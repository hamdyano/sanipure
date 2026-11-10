import axios from "axios";

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

// Read (one) — GET /api/products/:category/:id
// Public, no auth required — powers a product's public detail page (linked
// from its shop grid card), which shows the "For Display" spec-sheet data
// alongside its filter attributes.
export const getProduct = async (
  category: string,
  id: string,
): Promise<Product> => {
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

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

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
// profile, e.g. after the username is changed.
const syncStoredUser = (profile: Profile) => {
  const token = getAuthToken();
  if (!token) return;
  persistAuth(token, { id: profile.id, username: profile.username, email: profile.email });
};

export const getProfile = async (): Promise<Profile> => {
  const { data } = await apiClient.get<Profile>("/profile");
  syncStoredUser(data);
  return data;
};

export const updateProfile = async (payload: ProfileInput): Promise<Profile> => {
  const { data } = await apiClient.put<Profile>("/profile", payload);
  syncStoredUser(data);
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
// Leads report — GET /api/leads (backend/src/leads.ts). Auth required.
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
