import { useEffect, useState } from "react";
import CategoryPageHeader from "../components/shared/CategoryPageHeader";
import RevealSection from "../components/shared/RevealSection";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import heroImage from "../assets/bathroom collection photos/hero section.jpg";
import {
  BATHROOM_SERIES,
  GLAZE_COLORS,
  type CollectionSeries,
  type PieceGroup,
  type SeriesPiece,
} from "../data/bathroomCollection";

const GROUP_LABELS: Record<PieceGroup, [string, string]> = {
  Washbasin: ["washbasin", "washbasins"],
  Toilet: ["toilet", "toilets"],
  Bidet: ["bidet", "bidets"],
  Set: ["set", "sets"],
};

// e.g. "4 washbasins · 2 toilets"
const summarizePieces = (pieces: SeriesPiece[]) =>
  (Object.keys(GROUP_LABELS) as PieceGroup[])
    .map((group) => {
      const count = pieces.filter((piece) => piece.group === group).length;
      if (count === 0) return null;
      const [singular, plural] = GROUP_LABELS[group];
      return `${count} ${count === 1 ? singular : plural}`;
    })
    .filter(Boolean)
    .join(" · ");

const unique = (values: string[]) => [...new Set(values)];

const ColorDots = ({ colors, size = "h-4 w-4" }: { colors: string[]; size?: string }) => (
  <div className="flex items-center gap-1.5">
    {colors.map((color) => (
      <span
        key={color}
        title={color}
        className={`${size} rounded-full border border-white/30`}
        style={{ backgroundColor: GLAZE_COLORS[color] }}
      />
    ))}
  </div>
);

const PieceCard = ({ piece }: { piece: SeriesPiece }) => (
  <article className="flex flex-col">
    <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-white/5">
      <img
        src={piece.image}
        alt={piece.name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
    <p className="mt-4 text-xs uppercase tracking-wide text-white/40">{piece.group}</p>
    <h4 className="mt-1 text-base font-medium text-white">{piece.name}</h4>
    {piece.note && <p className="mt-1 text-sm text-white/60">{piece.note}</p>}
    {piece.sizes && (
      <p className="mt-1 text-sm text-white/60">{piece.sizes.join(" / ")} cm</p>
    )}
    {(piece.colors || piece.features) && (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {piece.colors && <ColorDots colors={piece.colors} />}
        {piece.features?.map((feature) => (
          <span
            key={feature}
            className="rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-white/70"
          >
            {feature}
          </span>
        ))}
      </div>
    )}
  </article>
);

const SeriesSection = ({
  series,
  index,
  pieces,
}: {
  series: CollectionSeries;
  index: number;
  pieces: SeriesPiece[];
}) => {
  const colors = unique(series.pieces.flatMap((piece) => piece.colors ?? []));
  const features = unique(series.pieces.flatMap((piece) => piece.features ?? []));
  const flipped = index % 2 === 1;

  return (
    <section id={series.id} className="scroll-mt-24 border-t border-white/10 py-14 md:py-20">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className={`overflow-hidden rounded-3xl ${flipped ? "lg:order-2" : ""}`}>
          <img
            src={series.cover}
            alt={`${series.name} series`}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <RevealSection>
          <p className="text-sm uppercase tracking-[0.2em] text-white/40">
            Series {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-2 font-brand text-4xl font-extrabold uppercase text-white md:text-5xl">
            {series.name}
          </h2>
          <p className="mt-5 leading-relaxed text-white/70">{series.description}</p>

          <dl className="mt-8 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-white/40">Pieces</dt>
              <dd className="mt-1 text-white">{summarizePieces(series.pieces)}</dd>
            </div>
            {colors.length > 0 && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/40">Colours</dt>
                <dd className="mt-2">
                  <ColorDots colors={colors} size="h-5 w-5" />
                </dd>
              </div>
            )}
            {features.length > 0 && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-white/40">Features</dt>
                <dd className="mt-1 text-white">{features.join(" · ")}</dd>
              </div>
            )}
          </dl>
        </RevealSection>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pieces.map((piece) => (
          <PieceCard key={piece.name} piece={piece} />
        ))}
      </div>
    </section>
  );
};

const BACK_TO_TOP_OFFSET = 600; // px scrolled before the button shows

// Small arrow pinned to the bottom-left corner that takes the visitor back
// to the top of the page. Hidden until they've scrolled past the header.
const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const update = () => setVisible(window.scrollY > BACK_TO_TOP_OFFSET);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
      }
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/70 text-white shadow-lg backdrop-blur transition-all duration-300 hover:bg-white hover:text-black md:bottom-8 md:left-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
};

const BathroomCollectionPage = () => {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  // A series whose name matches shows all its pieces; otherwise only the
  // pieces whose name or type matches, and series with none are hidden.
  const visibleSeries = BATHROOM_SERIES.map((series, index) => {
    const pieces =
      !query || series.name.toLowerCase().includes(query)
        ? series.pieces
        : series.pieces.filter(
            (piece) =>
              piece.name.toLowerCase().includes(query) ||
              piece.group.toLowerCase().includes(query)
          );
    return { series, index, pieces };
  }).filter(({ pieces }) => pieces.length > 0);

  const scrollToSeries = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <CategoryPageHeader
        categoryId="bathroom-collection"
        title="Bathroom Collection"
        subtitle="Seven series, each designed as a complete bathroom: washbasins, toilets and bidets that belong together."
        image={heroImage}
        imageAlt="Vega wall-hung toilet and bidet by Sanipure"
        search={search}
        onSearchChange={setSearch}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <nav aria-label="Series" className="mt-10 flex flex-wrap gap-2 md:mt-14">
          {BATHROOM_SERIES.map((series) => (
            <button
              key={series.id}
              type="button"
              onClick={() => scrollToSeries(series.id)}
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
            >
              {series.name}
              <span className="ml-2 text-white/40">{series.pieces.length}</span>
            </button>
          ))}
        </nav>

        <div className="mt-10 md:mt-14">
          {visibleSeries.length === 0 && (
            <div className="border-t border-white/10 py-14 text-sm text-white/60">
              <p>No series or pieces match "{search.trim()}".</p>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-3 text-white underline underline-offset-4"
              >
                Clear search
              </button>
            </div>
          )}

          {visibleSeries.map(({ series, index, pieces }) => (
            <SeriesSection key={series.id} series={series} index={index} pieces={pieces} />
          ))}
        </div>
      </div>

      <BackToTopButton />
    </>
  );
};

export default BathroomCollectionPage;
