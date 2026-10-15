import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { newsArticles } from "../data/news";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { showErrorToast, showSuccessToast } from "../lib/toast";

const AUTOPLAY_MS = 4000;
// The first change after the page opens comes quickly, so the slider is
// visibly moving right away instead of waiting a full slide.
const FIRST_SLIDE_MS = 700;
const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_TRANSITION = { duration: 0.6, ease: EASE };

interface SlideState {
  active: number;
  // The slide that was showing before the last change. Its image stays
  // underneath the new background while that one grows out of its card.
  previous: number | null;
  direction: 1 | -1;
}

const wrap = (index: number) =>
  ((index % newsArticles.length) + newsArticles.length) % newsArticles.length;

const shortDate = (date: string) => date.replace(/^(\w{3})\w*/, "$1");

const NewsPage = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [slide, setSlide] = useState<SlideState>({ active: 0, previous: null, direction: 1 });
  const [paused, setPaused] = useState(false);
  // Becomes true after the first change (automatic or manual); from then on
  // each slide gets the full AUTOPLAY_MS.
  const startedRef = useRef(false);

  const goTo = useCallback((index: number, direction: 1 | -1) => {
    startedRef.current = true;
    setSlide((current) =>
      wrap(index) === current.active
        ? current
        : { active: wrap(index), previous: current.active, direction }
    );
  }, []);

  const step = useCallback((delta: 1 | -1) => {
    startedRef.current = true;
    setSlide((current) => ({
      active: wrap(current.active + delta),
      previous: current.active,
      direction: delta,
    }));
  }, []);

  // Advance on a timer; changing slide manually restarts the countdown.
  useEffect(() => {
    if (prefersReducedMotion || paused) return;
    const timeout = window.setTimeout(
      () => step(1),
      startedRef.current ? AUTOPLAY_MS : FIRST_SLIDE_MS
    );
    return () => window.clearTimeout(timeout);
  }, [slide.active, paused, prefersReducedMotion, step]);

  // Load and decode every article image up front. Otherwise a large photo is
  // only fetched/decoded when it becomes the background, and the slide stalls
  // (or grows out of its card as an empty box) until it is ready.
  useEffect(() => {
    newsArticles.forEach(({ image }) => {
      const img = new Image();
      img.src = image;
      img.decode().catch(() => {});
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step]);

  const article = newsArticles[slide.active];
  const previousArticle = slide.previous === null ? null : newsArticles[slide.previous];
  const upcoming = Array.from({ length: newsArticles.length - 1 }, (_, i) =>
    newsArticles[wrap(slide.active + 1 + i)]
  );

  const shareArticle = async () => {
    const url = `${window.location.origin}/news/${article.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showSuccessToast("Link copied");
    } catch (err) {
      // Closing the native share sheet rejects with AbortError — not a failure.
      if (err instanceof DOMException && err.name === "AbortError") return;
      showErrorToast("Couldn't copy the link.");
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-roledescription="carousel"
        aria-label="Sanipure news"
        // Pause autoplay while someone is moving through it with the keyboard.
        onFocus={(event) => setPaused(event.target.matches(":focus-visible"))}
        onBlur={() => setPaused(false)}
        className="relative isolate flex min-h-[calc(100svh-72px)] flex-col justify-end gap-8 overflow-hidden bg-black px-6 pb-8 pt-24 md:px-12 lg:block lg:min-h-[640px] lg:h-[calc(100svh-72px)] lg:p-0"
      >
        {/* Background: the active article's image, which grows out of its card. */}
        <div className="absolute inset-0 -z-10">
          {previousArticle && (
            <img
              src={previousArticle.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <motion.div
            key={article.slug}
            layoutId={`news-${article.slug}`}
            transition={SLIDE_TRANSITION}
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: 0 }}
          >
            <motion.img
              layout
              transition={SLIDE_TRANSITION}
              src={article.image}
              alt=""
              className="h-full w-full object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        {/* Active article text */}
        <div
          aria-live={paused || prefersReducedMotion ? "polite" : "off"}
          className="relative lg:absolute lg:left-16 lg:top-1/2 lg:w-[44%] lg:-translate-y-1/2 xl:left-24"
        >
          {/* popLayout: the new text comes in while the old one leaves, instead
              of waiting for the exit to finish (which lagged the background). */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <span className="block h-0.5 w-8 bg-white" />
              <p className="mt-3 font-brand text-sm text-white/90 md:text-base">
                {article.category} · {article.date}
              </p>
              <h1 className="mt-2 font-brand text-[clamp(44px,6.5vw,96px)] font-medium uppercase leading-[0.95] text-white">
                {article.title}
              </h1>
              <p className="mt-5 line-clamp-3 max-w-lg text-sm leading-relaxed text-white/85 md:text-base">
                {article.excerpt}
              </p>
              <div className="mt-7 flex items-center gap-4">
                <button
                  type="button"
                  onClick={shareArticle}
                  aria-label="Share this article"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-black transition-colors hover:bg-amber-300"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                    <path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1" />
                    <path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1" />
                  </svg>
                </button>
                <Link
                  to={`/news/${article.slug}`}
                  className="rounded-full border border-white px-6 py-2.5 font-brand text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
                >
                  Read More
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Upcoming articles; the first one becomes the next background. */}
        <div className="-mr-6 flex gap-4 md:-mr-12 lg:absolute lg:left-[52%] lg:top-[40%] lg:mr-0 lg:gap-6">
          {upcoming.map((item, index) => {
            // The card for the slide we just left shouldn't fly in from the
            // full-screen background when moving forward; it simply appears
            // at the end of the row. Moving backward, it shrinks into place.
            const sharesLayout =
              slide.direction === -1 || newsArticles.indexOf(item) !== slide.previous;
            return (
              <motion.button
                key={item.slug}
                type="button"
                layout
                layoutId={sharesLayout ? `news-${item.slug}` : undefined}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={SLIDE_TRANSITION}
                onClick={() => goTo(slide.active + 1 + index, 1)}
                aria-label={`Show: ${item.title}`}
                style={{ borderRadius: 16 }}
                className="relative h-52 w-36 shrink-0 overflow-hidden text-left shadow-2xl shadow-black/50 sm:h-60 sm:w-44 lg:h-[clamp(240px,40vh,340px)] lg:w-[clamp(170px,14vw,230px)]"
              >
                <motion.img
                  layout
                  transition={SLIDE_TRANSITION}
                  src={item.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3 lg:p-4">
                  <span className="block h-0.5 w-5 bg-white" />
                  <span className="mt-2 block text-[10px] text-white/80 sm:text-xs">
                    {item.category} · {shortDate(item.date)}
                  </span>
                  <span className="mt-1 block font-brand text-sm font-medium uppercase leading-tight text-white sm:text-base lg:text-lg">
                    {item.title}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 lg:absolute lg:bottom-10 lg:left-[52%] lg:right-12 xl:right-24">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous article"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:border-white hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next article"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:border-white hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <div className="mx-2 h-0.5 flex-1 bg-white/20">
            <motion.div
              className="h-full bg-amber-400"
              initial={false}
              animate={{ width: `${((slide.active + 1) / newsArticles.length) * 100}%` }}
              transition={SLIDE_TRANSITION}
            />
          </div>
          <span className="w-14 text-right font-brand text-4xl font-medium text-white md:text-5xl">
            {String(slide.active + 1).padStart(2, "0")}
          </span>
        </div>
      </section>
    </MotionConfig>
  );
};

export default NewsPage;
