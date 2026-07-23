import { Link } from "react-router-dom";
import whyImage from "../assets/whySanipure.jpeg";

const WhySanipure = () => {
  return (
    <section className="my-20 grid grid-cols-1 items-center bg-black md:my-28 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">
        <h2 className="text-4xl font-semibold text-white md:text-5xl">
          Why Sanipure?
        </h2>
        <p className="mt-4 text-lg text-white/70">
          Premium sanitary ware designed for modern living.
        </p>

        <p className="mt-8 max-w-md text-base leading-relaxed text-white/80">
          Built from high-quality materials with elegant, contemporary
          designs, Sanipure offers a wide range of bathroom collections
          trusted by homeowners, architects, and contractors alike — all
          backed by reliable after-sales support.
        </p>

        <Link
          to="/products"
          className="mt-10 w-fit border border-white px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
        >
          Explore Our Collections
        </Link>
      </div>

      <div className="h-[320px] w-full lg:h-[480px]">
        <img
          src={whyImage}
          alt="Sanipure bathroom interior"
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
};

export default WhySanipure;
