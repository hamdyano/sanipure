import { useEffect, useState } from "react";
import { getCatalog, type CatalogResponse } from "../api/clientApi";
import { peekCatalog } from "../api/catalogCache";

/**
 * A category's filters and products. If the visitor already loaded it, that
 * copy shows immediately (no "Loading…") and a newer one replaces it if the
 * server has changed since. `category` must not change between renders.
 */
export const useCatalog = (category: string) => {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(() => peekCatalog(category));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCatalog(category)
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch((err) => {
        // With a copy already on screen, a failed refresh isn't worth an error.
        if (cancelled || peekCatalog(category)) return;
        setError(err instanceof Error ? err.message : "Failed to load products");
      });

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { catalog, loading: !catalog && !error, error };
};
