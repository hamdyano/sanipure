import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import DirectionalReveal from "../components/shared/DirectionalReveal";
import washbasinsImage from "../assets/categories photos/Washbasins photo.jpg";
import toiletsImage from "../assets/categories photos/Toilets photo.jpg";
import bathtubsImage from "../assets/categories photos/Bathtubs photo.jpg";
import accessoriesImage from "../assets/categories photos/Accessories photo.jpg";
import publicBathroomsImage from "../assets/categories photos/Public Bathrooms photo.jpg";
import bathroomCollectionImage from "../assets/categories photos/Bathroom collection photo .jpg";

const categories = [
  {
    name: "Washbasins",
    slug: "washbasins",
    image: washbasinsImage,
    headline: "Washbasins",
    description:
      "Explore a diverse range of washbasins made to bring character and elegance to every bathroom. Find the shape, size, and finish that suit your space.",
  },
  {
    name: "Toilets",
    slug: "toilets",
    image: toiletsImage,
    headline: "Toilets",
    description:
      "Discover toilets that combine refined design with advanced functionality. From rimless designs to water-saving flushing technologies, find solutions for everyday performance and lasting comfort.",
  },
  {
    name: "Bathtubs",
    slug: "bathtubs",
    image: bathtubsImage,
    headline: "Bathtubs",
    description:
      "Create a space dedicated to relaxation with our bathtubs. Discover a selection of refined forms and premium finishes designed to elevate the bathing experience.",
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
];

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

      {categories.map((category, index) => {
        const imageFirst = index % 2 === 0;
        const isActive = category.slug === activeSlug;
        return (
          <section
            key={category.name}
            ref={(el) => {
              sectionRefs.current[category.slug] = el;
            }}
            className={`grid scroll-mt-24 grid-cols-1 items-center bg-black transition-shadow duration-700 lg:grid-cols-2 ${
              index === 0 ? "my-20 md:my-28" : "mb-20 md:mb-28"
            } ${isActive ? "ring-2 ring-inset ring-white/50" : ""}`}
          >
            {imageFirst ? (
              <>
                <DirectionalReveal
                  direction="left"
                  className="h-[320px] w-full lg:h-[480px]"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                </DirectionalReveal>

                <DirectionalReveal
                  direction="right"
                  delay={0.12}
                  className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24"
                >
                  <h2 className="text-3xl font-semibold text-white md:text-4xl">
                    {category.headline}
                  </h2>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">
                    {category.description}
                  </p>
                </DirectionalReveal>
              </>
            ) : (
              <>
                <DirectionalReveal
                  direction="left"
                  delay={0.12}
                  className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24"
                >
                  <h2 className="text-3xl font-semibold text-white md:text-4xl">
                    {category.headline}
                  </h2>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">
                    {category.description}
                  </p>
                </DirectionalReveal>

                <DirectionalReveal
                  direction="right"
                  className="h-[320px] w-full lg:h-[480px]"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                </DirectionalReveal>
              </>
            )}
          </section>
        );
      })}
    </>
  );
};

export default ProductsPage;