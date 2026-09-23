import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type FocusEvent as ReactFocusEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import washbasinsImage from "../assets/categories photos/Washbasins photo.jpg";
import toiletsImage from "../assets/categories photos/Toilets photo.jpg";
import bathtubsImage from "../assets/categories photos/Bathtubs photo.jpg";
import accessoriesImage from "../assets/categories photos/Accessories photo.jpg";
import publicBathroomsImage from "../assets/categories photos/Public Bathrooms photo.jpg";
import bathroomCollectionImage from "../assets/categories photos/Bathroom collection photo.jpg";

export interface CarouselCategory {
  id: string;
  name: string;
  image: string;
  href: string;
}

interface CategoryCarouselProps {
  categories?: CarouselCategory[];
  /** Degrees between adjacent cards. Defaults to 26. */
  angleStep?: number;
  /** How many cards are visible on each side of the active card (desktop). */
  visibleSide?: number;
  /** Time in ms to continuously glide through one card step. 0 disables autoplay. Defaults to 3500. */
  autoplayMs?: number;
  className?: string;
}

const DEFAULT_CATEGORIES: CarouselCategory[] = [
  { id: "washbasins", name: "Washbasins", image: washbasinsImage, href: "/products/washbasins" },
  { id: "toilets", name: "Toilets", image: toiletsImage, href: "/products/toilets" },
  { id: "bathtubs", name: "Bathtubs", image: bathtubsImage, href: "/products/bathtubs" },
  {
    id: "accessories",
    name: "Accessories & Furniture",
    image: accessoriesImage,
    href: "/products/accessories",
  },
  {
    id: "public-bathrooms",
    name: "Public Bathrooms",
    image: publicBathroomsImage,
    href: "/products/public-bathrooms",
  },
  {
    id: "bathroom-collection",
    name: "Bathroom Collection",
    image: bathroomCollectionImage,
    href: "/products/bathroom-collection",
  },
];

const CARD_THICKNESS = 16; // px width of the beveled edge highlight
const SNAP_DURATION_MS = 600;

/** Shortest signed distance (in steps, possibly fractional) from `from` to `to` on a circular track of `count` items. */
const shortestDelta = (from: number, to: number, count: number) => {
  const raw = (((to - from) % count) + count) % count;
  return raw > count / 2 ? raw - count : raw;
};

