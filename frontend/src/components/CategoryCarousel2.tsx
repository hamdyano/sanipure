import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useSlideAutoplay } from "../hooks/useSlideAutoplay";
import { CATEGORIES, type CarouselCategory } from "../data/categories";

interface CategoryCarousel2Props {
  categories?: CarouselCategory[];
  /** How many cards are visible on each side of the active card (desktop). */
  visibleSide?: number;
  /** Time in ms each category stays at the front before autoplay moves on. */
  intervalMs?: number;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const SLIDE_TRANSITION = { duration: 0.7, ease: EASE };
const SWIPE_THRESHOLD_PX = 50;
// Mouse-follow: how far a card leans toward the cursor at its own edge.
const TILT_SPRING = { stiffness: 90, damping: 18, mass: 0.6 };
const TILT_MAX_TURN_DEG = 14;
const TILT_MAX_LEAN_DEG = 8;
const TILT_MAX_SHIFT_PX = 18;

// Per slot (distance from the front card): how much the card shrinks and how
// far it turns away. Paired with the parent's perspective, turning the inner
// edge away leaves the outer edge taller, the same gentle "screens around
// you" curve as the reference. Slots past the last visible one sit at the
// final entry with opacity 0, so cards fade in and out at the edges.
const SLOT_SCALE = [1, 0.88, 0.76, 0.64];
const SLOT_ANGLE = [0, 16, 24, 30];
const MAX_SLOT = SLOT_SCALE.length - 1;

/** Shortest signed distance (in steps) from `from` to `to` on a circular track of `count` items. */
const shortestDelta = (from: number, to: number, count: number) => {
  const raw = (((to - from) % count) + count) % count;
  return raw > count / 2 ? raw - count : raw;
};

const wrap = (value: number, count: number) => ((value % count) + count) % count;

/**
 * Horizontal centre of the card in a given slot, measured from the front
 * card's centre. Each card is placed by its scaled width, so the gap between
 * neighbours stays even as the cards get smaller. Perspective swings each
 * turned card's outer edge toward the viewer (wider) and its inner edge away
 * (pulled toward the centre), so between two turned cards the gap would
 * close; the extra spacing per slot past the first keeps it open.
 */
const slotX = (slot: number, cardWidth: number, gap: number) => {
  let x = 0;
  for (let s = 1; s <= slot; s += 1) {
    x += (cardWidth * (SLOT_SCALE[s - 1] + SLOT_SCALE[s])) / 2 + gap + cardWidth * 0.06 * (s - 1);
  }
  return x;
};

interface CarouselCardProps {
  item: CarouselCategory;
  offset: number;
  isVisible: boolean;
  cardWidth: number;
  cardHeight: number;
  gap: number;
  counter: string;
  prefersReducedMotion: boolean;
  /** The front card also mirrors its cursor position here, for the title. */
  linkedPointerX?: MotionValue<number>;
  onClick: () => void;
}

/**
 * One card of the slider. Its slot (place on the curve) is animated on the
 * outer button. The card's face inside it turns and drifts toward the mouse
 * on its own, as in the reference, so only the card under the cursor moves.
 */
const CarouselCard = ({
  item,
  offset,
  isVisible,
  cardWidth,
  cardHeight,
  gap,
  counter,
  prefersReducedMotion,
  linkedPointerX,
  onClick,
}: CarouselCardProps) => {
  const distance = Math.abs(offset);
  const slot = Math.min(distance, MAX_SLOT);
  const side = Math.sign(offset);
  const isActive = offset === 0;

  // Cursor position over this card, -1 (left/top edge) to 1 (right/bottom
  // edge), eased by a spring so the card glides after the mouse instead of
  // snapping to it, and settles back when the mouse leaves.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(pointerX, TILT_SPRING);
  const tiltY = useSpring(pointerY, TILT_SPRING);
  const turn = useTransform(tiltX, (v) => v * TILT_MAX_TURN_DEG);
  const lean = useTransform(tiltY, (v) => -v * TILT_MAX_LEAN_DEG);
  const shift = useTransform(tiltX, (v) => v * TILT_MAX_SHIFT_PX);
  // The photo slides a little the other way, so it seems to sit deeper than
  // the card's frame while the card leans.
  const photoShift = useTransform(tiltX, (v) => v * -10);

  const setPointer = (x: number, y: number) => {
    pointerX.set(x);
    pointerY.set(y);
    linkedPointerX?.set(x);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    // Mouse only: on touch the finger is swiping, and leaning the card under
    // it would fight the swipe. Off entirely under reduced motion.
    if (event.pointerType !== "mouse" || prefersReducedMotion || !isVisible) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPointer(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      ((event.clientY - rect.top) / rect.height) * 2 - 1,
    );
  };

  return (
    <motion.button
      type="button"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      aria-label={isActive ? `Go to ${item.name}` : `Show ${item.name}`}
      aria-current={isActive ? "true" : undefined}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPointer(0, 0)}
      initial={false}
      animate={{
        x: side * slotX(slot, cardWidth, gap),
        scale: SLOT_SCALE[slot],
        rotateY: -side * SLOT_ANGLE[slot],
      }}
      transition={SLIDE_TRANSITION}
      className="absolute left-1/2 top-1/2 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white"
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        marginLeft: `-${cardWidth / 2}px`,
        marginTop: `-${cardHeight / 2}px`,
        zIndex: 10 - distance,
        pointerEvents: isVisible ? "auto" : "none",
        // Lets the face's own lean below happen in the same 3D space as the
        // slot turn above, so it shows real depth instead of a flat squash.
        transformStyle: "preserve-3d",
      }}
    >
      {/* Face: opacity lives here rather than on the button, because any
          opacity below 1 on the button would flatten its 3D. */}
      <motion.div
        initial={false}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={SLIDE_TRANSITION}
        className="absolute inset-0 overflow-hidden rounded-sm bg-neutral-900 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
        style={{ x: shift, rotateY: turn, rotateX: lean }}
      >
        {/* Parallax: the photo is wider than its card and slides against the
            card's own movement, so it seems to sit further back than the
            frame around it. */}
        <motion.div className="absolute inset-0" style={{ x: photoShift }}>
          <motion.img
            src={item.image}
            alt=""
            draggable={false}
            initial={false}
            animate={{ x: `${-Math.max(-1.5, Math.min(1.5, offset)) * 7}%` }}
            transition={SLIDE_TRANSITION}
            className="absolute inset-y-0 left-[-15%] h-full w-[130%] max-w-none object-cover"
          />
        </motion.div>
        {/* Side cards sit a little in shadow; the front one is lit. */}
        <motion.div
          aria-hidden
          initial={false}
          animate={{ opacity: isActive ? 0 : 0.45 }}
          transition={SLIDE_TRANSITION}
          className="absolute inset-0 bg-black"
        />
        {isActive && (
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        )}
        {/* Tag on the front card's top-right corner, like the reference's
            "#Central America" label. Lives on the card so it moves with it. */}
        <motion.span
          aria-hidden
          initial={false}
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: 0.4, delay: isActive ? 0.3 : 0 }}
          className="absolute right-3 top-3 border border-white/40 bg-black/20 px-2.5 py-1 font-brand text-[11px] tracking-wider text-white backdrop-blur-sm"
        >
          {counter}
        </motion.span>
      </motion.div>
    </motion.button>
  );
};

