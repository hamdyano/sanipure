import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import RevealSection from "./RevealSection";
import RequiredItems from "./RequiredItems";
import ItemTile, { ItemSectionTitle } from "./ItemTile";
import { CATEGORIES } from "../../data/categories";
import type { CatalogResponse, Product, ProductDisplayColor } from "../../api/clientApi";

interface CategoryApi {
  getAll: () => Promise<CatalogResponse>;
  getById: (id: string) => Promise<Product>;
}

interface ProductDetailProps {
  /** Id of the product's category (see data/categories.ts). */
  categoryId: string;
  /** Plural label for the category, e.g. "Toilets". */
  categoryLabel: string;
  api: CategoryApi;
  /** Shop page the product belongs to; product pages live under it. */
  shopPath: string;
}

const MAX_RECOMMENDATIONS = 6;

// A product's main photo for a tile: its own image, else the first gallery
// photo, else the first color's photo.
const productImage = (product: Product) => {
  if (typeof product.image === "string" && product.image) return product.image;
  return product.display?.images?.[0] ?? product.display?.colors?.find((c) => c.image)?.image;
};

/** Faint wide curves behind the item grids, like the reference design. */
const BackgroundWaves = () => (
  <svg
    aria-hidden
    viewBox="0 0 1440 900"
    preserveAspectRatio="none"
    className="pointer-events-none absolute inset-x-0 top-[18%] h-[70%] w-full"
  >
    <path
      d="M0 160 C 300 120, 520 260, 820 250 S 1250 140, 1440 190 L1440 300 C 1200 260, 1000 360, 760 360 S 260 240, 0 280 Z"
      fill="rgba(255,255,255,0.045)"
    />
    <path
      d="M0 470 C 260 420, 560 560, 860 540 S 1260 420, 1440 470 L1440 560 C 1220 520, 1020 640, 780 640 S 280 520, 0 570 Z"
      fill="rgba(255,255,255,0.04)"
    />
    <path
      d="M0 720 C 320 680, 600 800, 900 780 S 1280 690, 1440 720 L1440 800 C 1180 780, 980 870, 720 860 S 240 770, 0 810 Z"
      fill="rgba(255,255,255,0.035)"
    />
  </svg>
);

/**
 * A product's detail page, shared by every category: a light card with the
 * photo gallery and spec sheet (code, description, colors, type, size,
 * technical sheet), then the product's required items and a few other
 * products from the same category to recommend.
 */
