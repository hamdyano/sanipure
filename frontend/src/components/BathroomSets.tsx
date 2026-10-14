import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useInView } from "motion/react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useSlideAutoplay } from "../hooks/useSlideAutoplay";
import keplerImage from "../assets/washbasins shop photos/Kepler Furniture.jpg";
import titanImage from "../assets/toilets shop photos/Titan Wall Mounted.jpg";
import vegaImage from "../assets/washbasins shop photos/Vega Half Pedestal.jpg";
import rosettaImage from "../assets/washbasins shop photos/Rosetta Half Pedestal.jpg";
import completeImage from "../assets/bathtubs shop photos/hero section.jpg";

interface BathroomSet {
  id: string;
  title: [string, string];
  series: string;
  caption: string;
  pieces: string;
  note: string;
  image: string;
}

// Each set pairs pieces from the same series that exist in the catalogue.
const sets: BathroomSet[] = [
  {
    id: "kepler",
    title: ["The Art", "of Order"],
    series: "Kepler",
    caption: "Crisp, square forms",
    pieces: "Furniture washbasin · Wall-mounted or close-coupled toilet",
    note: "Matching pieces from the Kepler series",
    image: keplerImage,
  },
  {
    id: "titan",
    title: ["Bold by", "Design"],
    series: "Titan",
    caption: "Smooth, solid shapes",
    pieces: "Furniture washbasin · Wall-mounted or close-coupled toilet",
    note: "Matching pieces from the Titan series",
    image: titanImage,
  },
  {
    id: "vega",
    title: ["Soft Curves,", "Warm Tones"],
    series: "Vega",
    caption: "Rounded comfort",
    pieces: "Half-pedestal washbasin · Toilet & bidet",
    note: "Matching pieces from the Vega series",
    image: vegaImage,
  },
  {
    id: "rosetta",
    title: ["A Quiet", "Classic"],
    series: "Rosetta",
    caption: "Timeless, gentle lines",
    pieces: "Half-pedestal washbasin · Wall-hung toilet",
    note: "Matching pieces from the Rosetta series",
    image: rosettaImage,
  },
  {
    id: "complete",
    title: ["The Complete", "Bathroom"],
    series: "Suite",
    caption: "Basin, toilet & bathtub",
    pieces: "Washbasin · Toilet · Bathtub",
    note: "Pair any series with a Sanipure bathtub",
    image: completeImage,
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

const BathroomSets = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  const set = sets[index];
  // Alternate the title between the right and left side, like the reference.
  const alignRight = index % 2 === 0;

  const advance = useCallback(() => setIndex((current) => (current + 1) % sets.length), []);
  // Only advance while the section is on screen; it changes quickly once it appears.
  const markStarted = useSlideAutoplay({
    running: inView && !prefersReducedMotion,
    slideKey: index,
    advance,
  });

  // A manual pick gets a full slide before autoplay moves on.
  const goTo = (next: number) => {
    markStarted();
    setIndex(next);
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-roledescription="carousel"
        aria-labelledby="bathroom-sets-heading"
        className="relative mb-20 h-screen min-h-[600px] w-full overflow-hidden bg-black md:mb-28"
      >
        {/* Background: crossfades through a blur into the next set. */}
        <AnimatePresence initial={false}>
          <motion.div
            key={set.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.12, filter: "blur(16px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <img
              src={set.image}
              alt=""
              className="h-full w-full animate-[sets-zoom_5s_ease-out_forwards] object-cover motion-reduce:animate-none"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-black/50" />

        {/* Title: the old one zooms out past the viewer, the new one sharpens in. */}
        <div className="absolute inset-x-0 top-0 bottom-36 flex items-center px-6 md:bottom-32 md:px-16 lg:px-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={set.id}
              className={`flex w-full ${alignRight ? "md:justify-end" : ""}`}
              initial={{ opacity: 0, scale: 1.15, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              // Ease-in so the oversized letters stay visible before fading.
              exit={{
                opacity: 0,
                scale: 2.4,
                filter: "blur(4px)",
                transition: { duration: 0.45, ease: [0.55, 0, 1, 0.45] },
              }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ transformOrigin: alignRight ? "75% 50%" : "25% 50%" }}
            >
              <div>
                <h2
                  id="bathroom-sets-heading"
                  className="font-brand text-sm uppercase tracking-[0.2em] text-copper md:text-base"
                >
                  Bathroom Sets
                </h2>
                <h3 className="mt-3 font-heading text-[clamp(34px,7vw,104px)] uppercase leading-[1] text-white">
                  <span className="block">{set.title[0]}</span>
                  <span className="flex flex-wrap items-end gap-x-5">
                    <span>{set.title[1]}</span>
                    <span className="mb-[0.18em] block normal-case leading-none">
                      <span className="block font-accent text-[clamp(22px,2.6vw,36px)] text-copper">
                        {set.series}
                      </span>
                      <span className="mt-1 block font-brand text-xs tracking-normal text-white/70">
                        {set.caption}
                      </span>
                    </span>
                  </span>
                </h3>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom band */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-6 border-t border-white/5 bg-black/40 px-6 py-6 backdrop-blur-[2px] md:px-16 md:py-8 lg:px-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={set.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="min-w-0"
            >
              <p className="max-w-xs font-brand text-xs font-medium uppercase leading-snug tracking-wide text-white md:max-w-sm md:text-sm">
                {set.pieces}
              </p>
              <p className="mt-2 text-xs text-white/60">
                {set.note} ·{" "}
                <Link to="/products" className="text-white/80 underline-offset-4 hover:text-white hover:underline">
                  Explore products
                </Link>
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex shrink-0 items-center gap-6">
            <div className="hidden items-center gap-4 sm:flex">
              {sets.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show the ${item.series} set`}
                  aria-current={i === index}
                  className={`border-b pb-1 font-brand text-sm transition-colors ${
                    i === index
                      ? "border-copper text-white"
                      : "border-transparent text-white/40 hover:text-white/80"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => goTo((index + 1) % sets.length)}
              aria-label="Next bathroom set"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-copper text-black transition-transform hover:scale-105 md:h-14 md:w-14"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
};

export default BathroomSets;
