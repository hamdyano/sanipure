import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import RevealSection from "./shared/RevealSection";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import washbasinsImage from "../assets/categories photos/Washbasins photo.jpg";
import toiletsImage from "../assets/categories photos/Toilets photo.jpg";
import bathtubsImage from "../assets/categories photos/Bathtubs photo.jpg";
import accessoriesImage from "../assets/categories photos/Accessories photo.jpg";
import publicBathroomsImage from "../assets/categories photos/Public Bathrooms photo.jpg";
import bathroomCollectionImage from "../assets/categories photos/Bathroom collection photo.jpg";

const categories = [
  {
    name: "Washbasins",
    cta: "View All Products",
    to: "/products/washbasins",
    image: washbasinsImage,
  },
  {
    name: "Toilets",
    cta: "View All Products",
    to: "/products/toilets",
    image: toiletsImage,
  },
  {
    name: "Bathtubs",
    cta: "View All Products",
    to: "/products/bathtubs",
    image: bathtubsImage,
  },
  {
    name: "Accessories & Furniture",
    cta: "View All Products",
    to: "/products/accessories",
    image: accessoriesImage,
  },
  {
    name: "Public Bathrooms",
    cta: "View All Products",
    to: "/products/public-bathrooms",
    image: publicBathroomsImage,
  },
  {
    name: "Bathroom Collection",
    cta: "View All Products",
    to: "/products/bathroom-collection",
    image: bathroomCollectionImage,
  },
];

// Rendered twice back-to-back so the track can wrap at exactly one set's
// width and land pixel-perfectly on the start of the duplicate set — that's
// what makes the loop from card 6 back to card 1 (in either direction, drag
// included) seamless.
const loopedCategories = [...categories, ...categories];

const AUTOPLAY_SPEED = 40; // px/second
const DRAG_CLICK_THRESHOLD = 6; // px of movement before a drag suppresses the card's click-through

const Categories = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const pausedRef = useRef(false);
  const pointerDownRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartOffsetRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const applyTransform = () => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
    }
  };

  // One set's width — used to wrap the offset around endlessly in both
  // directions, whether that motion comes from autoplay or a manual drag.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      halfWidthRef.current = track.scrollWidth / 2;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      if (!pausedRef.current && !draggingRef.current) {
        offsetRef.current -= AUTOPLAY_SPEED * dt;
        const half = halfWidthRef.current;
        if (half > 0) {
          while (offsetRef.current <= -half) offsetRef.current += half;
        }
        applyTransform();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  const wrapOffset = (value: number) => {
    const half = halfWidthRef.current;
    if (half <= 0) return value;
    let next = value;
    while (next <= -half) next += half;
    while (next > 0) next -= half;
    return next;
  };

  // Pointer capture is deferred until real drag movement is confirmed
  // (past DRAG_CLICK_THRESHOLD) rather than grabbed on pointerdown. Capturing
  // immediately retargets the browser's native click event to this wrapper
  // instead of the card's own <a>, which silently ate every plain click —
  // React Router's Link never saw it, so nothing ever navigated.
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = true;
    dragDistanceRef.current = 0;
    dragStartXRef.current = event.clientX;
    dragStartOffsetRef.current = offsetRef.current;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current) return;
    const delta = event.clientX - dragStartXRef.current;
    dragDistanceRef.current = Math.abs(delta);

    if (!draggingRef.current) {
      if (dragDistanceRef.current <= DRAG_CLICK_THRESHOLD) return;
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    offsetRef.current = wrapOffset(dragStartOffsetRef.current + delta);
    applyTransform();
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    pointerDownRef.current = false;
    if (draggingRef.current) {
      draggingRef.current = false;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  // A drag that moved more than a few pixels shouldn't also trigger the
  // card's navigation on release — only a genuine (near-stationary) click
  // should follow the link.
  const handleClickCapture = (event: MouseEvent) => {
    if (dragDistanceRef.current > DRAG_CLICK_THRESHOLD) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <section className="mb-20 overflow-hidden bg-gradient-to-b from-[#3a3a3a] to-black py-16 md:mb-28 md:py-20">
      <RevealSection className="mb-10 px-6 md:mb-12 md:px-12">
        <h2 className="text-center font-brand text-3xl font-extrabold uppercase tracking-tight text-white md:text-5xl">
          Discover Our Categories
        </h2>
      </RevealSection>

      <div
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
        className="cursor-grab touch-pan-y select-none active:cursor-grabbing"
      >
        <div
          ref={trackRef}
          data-marquee-track
          className="flex w-max gap-5 px-6 md:gap-6 md:px-12"
        >
          {loopedCategories.map((category, index) => (
            <Link
              key={`${category.name}-${index}`}
              to={category.to}
              draggable={false}
              className="group relative block h-[440px] w-[240px] flex-none overflow-hidden rounded-3xl sm:w-[270px] md:h-[500px] md:w-[300px] lg:h-[560px]"
            >
              <img
                src={category.image}
                alt={category.name}
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                <h3 className="font-brand text-xl font-medium uppercase text-white md:text-2xl">
                  {category.name}
                </h3>
                <span className="font-brand text-sm text-white underline underline-offset-4">
                  {category.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
