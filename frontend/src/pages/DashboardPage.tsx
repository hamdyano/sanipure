import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import ProductManager from "../components/dashboard/ProductManager";
import { isAuthenticated } from "../api/clientApi";
import washbasinsApi from "../api/washbasinsApi";
import toiletsApi from "../api/toiletsApi";
import bathtubsApi from "../api/bathtubsApi";
import concealedFlushTankApi from "../api/concealedFlushTankApi";
import publicBathroomsApi from "../api/publicBathroomsApi";
import accessoriesApi from "../api/accessoriesApi";
import { CATEGORIES as SITE_CATEGORIES } from "../data/categories";

// Each button's thumbnail is the category's photo from the home page carousels.
const categoryImage = (slug: string) => SITE_CATEGORIES.find((c) => c.id === slug)?.image;

type CategorySlug =
  | "washbasins"
  | "toilets"
  | "bathtubs"
  | "concealed-flush-tank"
  | "public-bathrooms"
  | "accessories";

const CATEGORIES: { slug: CategorySlug; label: string; api: typeof washbasinsApi }[] = [
  { slug: "washbasins", label: "Washbasins", api: washbasinsApi },
  { slug: "toilets", label: "Toilets", api: toiletsApi },
  { slug: "bathtubs", label: "Bathtubs", api: bathtubsApi },
  {
    slug: "concealed-flush-tank",
    label: "Concealed Flush Tanks",
    api: concealedFlushTankApi,
  },
  {
    slug: "public-bathrooms",
    label: "Public Bathrooms",
    api: publicBathroomsApi,
  },
  {
    slug: "accessories",
    label: "Accessories & Furniture",
    api: accessoriesApi,
  },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<CategorySlug | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const activeConfig = CATEGORIES.find((c) => c.slug === activeCategory);

  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          Dashboard
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Manage Sanipure's products.
        </p>
      </RevealSection>

      <section className="mx-auto my-16 max-w-4xl px-6 md:my-20">
        <div className="mb-8 flex justify-center">
          <Link
            to="/dashboard/leads"
            className="flex items-center gap-3 rounded-full border border-white px-8 py-4 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
            </svg>
            Leads Report
          </Link>
        </div>

        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {CATEGORIES.map((category) => {
            const image = categoryImage(category.slug);
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() =>
                  setActiveCategory((prev) => (prev === category.slug ? null : category.slug))
                }
                className={`flex items-center gap-3 rounded-full py-2 pl-2 pr-8 text-sm font-medium uppercase tracking-wide transition-colors ${
                  activeCategory === category.slug
                    ? "bg-white/20 text-white"
                    : "bg-white text-black hover:bg-white/80"
                }`}
              >
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center text-xl leading-none">
                    +
                  </span>
                )}
                Add {category.label}
              </button>
            );
          })}
        </div>

        {activeConfig && (
          <ProductManager
            key={activeConfig.slug}
            categoryLabel={activeConfig.label}
            api={activeConfig.api}
            onClose={() => setActiveCategory(null)}
            showDisplaySection
          />
        )}
      </section>
    </>
  );
};

export default DashboardPage;
