import { useEffect, useSyncExternalStore } from "react";
import {
  AUTH_CHANGED_EVENT,
  addWishlistItem,
  fetchWishlist,
  getAuthToken,
  removeWishlistItem,
  type WishlistEntry,
} from "../api/clientApi";

// One shared copy of the signed-in user's wishlist, so every heart button on
// the page (and the profile's "My Wishlist" list) stays in sync without
// each one fetching on its own.

type PendingAction = "add" | "remove";

interface WishlistState {
  status: "idle" | "loading" | "ready" | "error";
  items: WishlistEntry[];
  /** Products with an add/remove request still in flight, and which one. */
  pending: ReadonlyMap<string, PendingAction>;
}

const initialState: WishlistState = { status: "idle", items: [], pending: new Map() };

let state = initialState;
let loadPromise: Promise<void> | null = null;
// Which session the loaded wishlist belongs to, so a different sign-in (or
// sign-out) starts fresh while profile edits (which re-save the same token)
// don't trigger a reload.
let loadedForToken: string | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

const setState = (next: Partial<WishlistState>) => {
  state = { ...state, ...next };
  notify();
};

const setPending = (productId: string, action: PendingAction | null) => {
  const pending = new Map(state.pending);
  if (action) pending.set(productId, action);
  else pending.delete(productId);
  setState({ pending });
};

const load = (): Promise<void> => {
  const token = getAuthToken();
  if (!token) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadedForToken = token;
  setState({ status: "loading" });
  const request = fetchWishlist()
    .then((items) => {
      if (loadedForToken === token) setState({ status: "ready", items });
    })
    .catch(() => {
      if (loadedForToken === token) setState({ status: "error" });
    })
    .finally(() => {
      if (loadPromise === request) loadPromise = null;
    });
  loadPromise = request;
  return request;
};

if (typeof window !== "undefined") {
  window.addEventListener(AUTH_CHANGED_EVENT, () => {
    const token = getAuthToken();
    if (token === loadedForToken) return;
    loadPromise = null;
    loadedForToken = null;
    state = initialState;
    notify();
    if (token) load();
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

/** The signed-in user's wishlist; loads it on first use. */
export const useWishlist = () => {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (getAuthToken() && (state.status === "idle" || state.status === "error")) load();
  }, []);

  return snapshot;
};

const isSaved = (snapshot: WishlistState, productId: string) =>
  snapshot.items.some((item) => item.id === productId);

/** Whether the heart should show as filled, counting a click still in flight. */
export const isInWishlist = (snapshot: WishlistState, productId: string) => {
  const action = snapshot.pending.get(productId);
  return action ? action === "add" : isSaved(snapshot, productId);
};

/**
 * Makes sure a product is in the wishlist (never removes it). Used right after
 * signing in or up, for the product whose heart a signed-out visitor clicked.
 */
export const ensureInWishlist = async (productId: string): Promise<void> => {
  if (state.status !== "ready") await load();
  if (state.status === "ready" && isSaved(state, productId)) return;

  setPending(productId, "add");
  try {
    // The server ignores a product that's already saved, so this is safe even
    // if the list above couldn't be loaded.
    const entry = await addWishlistItem(productId);
    setState({ items: [entry, ...state.items.filter((item) => item.id !== productId)] });
  } finally {
    setPending(productId, null);
  }
};

/** Re-fetches the wishlist, e.g. for a "Try again" button. */
export const reloadWishlist = () => load();

/**
 * Adds or removes a product. The heart flips straight away (via "pending");
 * the saved list itself only changes once the server confirms, so a failed
 * request leaves everything as it was. Resolves to the new saved state.
 */
export const toggleWishlist = async (productId: string): Promise<boolean> => {
  if (state.pending.has(productId)) return isInWishlist(state, productId);
  // Know what's already saved before flipping anything.
  if (state.status !== "ready") await load();
  if (state.status !== "ready") throw new Error("Wishlist unavailable");

  const wasSaved = isSaved(state, productId);
  setPending(productId, wasSaved ? "remove" : "add");

  try {
    if (wasSaved) {
      await removeWishlistItem(productId);
      setState({ items: state.items.filter((item) => item.id !== productId) });
    } else {
      const entry = await addWishlistItem(productId);
      setState({ items: [entry, ...state.items.filter((item) => item.id !== productId)] });
    }
    return !wasSaved;
  } finally {
    setPending(productId, null);
  }
};
