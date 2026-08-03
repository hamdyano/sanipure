import { Link } from "react-router-dom";
import RevealSection from "./shared/RevealSection";
import DirectionalReveal from "./shared/DirectionalReveal";
import washbasinsImage from "../assets/categories photos/Washbasins photo.jpg";
import toiletsImage from "../assets/categories photos/Toilets photo.jpg";
import bathtubsImage from "../assets/categories photos/Bathtubs photo.jpg";
import accessoriesImage from "../assets/categories photos/Accessories photo.jpg";
import publicBathroomsImage from "../assets/categories photos/Public Bathrooms photo.jpg";
import bathroomCollectionImage from "../assets/categories photos/Bathroom collection photo .jpg";

const categories = [
  {
    name: "Washbasins",
    cta: "View All Products",
    to: "/products/washbasins",
    image: washbasinsImage,
  },
  {
    name: "Toilets",
    cta: "View All Products",
    to: "/products/toilets",
    image: toiletsImage,
  },
  {
    name: "Bathtubs",
    cta: "View All Products",
    to: "/products/bathtubs",
    image: bathtubsImage,
  },
  {
    name: "Accessories",
    cta: "View All Products",
    to: "/products/accessories",
    image: accessoriesImage,
  },
  {
    name: "Public Bathrooms",
    cta: "View All Products",
    to: "/products/public-bathrooms",
    image: publicBathroomsImage,
  },
  {
    name: "Bathroom Collection",
    cta: "View All Products",
    to: "/products/bathroom-collection",
    image: bathroomCollectionImage,
  },
];

// Left-column cards slide in from the left, right-column from the right,
// converging toward center.
const cardDirections: Array<"left" | "right"> = [
  "left",
  "right",
  "left",
  "right",
  "left",
  "right",
];

const Categories = () => {
  return (
    <section className="mb-20 bg-[#080808] md:mb-28">
      <RevealSection>
        <h2 className="px-6 pb-8 pt-12 text-center text-4xl font-semibold text-white md:text-5xl">
         Discover Our Categories
        </h2>
      </RevealSection>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {categories.map((category, index) => {
          const cardDelay = index * 0.08;
          return (
            <DirectionalReveal
              key={category.name}
              direction={cardDirections[index % cardDirections.length]}
              delay={cardDelay}
            >
              <Link
                to={category.to}
                className="group relative block h-[380px] overflow-hidden lg:h-[440px]"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
                <RevealSection
                  delay={cardDelay + 0.12}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center"
                >
                  <h3 className="text-2xl font-medium text-white md:text-3xl">
                    {category.name}
                  </h3>
                  <span className="text-sm font-medium text-white underline underline-offset-4">
                    {category.cta}
                  </span>
                </RevealSection>
              </Link>
            </DirectionalReveal>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;
