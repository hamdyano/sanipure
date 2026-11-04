import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CategoryPageHeader from "../components/shared/CategoryPageHeader";
import FilterSidebar from "../components/shared/FilterSidebar";
import RevealSection from "../components/shared/RevealSection";
import heroImage from "../assets/concealed flush tank shop photos/hero section.jpg";
import wallHungFrameImage from "../assets/concealed flush tank shop photos/wall hung frame.jpg";
import backToWallImage from "../assets/concealed flush tank shop photos/back to wall.jpg";
import lowHeightFrameImage from "../assets/concealed flush tank shop photos/low height frame.jpg";
import brickInImage from "../assets/concealed flush tank shop photos/brick in.jpg";
import concealedFlushTankImage from "../assets/categories photos/Concealed Flush tank.jpeg";
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

// The "name" of each type below must match an option of the matching
// backend filter (see backend/src/ConcealedFlushTankShop.ts), since picking
// a type selects that filter option.
const INSTALLATION_TYPES = [
  {
    name: "Wall-Hung Frame",
    image: wallHungFrameImage,
    description:
      "A self-supporting steel frame carries both the cistern and a wall-hung toilet, leaving the floor clear for easy cleaning.",
  },
  {
    name: "Back-to-Wall",
    image: backToWallImage,
    description:
      "For floor-standing toilets that sit flush against the wall, with the cistern and pipework hidden behind the wall or furniture.",
  },
  {
    name: "Low-Height Frame",
    image: lowHeightFrameImage,
    description:
      "A shorter frame for half-height walls, under windows or beneath sloped ceilings, where a full-height frame won't fit.",
  },
  {
    name: "Brick-In",
    image: brickInImage,
    description:
      "Built straight into a masonry wall during construction or renovation, then plastered and tiled over.",
  },
];

const FLUSH_MECHANISMS = [
  {
    name: "Mechanical",
    description:
      "A push plate linked directly to the flush valve. Simple, reliable and easy to service.",
  },
  {
    name: "Pneumatic",
    description:
      "Air pressure triggers the flush for a lighter, quieter press, and lets the plate sit further from the cistern.",
  },
  {
    name: "Sensor",
    description:
      "Touch-free infrared flushing. The most hygienic choice, especially for busy and public bathrooms.",
  },
];

const ConcealedFlushTankCategoriesPage = () => {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/products?category=concealed-flush-tank")
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

  // Picking a type card narrows that filter to just this option (or clears
  // it if it was already the only one picked), then jumps to the results.
  const pickType = (filterId: string, option: string) => {
    setSelected((prev) => {
      const current = prev[filterId] ?? [];
      const isOnlyPick = current.length === 1 && current[0] === option;
      return { ...prev, [filterId]: isOnlyPick ? [] : [option] };
    });
    productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isPicked = (filterId: string, option: string) =>
    (selected[filterId] ?? []).includes(option);

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
        categoryId="concealed-flush-tank"
        title="Concealed Flush Tank"
        subtitle="Choose a type to explore our range of concealed flush tanks."
        image={heroImage}
        imageAlt="Wall-hung toilet with a concealed flush tank"
        search={search}
        onSearchChange={setSearch}
      />

      <section className="mx-auto mt-14 max-w-7xl px-6 md:mt-20 lg:px-12">
        <RevealSection>
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Installation Types</h2>
          <p className="mt-2 max-w-2xl text-white/60">
            Every concealed flush tank hides the cistern inside the wall. How it's mounted
            depends on your toilet and your wall.
          </p>
        </RevealSection>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INSTALLATION_TYPES.map((type) => {
            const active = isPicked("installation", type.name);
            return (
              <button
                key={type.name}
                type="button"
                onClick={() => pickType("installation", type.name)}
                aria-pressed={active}
                className={`group relative h-80 overflow-hidden rounded-3xl text-left ring-2 transition-shadow ${
                  active ? "ring-white" : "ring-transparent hover:ring-white/40"
                }`}
              >
                <img
                  src={type.image}
                  alt={type.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-lg font-semibold uppercase text-white">{type.name}</h3>
                  <p className="mt-2 text-sm text-white/75">{type.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        <RevealSection className="mt-14">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Flush Mechanisms</h2>
        </RevealSection>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {FLUSH_MECHANISMS.map((mechanism) => {
            const active = isPicked("mechanism", mechanism.name);
            return (
              <button
                key={mechanism.name}
                type="button"
                onClick={() => pickType("mechanism", mechanism.name)}
                aria-pressed={active}
                className={`rounded-3xl border p-6 text-left transition-colors ${
                  active
                    ? "border-white bg-white text-black"
                    : "border-white/15 text-white hover:border-white/50"
                }`}
              >
                <h3 className="text-base font-semibold uppercase">{mechanism.name}</h3>
                <p className={`mt-2 text-sm ${active ? "text-black/70" : "text-white/60"}`}>
                  {mechanism.description}
                </p>
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
                  : "Concealed flush tanks are coming soon."}
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
              const topLine = [product.installation, product.mechanism]
                .filter((v): v is string => typeof v === "string" && v.length > 0)
                .join(" · ");
              const bottomLine = [product.flush]
                .filter((v): v is string => typeof v === "string" && v.length > 0)
                .join(" · ");

              const colors = product.display?.colors ?? [];
              const productPath = `/products/concealed-flush-tank/categories/${product.id}`;

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
                    {bottomLine && (
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        {bottomLine}
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
                      src={typeof product.image === "string" ? product.image : concealedFlushTankImage}
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

export default ConcealedFlushTankCategoriesPage;
