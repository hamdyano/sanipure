import { useEffect, useState } from "react";
import RevealSection from "../components/shared/RevealSection";
import FilterSidebar from "../components/shared/FilterSidebar";
import washbasinsImage from "../assets/categories photos/Washbasins photo.jpg";

interface Filter {
  id: string;
  label: string;
  options: string[];
}

interface Product {
  id: string;
  name: string;
  [attribute: string]: string;
}

interface CatalogResponse {
  category: string;
  filters: Filter[];
  products: Product[];
}

const ShopWashbasinsPage = () => {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let cancelled = false;

    fetch("/api/products?category=washbasins")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json() as Promise<CatalogResponse>;
      })
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load products");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleOption = (filterId: string, option: string) => {
    setSelected((prev) => {
      const current = prev[filterId] ?? [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [filterId]: next };
    });
  };

  const matchesFilters = (
    product: Product,
    activeSelected: Record<string, string[]>,
    excludeFilterId?: string
  ) =>
    Object.entries(activeSelected).every(([filterId, options]) => {
      if (filterId === excludeFilterId) return true;
      if (options.length === 0) return true;
      return options.includes(product[filterId]);
    });

  const filteredProducts =
    catalog?.products.filter((product) => matchesFilters(product, selected)) ?? [];

  const getCount = (filterId: string, option: string) => {
    if (!catalog) return 0;
    return catalog.products.filter(
      (product) =>
        matchesFilters(product, selected, filterId) && product[filterId] === option
    ).length;
  };

  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          View Washbasins
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Filter by material, shape, color, series, size, and type to find the right fit.
        </p>
      </RevealSection>

      <section className="mx-auto my-16 grid max-w-7xl grid-cols-1 gap-10 px-6 md:my-20 lg:grid-cols-[240px_1fr] lg:px-12">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          {loading && <p className="text-sm text-white/60">Loading filters…</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {catalog && (
            <FilterSidebar
              filters={catalog.filters}
              selected={selected}
              onToggle={toggleOption}
              onClear={() => setSelected({})}
              getCount={getCount}
              resultCount={filteredProducts.length}
            />
          )}
        </aside>

        <div>
          {loading && (
            <p className="text-sm text-white/60">Loading products…</p>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="text-sm text-white/60">
              No products match the selected filters.
            </p>
          )}

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const topLine = [product.series, product.type].filter(Boolean).join(" · ");
              const bottomLine = [
                product.material,
                product.shape,
                product.color,
                product.size ? `${product.size}cm` : undefined,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div key={product.id} className="flex flex-col">
                  <div className="h-64 w-full overflow-hidden">
                    <img
                      src={product.image || washbasinsImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h4 className="mt-4 text-base font-medium text-white">
                    {product.name}
                  </h4>
                  {topLine && (
                    <p className="mt-1 text-sm text-white/60">{topLine}</p>
                  )}
                  {bottomLine && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-white/40">
                      {bottomLine}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWashbasinsPage;
