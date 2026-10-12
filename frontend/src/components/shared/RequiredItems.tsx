import { useEffect, useState } from "react";
import type { ProductRequiredItem } from "../../api/clientApi";

// Popup with a required item's photos (main image + thumbnails) and details.
// Closes on the backdrop, the × button, or Escape.
const RequiredItemModal = ({
  item,
  onClose,
}: {
  item: ProductRequiredItem;
  onClose: () => void;
}) => {
  const images = item.images ?? [];
  const [activeImage, setActiveImage] = useState(images[0] ?? null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={item.name}
        onClick={(event) => event.stopPropagation()}
        className="relative grid max-h-[90vh] w-full max-w-4xl grid-cols-1 gap-8 overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 md:grid-cols-2 md:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-3 text-3xl leading-none text-white/60 transition-colors hover:text-white"
        >
          ×
        </button>

        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-white">
            {activeImage ? (
              <img src={activeImage} alt={item.name} className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-black/30">
                No image
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded border-2 bg-white transition-colors ${
                    activeImage === image ? "border-white" : "border-transparent hover:border-white/50"
                  }`}
                >
                  <img src={image} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col pr-6">
          <h3 className="text-2xl font-semibold text-white">{item.name}</h3>
          {item.productCode && <p className="mt-2 text-sm text-white/50">{item.productCode}</p>}
          <div className="mt-6 flex flex-col gap-2 text-sm text-white/80">
            {item.color && <p>Color/Finish: {item.color}</p>}
            {item.quantity && <p>Qty: {item.quantity}</p>}
          </div>
          {item.description && (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-white/80">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// "Required Items" list on a product's detail page — each row opens the
// item's popup.
const RequiredItems = ({ items }: { items: ProductRequiredItem[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openItem = openIndex === null ? null : items[openIndex];

  return (
    <div className="mt-10">
      <h2 className="border-b border-white/40 pb-3 text-lg font-medium text-white">
        Required Items
      </h2>

      <ul>
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="border-b border-white/15">
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group flex w-full items-start gap-5 py-5 text-left"
            >
              <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded bg-white">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-black/30">No image</span>
                )}
              </span>
              <span className="flex min-w-0 flex-col gap-2">
                <span className="text-base text-white underline underline-offset-4 transition-colors group-hover:text-white/70">
                  {item.name}
                </span>
                {item.color && (
                  <span className="text-sm text-white/70">Color/Finish: {item.color}</span>
                )}
                {item.quantity && (
                  <span className="text-sm text-white/70">Qty: {item.quantity}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {openItem && (
        <RequiredItemModal
          key={openIndex}
          item={openItem}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
};

export default RequiredItems;
