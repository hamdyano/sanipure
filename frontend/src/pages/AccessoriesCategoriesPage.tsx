import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CategoryPageHeader from "../components/shared/CategoryPageHeader";
import FilterSidebar from "../components/shared/FilterSidebar";
import RevealSection from "../components/shared/RevealSection";
import heroImage from "../assets/accessories and furniture shop photos/hero section.jpg";
import towelHoldersImage from "../assets/accessories and furniture shop photos/towel holders.jpg";
import toiletRollHoldersImage from "../assets/accessories and furniture shop photos/toilet roll holders.jpg";
import soapDispensersImage from "../assets/accessories and furniture shop photos/soap dispensers.jpg";
import mirrorsImage from "../assets/accessories and furniture shop photos/mirrors.jpg";
import circularCabinetImage from "../assets/accessories and furniture shop photos/circular cabinet.jpg";
import rectangularCabinetImage from "../assets/accessories and furniture shop photos/rectangular cabinet.jpg";
import overCounterImage from "../assets/accessories and furniture shop photos/over counter.jpg";
import counterTopImage from "../assets/accessories and furniture shop photos/counter top.jpg";
import accessoriesImage from "../assets/categories photos/Accessories photo.jpg";
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

interface TypeCard {
  /** Must match an option of the backend "type" filter. */
  type: string;
  /** Must match an option of the backend "shape" filter, for cabinets. */
  shape?: string;
  title: string;
  image: string;
  description: string;
}

// See backend/src/AccessoriesShop.ts for the filter options these select.
const ACCESSORIES: TypeCard[] = [
  {
    type: "Towel Holders",
    title: "Towel Holders",
    image: towelHoldersImage,
    description: "Rings, rails and bars that keep towels within easy reach.",
  },
  {
    type: "Toilet Roll Holders",
    title: "Toilet Roll Holders",
    image: toiletRollHoldersImage,
    description: "Wall-mounted and free-standing holders in refined finishes.",
  },
  {
    type: "Soap Dispensers",
    title: "Soap Dispensers",
    image: soapDispensersImage,
    description: "Elegant dispensers that bring a finishing touch to the basin.",
  },
  {
    type: "Mirrors",
    title: "Mirrors",
    image: mirrorsImage,
    description: "Statement mirrors, from framed classics to backlit designs.",
  },
];

const FURNITURE: TypeCard[] = [
  {
    type: "Cabinet",
    shape: "Circular",
    title: "Circular Cabinet",
    image: circularCabinetImage,
    description: "Soft, rounded lines for a graceful, timeless vanity.",
  },
  {
    type: "Cabinet",
    shape: "Rectangular",
    title: "Rectangular Cabinet",
    image: rectangularCabinetImage,
    description: "Crisp, tailored lines with generous storage below the basin.",
  },
  {
    type: "Over-Counter",
    title: "Over-Counter",
    image: overCounterImage,
    description: "A basin that sits proudly on top of the counter, like a sculpture.",
  },
  {
    type: "Counter-Top",
    title: "Counter-Top",
    image: counterTopImage,
    description: "A seamless stone surface with the basin set neatly into it.",
  },
];

const AccessoriesCategoriesPage = () => {
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/products?category=accessories")
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

  const isOnly = (values: string[] | undefined, value?: string) =>
    value ? values?.length === 1 && values[0] === value : !values?.length;

  const isPicked = (card: TypeCard) =>
    isOnly(selected.type, card.type) && isOnly(selected.shape, card.shape);

  // Picking a card narrows the filters to just that type (and shape, for
  // cabinets), or clears them if it was already the current pick, then
  // jumps to the results.
  const pickCard = (card: TypeCard) => {
    setSelected(
      isPicked(card)
        ? {}
        : { type: [card.type], shape: card.shape ? [card.shape] : [] }
    );
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

  const renderCard = (card: TypeCard) => {
    const active = isPicked(card);
    return (
      <button
        key={card.title}
        type="button"
        onClick={() => pickCard(card)}
        aria-pressed={active}
        className={`group relative h-96 overflow-hidden rounded-3xl text-left ring-2 transition-shadow ${
          active ? "ring-white" : "ring-transparent hover:ring-white/40"
        }`}
      >
        <img
          src={card.image}
          alt={card.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          {card.shape && (
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">{card.type}</p>
          )}
          <h3 className="mt-1 font-brand text-xl font-semibold uppercase text-white">
            {card.title}
          </h3>
          <p className="mt-2 text-sm text-white/75">{card.description}</p>
        </div>
      </button>
    );
  };

  return (
    <>
      <CategoryPageHeader
        categoryId="accessories"
        title="Accessories & Furniture"
        subtitle="The finishing touches and furniture that complete a refined bathroom."
        image={heroImage}
        imageAlt="Marble double vanity with wooden cabinetry"
        search={search}
        onSearchChange={setSearch}
      />

      <section className="mx-auto mt-14 max-w-7xl px-6 md:mt-20 lg:px-12">
        <RevealSection>
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Accessories</h2>
          <p className="mt-2 max-w-2xl text-white/60">
            Every detail considered, from the towel ring to the soap dispenser.
          </p>
        </RevealSection>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ACCESSORIES.map(renderCard)}
        </div>

        <RevealSection className="mt-16">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">Furniture</h2>
          <p className="mt-2 max-w-2xl text-white/60">
            Cabinets in circular or rectangular forms, and basin counters made to be seen.
          </p>
        </RevealSection>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FURNITURE.map(renderCard)}
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
                  : "Accessories & furniture are coming soon."}
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
              const topLine = [product.type, product.shape]
                .filter((v): v is string => typeof v === "string" && v.length > 0)
                .join(" · ");

              const colors = product.display?.colors ?? [];
              const productPath = `/products/accessories/categories/${product.id}`;

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
                      src={typeof product.image === "string" ? product.image : accessoriesImage}
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

export default AccessoriesCategoriesPage;
