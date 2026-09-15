import { Link } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import DirectionalReveal from "../components/shared/DirectionalReveal";
import counterTopImage from "../assets/categories photos/Sub categories photos/washbasins sub category photos/countertop.png";
import floorStandingImage from "../assets/categories photos/Sub categories photos/washbasins sub category photos/floor standing.jpg";
import overCounterImage from "../assets/categories photos/Sub categories photos/washbasins sub category photos/over counter.webp";
import wallMountedImage from "../assets/categories photos/Sub categories photos/washbasins sub category photos/wall mounted.jpg";
import underCounterImage from "../assets/categories photos/Sub categories photos/washbasins sub category photos/under counter.jpg";
import pedestalImage from "../assets/categories photos/Sub categories photos/washbasins sub category photos/pedestal.jpg";
import furnitureImage from "../assets/categories photos/Sub categories photos/washbasins sub category photos/furniture.jpg";

const subCategories = [
  {
    name: "Counter-Top",
    image: counterTopImage,
    description:
      "Washbasins that sit on top of the counter, adding a striking focal point to any bathroom vanity.",
    shopPath: "/products/washbasins/shop-washbasins?subcategory=Counter-Top",
  },
  {
    name: "Floor-Standing",
    image: floorStandingImage,
    description:
      "Freestanding washbasins that stand directly on the floor, combining bold design with practical stability.",
    shopPath: "/products/washbasins/shop-washbasins?subcategory=Floor-Standing",
  },
  {
    name: "Over-Counter",
    image: overCounterImage,
    description:
      "Washbasins set into the countertop for a seamless, integrated look that's easy to keep clean.",
    shopPath: "/products/washbasins/shop-washbasins?subcategory=Over-Counter",
  },
  {
    name: "Wall-Mounted",
    image: wallMountedImage,
    description:
      "Wall-hung washbasins that create a floating look, making cleaning easier and the bathroom feel more spacious.",
    shopPath: "/products/washbasins/shop-washbasins?subcategory=Wall-Mounted",
  },
  {
    name: "Under-Counter",
    image: underCounterImage,
    description:
      "Washbasins mounted beneath the counter for a clean, minimal edge and effortless countertop wipe-downs.",
    shopPath: "/products/washbasins/shop-washbasins?subcategory=Under-Counter",
  },
  {
    name: "Pedestal",
    image: pedestalImage,
    description:
      "Classic pedestal washbasins that hide the plumbing while keeping the footprint compact and elegant.",
    shopPath: "/products/washbasins/shop-washbasins?subcategory=Pedestal",
  },
  {
    name: "Furniture",
    image: furnitureImage,
    description:
      "Washbasins paired with matching furniture units for built-in storage and a coordinated bathroom look.",
    shopPath: "/products/washbasins/shop-washbasins?subcategory=Furniture",
  },
];

const cardDirections: Array<"left" | "right"> = ["left", "right"];

const WashbasinsCategoriesPage = () => {
  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          Washbasins
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Choose a category to explore our range of washbasins.
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

export default WashbasinsCategoriesPage;
