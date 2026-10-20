import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** Outlined title bar above a product page's item grids ("Required Items", "Recommendation Items"). */
export const ItemSectionTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="rounded-2xl border border-white/60 px-4 py-2 font-brand text-2xl font-bold text-white md:px-5 md:py-3 md:text-3xl">
    {children}
  </h2>
);

interface ItemTileProps {
  name: string;
  image?: string;
  productCode?: string;
  /** "See More" either opens something on the page or links to another page. */
  onSeeMore?: () => void;
  to?: string;
}

const seeMoreClasses =
  "shrink-0 rounded bg-neutral-200 px-4 py-0.5 font-brand text-[11px] font-bold uppercase italic text-black transition-colors hover:bg-white";

/** One product in a product page's item grid: photo, name, code badge and "See More". */
const ItemTile = ({ name, image, productCode, onSeeMore, to }: ItemTileProps) => (
  <div className="flex flex-col items-center">
    <div className="flex h-40 w-full items-center justify-center md:h-44">
      {image ? (
        <img
          src={image}
          alt={name}
          className="max-h-full max-w-[85%] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.55)]"
        />
      ) : (
        <span className="text-xs text-white/30">No image</span>
      )}
    </div>
    <div className="mt-4 w-full max-w-[220px]">
      <h3 className="truncate font-brand text-lg font-semibold text-white" title={name}>
        {name}
      </h3>
      <div className="mt-1.5 flex items-center justify-between gap-3">
        {productCode ? (
          <span className="truncate rounded bg-neutral-300 px-1.5 py-0.5 font-brand text-[11px] font-bold italic text-black">
            {productCode}
          </span>
        ) : (
          <span />
        )}
        {to ? (
          <Link to={to} className={seeMoreClasses}>
            See More
          </Link>
        ) : (
          <button type="button" onClick={onSeeMore} className={seeMoreClasses}>
            See More
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ItemTile;
