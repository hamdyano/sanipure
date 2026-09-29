import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
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

// The subcategory tabs. `values` holds the exact option string(s) the admin
// dashboard's "Type" dropdown submits (see ToiletsShop.ts filters) so a tab
// reliably matches products saved with that value, regardless of the
// friendlier label shown to shoppers.
const subCategories: { name: string; filterId: string; values: string[] }[] = [
  { name: "Floor-Standing", filterId: "type", values: ["Floor Standing"] },
  { name: "Wall-Mounted", filterId: "type", values: ["Wall hung"] },
];

const ALL_TAB = "All";

const ToiletsCategoriesPage = () => {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
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

  const matchesTab = (product: Product) => {
    const tab = subCategories.find((s) => s.name === activeTab);
    if (!tab) return true;
    const raw = product[tab.filterId];
    const productValues = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
    return productValues.some((v) =>
      tab.values.some((tv) => tv.toLowerCase() === v.trim().toLowerCase())
    );
  };

  const matchesSearch = (product: Product) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return product.name.toLowerCase().includes(query);
  };

  const filteredProducts =
    catalog?.products.filter(
      (product) => matchesFilters(product, selected) && matchesTab(product) && matchesSearch(product)
    ) ?? [];

  const getCount = (filterId: string, option: string) => {
    if (!catalog) return 0;
    return catalog.products.filter((product) => {
      if (!matchesFilters(product, selected, filterId)) return false;
      if (!matchesTab(product) || !matchesSearch(product)) return false;
      const value = product[filterId];
      return Array.isArray(value) ? value.includes(option) : value === option;
    }).length;
  };

  return (
    <>
      <section className="relative flex h-[60vh] min-h-[420px] w-full items-center justify-center overflow-hidden bg-black md:h-[70vh]">
        <img
          src={heroImage}
          alt="Toilets by Sanipure"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <RevealSection className="relative z-10 px-6 text-center">
          <h1 className="text-4xl font-semibold text-white md:text-5xl">
            Toilets
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Choose a category to explore our range of toilets.
          </p>
        </RevealSection>
      </section>

      <section className="bg-black px-6 pb-6 pt-6 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-[2rem] bg-white p-2 shadow-lg sm:flex-row sm:items-center sm:gap-2">
          <div className="flex flex-1 flex-wrap items-center gap-1 overflow-x-auto px-1 py-1 sm:flex-nowrap">
            {[ALL_TAB, ...subCategories.map((s) => s.name)].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-black text-white"
                    : "text-black/70 hover:bg-black/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 sm:w-56">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4 shrink-0 text-black/50"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm text-black placeholder:text-black/40 focus:outline-none"
            />
          </div>
        </div>
      </section>

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
                    className="absolute right-1 -top-6 z-10 h-[calc(100%+2.5rem)] w-32 sm:right-2 sm:w-44 lg:w-52"
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