const wrap = (value: number, count: number) => ((value % count) + count) % count;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const CategoryCarousel = ({
  categories = DEFAULT_CATEGORIES,
  angleStep = 26,
  visibleSide = 2,
  autoplayMs = 3500,
  className = "",
}: CategoryCarouselProps) => {
  const navigate = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion();
  const count = categories.length;

  // `position` is the continuous (fractional) index currently at the front —
  // e.g. 2.4 means drifting from card 2 toward card 3. It's the single
  // source of truth for every card's angle; positionRef mirrors it so event
  // handlers and the animation loop can read the latest value synchronously
  // (functional setState alone can't be read outside of a setState call).
  const [position, setPositionState] = useState(0);
  const positionRef = useRef(0);
  const setPosition = useCallback((value: number) => {
    positionRef.current = value;
    setPositionState(value);
  }, []);

  const [cardWidth, setCardWidth] = useState(300);
  const [gap, setGap] = useState(34);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStateRef = useRef<{ pointerId: number; startX: number; dragging: boolean; startPosition: number } | null>(null);
  const snapStateRef = useRef<{ from: number; to: number; start: number } | null>(null);

  // Card width and gap drive the radius, so the ring geometry stays
  // responsive instead of hard-coding pixel breakpoints. sideCount is
  // derived from the same measurement so both stay in sync at the same
  // breakpoint.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const computeSize = () => {
      const viewportWidth = element.clientWidth;
      if (viewportWidth < 640) {
        setCardWidth(200);
        setGap(20);
        setIsMobile(true);
      } else if (viewportWidth < 1024) {
        setCardWidth(240);
        setGap(28);
        setIsMobile(false);
      } else {
        setCardWidth(300);
        setGap(34);
        setIsMobile(false);
      }
    };
    computeSize();
    const observer = new ResizeObserver(computeSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const sideCount = isMobile ? 1 : visibleSide;

  // Radius large enough that neighbouring cards (offset by angleStep), plus
  // the requested gap between them, don't touch: the card+gap width divided
  // by 2*tan(halfAngle) is the distance at which two panels that wide, angled
  // apart by angleStep, sit flush with exactly `gap` px between their edges.
  const radius = useMemo(() => {
    const halfAngleRad = (angleStep * Math.PI) / 360;
    return (cardWidth + gap) / (2 * Math.tan(halfAngleRad || 0.01));
  }, [cardWidth, gap, angleStep]);

  const activeIndex = wrap(Math.round(position), count);

  // Animates the ring to a target index, taking the shortest direction from
  // wherever `position` currently is — even mid-drift or mid-drag. Under
  // reduced motion, jump instantly instead (no auto-drift, no eased snap).
  const snapTo = useCallback(
    (targetIndex: number) => {
      if (prefersReducedMotion) {
        setPosition(wrap(targetIndex, count));
        return;
      }
      const from = positionRef.current;
      const to = from + shortestDelta(from, targetIndex, count);
      snapStateRef.current = { from, to, start: performance.now() };
    },
    [count, prefersReducedMotion, setPosition],
  );

  const stepBy = useCallback(
    (delta: number) => {
      snapTo(wrap(Math.round(positionRef.current) + delta, count));
    },
    [count, snapTo],
  );

  // Single animation loop: while a snap is in flight, ease `position` toward
  // its target; otherwise, if nothing is pausing/dragging it, drift forward
  // continuously. Skipped entirely under reduced motion (no auto-moving
  // content, no animated snapping — clicks/arrows jump instantly instead).
  useEffect(() => {
    if (prefersReducedMotion) return;
    const speedStepsPerSec = autoplayMs > 0 ? 1000 / autoplayMs : 0;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      const snap = snapStateRef.current;
      if (snap) {
        const t = Math.min(1, (now - snap.start) / SNAP_DURATION_MS);
        const eased = easeOutCubic(t);
        const next = snap.from + (snap.to - snap.from) * eased;
        if (t >= 1) {
          snapStateRef.current = null;
          setPosition(wrap(snap.to, count));
        } else {
          setPosition(next);
        }
      } else if (!pausedRef.current && !draggingRef.current && speedStepsPerSec > 0) {
        setPosition(wrap(positionRef.current + speedStepsPerSec * dt, count));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoplayMs, count, prefersReducedMotion, setPosition]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };
  // WCAG 2.2.2 requires a way to pause auto-moving content for keyboard and
  // screen-reader users too, not just mouse hover — so focus landing
  // anywhere inside the carousel pauses it the same way hover does.
  const handleBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      resume();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      stepBy(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepBy(-1);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    snapStateRef.current = null; // a fresh drag always takes over from the current position
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      dragging: false,
      startPosition: positionRef.current,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    const deltaPx = event.clientX - drag.startX;

    if (!drag.dragging) {
      if (Math.abs(deltaPx) < 6) return;
      drag.dragging = true;
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    // Dragging right feels like pulling the previous card into view, so
    // position decreases; one (cardWidth + gap) px of drag ~= one step.
    const deltaSteps = -deltaPx / (cardWidth + gap);
    setPosition(wrap(drag.startPosition + deltaSteps, count));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    dragStateRef.current = null;
    draggingRef.current = false;
    if (!drag?.dragging) return;

    event.currentTarget.releasePointerCapture(event.pointerId);
    // Settle smoothly to whichever card ended up nearest the front.
    snapTo(wrap(Math.round(positionRef.current), count));
  };

  const handleCardActivate = (index: number, href: string) => {
    if (index === activeIndex) {
      navigate(href);
      return;
    }
    snapTo(index);
  };

  return (
    <div
      className={`relative w-full bg-[#2a2f36] py-16 md:py-20 ${className}`}
      onFocusCapture={pause}
      onBlurCapture={handleBlur}
    >
      <div
        ref={containerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Product categories"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="relative w-full select-none touch-pan-y outline-none overflow-hidden h-[380px] sm:h-[460px] md:h-[580px]"
        style={{ perspective: "1100px" }}
      >
        {/* floor shadow */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-6 left-1/2 h-8 w-2/3 -translate-x-1/2 rounded-full bg-black/40 blur-2xl"
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transformStyle: "preserve-3d",
            // translateZ(+radius) pushes the ring's own origin toward the
            // viewer by radius; each card then pulls itself back by -radius
            // (below) before rotating, so the two cancel out for whichever
            // card currently sits at offset 0 — it renders at the same
            // depth/size as a flat 2D element, only the others are displaced.
            //
            // pointer-events-none matters here: this wrapper has no visible
            // content, but its own untransformed box still sits at Z=+radius
            // (much closer to the camera than the actual card content, which
            // nets to Z=0 or further back) — without this, its invisible
            // flat plane wins 3D hit-testing over every card underneath it
            // and swallows all clicks.
            transform: `translateZ(${radius}px)`,
          }}
        >
          {categories.map((category, index) => {
            const offset = shortestDelta(position, index, count);
            const isActive = index === activeIndex;
            // Visibility range is extended a step beyond sideCount, and
            // opacity fades to exactly 0 at that extended edge, so a card
            // crossing the sideCount boundary during continuous drift fades
            // out smoothly instead of popping in/out abruptly.
            const fadeRange = sideCount + 1;
            const isVisible = Math.abs(offset) <= fadeRange;
            const isOuterRight = offset >= 0;
            // Negated offset: left cards (offset < 0) get a positive rotateY
            // and right cards (offset > 0) get a negative one. Paired with
            // translateZ(-radius) below, that turns each card's OUTER edge
            // toward the viewer (concave ring) instead of its inner edge
            // (which is what a positive-offset rotateY would give you — a
            // convex coverflow, the opposite of what we want here).
            const cardAngle = -offset * angleStep;

            return (
              <div
                key={category.id}
                role="button"
                tabIndex={isActive ? 0 : -1}
                aria-hidden={!isVisible}
                aria-label={isActive ? `Go to ${category.name}` : `Show ${category.name}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => handleCardActivate(index, category.href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleCardActivate(index, category.href);
                  }
                }}
                onMouseEnter={pause}
                onMouseLeave={resume}
                className="absolute left-1/2 top-1/2 origin-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                style={{
                  width: `${cardWidth}px`,
                  height: `${(cardWidth * 5) / 3}px`,
                  marginLeft: `-${cardWidth / 2}px`,
                  marginTop: `-${(cardWidth * 5) / 6}px`,
                  transformStyle: "preserve-3d",
                  transform: prefersReducedMotion
                    ? "none"
                    : `rotateY(${cardAngle}deg) translateZ(-${radius}px)`,
                  opacity: prefersReducedMotion
                    ? isActive
                      ? 1
                      : 0.35
                    : Math.max(0, 1 - Math.abs(offset) / fadeRange),
                  pointerEvents: isVisible ? "auto" : "none",
                  zIndex: 100 - Math.round(Math.abs(offset) * 10),
                }}
              >
                {/* Front face: clips the image/text to rounded corners. Kept
                    separate from the button so overflow-hidden here doesn't
                    also clip the 3D side slab below, which needs to extend
                    outside this box's flat plane to read as real depth. */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/15 bg-black/20 shadow-2xl">
                  <img
                    src={category.image}
                    alt={category.name}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 p-4 text-center">
                    <h3 className="font-brand text-lg font-bold uppercase leading-tight text-white md:text-2xl">
                      {category.name}
                    </h3>
                    <Link
                      to={category.href}
                      onClick={(event) => event.stopPropagation()}
                      className="font-brand text-sm text-white underline underline-offset-4 hover:text-white/80"
                    >
                      View All Products
                    </Link>
                  </div>
                </div>

                {/* Side "slab" edge: a lit/shaded strip along the card's
                    outer border, inside its own flat plane (no extra 3D
                    rotation). A literal perpendicular face here — hinged on
                    the edge and rotated 90deg — degenerates to a zero-width
                    line once composed with the parent's own rotateY: the
                    two rotations are both around Y, and for this hinge/pivot
                    geometry their composition collapses the strip's apparent
                    width to exactly zero for every rotated card, regardless
                    of thickness (verified: only the unrotated active card
                    showed nonzero width). This flat gradient reads as a
                    beveled/lit edge instead and renders reliably at every
                    angle. */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0"
                  style={{
                    width: `${CARD_THICKNESS}px`,
                    [isOuterRight ? "right" : "left"]: 0,
                    background: isOuterRight
                      ? "linear-gradient(to left, rgba(255,255,255,0.4), rgba(0,0,0,0.5) 40%, transparent)"
                      : "linear-gradient(to right, rgba(255,255,255,0.4), rgba(0,0,0,0.5) 40%, transparent)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryCarousel;
