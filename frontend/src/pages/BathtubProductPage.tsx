import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import RevealSection from "../components/shared/RevealSection";
import bathtubsApi from "../api/bathtubsApi";
import type { Product, ProductDisplayColor } from "../api/clientApi";

const BathtubProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const requestedColor = searchParams.get("color");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<ProductDisplayColor | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    bathtubsApi
      .getById(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        const display = data.display;
        // Clicking a color swatch from the shop grid links here with
        // ?color=<name> — that's the display rule for every product with
        // colors: land on this page with the chosen color already pointed
        // to in the slider, rather than always defaulting to the first one.
        const colors = display?.colors ?? [];
        const requested = requestedColor
          ? colors.find((color) => color.name === requestedColor)
          : undefined;
        const initialColor = requested ?? colors[0] ?? null;
        const firstImage =
          initialColor?.image ?? display?.images?.[0] ?? (typeof data.image === "string" ? data.image : null);
        setActiveImage(firstImage);
        setActiveColor(initialColor);
      })
      .catch(() => {
        if (!cancelled) setError("This product couldn't be found.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, requestedColor]);

  const gallery = useMemo(() => {
    const display = product?.display;
    const images = display?.images ?? [];
    if (images.length) return images;
    return typeof product?.image === "string" ? [product.image] : [];
  }, [product]);

  if (loading) {
    return (
      <RevealSection className="bg-black px-6 py-28 text-center">
        <p className="text-sm text-white/60">Loading product…</p>
      </RevealSection>
    );
  }

  if (error || !product) {
    return (
      <RevealSection className="bg-black px-6 py-28 text-center">
        <p className="text-sm text-white/60">{error ?? "This product couldn't be found."}</p>
        <Link
          to="/products/bathtubs/shop-bathtubs"
          className="mt-6 inline-block border border-white px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
        >
          Back to Bathtubs
        </Link>
      </RevealSection>
    );
  }

  const display = product.display;

  return (
    <>
      <RevealSection className="bg-black px-6 pb-4 pt-20 md:pt-28">
        <Link
          to="/products/bathtubs/shop-bathtubs"
          className="text-sm text-white/60 transition-colors hover:text-white"
        >
          ← Back to Bathtubs
        </Link>
      </RevealSection>

      <section className="mx-auto my-10 grid max-w-7xl grid-cols-1 gap-12 px-6 md:my-14 lg:grid-cols-[1.5fr_1fr] lg:px-12">
        <div className="flex flex-col-reverse gap-4 lg:flex-row">
          {gallery.length > 1 && (
            <div className="flex gap-3 lg:flex-col lg:gap-4">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`h-16 w-16 shrink-0 overflow-hidden border transition-colors lg:h-20 lg:w-20 ${
                    activeImage === image ? "border-white" : "border-white/20 hover:border-white/50"
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="aspect-square w-full flex-1 overflow-hidden bg-white/5 lg:aspect-auto lg:h-[640px]">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-white/30">
                No image
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold text-white md:text-4xl">{product.name}</h1>
          {display?.productCode && (
            <p className="mt-2 text-sm text-white/50">{display.productCode}</p>
          )}

          {display?.description && (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80">
              {display.description}
            </p>
          )}

          {display?.colors && display.colors.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/60">
                Color/Finish
                {activeColor?.name ? <span className="ml-2 font-normal normal-case text-white/60">{activeColor.name}</span> : null}
              </p>
              <div className="flex flex-wrap gap-3">
                {display.colors.map((color, index) => (
                  <button
                    key={`${color.name}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveColor(color);
                      if (color.image) setActiveImage(color.image);
                    }}
                    title={color.name}
                    className={`h-11 w-11 overflow-hidden rounded-full border-2 transition-colors ${
                      activeColor?.name === color.name && activeColor?.image === color.image
                        ? "border-white"
                        : "border-transparent hover:border-white/50"
                    }`}
                  >
                    {color.image ? (
                      <img src={color.image} alt={color.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-white/10 text-[9px] text-white/60">
                        {color.name.slice(0, 2)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {display?.types && display.types.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/60">
                Type
              </p>
              <div className="flex flex-wrap gap-2">
                {display.types.map((type) => (
                  <span
                    key={type}
                    className="border border-white/30 px-4 py-2 text-sm text-white/80"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {display?.sizes && display.sizes.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/60">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {display.sizes.map((size) => (
                  <span
                    key={size}
                    className="border border-white/30 px-4 py-2 text-sm text-white/80"
                  >
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
              className="mt-10 w-fit border border-white px-8 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-black"
            >
              Download Design File
            </a>
          )}
        </div>
      </section>
    </>
  );
};

export default BathtubProductPage;
