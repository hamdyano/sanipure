import { useEffect, useRef, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import DirectionalReveal from "../components/shared/DirectionalReveal";
import washbasinsImage from "../assets/categories photos/Washbasins photo.jpg";
import toiletsImage from "../assets/categories photos/Toilets photo.jpg";
import bathtubsImage from "../assets/categories photos/Bathtubs photo.jpg";
import accessoriesImage from "../assets/categories photos/Accessories photo.jpg";
import publicBathroomsImage from "../assets/categories photos/Public Bathrooms photo.jpg";
import bathroomCollectionImage from "../assets/categories photos/Bathroom collection photo.jpg";
import concealedFlushTankImage from "../assets/categories photos/7th category.jpg";

interface Category {
  name: string;
  slug: string;
  image: string;
  headline: string;
  description: string;
  shopPath?: string;
}

const categories: Category[] = [
  {
    name: "Washbasins",
    slug: "washbasins",
    image: washbasinsImage,
    headline: "Washbasins",
    description:
      "Explore a diverse range of washbasins made to bring character and elegance to every bathroom. Find the shape, size, and finish that suit your space.",
    shopPath: "/products/washbasins/categories",
  },
  {
    name: "Toilets",
    slug: "toilets",
    image: toiletsImage,
    headline: "Toilets",
    description:
      "Discover toilets that combine refined design with advanced functionality. From rimless designs to water-saving flushing technologies, find solutions for everyday performance and lasting comfort.",
    shopPath: "/products/toilets/categories",
  },
  {
    name: "Bathtubs",
    slug: "bathtubs",
    image: bathtubsImage,
    headline: "Bathtubs",
    description:
      "Create a space dedicated to relaxation with our bathtubs. Discover a selection of refined forms and premium finishes designed to elevate the bathing experience.",
    shopPath: "/products/bathtubs/categories",
  },
  {
    name: "Accessories & Furniture",
    slug: "accessories",
    image: accessoriesImage,
    headline: "Accessories & Furniture",
    description:
      "Complete your bathroom with furniture and accessories that bring style and practicality together. Explore functional solutions created to complement your sanitaryware and keep every detail beautifully organized.",
  },
  {
    name: "Public Bathrooms",
    slug: "public-bathrooms",
    image: publicBathroomsImage,
    headline: "Public Bathrooms",
    description:
      "Check our durable, practical solutions designed specifically for high-traffic public and commercial spaces. Our range combines reliable performance, hygiene-focused designs, and functionality to meet demanding everyday environments.",
  },
  {
    name: "Bathroom Collection",
    slug: "bathroom-collection",
    image: bathroomCollectionImage,
    headline: "Bathroom Collection",
    description:
      "Discover complete bathroom collections where every element is designed to work together seamlessly. Explore coordinated designs that create a distinctive bathroom aesthetic.",
  },
  {
    name: "Concealed Flush Tank",
    slug: "concealed-flush-tank",
    image: concealedFlushTankImage,
    headline: "Concealed Flush Tank",
    description:
      "Keep your bathroom clean and clutter-free with concealed flush tanks hidden neatly inside the wall. Enjoy quiet, water-efficient flushing and more usable space, paired with a sleek finish that suits any modern design.",
  },
];

// Simple line icons shown in the circle badge on each category card.
const categoryIcons: Record<string, ReactNode> = {
  washbasins: (
    <>
      <path d="M3 11h18v1a7 7 0 0 1-7 7h-4a7 7 0 0 1-7-7z" />
      <path d="M12 11V6a2 2 0 0 1 2-2h3" />
    </>
  ),
  toilets: (
    <>
      <rect x="7" y="3" width="10" height="5" rx="1" />
      <path d="M5 10h14a7 5 0 0 1-5 5l1 6H9l1-6a7 5 0 0 1-5-5z" />
    </>
  ),
  bathtubs: (
    <>
      <path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" />
      <path d="M6 12V6a2 2 0 0 1 4 0" />
      <path d="M7 19l-1 2M17 19l1 2" />
    </>
  ),
  accessories: (
    <>
      <rect x="4" y="4" width="16" height="12" rx="1" />
      <path d="M12 4v12M10 10h0.01M14 10h0.01M6 16v3M18 16v3" />
    </>
  ),
  "public-bathrooms": (
    <>
      <circle cx="8" cy="5" r="2" />
      <circle cx="16" cy="5" r="2" />
      <path d="M8 8v13M5 9h6v6H5zM16 8l-3 8h6zM15 16v5M17 16v5" />
    </>
  ),
  "bathroom-collection": (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  "concealed-flush-tank": (
    <>
      <rect x="6" y="3" width="12" height="18" rx="1" />
      <rect x="8.5" y="7" width="7" height="4" rx="1" />
      <path d="M12 7v4" />
    </>
  ),
};

const ProductsPage = () => {
  const { category: activeSlug } = useParams<{ category?: string }>();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!activeSlug) return;
    const target = sectionRefs.current[activeSlug];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeSlug]);

  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          Products
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Explore our full range of sanitary ware, crafted at scale and
          trusted across Egypt.
        </p>
      </RevealSection>

      <section className="mx-auto my-16 grid max-w-6xl grid-cols-1 gap-6 px-6 md:my-20 md:grid-cols-2 md:gap-8 lg:px-10">
        {categories.map((category, index) => {
          const isRightColumn = index % 2 === 1;
          return (
            <div
              key={category.name}
              ref={(el) => {
                sectionRefs.current[category.slug] = el;
              }}
              className="scroll-mt-24"
            >
              <DirectionalReveal
                direction="up"
                delay={(index % 2) * 0.1}
                className="group relative h-64 overflow-hidden rounded-2xl sm:h-72"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/35" />

                <div
                  className={`absolute top-5 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 text-white/90 ${
                    isRightColumn ? "right-5" : "left-5"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden
                  >
                    {categoryIcons[category.slug]}
                  </svg>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                  <div className="min-w-0">
                    <h2 className="font-brand text-3xl font-bold text-white md:text-4xl">
                      {category.headline}
                    </h2>
                    <p className="mt-2 max-w-xs text-xs leading-snug text-white/80 sm:text-sm">
                      {category.description}
                    </p>
                  </div>
                  {category.shopPath && (
                    <Link
                      to={category.shopPath}
                      className="shrink-0 rounded-md bg-white/85 px-5 py-1.5 font-brand text-base font-semibold text-black transition-colors hover:bg-white"
                    >
                      See More
                    </Link>
                  )}
                </div>
              </DirectionalReveal>
            </div>
          );
        })}
      </section>
    </>
  );
};

export default ProductsPage;