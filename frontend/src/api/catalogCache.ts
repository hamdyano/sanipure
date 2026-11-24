import type { CatalogResponse, Product } from "./clientApi";

// Keeps each category's catalog in memory while the visitor browses, so going
// back to a category (or opening one of its products) shows straight away.
// A page reload starts empty. See lib/useCatalog.ts for how pages use it.

// How long a catalog is used without asking the server for a newer one.
const FRESH_MS = 30_000;

interface Entry {
  data: CatalogResponse;
  loadedAt: number;
}

const entries = new Map<string, Entry>();
const inFlight = new Map<string, Promise<CatalogResponse>>();

/** The last loaded catalog, however old, or null if there isn't one. */
export const peekCatalog = (category: string): CatalogResponse | null =>
  entries.get(category)?.data ?? null;

const freshCatalog = (category: string): CatalogResponse | null => {
  const entry = entries.get(category);
  return entry && Date.now() - entry.loadedAt < FRESH_MS ? entry.data : null;
};

/** A product from its category's catalog, if that was loaded recently. */
export const findFreshProduct = (category: string, id: string): Product | null =>
  freshCatalog(category)?.products.find((product) => product.id === id) ?? null;

/** The catalog if it's fresh, else a new copy; simultaneous callers share one request. */
export const loadCatalog = (
  category: string,
  request: () => Promise<CatalogResponse>,
): Promise<CatalogResponse> => {
  const fresh = freshCatalog(category);
  if (fresh) return Promise.resolve(fresh);

  const pending = inFlight.get(category);
  if (pending) return pending;

  const promise: Promise<CatalogResponse> = request()
    .then((data) => {
      // Not if the cache was cleared meanwhile: this copy may predate a change.
      if (inFlight.get(category) === promise) {
        entries.set(category, { data, loadedAt: Date.now() });
      }
      return data;
    })
    .finally(() => {
      if (inFlight.get(category) === promise) inFlight.delete(category);
    });
  inFlight.set(category, promise);
  return promise;
};

/** Forgets everything; called whenever a product is added, edited or deleted. */
export const clearCatalogCache = () => {
  entries.clear();
  inFlight.clear();
};
