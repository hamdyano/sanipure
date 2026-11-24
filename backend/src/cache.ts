// A small in-memory cache for data that is read far more often than it
// changes (the product catalogs). Lives in this server process only, so it
// starts empty after every restart.

interface Entry<T> {
  value: Promise<T>;
  expiresAt: number;
}

export interface MemoryCache<T> {
  /** The cached value for this key, or whatever `load` returns. */
  get: (key: string, load: () => Promise<T>) => Promise<T>;
  /** Drops everything, so the next get() of any key loads it again. */
  clear: () => void;
}

// ttlMs is only a safety net for changes made outside this process (the seed
// script, a direct database edit, a second server process). Changes made
// through the API call clear() and show up straight away.
export const createMemoryCache = <T>(ttlMs: number): MemoryCache<T> => {
  const entries = new Map<string, Entry<T>>();

  return {
    get: (key, load) => {
      const cached = entries.get(key);
      if (cached && cached.expiresAt > Date.now()) return cached.value;

      // The promise itself is stored, so requests arriving while it's still
      // loading share one database query. After a clear() the next request
      // starts its own load, so a load from before a change is never reused.
      const entry: Entry<T> = { value: load(), expiresAt: Date.now() + ttlMs };
      entries.set(key, entry);

      // A failed load isn't kept: the next request tries again.
      entry.value.catch(() => {
        if (entries.get(key) === entry) entries.delete(key);
      });
      return entry.value;
    },
    clear: () => entries.clear(),
  };
};
