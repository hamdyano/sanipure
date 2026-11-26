import axios from "axios";
import { clearCatalogCache, findFreshProduct, loadCatalog } from "./catalogCache";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the signed-in user's token to every request automatically, so
// auth-protected endpoints (creating/editing/deleting products, "my
// products", etc.) work without each call site having to pass headers.
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  // The instance-level default Content-Type ("application/json") would
  // otherwise override FormData's auto-detected multipart boundary header,
  // silently breaking every file upload (create/update product with a
  // photo) — confirmed live: the request went out as application/json with
  // no boundary, so the backend never saw the uploaded file.
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
});

// Adding, editing or deleting a product makes the cached catalogs outdated.
// Also done when the request fails: the change may have been saved even if
// the reply never arrived.
const clearCatalogAfterChange = (config?: { method?: string; url?: string }) => {
  if (config?.method !== "get" && config?.url?.startsWith("/products/")) clearCatalogCache();
};

apiClient.interceptors.response.use(
  (response) => {
    clearCatalogAfterChange(response.config);
    return response;
  },
  (err) => {
    if (axios.isAxiosError(err)) clearCatalogAfterChange(err.config);
    return Promise.reject(err);
  },
);

export default apiClient;

// ---------------------------------------------------------------------------
// Products (category-scoped: "toilets" | "washbasins" | "bathtubs" |
// "concealed-flush-tank" | "public-bathrooms" | "accessories")
// ---------------------------------------------------------------------------

export interface ProductFilter {
  id: string;
  label: string;
  options: string[];
}

// The "For Display" section's data — a product's full spec sheet, shown on
// its public detail page. Separate from the top-level filter attributes
// (which only ever hold single strings for the shop grid's filter sidebar).
export interface ProductDisplayColor {
  name: string;
  code?: string;
  image?: string;
}

export interface ProductDisplaySize {
  name: string;
  code?: string;
}

// Products saved before sizes had codes store each size as a plain string.
export const toSizeEntries = (sizes: ProductDisplay["sizes"]): ProductDisplaySize[] =>
  (sizes ?? []).map((size) => (typeof size === "string" ? { name: size } : size));

// The "For Required Items" section's data — companion items needed with the
// product (e.g. a seat or flush plate), listed under the design file button
// on the detail page and opened in a popup with their own photos/details.
export interface ProductRequiredItem {
  name: string;
  productCode?: string;
  color?: string;
  quantity?: string;
  description?: string;
  images?: string[];
}

export interface ProductDisplay {
  productCode?: string;
  description?: string;
  colors?: ProductDisplayColor[];
  images?: string[];
  types?: string[];
  sizes?: Array<ProductDisplaySize | string>;
  designFile?: string;
  requiredItems?: ProductRequiredItem[];
}

export interface Product {
  id: string;
  name: string;
  display?: ProductDisplay;
  [attribute: string]: string | string[] | ProductDisplay | undefined;
}

export type ProductInput = Omit<Product, "id">;

/** The last edit or delete of a product: who did it (their email) and when. */
export interface ProductChange {
  action: "edited" | "deleted";
  email: string | null;
  at: string;
}

/**
 * A product as listed on the dashboard, with who added it and its last
 * change. A deleted product stays on the list with lastChange.action "deleted".
 */
export type ManagedProduct = Product & {
  addedBy?: { name: string; email: string };
  lastChange?: ProductChange;
};

export interface CatalogResponse {
  category: string;
  filters: ProductFilter[];
  products: Product[];
}

// Per-category CRUD lives in its own file: washbasinsApi.ts, toiletsApi.ts,
// bathtubsApi.ts. They all share the apiClient instance and types above.

// A product form can involve uploading half a dozen files back to back
// before the admin can hit Save — a single transient network hiccup on any
// one of them shouldn't force retyping the whole form. Retries only when
// there's no response at all (dropped connection/timeout) or the server
// errored (5xx); a 4xx (e.g. file too large) means trying again would just
// fail the same way, so that's returned to the caller immediately.
const withUploadRetry = async (attempt: () => Promise<string>): Promise<string> => {
  try {
    return await attempt();
  } catch (err) {
    const shouldRetry =
      axios.isAxiosError(err) && (!err.response || err.response.status >= 500);
    if (!shouldRetry) throw err;
    return attempt();
  }
};