const ProductDetail = ({ categoryId, categoryLabel, api, shopPath }: ProductDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const requestedColor = searchParams.get("color");

  // Keyed by the id it was loaded for, so "loading" is simply "the result
  // isn't for the product in the URL yet" — no resetting state inside the
  // effect when the visitor moves to another product.
  const [result, setResult] = useState<{ id: string; product: Product | null } | null>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  // The visitor's own pick of photo/color, for the product it was made on.
  const [picked, setPicked] = useState<{
    productId: string;
    image: string | null;
    color: ProductDisplayColor | null;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    api
      .getById(id)
      .then((product) => !cancelled && setResult({ id, product }))
      .catch(() => !cancelled && setResult({ id, product: null }));
    return () => {
      cancelled = true;
    };
  }, [api, id]);

  useEffect(() => {
    let cancelled = false;
    api
      .getAll()
      .then((data) => !cancelled && setCatalog(data.products))
      // Recommendations are extra; without them the page still works.
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [api]);

  const loading = !!id && result?.id !== id;
  const product = loading ? null : (result?.product ?? null);
  const display = product?.display;

  const gallery = useMemo(() => {
    const images = display?.images ?? [];
    if (images.length) return images;
    return typeof product?.image === "string" && product.image ? [product.image] : [];
  }, [display, product]);

  // Clicking a color swatch in the shop grid links here with ?color=<name>,
  // so the page opens on that color; otherwise on the first one.
  const defaultColor = useMemo(() => {
    const colors = display?.colors ?? [];
    return (requestedColor && colors.find((c) => c.name === requestedColor)) || colors[0] || null;
  }, [display, requestedColor]);

  const ownPick = picked && product && picked.productId === product.id ? picked : null;
  const activeColor = ownPick ? ownPick.color : defaultColor;
  const activeImage = ownPick?.image ?? defaultColor?.image ?? gallery[0] ?? null;

  const pick = (image: string | null, color: ProductDisplayColor | null) => {
    if (product) setPicked({ productId: product.id, image, color });
  };

  const fallbackImage = CATEGORIES.find((c) => c.id === categoryId)?.image;
  const recommendations = catalog.filter((p) => p.id !== id).slice(0, MAX_RECOMMENDATIONS);

  if (loading) {
    return (
      <RevealSection className="bg-black px-6 py-28 text-center">
        <p className="text-sm text-white/60">Loading product…</p>
      </RevealSection>
    );
  }

  if (!product) {
    return (
      <RevealSection className="bg-black px-6 py-28 text-center">
        <p className="text-sm text-white/60">This product couldn't be found.</p>
        <Link
          to={shopPath}
          className="mt-6 inline-block border border-white px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
        >
          Back to {categoryLabel}
        </Link>
      </RevealSection>
    );
  }

  return (
    <div className="relative overflow-hidden bg-black pb-20 md:pb-28">
      <BackgroundWaves />

      <div className="relative mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-10">
        <Link to={shopPath} className="text-sm text-white/60 transition-colors hover:text-white">
          ← Back to {categoryLabel}
        </Link>

        {/* Product card */}
        <section className="mt-4 grid grid-cols-1 gap-6 rounded-3xl bg-[#d4d6d9] p-5 md:grid-cols-[96px_1fr] md:p-7 lg:grid-cols-[104px_1fr_minmax(280px,340px)] lg:gap-8">
          {/* Thumbnails: a row under the photo on phones, a column on the left otherwise. */}
          {gallery.length > 1 && (
            <div className="order-2 flex gap-3 overflow-x-auto md:order-none md:max-h-[460px] md:flex-col md:overflow-y-auto md:overflow-x-visible">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => pick(image, activeColor)}
                  aria-label={`Show photo ${index + 1}`}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-offset-2 ring-offset-[#d4d6d9] transition md:h-24 md:w-24 lg:h-[100px] lg:w-[100px] ${
                    activeImage === image ? "ring-2 ring-black/70" : "hover:ring-2 hover:ring-black/25"
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main photo */}
          <div
            className={`order-1 flex h-72 items-center justify-center sm:h-80 md:order-none lg:h-[460px] ${
              gallery.length > 1 ? "" : "md:col-span-2 lg:col-span-2"
            }`}
          >
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.25)]"
              />
            ) : (
              <span className="text-sm text-black/40">No image</span>
            )}
          </div>

          {/* Spec sheet */}
          <div className="order-3 flex flex-col md:col-span-2 md:order-none lg:col-span-1 lg:pt-4">
            <h1 className="font-brand text-3xl font-bold leading-tight text-black md:text-4xl">
              {product.name}
            </h1>
            {display?.productCode && (
              <span className="mt-2 w-fit rounded bg-neutral-500 px-2 py-0.5 font-brand text-xs font-semibold italic text-white">
                {display.productCode}
              </span>
            )}
            {display?.description && (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-black/80">
                {display.description}
              </p>
            )}

            {display?.colors && display.colors.length > 0 && (
              <div className="mt-6 rounded-2xl bg-[#b9bcc0] p-4 shadow-[0_14px_30px_-10px_rgba(0,0,0,0.45)]">
                <p className="font-brand text-sm font-semibold text-black">Color / Finish</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {display.colors.map((color, index) => {
                    const isActive = activeColor?.name === color.name && activeColor?.image === color.image;
                    return (
                      <button
                        key={`${color.name}-${index}`}
                        type="button"
                        onClick={() => pick(color.image ?? activeImage, color)}
                        title={color.name}
                        aria-label={color.name}
                        aria-pressed={isActive}
                        className={`flex h-11 w-12 items-center justify-center overflow-hidden rounded-lg transition ${
                          isActive ? "bg-white/70 ring-2 ring-black/60" : "hover:bg-white/40"
                        }`}
                      >
                        {color.image ? (
                          <img src={color.image} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-semibold text-black/60">{color.name.slice(0, 2)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {activeColor?.name && (
                  <p className="mt-3 font-brand text-sm font-bold text-black">{activeColor.name}</p>
                )}
              </div>
            )}

            {display?.types && display.types.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wide text-black">Type</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {display.types.map((type) => (
                    <span key={type} className="rounded-sm border border-neutral-600 px-3 py-1 text-xs text-black">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {display?.sizes && display.sizes.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-black">Size</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {display.sizes.map((size) => (
                    <span key={size} className="rounded-sm border border-neutral-600 px-3 py-1 text-xs text-black">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {display?.designFile && (
              <a
                href={display.designFile}
                target="_blank"
                rel="noreferrer"
                className="mt-7 w-fit rounded bg-neutral-500 px-3 py-1.5 font-brand text-sm font-bold uppercase italic text-white transition-colors hover:bg-neutral-700"
              >
                Download Technical Sheet
              </a>
            )}
          </div>
        </section>

        <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-16 md:mt-12 md:gap-20">
          {display?.requiredItems && display.requiredItems.length > 0 && (
            <RequiredItems items={display.requiredItems} />
          )}

          {recommendations.length > 0 && (
            <section>
              <ItemSectionTitle>Recommendation Items</ItemSectionTitle>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((item) => (
                  <ItemTile
                    key={item.id}
                    name={item.name}
                    image={productImage(item) ?? fallbackImage}
                    productCode={item.display?.productCode}
                    to={`${shopPath}/${item.id}`}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
