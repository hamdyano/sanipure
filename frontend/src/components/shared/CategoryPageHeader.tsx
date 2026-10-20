import { Link } from "react-router-dom";
import RevealSection from "./RevealSection";
import { CATEGORIES } from "../../data/categories";

interface CategoryPageHeaderProps {
  /** Id of the category whose page this is (see data/categories.ts). */
  categoryId: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  search: string;
  onSearchChange: (value: string) => void;
}

/**
 * Hero and category bar at the top of each category's product page
 * (Washbasins, Toilets, Bathtubs). The bar links to all 7 categories, so a
 * visitor can jump straight from one category to another; the current one is
 * highlighted. The hero photo runs down behind the bar instead of stopping
 * above it.
 */
const CategoryPageHeader = ({
  categoryId,
  title,
  subtitle,
  image,
  imageAlt,
  search,
  onSearchChange,
}: CategoryPageHeaderProps) => {
  return (
    <section className="relative flex min-h-[calc(60vh+6.5rem)] w-full flex-col overflow-hidden bg-black md:min-h-[calc(70vh+6.5rem)]">
      <img src={image} alt={imageAlt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/55" />
      {/* Soft fade at the very bottom, so the photo ends in the page's black
          instead of a hard edge just under the bar. */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent" />

      <div className="relative z-10 flex flex-1 items-center justify-center">
        <RevealSection className="px-6 text-center">
          <h1 className="text-4xl font-semibold text-white md:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">{subtitle}</p>
        </RevealSection>
      </div>

      <div className="relative z-10 px-6 pb-6 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 rounded-[2rem] bg-white p-2 shadow-lg md:flex-row md:items-center md:gap-2">
          <nav
            aria-label="Product categories"
            className="flex min-w-0 flex-1 flex-wrap items-center gap-1 px-1 py-1 xl:flex-nowrap"
          >
            {CATEGORIES.map((category) => {
              const isCurrent = category.id === categoryId;
              return (
                <Link
                  key={category.id}
                  to={category.shopHref ?? category.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    isCurrent ? "bg-black text-white" : "text-black/70 hover:bg-black/5"
                  }`}
                >
                  {category.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 md:w-48 md:shrink-0 xl:w-52">
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
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search…"
              aria-label={`Search ${title.toLowerCase()}`}
              className="w-full bg-transparent text-sm text-black placeholder:text-black/40 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryPageHeader;
