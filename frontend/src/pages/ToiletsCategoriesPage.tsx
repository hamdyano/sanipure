import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CategoryPageHeader from "../components/shared/CategoryPageHeader";
import FilterSidebar from "../components/shared/FilterSidebar";
import heroImage from "../assets/toilets shop photos/hero section.jpg";
import toiletsImage from "../assets/categories photos/Toilets photo.jpg";
import type { ProductDisplay } from "../api/clientApi";

interface Filter {
  id: string;
  label: string;
  options: string[];
}

interface Product {
  id: string;
  name: string;
  display?: ProductDisplay;
  [attribute: string]: string | string[] | ProductDisplay | undefined;
}

interface CatalogResponse {
  category: string;
  filters: Filter[];
  products: Product[];
}

const ToiletsCategoriesPage = () => {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/products?category=toilets")
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
      const value = product[filterId];
      if (Array.isArray(value)) {
        return value.some((v) => options.includes(v));
      }
      return options.includes(value as string);
    });

  const matchesSearch = (product: Product) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return product.name.toLowerCase().includes(query);
  };

  const filteredProducts =
    catalog?.products.filter(
      (product) => matchesFilters(product, selected) && matchesSearch(product)
    ) ?? [];

  const getCount = (filterId: string, option: string) => {
    if (!catalog) return 0;
    return catalog.products.filter((product) => {
      if (!matchesFilters(product, selected, filterId)) return false;
      if (!matchesSearch(product)) return false;
      const value = product[filterId];
      return Array.isArray(value) ? value.includes(option) : value === option;
    }).length;
  };

  return (
    <>
      <CategoryPageHeader
        categoryId="toilets"
        title="Toilets"
        subtitle="Choose a category to explore our range of toilets."
        image={heroImage}
        imageAlt="Toilets by Sanipure"
        search={search}
        onSearchChange={setSearch}
      />

      <section className="mx-auto my-10 grid max-w-7xl grid-cols-1 gap-10 px-6 md:my-14 lg:grid-cols-[240px_1fr] lg:px-12">
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
          {loading && <p className="text-sm text-white/60">Loading products…</p>}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="text-sm text-white/60">
              No products match the selected filters.
            </p>
          )}

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 xl:grid-cols-2">
            {filteredProducts.map((product) => {
              const topLine = [product.series, product.type]
                .filter((v): v is string => typeof v === "string" && v.length > 0)
                .join(" · ");
              const bottomLine = [product.shape, product.color]
                .filter((v): v is string => typeof v === "string" && v.length > 0)
                .join(" · ");
              const extra = Array.isArray(product.extra) ? product.extra : [];

              const colors = product.display?.colors ?? [];
              const productPath = `/products/toilets/shop-toilets/${product.id}`;

              return (
                <div
                  key={product.id}
                  className="relative py-6 pl-6 pr-2 sm:pr-4"
                >
                  <div className="flex min-w-0 flex-col gap-2">
                    <h4 className="truncate text-lg font-bold uppercase text-white">
                      {product.name}
                    </h4>
                    {topLine && (
                      <p className="text-sm font-medium text-white/70">{topLine}</p>
                    )}
                    {(bottomLine || extra.length > 0) && (
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        {[bottomLine, extra.join(" · ")].filter(Boolean).join(" · ")}
                      </p>
                    )}

                    {colors.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {colors.map((color, index) => (
                          <Link
                            key={`${color.name}-${index}`}
                            to={`${productPath}?color=${encodeURIComponent(color.name)}`}
                            title={color.name}
                            className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/20 transition-colors hover:border-white"
                          >
                            {color.image ? (
                              <img
                                src={color.image}
                                alt={color.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center bg-white/10 text-[8px] text-white/60">
                                {color.name.slice(0, 2)}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}

                    <Link
                      to={productPath}
                      className="relative z-0 mt-2 w-[calc(100%+1.5rem)] rounded-full border border-white px-6 py-2 text-xs font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black sm:w-[calc(100%+2rem)]"
                    >
                      See More
                    </Link>
                  </div>

                  <Link
                    to={productPath}
                    className="absolute right-2 top-1/2 z-10 h-28 w-24 -translate-y-1/2 sm:right-4 sm:h-32 sm:w-28 lg:h-36 lg:w-32"
                  >
                    <img
                      src={typeof product.image === "string" ? product.image : toiletsImage}
                      alt={product.name}
                      className="h-full w-full object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.55)]"
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default ToiletsCategoriesPage;