const CategoryCarousel2 = ({
  categories = CATEGORIES,
  visibleSide = 2,
  intervalMs = 4000,
  className = "",
}: CategoryCarousel2Props) => {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const count = categories.length;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(280);
  const [gap, setGap] = useState(16);
  const [isMobile, setIsMobile] = useState(false);

  const swipeRef = useRef<{ startX: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  // While the mouse is over the front card, the title sitting on it slides
  // gently the other way, so the card seems to float behind the text.
  const frontPointerX = useMotionValue(0);
  const frontTiltX = useSpring(frontPointerX, TILT_SPRING);
  const titleShift = useTransform(frontTiltX, (v) => v * -14);

  // Breakpoints are measured from the stage itself, so the geometry follows
  // the space the carousel actually has.
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const computeSize = () => {
      const width = element.clientWidth;
      if (width < 640) {
        setCardWidth(190);
        setGap(12);
        setIsMobile(true);
      } else if (width < 1024) {
        setCardWidth(230);
        setGap(14);
        setIsMobile(false);
      } else {
        setCardWidth(280);
        setGap(16);
        setIsMobile(false);
      }
    };
    computeSize();
    const observer = new ResizeObserver(computeSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const sideCount = Math.min(isMobile ? 1 : visibleSide, MAX_SLOT - 1);
  const cardHeight = (cardWidth * 5) / 3;
  const category = categories[active];

  const advance = useCallback(() => setActive((current) => wrap(current + 1, count)), [count]);
  // Only advance while the section is on screen and nobody is hovering or
  // focused inside it (WCAG 2.2.2: auto-moving content must be pausable).
  const markStarted = useSlideAutoplay({
    running: inView && !paused && !prefersReducedMotion,
    slideKey: active,
    advance,
    intervalMs,
  });

  // A manual pick gets a full interval before autoplay moves on.
  const goTo = (index: number) => {
    markStarted();
    setActive(wrap(index, count));
  };

  const handleBlur = (event: ReactFocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setPaused(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(active + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(active - 1);
    }
  };

  // Swipe/drag: one step per gesture, decided on release. No pointer capture
  // here — capturing would retarget the click to the stage and stop a plain
  // tap on a card from registering.
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    swipeRef.current = { startX: event.clientX, moved: false };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current;
    if (swipe && Math.abs(event.clientX - swipe.startX) > 6) swipe.moved = true;
  };

  // A new front card starts with the title back in its resting place.
  useEffect(() => {
    frontPointerX.set(0);
  }, [active, frontPointerX]);

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe?.moved) return;

    // The click that follows a drag shouldn't also open or pick a card.
    suppressClickRef.current = true;
    const deltaX = event.clientX - swipe.startX;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
      goTo(active + (deltaX < 0 ? 1 : -1));
    }
  };

  const handleCardClick = (index: number, href: string) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (index === active) {
      navigate(href);
    } else {
      goTo(index);
    }
  };

  const formatCounter = (index: number) =>
    `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        aria-roledescription="carousel"
        aria-labelledby="category-carousel-heading"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={handleBlur}
        className={`relative w-full overflow-hidden bg-black py-16 md:py-20 ${className}`}
      >
        {/* Backdrop: the front card's photo, blurred and darkened, crossfading
            as the slide changes — it tints the whole section to the category. */}
        <AnimatePresence initial={false}>
          <motion.img
            key={category.id}
            src={category.image}
            alt=""
            aria-hidden
            draggable={false}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover blur-2xl"
          />
        </AnimatePresence>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/50" />
        {/* Fade the edges to black so the section blends into the black
            sections above and below it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent"
        />

        <h2
          id="category-carousel-heading"
          className="relative z-10 mb-10 px-6 text-center font-brand text-3xl font-extrabold uppercase tracking-tight text-white md:mb-12 md:text-5xl"
        >
          Discover Our Categories
        </h2>

        <div
          ref={stageRef}
          role="region"
          aria-label="Category slides"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => (swipeRef.current = null)}
          onPointerLeave={() => (swipeRef.current = null)}
          className="relative w-full select-none touch-pan-y outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
          style={{ height: `${cardHeight + 24}px`, perspective: "1200px" }}
        >
          {categories.map((item, index) => {
            const offset = shortestDelta(active, index, count);
            return (
              <CarouselCard
                key={item.id}
                item={item}
                offset={offset}
                isVisible={Math.abs(offset) <= sideCount}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                gap={gap}
                counter={formatCounter(index)}
                prefersReducedMotion={prefersReducedMotion}
                linkedPointerX={offset === 0 ? frontPointerX : undefined}
                onClick={() => handleCardClick(index, item.href)}
              />
            );
          })}

          {/* Title: wider than the front card and overlapping its edges, so
              it reads as part of the scene rather than a caption inside it. */}
          <motion.div
            className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
            style={{
              x: titleShift,
              top: `calc(50% + ${cardHeight * 0.02}px)`,
              width: `min(${cardWidth * 1.75}px, calc(100% - 3rem))`,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14, transition: { duration: 0.25, ease: EASE } }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <h3 className="font-brand text-[clamp(30px,5vw,64px)] font-bold uppercase leading-[0.95] tracking-wide text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]">
                  {category.name}
                </h3>
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
                  className="mt-4 block h-0.5 w-12 origin-left bg-white"
                />
                <Link
                  to={category.href}
                  className="pointer-events-auto mt-3 inline-flex items-center gap-2 font-brand text-base text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] hover:text-white md:text-lg"
                >
                  View All Products
                  <span aria-hidden>→</span>
                </Link>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous category"
            className="absolute left-3 top-1/2 z-30 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black md:left-8"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next category"
            className="absolute right-3 top-1/2 z-30 hidden sm:flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-black md:right-8"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="relative z-10 mt-8 flex justify-center gap-2.5 md:mt-10">
          {categories.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show ${item.name}`}
              aria-current={index === active}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === active ? "w-7 bg-white" : "w-2 bg-white/35 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </section>
    </MotionConfig>
  );
};

export default CategoryCarousel2;