// Upload — POST /api/products/upload-image
// Auth required. Uploads a single image file to Supabase Storage and
// returns its public URL, which the admin form then includes as the
// "image" attribute when creating/updating a product (a plain string, not
// a file) — decoupled from create/update so those stay simple JSON calls.
export const uploadProductImage = async (file: File): Promise<string> =>
  withUploadRetry(async () => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await apiClient.post<{ url: string }>(
      "/products/upload-image",
      formData,
    );
    return data.url;
  });

// Upload — POST /api/products/upload-file
// Auth required. Uploads any file (used for the "For Display" section's
// downloadable PDF design file) to Supabase Storage and returns its public
// URL, the same way uploadProductImage does for photos.
export const uploadProductFile = async (file: File): Promise<string> =>
  withUploadRetry(async () => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<{ url: string }>(
      "/products/upload-file",
      formData,
    );
    return data.url;
  });

// Read (all) — GET /api/products?category=:category
// Public, no auth required. Cached in memory for a short time (catalogCache.ts).
export const getCatalog = (category: string): Promise<CatalogResponse> =>
  loadCatalog(category, async () => {
    const { data } = await apiClient.get<CatalogResponse>("/products", {
      params: { category },
    });
    return data;
  });

// Dismiss — DELETE /api/products/:category/:id/history
// Data entry or admin only. Removes a deleted product's "Deleted by …" card
// from the dashboard for everyone.
export const dismissDeletedProduct = async (category: string, id: string): Promise<void> => {
  await apiClient.delete(`/products/${category}/${id}/history`);
};

// Read (one) — GET /api/products/:category/:id
// Public, no auth required — powers a product's public detail page (linked
// from its shop grid card), which shows the "For Display" spec-sheet data
// alongside its filter attributes. Catalog entries are the same full record,
// so a product whose catalog was just loaded needs no request.
export const getProduct = async (
  category: string,
  id: string,
): Promise<Product> => {
  const cached = findFreshProduct(category, id);
  if (cached) return cached;

  const { data } = await apiClient.get<Product>(`/products/${category}/${id}`);
  return data;
};

// ---------------------------------------------------------------------------
// Auth (used by the Admin sign-in / sign-up forms)
// Backed by POST /api/auth/signin and /api/auth/signup (backend/src/auth.ts).
// ---------------------------------------------------------------------------

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  username: string;
  email: string;
  phone: string;
  password: string;
}

// Same rule as the backend (backend/src/validation.ts): digits with an
// optional leading "+", spaces, dashes and brackets.
export const isValidPhone = (phone: string) => /^\+?[0-9\s\-()]{6,30}$/.test(phone.trim());

// Same rule as the backend: something@something.something, no spaces.
export const isValidEmail = (email: string) => {
  const trimmed = email.trim();
  return trimmed.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

// What an account may do (enforced by the backend on every request; here it
// only decides what to show). Same values as enum Role in schema.prisma.
export type UserRole = "visitor" | "data_entry" | "admin";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  /** Missing for a session started before roles existed, until it refreshes. */
  role?: UserRole;
}

// The dashboard's name, which depends on the role; null for visitors, who
// don't have one.
export const dashboardLabel = (role: UserRole | undefined): string | null => {
  if (role === "admin") return "Dashboard";
  if (role === "data_entry") return "Adding Data";
  return null;
};

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = "sanipure_admin_token";
const USER_KEY = "sanipure_admin_user";

// Fired on the window whenever auth state changes (sign in/up/out), so any
// component — Header included — can react without prop-drilling or a
// separate context provider. The native "storage" event only fires in
// *other* tabs, not the one that made the change, so this covers same-tab
// updates.
export const AUTH_CHANGED_EVENT = "sanipure-auth-changed";

const persistAuth = (token: string, user: AuthUser) => {
  // sessionStorage (not localStorage) so the sign-in only lasts for this
  // browser tab/session — closing the site clears it and the next visit
  // requires signing in again, while reloads/navigation within the same
  // session keep it.
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const signIn = async (payload: SignInInput): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/signin", payload);
  persistAuth(data.token, data.user);
  return data;
};

export const signUp = async (payload: SignUpInput): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/auth/signup", payload);
  persistAuth(data.token, data.user);
  return data;
};

export interface ResetPasswordInput {
  email: string;
  resetWord: string;
  newPassword: string;
}

// POST /api/auth/reset-password — the reset word is checked on the server
// only. Doesn't sign the user in; they sign in with the new password after.
export const resetPassword = async (payload: ResetPasswordInput): Promise<void> => {
  await apiClient.post("/auth/reset-password", payload);
};

// ---------------------------------------------------------------------------
// Profile — GET/PUT /api/profile (backend/src/profile.ts). Auth required.
// ---------------------------------------------------------------------------

