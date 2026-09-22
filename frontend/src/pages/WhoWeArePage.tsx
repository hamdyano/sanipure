import { motion } from "motion/react";
import RevealSection from "../components/shared/RevealSection";
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
          className="relative z-10 flex h-full flex-col items-start justify-center px-6 text-left sm:px-12 lg:px-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
        >
          <h1 className="font-brand text-[clamp(40px,8vw,96px)] font-medium uppercase leading-[0.95] tracking-normal text-white">
            Who
            <br />
            We Are
          </h1>
          <div className="mt-5 h-[3px] w-24 bg-white" />
        </motion.div>
      </section>

      <section className="mt-20 bg-black pb-16 md:mt-28 md:pb-20">
        <RevealSection className="grid grid-cols-1 gap-1 sm:grid-cols-3">
          {[
            {
              src: factoryThree,
              alt: "Sanipure rimless toilets and customizable shower trays",
            },
            {
              src: factoryFour,
              alt: "Sanipure HydroJet water-saving toilet technology",
            },
            {
              src: factoryFive,
              alt: "Sanipure first grade quality manufacturing",
            },
          ].map((image) => (
            <div
              key={image.src}
              className="relative aspect-[3/4] w-full cursor-pointer transition-transform duration-500 ease-out hover:z-20 hover:scale-110 hover:shadow-2xl"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </RevealSection>

        <RevealSection
          delay={0.15}
          className="relative -mt-10 mx-4 rounded-3xl bg-neutral-900 px-6 py-12 sm:-mt-16 sm:mx-8 lg:mx-12 lg:px-16 xl:px-24"
        >
          <h2 className="text-4xl font-semibold text-white md:text-5xl">
            Design Without Limits & Rimless Technology
          </h2>

          <h3 className="mt-8 text-2xl font-semibold text-white md:text-3xl">
            Tailored to Every Space.
          </h3>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/80 md:text-xl">
            An extensive selection of styles, colors, and sizes to
            customizable shower trays tailored with decorative prints and
            flexible cutting options, every detail is created to complement
            your space. Our free-standing washbasins are thoughtfully
            designed with integrated accessories, delivering a complete
            solution that brings together elegance, practicality, and
            effortless installation.
          </p>

          <h3 className="mt-8 text-2xl font-semibold text-white md:text-3xl">
            Cleaner by Design.
          </h3>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/80 md:text-xl">
            No rims. No hidden bacteria. Our Rimless toilets improve hygiene
            and make cleaning up to 70% easier, ensuring a cleaner bathroom
            with every flush.
          </p>
        </RevealSection>
      </section>
    </>
  );
};

export default WhoWeArePage;