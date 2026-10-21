import { useCallback, useRef, useState, type TouchEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useInView } from "motion/react";
import RevealSection from "../components/shared/RevealSection";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useSlideAutoplay } from "../hooks/useSlideAutoplay";
import catalogsImage from "../assets/whySanipure.jpeg";
import priceListsImage from "../assets/washbasins shop photos/hero section.jpg";
import technicalImage from "../assets/Resources photos/Technical Documents.png";
import platformsImage from "../assets/articles photos/article 3.jpg";
import guidesImage from "../assets/Resources photos/Guides.jpg";
import needSomethingElseImage from "../assets/Resources photos/Need Something Else.jpg";

interface Resource {
  id: string;
  /** The big word across the hero, as in the reference design. */
  word: string;
  title: string;
  eyebrow: string;
  summary: string;
  includes: string[];
  cta: string;
  image: string;
  /** Keeps the subject of the photo in frame on narrow screens. */
  imagePosition?: string;
  note?: { text: string; linkLabel: string; to: string };
}

const resources: Resource[] = [
  {
    id: "catalogs",
    word: "Catalogs",
    title: "Catalogs",
    eyebrow: "Our Collections",
    summary:
      "Browse every Sanipure collection in one place — washbasins, toilets, bathtubs and complete bathroom sets, with their finishes, colors and dimensions.",
    includes: ["Full product catalog", "Collection brochures", "Colors & finishes"],
    cta: "Request a Catalog",
    image: catalogsImage,
    imagePosition: "50% 60%",
  },
  {
    id: "price-lists",
    word: "Price Lists",
    title: "Price Lists",
    eyebrow: "Clear Pricing",
    summary:
      "Current pricing across our full range of sanitaryware, for homeowners, retailers and project buyers planning their budget with confidence.",
    includes: ["Retail price list", "Project & bulk pricing", "All product categories"],
    cta: "Request a Price List",
    image: priceListsImage,
  },
  {
    id: "technical-documents",
    word: "Technical",
    title: "Technical Documents",
    eyebrow: "Built To Spec",
    summary:
      "Specification sheets, dimension drawings and installation instructions — everything engineers, contractors and installers need on site.",
    includes: ["Technical data sheets", "Dimension drawings", "Installation instructions"],
    cta: "Request Documents",
    image: technicalImage,
    imagePosition: "45% 62%",
    note: {
      text: "Most technical sheets can also be downloaded straight from each product's page.",
      linkLabel: "Browse Products",
      to: "/products",
    },
  },
  {
    id: "platforms",
    word: "Platforms",
    title: "Platforms",
    eyebrow: "Design Digitally",
    summary:
      "Digital design files for architects and interior designers — BIM objects, CAD blocks and 3D models to place Sanipure products straight into your plans.",
    includes: ["BIM objects", "2D CAD drawings", "3D models"],
    cta: "Request Design Files",
    image: platformsImage,
  },
  {
    id: "guides",
    word: "Guides",
    title: "Guides",
    eyebrow: "Expert Advice",
    summary:
      "Practical guides to choosing, installing and caring for your sanitaryware, so every piece looks and performs at its best for years to come.",
    includes: ["Buying guides", "Installation guides", "Care & cleaning"],
    cta: "Request a Guide",
    image: guidesImage,
    imagePosition: "35% 40%",
  },
];

// There are no files to download yet, so each request opens the contact
// form with the subject already filled in (FindUsPage reads ?subject=).
const requestLink = (resource: Resource) =>
  `/contact-us?subject=${encodeURIComponent(`Request: ${resource.title}`)}`;

const pad = (n: number) => String(n).padStart(2, "0");

// Thin outlined lettering for the small labels above headings, as on Find Us.
const outlinedLabel =
  "font-brand text-lg font-bold text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.7)] md:text-xl";

const SWIPE_THRESHOLD = 50;

const ResourcesPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);
  const inView = useInView(heroRef, { amount: 0.5 });
  const prefersReducedMotion = usePrefersReducedMotion();
  const active = resources[activeIndex];

  const advance = useCallback(
    () => setActiveIndex((index) => (index + 1) % resources.length),
    []
  );

  const markStarted = useSlideAutoplay({
    running: inView && !paused && !prefersReducedMotion,
    slideKey: activeIndex,
    advance,
    intervalMs: 6000,
    firstMs: 6000,
  });

  const goTo = (index: number) => {
    markStarted();
    setActiveIndex((index + resources.length) % resources.length);
  };

  const handleTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
    goTo(activeIndex + (deltaX < 0 ? 1 : -1));
  };

  const scrollToResource = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });

  // Long words ("Price Lists", "Technical") get a smaller size so they
  // stay on one line on phones.
  const wordSize =
    active.word.length > 8
      ? "text-[clamp(44px,10vw,160px)]"
      : "text-[clamp(56px,13vw,200px)]";

  return (
    <div className="bg-black">
      {/* Hero slider */}
      <section
        ref={heroRef}
        aria-roledescription="carousel"
        aria-label="Sanipure resources"
        // The hero fills the screen, so pausing on hover (or on a clicked
        // button keeping focus) would stop it almost all the time. Only
        // keyboard focus pauses it, so the slide can be read while tabbing.
        onFocus={(event) => setPaused(event.target.matches(":focus-visible"))}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative h-[calc(100svh-72px)] min-h-[560px] overflow-hidden bg-black"
      >
        <h1 className="sr-only">Resources</h1>

        <AnimatePresence initial={false}>
          <motion.div
            key={active.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.9, ease: "easeInOut" }}
          >
            <img
              src={active.image}
              alt=""
              style={{ objectPosition: active.imagePosition }}
              className="h-full w-full animate-[design-zoom_7s_ease-out_forwards] object-cover motion-reduce:animate-none"
            />
          </motion.div>
        </AnimatePresence>

        {/* Muted, moody grade like the reference, darker toward the edges. */}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_center,transparent,rgba(0,0,0,0.55))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

        {/* Category tabs, top right — the reference's small nav row. */}
        <div
          role="group"
          aria-label="Resource types"
          className="absolute right-6 top-6 z-20 hidden items-center gap-6 md:flex lg:right-12"
        >
          {resources.map((resource, index) => (
            <button
              key={resource.id}
              type="button"
              aria-current={index === activeIndex}
              onClick={() => goTo(index)}
              className={`border-b pb-1 font-brand text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                index === activeIndex
                  ? "border-white text-white"
                  : "border-transparent text-white/55 hover:text-white"
              }`}
            >
              {resource.title}
            </button>
          ))}
        </div>

        {/* Vertical label on the left edge. */}
        <p className="absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 rotate-180 font-brand text-xs uppercase tracking-[0.35em] text-white/60 [writing-mode:vertical-rl] md:block lg:left-8">
          Sanipure Resources
        </p>

        {/* Center content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-12 pb-10 text-center md:px-20">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
              // Announce slide changes the visitor makes, not every autoplay tick.
              aria-live={paused ? "polite" : "off"}
            >
              <p className="font-brand text-sm font-medium uppercase tracking-[0.3em] text-white/75">
                {pad(activeIndex + 1)} — {active.eyebrow}
              </p>
              <h2
                className={`mt-3 whitespace-nowrap font-brand font-bold uppercase leading-[0.9] tracking-tight text-white [text-shadow:0_6px_40px_rgba(0,0,0,0.35)] ${wordSize}`}
              >
                {active.word}
              </h2>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
                {active.summary}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to={requestLink(active)}
                  className="rounded-full bg-white px-7 py-3 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/85"
                >
                  {active.cta}
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToResource(active.id)}
                  className="rounded-full border border-white/70 px-7 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
                >
                  Learn More
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot pager on the right edge. */}
        <div className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 lg:right-8">
          {resources.map((resource, index) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show ${resource.title}`}
              aria-current={index === activeIndex}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span
                className={`block w-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "h-6 bg-white" : "h-1.5 bg-white/45 hover:bg-white/80"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Counter, bottom left, and a cue to the full list. */}
        <div className="absolute inset-x-0 bottom-6 z-20 grid grid-cols-3 items-end px-6 lg:px-12">
          <p className="justify-self-start font-brand text-sm tracking-[0.2em] text-white/70">
            <span className="text-white">{pad(activeIndex + 1)}</span> / {pad(resources.length)}
          </p>
          <button
            type="button"
            onClick={() => scrollToResource("all-resources")}
            className="group flex flex-col items-center gap-1 justify-self-center whitespace-nowrap font-brand text-[11px] uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white"
          >
            All Resources
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5 transition-transform group-hover:translate-y-0.5"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      {/* All resources */}
      <section id="all-resources" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20 md:py-28">
        <RevealSection className="text-center">
          <p className={outlinedLabel}>Resources</p>
          <h2 className="mt-1 font-brand text-3xl font-semibold text-white md:text-5xl">
            Everything You Need, In One Place
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
            From first inspiration to final installation, our resources help homeowners,
            designers, contractors and partners work with Sanipure products with confidence.
          </p>
        </RevealSection>

        <div className="mt-14 flex flex-col gap-10 md:mt-20 md:gap-16">
          {resources.map((resource, index) => {
            const imageFirst = index % 2 === 0;
            return (
              <article key={resource.id} id={resource.id} className="scroll-mt-24">
                <RevealSection className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-12">
                  <div
                    className={`group relative h-64 overflow-hidden sm:h-80 ${
                      imageFirst ? "" : "md:order-last"
                    }`}
                  >
                    <img
                      src={resource.image}
                      alt=""
                      style={{ objectPosition: resource.imagePosition }}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25" />
                    <span className="absolute bottom-3 left-5 font-brand text-7xl font-bold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.85)] md:text-8xl">
                      {pad(index + 1)}
                    </span>
                  </div>

                  <div>
                    <p className="font-brand text-xs font-medium uppercase tracking-[0.3em] text-white/50">
                      {resource.eyebrow}
                    </p>
                    <h3 className="mt-2 font-brand text-3xl font-semibold text-white md:text-4xl">
                      {resource.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-base">
                      {resource.summary}
                    </p>
                    <ul className="mt-5 flex flex-col gap-2">
                      {resource.includes.map((item) => (
                        <li key={item} className="flex items-center gap-3 text-sm text-white/85">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="h-4 w-4 shrink-0 text-white/60"
                            aria-hidden
                          >
                            <path d="M5 12l5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                    {resource.note && (
                      <p className="mt-5 text-xs leading-relaxed text-white/55">
                        {resource.note.text}{" "}
                        <Link
                          to={resource.note.to}
                          className="text-white underline underline-offset-2 hover:text-white/80"
                        >
                          {resource.note.linkLabel}
                        </Link>
                      </p>
                    )}
                    <Link
                      to={requestLink(resource)}
                      className="mt-7 inline-block rounded-full border border-white/70 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
                    >
                      {resource.cta}
                    </Link>
                  </div>
                </RevealSection>
              </article>
            );
          })}
        </div>
      </section>

      {/* Call to action */}
      <section className="px-6 pb-24 md:pb-32">
        <RevealSection className="relative mx-auto max-w-6xl overflow-hidden px-6 py-16 text-center md:py-24">
          {/* The photo has white bands top and bottom; the wide banner crops
              them off on its own, but narrower screens show more of the
              height, so it's zoomed in there to keep them out of view. */}
          <img
            src={needSomethingElseImage}
            alt=""
            className="absolute inset-0 h-full w-full scale-[1.35] object-cover md:scale-100"
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="relative">
            <p className={outlinedLabel}>Need Something Else?</p>
            <h2 className="mt-1 font-brand text-3xl font-semibold leading-tight text-white md:text-5xl">
              Can't Find What You're Looking For?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
              Our team is happy to help with any document, file or detail your project needs.
            </p>
            <Link
              to="/contact-us"
              className="mt-8 inline-block rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-colors hover:bg-white/85"
            >
              Contact Us
            </Link>
          </div>
        </RevealSection>
      </section>
    </div>
  );
};

export default ResourcesPage;
