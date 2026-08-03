import RevealSection from "../components/shared/RevealSection";
import DirectionalReveal from "../components/shared/DirectionalReveal";
import factoryOne from "../assets/who we are photos/Factory 1.png";
import factoryTwo from "../assets/who we are photos/Factory 2.png";

const WhoWeArePage = () => {
  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 text-center md:pt-28">
        <h1 className="text-4xl font-semibold text-white md:text-5xl">
          Who We Are
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
          Premium sanitary ware, crafted at scale, trusted across Egypt.
        </p>
      </RevealSection>

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