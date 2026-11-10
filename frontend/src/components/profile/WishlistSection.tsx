import { Link } from "react-router-dom";
import WishlistButton from "../shared/WishlistButton";
import { CATEGORIES } from "../../data/categories";
import type { WishlistEntry } from "../../api/clientApi";
import { reloadWishlist, useWishlist } from "../../lib/wishlist";
import { productPagePath } from "../../lib/productPaths";

// Its own photo, else the first gallery or color photo, else the category's.
const productImage = (item: WishlistEntry, fallback?: string) => {
  if (typeof item.image === "string" && item.image) return item.image;
  return (
    item.display?.images?.[0] ?? item.display?.colors?.find((c) => c.image)?.image ?? fallback
  );
};

/** "My Wishlist" on the profile page: every product the user saved with the heart button. */
const WishlistSection = () => {
  const { status, items } = useWishlist();

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-medium text-white">My Wishlist</h2>
        {status === "ready" && items.length > 0 && (
          <p className="text-sm text-white/50">
            {items.length} {items.length === 1 ? "product" : "products"}
          </p>
        )}
      </div>

      {status === "error" ? (
        <div className="mt-4">
          <p className="text-sm text-white/60">We couldn't load your wishlist.</p>
          <button
            type="button"
            onClick={reloadWishlist}
            className="mt-3 text-sm text-white underline underline-offset-4 hover:text-white/80"
          >
            Try again
          </button>
        </div>
      ) : status !== "ready" ? (
        <p className="mt-4 text-sm text-white/50">Loading your wishlist…</p>
      ) : items.length === 0 ? (
        <div className="mt-4">
          <p className="text-sm text-white/60">
            No saved products yet. Tap the heart on any product to save it here.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/80"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {items.map((item) => {
            const category = CATEGORIES.find((c) => c.id === item.category);
            const image = productImage(item, category?.image);
            return (
              <li key={item.id} className="relative">
                <WishlistButton
                  productId={item.id}
                  productName={item.name}
                  className="absolute right-2 top-2 z-10"
                />
                <Link to={productPagePath(item.category, item.id)} className="group block">
                  <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl bg-white/5 p-3">
                    {image ? (
                      <img
                        src={image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-xs text-white/30">No image</span>
                    )}
                  </div>
                  <p className="mt-3 truncate text-sm font-medium text-white" title={item.name}>
                    {item.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-white/50">
                    {category?.name ?? item.category}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default WishlistSection;
