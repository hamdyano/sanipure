import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CategoryPageHeader from "../components/shared/CategoryPageHeader";
import FilterSidebar from "../components/shared/FilterSidebar";
import RevealSection from "../components/shared/RevealSection";
import heroImage from "../assets/public bathrooms shop photos/hero section.jpg";
import circularImage from "../assets/public bathrooms shop photos/circular.jpg";
import rectangularImage from "../assets/public bathrooms shop photos/rectangular.jpg";
import publicBathroomsImage from "../assets/categories photos/Public Bathrooms photo.jpg";
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

// Each "name" must match an option of the backend "shape" filter (see
// backend/src/PublicBathroomsShop.ts), since picking a shape selects it.
const SHAPES = [
  {
    name: "Circular",
    image: circularImage,
    description:
      "Soft, rounded forms with no corners to catch dirt, so they're quick to wipe down between visitors.",
  },
  {
    name: "Rectangular",
    image: rectangularImage,
    description:
      "Clean, straight lines that line up neatly in rows and make the most of every metre of wall.",
  },
];

const PublicBathroomsCategoriesPage = () => {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/products?category=public-bathrooms")
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

  // Picking a shape card narrows the filter to just that shape (or clears it
  // if it was already the only one picked), then jumps to the results.
  const pickShape = (shape: string) => {
    setSelected((prev) => {
      const current = prev.shape ?? [];
      const isOnlyPick = current.length === 1 && current[0] === shape;
      return { ...prev, shape: isOnlyPick ? [] : [shape] };
    });
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const hasActiveFilters = Object.values(selected).some((options) => options.length > 0);

  return (
    <>
      <CategoryPageHeader
        categoryId="public-bathrooms"
        title="Public Bathrooms"
        subtitle="Choose a shape to explore our range for public and commercial spaces."
        image={heroImage}
        imageAlt="Row of washbasins in a public restroom"
        search={search}
        onSearchChange={setSearch}
      />

      <section className="mx-auto mt-14 max-w-7xl px-6 md:mt-20 lg:px-12">
        <RevealSection>
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Shapes</h2>
          <p className="mt-2 max-w-2xl text-white/60">
            Built for high-traffic spaces, in two shapes to suit any design.
          </p>
        </RevealSection>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {SHAPES.map((shape) => {
            const active = (selected.shape ?? []).includes(shape.name);
            return (
              <button
                key={shape.name}
                type="button"
                onClick={() => pickShape(shape.name)}
                aria-pressed={active}
                className={`group relative h-80 overflow-hidden rounded-3xl text-left ring-2 transition-shadow md:h-[26rem] ${
                  active ? "ring-white" : "ring-transparent hover:ring-white/40"
                }`}
              >
                <img
                  src={shape.image}
                  alt={`${shape.name} washbasins`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-brand text-2xl font-semibold uppercase text-white md:text-3xl">
                    {shape.name}
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-white/75">{shape.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section
        ref={productsRef}
        className="mx-auto my-10 grid max-w-7xl scroll-mt-24 grid-cols-1 gap-10 px-6 md:my-14 lg:grid-cols-[240px_1fr] lg:px-12"
      >
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
            <div className="text-sm text-white/60">
              <p>
                {catalog?.products.length
                  ? "No products match the selected filters."
                  : "Public bathroom products are coming soon."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => setSelected({})}
                  className="mt-3 text-white underline underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 xl:grid-cols-2">
            {filteredProducts.map((product) => {
              const topLine = [product.shape]
                .filter((v): v is string => typeof v === "string" && v.length > 0)
                .join(" · ");

              const colors = product.display?.colors ?? [];
              const productPath = `/products/public-bathrooms/categories/${product.id}`;

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
                      src={typeof product.image === "string" ? product.image : publicBathroomsImage}
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

export default PublicBathroomsCategoriesPage;
