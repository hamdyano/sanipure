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
    image: washbasinsImage,
    headline: "Washbasins",
    description:
      "Sculpted for everyday use and finished to a lasting shine, our washbasins bring together clean lines and durable ceramics. From compact countertop designs to freestanding pieces, every basin is built to hold its form and finish through years of daily use.",
  },
  {
    name: "Toilets",
    image: toiletsImage,
    headline: "Toilets",
    description:
      "Engineered for reliable performance and effortless cleaning, our toilet collection pairs efficient flushing systems with refined silhouettes. Each unit is pressure-tested and glazed to resist staining, keeping bathrooms hygienic with minimal upkeep.",
  },
  {
    name: "Bathtubs",
    image: bathtubsImage,
    headline: "Bathtubs",
    description:
      "Designed for comfort as much as style, our bathtubs are cast from premium acrylic and reinforced materials that retain heat and resist wear. Whether the space calls for a compact tub or a statement centerpiece, each model is built for lasting comfort.",
  },
  {
    name: "Accessories",
    image: accessoriesImage,
    headline: "Accessories",
    description:
      "The finishing touches that complete a bathroom, our accessories range covers everything from fittings to fixtures, all crafted to match the durability and finish of the rest of the Sanipure collection.",
  },
  {
    name: "Public Bathrooms",
    image: publicBathroomsImage,
    headline: "Public Bathrooms",
    description:
      "Built for high-traffic environments, our public bathroom solutions are engineered for heavy daily use without compromising on hygiene or design. Hotels, malls, and commercial developments trust these fixtures to perform under constant demand.",
  },
  {
    name: "Bathroom Collection",
    image: bathroomCollectionImage,
    headline: "Bathroom Collection",
    description:
      "A complete range designed to work together, our bathroom collection brings washbasins, toilets, bathtubs, and accessories into one cohesive line, so every space can be finished with a consistent look and feel.",
  },
];

const ProductsPage = () => {
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
        return (
          <section
            key={category.name}
            className={`grid grid-cols-1 items-center bg-black lg:grid-cols-2 ${
              index === 0 ? "my-20 md:my-28" : "mb-20 md:mb-28"
            }`}
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