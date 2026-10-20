import { useEffect, useState } from "react";
import type { ProductRequiredItem } from "../../api/clientApi";
import ItemTile, { ItemSectionTitle } from "./ItemTile";

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

// "Required Items" grid on a product's detail page — each item's "See More"
// opens its popup.
const RequiredItems = ({ items }: { items: ProductRequiredItem[] }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openItem = openIndex === null ? null : items[openIndex];

  return (
    <section>
      <ItemSectionTitle>Required Items</ItemSectionTitle>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <ItemTile
            key={`${item.name}-${index}`}
            name={item.name}
            image={item.images?.[0]}
            productCode={item.productCode}
            onSeeMore={() => setOpenIndex(index)}
          />
        ))}
      </div>

      {openItem && (
        <RequiredItemModal
          key={openIndex}
          item={openItem}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
};

export default RequiredItems;
