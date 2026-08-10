import { motion } from "motion/react";
import RevealSection from "../components/shared/RevealSection";
import DirectionalReveal from "../components/shared/DirectionalReveal";
import factoryOne from "../assets/who we are photos/Factory 1.png";
import factoryTwo from "../assets/who we are photos/Factory 2.png";
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
            Uncompromising Quality
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">
            Every Sanipure product is built from premium materials and
            finished to exacting standards, designed to withstand daily use
            in homes, hotels, and large-scale developments. From washbasins
            to bathtubs, each piece passes through rigorous quality control
            before it ever reaches a customer.
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
            src={factoryTwo}
            alt="Sanipure manufacturing facility"
            className="h-full w-full object-cover"
          />
        </DirectionalReveal>

        <DirectionalReveal
          direction="right"
          delay={0.12}
          className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24"
        >
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            A Factory Built for Scale
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">
            Our manufacturing facility is one of the largest of its kind in
            the region, home to more than 3,000 professional laborers working
            across every stage of production. That scale lets us hold every
            batch to the same consistent standard while keeping pace with
            demand from homes, hotels, and projects nationwide.
          </p>
        </DirectionalReveal>
      </section>
    </>
  );
};

export default WhoWeArePage;