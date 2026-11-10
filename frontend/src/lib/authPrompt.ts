// Opens the "Sign In / Create Account" pop-up (AuthPromptModal, mounted once in
// Layout) from anywhere — the header, a wishlist heart, etc.

export type AuthPromptTab = "signin" | "signup";
export type AccountType = "homeowner" | "professional";

export interface AuthPromptOptions {
  /** Which tab the pop-up opens on. Defaults to "signin". */
  tab?: AuthPromptTab;
  /** Same-site path to return to after signing in. Defaults to the current page. */
  from?: string;
  /** A product to add to the wishlist once the visitor has signed in or up. */
  wishlistProduct?: WishlistIntent;
}

export interface WishlistIntent {
  id: string;
  name: string;
}

/** Reads a WishlistIntent back out of router state (which is untyped). */
export const readWishlistIntent = (value: unknown): WishlistIntent | null => {
  if (!value || typeof value !== "object") return null;
  const { id, name } = value as Record<string, unknown>;
  return typeof id === "string" && id && typeof name === "string" ? { id, name } : null;
};

export const OPEN_AUTH_PROMPT_EVENT = "sanipure-open-auth-prompt";

export const openAuthPrompt = (options: AuthPromptOptions = {}) => {
  window.dispatchEvent(
    new CustomEvent<AuthPromptOptions>(OPEN_AUTH_PROMPT_EVENT, { detail: options }),
  );
};
