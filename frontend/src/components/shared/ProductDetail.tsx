import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import RevealSection from "./RevealSection";
import RequiredItems from "./RequiredItems";
import ItemTile, { ItemSectionTitle } from "./ItemTile";
import WishlistButton from "./WishlistButton";
import { CATEGORIES } from "../../data/categories";
import type { CatalogResponse, Product, ProductDisplayColor } from "../../api/clientApi";
import { toSizeEntries } from "../../api/clientApi";
import backgroundPattern from "../../assets/background Pattern.png";

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
  /**
   * Where "Back to …" goes, when that isn't shopPath: toilets, washbasins and
   * bathtubs keep their product pages under the old shop-* pages, but the
   * page people browse from is the category page with the filter sidebar.
   */
  backPath?: string;
}

const MAX_RECOMMENDATIONS = 6;

// A product's main photo for a tile: its own image, else the first gallery
// photo, else the first color's photo.
const productImage = (product: Product) => {
  if (typeof product.image === "string" && product.image) return product.image;
  return product.display?.images?.[0] ?? product.display?.colors?.find((c) => c.image)?.image;
};

/**
 * The brand stripe pattern (assets/background Pattern.png) as faint light
 * bands behind the item grids, like the reference design. The PNG is dark
 * stripes on transparency, so it's used as a mask over a faint white fill:
 * the stripes come out light on the black page, and their strength is just
 * the fill's opacity. It spans the full screen width, stretched a little
 * taller than the file so the bands run through both item sections.
 */
const BackgroundPattern = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute left-1/2 top-24 -z-10 aspect-[3902/1456] w-screen -translate-x-1/2 bg-white/[0.08]"
    style={{
      maskImage: `url("${backgroundPattern}")`,
      WebkitMaskImage: `url("${backgroundPattern}")`,
      maskSize: "100% 100%",
      WebkitMaskSize: "100% 100%",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
    }}
  />
);

/**
 * A product's detail page, shared by every category: a black card with the
 * photo gallery and spec sheet (code, description, colors, type, size,
 * technical sheet), then the product's required items and a few other
 * products from the same category to recommend.
 */
const ProductDetail = ({
  categoryId,
  categoryLabel,
  api,
  shopPath,
  backPath = shopPath,
}: ProductDetailProps) => {
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
          to={backPath}
          className="mt-6 inline-block border border-white px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
        >
          Back to {categoryLabel}
        </Link>
      </RevealSection>
    );
  }

  return (
    <div className="relative overflow-hidden bg-black pb-20 md:pb-28">
      <div className="relative mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-10">
        <Link to={backPath} className="text-sm text-white/60 transition-colors hover:text-white">
          ← Back to {categoryLabel}
        </Link>

        {/* Product card */}
        {/* Light gray card (#d2d3d5, inner panels #b7b8ba) so transparent PNG
            cut-outs of white sanitaryware sit straight on it, lifted by a drop
            shadow instead of a box of their own. */}
        <section className="mt-4 grid grid-cols-1 gap-6 rounded-3xl bg-[#d2d3d5] p-5 [color-scheme:light] md:grid-cols-[96px_1fr] md:p-7 lg:grid-cols-[104px_1fr_minmax(280px,340px)] lg:gap-8">
          {/* Thumbnails: a row under the photo on phones, a column on the left otherwise. */}
          {gallery.length > 1 && (
            <div className="order-2 flex gap-3 overflow-x-auto md:order-none md:max-h-[460px] md:flex-col md:overflow-y-auto md:overflow-x-visible">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => pick(image, activeColor)}
                  aria-label={`Show photo ${index + 1}`}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#c4c5c8] ring-offset-2 ring-offset-[#d2d3d5] transition md:h-24 md:w-24 lg:h-[100px] lg:w-[100px] ${
                    activeImage === image ? "ring-2 ring-black/70" : "hover:ring-2 hover:ring-black/25"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-contain p-1"
                  />
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
                className="max-h-full max-w-full object-contain drop-shadow-[0_22px_26px_rgba(0,0,0,0.28)]"
              />
            ) : (
              <span className="text-sm text-black/50">No image</span>
            )}
          </div>

          {/* Spec sheet */}
          <div className="order-3 flex flex-col md:col-span-2 md:order-none lg:col-span-1 lg:pt-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-brand text-3xl font-bold leading-tight text-black md:text-4xl">
                {product.name}
              </h1>
              <WishlistButton
                productId={product.id}
                productName={product.name}
                className="mt-1 shrink-0"
              />
            </div>
            {display?.productCode && (
              <span className="mt-2 w-fit rounded bg-[#7a7b7e] px-2 py-0.5 font-brand text-xs font-semibold italic text-white">
                {display.productCode}
              </span>
            )}
            {display?.description && (
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-black/75">
                {display.description}
              </p>
            )}

            {display?.colors && display.colors.length > 0 && (
              <div className="mt-6 rounded-2xl bg-[#b7b8ba] p-4 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.4)]">
                <p className="font-brand text-sm font-semibold text-black">Color / Finish</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {display.colors.map((color, index) => {
                    const isActive = activeColor?.name === color.name && activeColor?.image === color.image;
                    return (
                      <button
                        key={`${color.name}-${index}`}
                        type="button"
                        onClick={() => pick(color.image ?? activeImage, color)}
                        title={[color.name, color.code].filter(Boolean).join(" ")}
                        aria-label={[color.name, color.code].filter(Boolean).join(" ")}
                        aria-pressed={isActive}
                        className={`flex h-11 w-12 items-center justify-center overflow-hidden rounded-lg bg-[#d2d3d5] p-0.5 ring-offset-2 ring-offset-[#b7b8ba] transition ${
                          isActive ? "ring-2 ring-black/70" : "hover:ring-2 hover:ring-black/25"
                        }`}
                      >
                        {color.image ? (
                          <img src={color.image} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-semibold text-black/55">{color.name.slice(0, 2)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {(activeColor?.name || activeColor?.code) && (
                  <p className="mt-3 font-brand text-sm font-bold text-black">
                    {activeColor.name}
                    {activeColor.code && (
                      <span className={`font-semibold text-black/55 ${activeColor.name ? "ml-2" : ""}`}>
                        {activeColor.code}
                      </span>
                    )}
                  </p>
                )}
              </div>
            )}

            {display?.types && display.types.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] font-bold uppercase tracking-wide text-black">Type</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {display.types.map((type) => (
                    <span key={type} className="rounded-sm border border-black/40 px-3 py-1 text-xs text-black">
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
                  {toSizeEntries(display.sizes).map((size, index) => (
                    <span
                      key={`${size.name}-${index}`}
                      className="rounded-sm border border-black/40 px-3 py-1 text-xs text-black"
                    >
                      {size.name}
                      {size.code && <span className="ml-1.5 text-black/55">{size.code}</span>}
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
                className="mt-7 w-fit rounded bg-[#7a7b7e] px-3 py-1.5 font-brand text-sm font-bold uppercase italic text-white transition-colors hover:bg-black"
              >
                Download Technical Sheet
              </a>
            )}
          </div>
        </section>

        {/* `isolate` keeps the pattern's -z-10 inside this block: above the
            page's black, below the items. */}
        <div className="relative isolate mx-auto mt-10 flex max-w-5xl flex-col gap-16 md:mt-12 md:gap-20">
          {((display?.requiredItems?.length ?? 0) > 0 || recommendations.length > 0) && (
            <BackgroundPattern />
          )}
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
