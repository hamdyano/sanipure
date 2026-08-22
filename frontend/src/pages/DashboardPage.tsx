import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import ProductManager from "../components/dashboard/ProductManager";
import { isAuthenticated } from "../api/clientApi";
import washbasinsApi from "../api/washbasinsApi";
import toiletsApi from "../api/toiletsApi";
import bathtubsApi from "../api/bathtubsApi";

type CategorySlug = "washbasins" | "toilets" | "bathtubs";

const CATEGORIES: { slug: CategorySlug; label: string; api: typeof washbasinsApi }[] = [
  { slug: "washbasins", label: "Washbasins", api: washbasinsApi },
  { slug: "toilets", label: "Toilets", api: toiletsApi },
  { slug: "bathtubs", label: "Bathtubs", api: bathtubsApi },
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
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() =>
                setActiveCategory((prev) => (prev === category.slug ? null : category.slug))
              }
              className={`flex items-center gap-3 rounded-full px-8 py-4 text-sm font-medium uppercase tracking-wide transition-colors ${
                activeCategory === category.slug
                  ? "bg-white/20 text-white"
                  : "bg-white text-black hover:bg-white/80"
              }`}
            >
              <span className="text-xl leading-none">+</span>
              Add {category.label}
            </button>
          ))}
        </div>

        {activeConfig && (
          <ProductManager
            key={activeConfig.slug}
            categoryLabel={activeConfig.label}
            api={activeConfig.api}
            onClose={() => setActiveCategory(null)}
          />
        )}
      </section>
    </>
  );
};

export default DashboardPage;
