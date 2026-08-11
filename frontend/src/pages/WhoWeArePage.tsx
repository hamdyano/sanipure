import { motion } from "motion/react";
import RevealSection from "../components/shared/RevealSection";
import DirectionalReveal from "../components/shared/DirectionalReveal";
import factoryOne from "../assets/who we are photos/Factory 1.png";
import factoryThree from "../assets/who we are photos/factory 3.jpg";
import factoryFour from "../assets/who we are photos/factory 4.jpg";
import factoryFive from "../assets/who we are photos/factory 5.jpg";
import whoWeAreVideo from "../assets/who we are photos/who we are video.mp4";

const WhoWeArePage = () => {
  return (
    <>
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={whoWeAreVideo}
          autoPlay
          muted
          loop
          playsInline
        />

        <motion.div
          className="absolute inset-0 bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        <motion.div
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        >
          <h1 className="max-w-3xl text-4xl font-semibold text-white md:text-6xl">
            Who We Are
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/90">
            Premium sanitary ware, crafted at scale, trusted across Egypt.
          </p>
        </motion.div>
      </section>

      <section className="my-20 grid grid-cols-1 items-center bg-black md:my-28 lg:grid-cols-2">
        <DirectionalReveal
          direction="left"
          delay={0.12}
          className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24"
        >
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
           Shaping Spaces Worldwide 
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">
            Sanipure is one of Egypt's leading sanitaryware manufacturers, creating premium bathroom solutions that combine contemporary design, advanced manufacturing, and uncompromising quality. With a footprint of 80,000 m2 and total build up area of 60,000 m2 with over than 2,000 skilled professionals, we produce more than 1.6 million ceramic, acrylic, and composite products annually for our own brand and as a trusted manufacturing partner for leading international brands. Today, our products are specified in residential, hospitality, and commercial projects and exported to 14 countries, reflecting our commitment to world-class quality, innovation, and sustainable manufacturing
          </p>
        </DirectionalReveal>

        <DirectionalReveal
          direction="right"
          className="h-[320px] w-full lg:h-[480px]"
        >
          <img
            src={factoryOne}
            alt="Sanipure factory production line"
            className="h-full w-full object-cover"
          />
        </DirectionalReveal>
      </section>

      <section className="mb-20 grid grid-cols-1 items-center bg-black md:mb-28 lg:grid-cols-2">
        <DirectionalReveal
          direction="left"
          className="h-[320px] w-full lg:h-[480px]"
        >
          <img
            src={factoryThree}
            alt="Sanipure rimless toilets and customizable shower trays"
            className="h-full w-full object-cover"
          />
        </DirectionalReveal>

        <DirectionalReveal
          direction="right"
          delay={0.12}
          className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24"
        >
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Design Without Limits & Rimless Technology
          </h2>

          <h3 className="mt-8 text-xl font-semibold text-white">
            Tailored to Every Space.
          </h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
            An extensive selection of styles, colors, and sizes to
            customizable shower trays tailored with decorative prints and
            flexible cutting options, every detail is created to complement
            your space. Our free-standing washbasins are thoughtfully
            designed with integrated accessories, delivering a complete
            solution that brings together elegance, practicality, and
            effortless installation.
          </p>

          <h3 className="mt-8 text-xl font-semibold text-white">
            Cleaner by Design.
          </h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
            No rims. No hidden bacteria. Our Rimless toilets improve hygiene
            and make cleaning up to 70% easier, ensuring a cleaner bathroom
            with every flush.
          </p>
        </DirectionalReveal>
      </section>

      <section className="mb-20 grid grid-cols-1 items-center bg-black md:mb-28 lg:grid-cols-2">
        <DirectionalReveal
          direction="left"
          delay={0.12}
          className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24"
        >
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Water-Saving Performance & HydroJet Innovation
          </h2>

          <h3 className="mt-8 text-xl font-semibold text-white">
            Save Water. Every Flush.
          </h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
            Powered by our latest flushing technology, our toilets deliver
            powerful cleaning performance while using only 4.5 liters per
            flush, reducing water consumption without compromising
            efficiency.
          </p>

          <h3 className="mt-8 text-xl font-semibold text-white">
            Smarter Flushing Technology.
          </h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
            Our patented HydroJet nozzle technology delivers enhanced
            flushing performance through optimized water flow, ensuring
            cleaner and more efficient operation.
          </p>
        </DirectionalReveal>

        <DirectionalReveal
          direction="right"
          className="h-[320px] w-full lg:h-[480px]"
        >
          <img
            src={factoryFour}
            alt="Sanipure HydroJet water-saving toilet technology"
            className="h-full w-full object-cover"
          />
        </DirectionalReveal>
      </section>

      <section className="mb-20 grid grid-cols-1 items-center bg-black md:mb-28 lg:grid-cols-2">
        <DirectionalReveal
          direction="left"
          className="h-[320px] w-full lg:h-[480px]"
        >
          <img
            src={factoryFive}
            alt="Sanipure first grade quality manufacturing"
            className="h-full w-full object-cover"
          />
        </DirectionalReveal>

        <DirectionalReveal
          direction="right"
          delay={0.12}
          className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24"
        >
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            First Grade Quality & Lifetime Guarantee
          </h2>

          <h3 className="mt-8 text-xl font-semibold text-white">
            Manufactured Without Compromise.
          </h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
            Every Sanipure product is manufactured using premium raw
            materials and advanced production processes, ensuring consistent
            quality, durability, and long-lasting performance.
          </p>

          <h3 className="mt-8 text-xl font-semibold text-white">
            Confidence That Lasts.
          </h3>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/80">
            We stand behind the quality of our products with a Lifetime
            Guarantee against manufacturing defects, giving customers lasting
            peace of mind.
          </p>
        </DirectionalReveal>
      </section>
    </>
  );
};

export default WhoWeArePage;