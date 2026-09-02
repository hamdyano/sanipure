import { Link } from "react-router-dom";
import RevealSection from "./shared/RevealSection";
import DirectionalReveal from "./shared/DirectionalReveal";
import toiletImage from "../assets/why sani photos/1.PNG";
import bathtubImage from "../assets/why sani photos/2.PNG";
import bathroomImage from "../assets/why sani photos/3.PNG";

const images = [
  { src: toiletImage, alt: "Sanipure toilet and bidet suite", height: "h-72 md:h-[380px]" },
  { src: bathtubImage, alt: "Sanipure freestanding bathtub", height: "h-80 md:h-[440px]" },
  { src: bathroomImage, alt: "Sanipure full bathroom collection", height: "h-72 md:h-[380px]" },
];

const WhySanipure = () => {
  return (
    <section className="bg-black">
      <RevealSection className="mx-auto max-w-3xl px-6 pb-14 pt-16 text-center md:pb-16 md:pt-20">
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Why Sanipure?
        </h2>
        <p className="mt-2 text-base font-semibold text-white/90 md:text-lg">
          Sanipure is the best choice for homeowners and professionals
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-sm font-medium leading-relaxed text-white/80 md:text-base">
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
          className="mt-10 inline-block rounded-xl bg-neutral-700 px-10 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-neutral-600"
        >
          Learn More
        </Link>
      </RevealSection>

      <div className="relative pb-20 md:pb-32">
        <div className="absolute inset-x-0 bottom-0 h-20 bg-[#2e2e2e] md:h-28" />

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-3 items-center gap-4 px-6 md:gap-8 md:px-10">
          {images.map((image, index) => (
            <DirectionalReveal
              key={image.alt}
              direction="up"
              delay={index * 0.1}
            >
              <img
                src={image.src}
                alt={image.alt}
                className={`w-full ${image.height} rounded-2xl object-cover shadow-2xl`}
              />
            </DirectionalReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySanipure;
