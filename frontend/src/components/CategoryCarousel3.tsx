import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useInView, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useSlideAutoplay } from "../hooks/useSlideAutoplay";
import { CATEGORIES, type CarouselCategory } from "../data/categories";

interface CategorySlide extends CarouselCategory {
  /** Shown in giant faint letters behind the frame — kept to one short word,
   *  since at this size a long name would run far off the page. */
  ghost: string;
  /** First sentence of the description, shown large on the photo. */
  headline: string;
  /** The rest of the description, shown in the "Good to know" side note. */
  detail: string;
}

const GHOST_WORDS: Record<string, string> = {
  washbasins: "Basin",
  toilets: "Toilet",
  bathtubs: "Bath",
  accessories: "Detail",
  "public-bathrooms": "Public",
  "bathroom-collection": "Suite",
  "concealed-flush-tank": "Flush",
};

// Split a description after its first sentence: the opening line is short
// enough to read big on the photo, the rest fits the smaller side note.
const splitDescription = (description: string) => {
  const end = description.indexOf(". ");
  if (end === -1) return { headline: description, detail: "" };
  return { headline: description.slice(0, end + 1), detail: description.slice(end + 2) };
};

const items: CategorySlide[] = CATEGORIES.map((category) => ({
  ...category,
  ghost: GHOST_WORDS[category.id] ?? category.name.split(" ")[0],
  ...splitDescription(category.description),
}));

const EASE = [0.22, 1, 0.36, 1] as const;

// The photo panel turns in 3D as it slides: in from the side it's heading
// from, out towards the other side.
const panelVariants: Variants = {
  enter: (direction: number) => ({
    opacity: 0,
    rotateY: direction * 28,
    x: `${direction * 14}%`,
    scale: 0.88,
    filter: "blur(8px)",
  }),
  center: { opacity: 1, rotateY: 0, x: "0%", scale: 1, filter: "blur(0px)" },
  exit: (direction: number) => ({
    opacity: 0,
    rotateY: direction * -28,
    x: `${direction * -14}%`,
    scale: 0.88,
    filter: "blur(8px)",
  }),
};

const ghostVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: `${direction * 20}%` }),
  center: { opacity: 1, x: "0%" },
  exit: (direction: number) => ({ opacity: 0, x: `${direction * -20}%` }),
};

const dotGrid =
  "pointer-events-none absolute bg-[radial-gradient(circle,rgba(255,255,255,0.22)_1px,transparent_1.5px)] [background-size:18px_18px]";