export interface Profile extends AuthUser {
  role: UserRole;
  fullName: string | null;
  phone: string | null;
  jobTitle: string | null;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

// Empty strings clear an optional field.
export interface ProfileInput {
  username: string;
  fullName: string;
  phone: string;
  jobTitle: string;
  location: string;
  bio: string;
  avatarUrl: string;
}

// Keeps the cached signed-in user (shown in the Header) in step with the
// profile, e.g. after the username or role is changed.
// Skipped if someone else signed in (or out) while the request was running.
const syncStoredUser = (profile: Profile, token: string | null) => {
  if (!token || token !== getAuthToken()) return;
  persistAuth(token, {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    role: profile.role,
  });
};

export const getProfile = async (): Promise<Profile> => {
  const token = getAuthToken();
  const { data } = await apiClient.get<Profile>("/profile");
  syncStoredUser(data, token);
  return data;
};

// Picks up a role changed by an admin since the visitor signed in. Once per
// page load is enough, and a failure just leaves the session as it was.
let sessionRefreshed = false;
export const refreshSessionOnce = () => {
  if (sessionRefreshed || !getAuthToken()) return;
  sessionRefreshed = true;
  getProfile().catch(() => {});
};

// Upload — POST /api/profile/upload-image. Stores a profile photo and returns
// its URL, to be sent as avatarUrl. Open to every signed-in user, unlike
// uploadProductImage.
export const uploadProfileImage = async (file: File): Promise<string> =>
  withUploadRetry(async () => {
    const formData = new FormData();
    formData.append("image", file);
    const { data } = await apiClient.post<{ url: string }>("/profile/upload-image", formData);
    return data.url;
  });

export const updateProfile = async (payload: ProfileInput): Promise<Profile> => {
  const token = getAuthToken();
  const { data } = await apiClient.put<Profile>("/profile", payload);
  syncStoredUser(data, token);
  return data;
};

// ---------------------------------------------------------------------------
// Wishlist — /api/wishlist (backend/src/wishlist.ts). Auth required.
// State shared across the app lives in lib/wishlist.ts.
// ---------------------------------------------------------------------------

export interface WishlistEntry extends Product {
  /** Category slug, e.g. "toilets" — used to build the product page link. */
  category: string;
  addedAt: string;
}

export const fetchWishlist = async (): Promise<WishlistEntry[]> => {
  const { data } = await apiClient.get<WishlistEntry[]>("/wishlist");
  return data;
};

export const addWishlistItem = async (productId: string): Promise<WishlistEntry> => {
  const { data } = await apiClient.post<WishlistEntry>(
    `/wishlist/${encodeURIComponent(productId)}`,
  );
  return data;
};

export const removeWishlistItem = async (productId: string): Promise<void> => {
  await apiClient.delete(`/wishlist/${encodeURIComponent(productId)}`);
};

// ---------------------------------------------------------------------------
// Leads report — GET /api/leads (backend/src/leads.ts). Data entry and admins only.
// One entry per user, with every product they saved to their wishlist.
// ---------------------------------------------------------------------------

export interface LeadProduct {
  id: string;
  name: string;
  category: string;
  image: string | null;
  addedAt: string;
}

export interface Lead {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  /** Newest first. */
  products: LeadProduct[];
}

export const getLeads = async (): Promise<Lead[]> => {
  const { data } = await apiClient.get<Lead[]>("/leads");
  return data;
};

// ---------------------------------------------------------------------------
// Data entry accounts — /api/users (backend/src/users.ts). Admin only.
// ---------------------------------------------------------------------------

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  productCount: number;
}

export const getDataEntryTeam = async (): Promise<TeamMember[]> => {
  const { data } = await apiClient.get<TeamMember[]>("/users/data-entry");
  return data;
};

// Visitor accounts whose email contains the text.
export const searchVisitors = async (query: string): Promise<TeamMember[]> => {
  const { data } = await apiClient.get<TeamMember[]>("/users/search", { params: { q: query } });
  return data;
};

export const setUserRole = async (
  id: string,
  role: "visitor" | "data_entry",
): Promise<TeamMember> => {
  const { data } = await apiClient.put<TeamMember>(`/users/${encodeURIComponent(id)}/role`, {
    role,
  });
  return data;
};

export const signOut = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const getAuthToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => getAuthToken() !== null;

export const authApi = {
  signIn,
  signUp,
  signOut,
  getStoredUser,
  getAuthToken,
  isAuthenticated,
};
