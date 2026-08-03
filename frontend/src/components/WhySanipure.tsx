import { Link } from "react-router-dom";
import DirectionalReveal from "./shared/DirectionalReveal";
import whyImage from "../assets/whySanipure.jpeg";

const WhySanipure = () => {
  return (
    <section className="my-20 grid grid-cols-1 items-center bg-black md:my-28 lg:grid-cols-2">
      <DirectionalReveal
        direction="left"
        delay={0.12}
        className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24"
      >
        <h2 className="text-4xl font-semibold text-white md:text-5xl">
          Why Sanipure?
        </h2>
        <p className="mt-4 text-lg text-white/70">
          Sanipure is the best choice for homeowners and professionals
        </p>

        <p className="mt-8 max-w-md text-base leading-relaxed text-white/80">
          Sanipure combines advanced manufacturing, contemporary design, and
          premium materials to deliver bathroom solutions trusted across homes,
          hospitality, and commercial projects in Egypt and 14 international
          markets. Our Rimless Technology improves hygiene and makes cleaning up
          to 70% easier, while HydroJet innovation and our water-saving system
          provide powerful performance with only 4.5 liters per flush. Every
          product is manufactured to first-grade quality standards for
          exceptional durability and long-lasting performance. Backed by
          sustainable manufacturing practices and a Lifetime Guarantee against
          manufacturing defects, Sanipure creates bathrooms built to perform
          beautifully for years to come.
        </p>

        <Link
          to="/products"
          className="mt-10 w-fit border border-white px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
        >
          Learn More
        </Link>
      </DirectionalReveal>

      <DirectionalReveal
        direction="right"
        className="h-[320px] w-full lg:h-[480px]"
      >
        <img
          src={whyImage}
          alt="Sanipure bathroom interior"
          className="h-full w-full object-cover"
        />
      </DirectionalReveal>
    </section>
  );
};

export default WhySanipure;