const CategoryCarousel3 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [slide, setSlide] = useState({ index: 0, direction: 1 });

  const item = items[slide.index];
  const progress = (slide.index + 1) / items.length;

  const advance = useCallback(
    () => setSlide((current) => ({ index: (current.index + 1) % items.length, direction: 1 })),
    []
  );
  const markStarted = useSlideAutoplay({
    running: inView && !prefersReducedMotion,
    slideKey: slide.index,
    advance,
  });

  const goTo = (index: number, direction: number) => {
    markStarted();
    setSlide({ index: (index + items.length) % items.length, direction });
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-roledescription="carousel"
        aria-labelledby="category-carousel-3-heading"
        className="relative mb-20 flex min-h-[640px] w-full items-center overflow-hidden bg-[#0b0b0b] py-16 md:mb-28 md:h-screen md:py-0"
      >
        {/* Giant faint word behind everything */}
        <AnimatePresence initial={false} custom={slide.direction}>
          <motion.span
            key={item.id}
            custom={slide.direction}
            variants={ghostVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: EASE }}
            aria-hidden
            className="pointer-events-none absolute -bottom-[0.18em] -left-[0.04em] select-none whitespace-nowrap font-brand text-[34vw] font-medium uppercase leading-none text-white/[0.045]"
          >
            {item.ghost}
          </motion.span>
        </AnimatePresence>
        <div className={`${dotGrid} left-[4%] top-[12%] hidden h-40 w-40 md:block`} aria-hidden />
        <div className={`${dotGrid} bottom-[10%] right-[5%] hidden h-48 w-56 md:block`} aria-hidden />

        {/* Side notes, outside the frame on wide screens */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden xl:block"
          >
            <div className="absolute left-[3vw] top-[30%] w-[13vw] max-w-[220px]">
              <p className="font-brand text-xs uppercase tracking-[0.2em] text-white/40">Good to know</p>
              <p className="mt-3 text-xs leading-relaxed text-white/70">{item.detail}</p>
            </div>
            <div className="pointer-events-auto absolute right-[3vw] top-[30%] w-[13vw] max-w-[220px]">
              <p className="font-brand text-xs uppercase tracking-[0.2em] text-white/40">Explore</p>
              <p className="mt-3 text-xs leading-relaxed text-white/70">{item.name}</p>
              <Link
                to={item.href}
                className="mt-4 inline-block font-brand text-xs uppercase tracking-wide text-white underline-offset-4 hover:underline"
              >
                View all products
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative mx-auto w-full px-4 md:w-[min(76vw,1100px)] md:px-0 xl:w-[min(66vw,1100px)]">
          {/* Top bar: section name and one tab per category. Seven tabs are
              too many to fit beside the heading, so they get their own row
              under it: spread across the frame on wide screens, wrapping on
              tablets, scrolling sideways on phones. */}
          <div className="mb-4 flex flex-col gap-3 md:mb-5">
            <h2
              id="category-carousel-3-heading"
              className="shrink-0 font-brand text-sm uppercase tracking-[0.2em] text-white/90"
            >
              Our Categories
            </h2>
            <div
              className="-mx-4 flex gap-5 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:gap-x-6 md:gap-y-2 md:overflow-visible md:px-0 xl:justify-between"
              role="tablist"
            >
              {items.map((entry, i) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={i === slide.index}
                  onClick={() => goTo(i, i >= slide.index ? 1 : -1)}
                  className={`shrink-0 border-b pb-1 font-brand text-xs uppercase tracking-wide transition-colors md:text-[13px] ${
                    i === slide.index
                      ? "border-white text-white"
                      : "border-transparent text-white/45 hover:text-white/80"
                  }`}
                >
                  {entry.name}
                </button>
              ))}
            </div>
          </div>

          {/* The frame */}
          <div className="relative h-[68svh] max-h-[620px] min-h-[420px] [perspective:1600px]">
            <span className="pointer-events-none absolute -inset-3 border border-white/10 md:-inset-5" aria-hidden />
            <span className="absolute -top-3 left-1/2 h-3 w-px bg-white/60 md:-top-5 md:h-5" aria-hidden />
            <span className="absolute -bottom-3 left-1/2 h-3 w-px bg-white/60 md:-bottom-5 md:h-5" aria-hidden />

            <AnimatePresence initial={false} custom={slide.direction}>
              <motion.div
                key={item.id}
                custom={slide.direction}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.7, ease: EASE }}
                className="absolute inset-0 overflow-hidden bg-black"
              >
                <img src={item.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/5" />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

                <span className="absolute left-5 top-5 font-brand text-2xl font-medium text-white md:left-10 md:top-8 md:text-3xl">
                  {String(slide.index + 1).padStart(2, "0")}
                </span>

                <div className="absolute inset-0 flex flex-col justify-center px-5 md:px-10 lg:px-14">
                  <h3 className="max-w-xl font-brand text-[clamp(40px,5.5vw,80px)] font-medium uppercase leading-[0.95] text-white">
                    {item.name}
                  </h3>
                  <p className="mt-4 max-w-md font-brand text-lg leading-snug text-white/90 md:text-2xl">
                    {item.headline}
                  </p>
                  {/* Same divider and "View All Products" button as
                      CategoryCarousel2's title block. */}
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
                    className="mt-5 block h-0.5 w-12 origin-left bg-white"
                  />
                  <Link
                    to={item.href}
                    className="mt-3 inline-flex w-fit items-center gap-2 font-brand text-base text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] hover:text-white md:text-lg"
                  >
                    View All Products
                    <span aria-hidden>→</span>
                  </Link>
                  <div className="mt-8 flex items-center gap-4 font-brand text-xs tracking-[0.5em] text-white/80">
                    <span>01</span>
                    <span className="relative h-px w-28 bg-white/25 md:w-40">
                      <motion.span
                        className="absolute inset-y-0 left-0 bg-white"
                        initial={{ width: `${(slide.index / items.length) * 100}%` }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
                      />
                    </span>
                    <span>{String(items.length).padStart(2, "0")}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => goTo(slide.index - 1, -1)}
              aria-label="Previous category"
              className="absolute bottom-4 left-4 z-10 flex h-10 w-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2 items-center justify-center border border-white/30 bg-black/50 text-white transition-colors hover:bg-white hover:text-black md:left-0 md:-translate-x-1/2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo(slide.index + 1, 1)}
              aria-label="Next category"
              className="absolute bottom-4 right-4 z-10 flex h-10 w-10 md:bottom-auto md:top-1/2 md:-translate-y-1/2 items-center justify-center border border-white/30 bg-black/50 text-white transition-colors hover:bg-white hover:text-black md:right-0 md:translate-x-1/2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
};

export default CategoryCarousel3;
