import { Link } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import DirectionalReveal from "../components/shared/DirectionalReveal";
import floorStandingImage from "../assets/categories photos/Sub categories photos/toilets sub category photos/floor standing.jpg";
import wallMountedImage from "../assets/categories photos/Sub categories photos/toilets sub category photos/wall mounted.jpg";

const subCategories = [
  {
    name: "Floor-Standing",
    image: floorStandingImage,
    description:
      "Classic, sturdy toilets that stand directly on the floor — a reliable fit for any bathroom layout.",
    shopPath: "/products/toilets/shop-toilets?subcategory=Floor-Standing",
  },
  {
    name: "Wall-Mounted",
    image: wallMountedImage,
    description:
      "Wall-hung toilets that create a floating look, making cleaning easier and the bathroom feel more spacious.",
    shopPath: "/products/toilets/shop-toilets?subcategory=Wall-Mounted",
  },
];

const cardDirections: Array<"left" | "right"> = ["left", "right"];

const ToiletsCategoriesPage = () => {
  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          Toilets
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Choose a category to explore our range of toilets.
        </p>
      </RevealSection>

      <section className="mx-auto my-12 flex max-w-6xl flex-col gap-6 px-6 md:my-16 lg:px-12">
        {subCategories.map((subCategory, index) => (
          <DirectionalReveal
            key={subCategory.name}
            direction={cardDirections[index % cardDirections.length]}
            delay={(index % 2) * 0.1}
            className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] lg:flex-row lg:h-64"
          >
            <div className="h-56 w-full overflow-hidden lg:h-full lg:w-2/5">
              <img
                src={subCategory.image}
                alt={subCategory.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 p-8 lg:p-10">
              <h3 className="text-2xl font-semibold text-white">
                {subCategory.name}
              </h3>
              <p className="max-w-xl text-base leading-relaxed text-white/70">
                {subCategory.description}
              </p>
              <Link
                to={subCategory.shopPath}
                className="mt-2 w-fit border border-white px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
              >
                View {subCategory.name}
              </Link>
            </div>
          </DirectionalReveal>
        ))}
      </section>
    </>
  );
};

export default ToiletsCategoriesPage;
