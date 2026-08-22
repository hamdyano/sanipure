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
  const token = localStorage.getItem(TOKEN_KEY);
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
// Products (category-scoped: "toilets" | "washbasins" | "bathtubs")
// ---------------------------------------------------------------------------

export interface ProductFilter {
  id: string;
  label: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  [attribute: string]: string | string[];
}

export type ProductInput = Omit<Product, "id">;

export interface CatalogResponse {
  category: string;
  filters: ProductFilter[];
  products: Product[];
}

// Per-category CRUD lives in its own file: washbasinsApi.ts, toiletsApi.ts,
// bathtubsApi.ts. They all share the apiClient instance and types above.

// ---------------------------------------------------------------------------
// Auth (used by the Admin sign-in / sign-up forms)
// Not implemented on the backend yet — no /api/auth/* routes exist.
// ---------------------------------------------------------------------------

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

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
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
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

export const signOut = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
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
