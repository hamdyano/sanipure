import { useEffect, useRef, useState, type ChangeEvent } from "react";
import axios from "axios";
import type {
  CatalogResponse,
  Product,
  ProductDisplay,
  ProductInput,
} from "../../api/clientApi";
import { uploadProductFile, uploadProductImage } from "../../api/clientApi";
import {
  showErrorToast,
  showSuccessToast,
  showUnexpectedErrorToast,
} from "../../lib/toast";

const MAX_GALLERY_IMAGES = 5;
const MAX_COLORS = 8;

interface ColorSlot {
  name: string;
  file: File | null;
  preview: string | null;
}

interface ImageSlot {
  file: File | null;
  preview: string | null;
}

const emptyImageSlots = (): ImageSlot[] =>
  Array.from({ length: MAX_GALLERY_IMAGES }, () => ({ file: null, preview: null }));

interface Filter {
  id: string;
  label: string;
  options: string[];
}

export interface ProductManagerApi {
  getAll: () => Promise<CatalogResponse>;
  getMine: () => Promise<Product[]>;
  create: (payload: ProductInput) => Promise<Product>;
  update: (id: string, payload: ProductInput) => Promise<Product>;
  remove: (id: string) => Promise<void>;
}

interface ProductManagerProps {
  categoryLabel: string;
  api: ProductManagerApi;
  onClose: () => void;
  // Renders the "For Display" section below the filter attributes — the
  // full spec-sheet data (colors, gallery photos, types, sizes, design
  // file) shown on the product's public detail page. Only toilets use this
  // today; other categories keep the plain filter-attributes form.
  showDisplaySection?: boolean;
}

const inputClasses =
  "w-full rounded-md border border-white/20 bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition-colors focus:border-white";

// Native <select> popups ignore transparent backgrounds and fall back to the
// browser/OS default (white), so selects need an explicit solid background —
// and each <option> needs it too, since most browsers style options
// independently of the <select> itself.
const selectClasses =
  "w-full rounded-md border border-white/20 bg-[#0d0d0d] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-white";
const optionClasses = "bg-[#0d0d0d] text-white";

const reportError = (err: unknown) => {
  if (
    axios.isAxiosError(err) &&
    err.response &&
    typeof err.response.data?.message === "string"
  ) {
    showErrorToast(err.response.data.message);
  } else {
    showUnexpectedErrorToast();
  }
};

const describeProduct = (product: Product, filters: Filter[]) =>
  filters
    .map((filter) => product[filter.id])
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" · ");

const ProductManager = ({
  categoryLabel,
  api,
  onClose,
  showDisplaySection = false,
}: ProductManagerProps) => {
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loadingMine, setLoadingMine] = useState(true);

  const [filters, setFilters] = useState<Filter[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // "For Display" section state — see showDisplaySection above.
  const [productCode, setProductCode] = useState("");
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState<ColorSlot[]>([]);
  const [galleryImages, setGalleryImages] = useState<ImageSlot[]>(emptyImageSlots());
  const [types, setTypes] = useState<string[]>([]);
  const [typeInput, setTypeInput] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designFileUrl, setDesignFileUrl] = useState<string | null>(null);

  const loadMine = async () => {
    setLoadingMine(true);
    try {
      const mine = await api.getMine();
      setMyProducts(mine);
    } catch (err) {
      reportError(err);
    } finally {
      setLoadingMine(false);
    }
  };

  useEffect(() => {
    loadMine();
    (async () => {
      setLoadingFilters(true);
      try {
        const catalog = await api.getAll();
        setFilters(catalog.filters);
      } catch (err) {
        reportError(err);
      } finally {
        setLoadingFilters(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSelected({});
    setImageFile(null);
    setImagePreview(null);
    setProductCode("");
    setDescription("");
    setColors([]);
    setGalleryImages(emptyImageSlots());
    setTypes([]);
    setTypeInput("");
    setSizes([]);
    setSizeInput("");
    setDesignFile(null);
    setDesignFileUrl(null);
  };

  const formRef = useRef<HTMLHeadingElement>(null);

  const openEditForm = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    const nextSelected: Record<string, string> = {};
    for (const [key, value] of Object.entries(product)) {
      if (key !== "id" && key !== "name" && key !== "image" && typeof value === "string") {
        nextSelected[key] = value;
      }
    }
    setSelected(nextSelected);
    setImageFile(null);
    setImagePreview(typeof product.image === "string" ? product.image : null);

    const display = (product.display as ProductDisplay | undefined) ?? {};
    setProductCode(display.productCode ?? "");
    setDescription(display.description ?? "");
    setColors(
      (display.colors ?? []).map((color) => ({
        name: color.name,
        file: null,
        preview: color.image ?? null,
      }))
    );
    const existingImages = display.images ?? [];
    setGalleryImages(
      emptyImageSlots().map((slot, index) => ({
        ...slot,
        preview: existingImages[index] ?? null,
      }))
    );
    setTypes(display.types ?? []);
    setTypeInput("");
    setSizes(display.sizes ?? []);
    setSizeInput("");
    setDesignFile(null);
    setDesignFileUrl(display.designFile ?? null);

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleColorCountChange = (nextCount: number) => {
    setColors((prev) => {
      if (nextCount <= prev.length) return prev.slice(0, nextCount);
      const additions = Array.from({ length: nextCount - prev.length }, () => ({
        name: "",
        file: null,
        preview: null,
      }));
      return [...prev, ...additions];
    });
  };

  const updateColorName = (index: number, value: string) => {
    setColors((prev) =>
      prev.map((color, i) => (i === index ? { ...color, name: value } : color))
    );
  };

  const handleColorImageChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setColors((prev) =>
      prev.map((color, i) =>
        i === index ? { ...color, file, preview: URL.createObjectURL(file) } : color
      )
    );
  };

  const handleGalleryImageChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setGalleryImages((prev) =>
      prev.map((slot, i) =>
        i === index ? { file, preview: URL.createObjectURL(file) } : slot
      )
    );
  };

  const clearGalleryImage = (index: number) => {
    setGalleryImages((prev) =>
      prev.map((slot, i) => (i === index ? { file: null, preview: null } : slot))
    );
  };

  const addType = () => {
    const value = typeInput.trim();
    if (!value) return;
    setTypes((prev) => [...prev, value]);
    setTypeInput("");
  };

  const removeType = (index: number) => {
    setTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    const value = sizeInput.trim();
    if (!value) return;
    setSizes((prev) => [...prev, value]);
    setSizeInput("");
  };

  const removeSize = (index: number) => {
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDesignFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    setDesignFile(file);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showErrorToast("Enter a product name.");
      return;
    }

    setSaving(true);
    try {
      // A newly-picked file needs to go to Supabase Storage first — imagePreview
      // for a new file is a local blob: URL, not something we can save.
      // Editing without picking a new file keeps whatever URL was already there.
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      } else if (imagePreview) {
        imageUrl = imagePreview;
      }

      let display: ProductDisplay | undefined;
      if (showDisplaySection) {
        const resolvedColors = (
          await Promise.all(
            colors.map(async (color) => ({
              name: color.name.trim(),
              image: color.file ? await uploadProductImage(color.file) : color.preview ?? undefined,
            }))
          )
        ).filter((color) => color.name || color.image);

        const resolvedImages = (
          await Promise.all(
            galleryImages.map((slot) =>
              slot.file
                ? uploadProductImage(slot.file)
                : Promise.resolve(slot.preview ?? undefined)
            )
          )
        ).filter((url): url is string => Boolean(url));

        let resolvedDesignFile = designFileUrl ?? undefined;
        if (designFile) {
          resolvedDesignFile = await uploadProductFile(designFile);
        }

        // A value typed into the Types/Sizes box counts even if "Add" was
        // never clicked — Save shouldn't silently drop it just because the
        // admin didn't take that extra step.
        const pendingType = typeInput.trim();
        const finalTypes =
          pendingType && !types.includes(pendingType) ? [...types, pendingType] : types;
        const pendingSize = sizeInput.trim();
        const finalSizes =
          pendingSize && !sizes.includes(pendingSize) ? [...sizes, pendingSize] : sizes;

        const candidate: ProductDisplay = {
          ...(productCode.trim() ? { productCode: productCode.trim() } : {}),
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(resolvedColors.length ? { colors: resolvedColors } : {}),
          ...(resolvedImages.length ? { images: resolvedImages } : {}),
          ...(finalTypes.length ? { types: finalTypes } : {}),
          ...(finalSizes.length ? { sizes: finalSizes } : {}),
          ...(resolvedDesignFile ? { designFile: resolvedDesignFile } : {}),
        };
        if (Object.keys(candidate).length) display = candidate;
      }

      const payload: ProductInput = {
        name: name.trim(),
        ...selected,
        ...(imageUrl ? { image: imageUrl } : {}),
        ...(display ? { display } : {}),
      };

      if (editingId) {
        await api.update(editingId, payload);
        showSuccessToast(`${categoryLabel.slice(0, -1)} updated successfully`);
      } else {
        await api.create(payload);
        showSuccessToast(`${categoryLabel.slice(0, -1)} added successfully`);
      }
      resetForm();
      loadMine();
    } catch (err) {
      reportError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete "${product.name}"? This can't be undone.`);
    if (!confirmed) return;

    setDeletingId(product.id);
    try {
      await api.remove(product.id);
      showSuccessToast(`${categoryLabel.slice(0, -1)} deleted successfully`);
      if (editingId === product.id) resetForm();
      loadMine();
    } catch (err) {
      reportError(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Your {categoryLabel}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-white/60 transition-colors hover:text-white"
        >
          Close
        </button>
      </div>

      {!loadingMine && myProducts.length > 0 && (
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {myProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-black"
            >
              <div className="aspect-square w-full overflow-hidden bg-white/5">
                {typeof product.image === "string" ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
                    No image
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{product.name}</p>
                  <p className="truncate text-xs text-white/50">
                    {describeProduct(product, filters) || "No attributes set"}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(product)}
                    className="flex-1 rounded-full border border-white/30 px-3 py-2 text-xs font-medium uppercase tracking-wide text-white transition-colors hover:border-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    className="flex-1 rounded-full border border-red-500/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-red-300 transition-colors hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === product.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 ref={formRef} className="mb-4 scroll-mt-6 text-lg font-semibold text-white">
        {editingId ? `Edit ${categoryLabel.slice(0, -1)}` : `Add ${categoryLabel.slice(0, -1)}`}
      </h3>

      <div className="mb-6">
        <label className="mb-1 block text-sm text-white/70">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
          placeholder="e.g. Kepler Stand Alone"
        />
      </div>

      {showDisplaySection && (
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">
          For Filtering
        </h4>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Features (optional)
          </h4>
          {loadingFilters && <p className="text-sm text-white/60">Loading options…</p>}
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="mb-1 block text-sm text-white/70">{filter.label}</label>
              <select
                value={selected[filter.id] ?? ""}
                onChange={(e) =>
                  setSelected((prev) => ({ ...prev, [filter.id]: e.target.value }))
                }
                className={selectClasses}
              >
                <option value="" className={optionClasses}>
                  — Not specified —
                </option>
                {filter.options.map((option) => (
                  <option key={option} value={option} className={optionClasses}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/20 p-8">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Product preview"
              className="h-48 w-48 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-white/10 text-center text-sm text-white/40">
              No image selected
            </div>
          )}
          <p className="text-xs text-white/40">JPG, PNG or WEBP · up to 5MB</p>
          <label className="cursor-pointer rounded-full border border-white/30 px-6 py-2 text-sm text-white transition-colors hover:border-white">
            Choose Photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {showDisplaySection && (
        <div className="mt-10 border-t border-white/10 pt-8">
          <h4 className="mb-6 text-sm font-semibold uppercase tracking-wide text-white/60">
            For Display
          </h4>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-white/70">Product Code</label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className={inputClasses}
                placeholder="e.g. K-3814-0"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-1 block text-sm text-white/70">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${inputClasses} resize-none`}
              placeholder="Full product description shown on the product's detail page"
            />
          </div>

          <div className="mt-8">
            <label className="mb-1 block text-sm text-white/70">Colors</label>
            <select
              value={colors.length}
              onChange={(e) => handleColorCountChange(Number(e.target.value))}
              className={`${selectClasses} max-w-xs`}
            >
              {Array.from({ length: MAX_COLORS + 1 }, (_, i) => i).map((count) => (
                <option key={count} value={count} className={optionClasses}>
                  {count === 0 ? "No colors" : `${count} color${count > 1 ? "s" : ""}`}
                </option>
              ))}
            </select>

            {colors.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-lg border border-white/10 p-4 sm:flex-row sm:items-center"
                  >
                    <input
                      type="text"
                      value={color.name}
                      onChange={(e) => updateColorName(index, e.target.value)}
                      className={inputClasses}
                      placeholder={`Color ${index + 1} name`}
                    />
                    <div className="flex shrink-0 items-center gap-3">
                      {color.preview ? (
                        <img
                          src={color.preview}
                          alt=""
                          className="h-14 w-14 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded border border-white/10 text-[10px] text-white/30">
                          No photo
                        </div>
                      )}
                      <label className="cursor-pointer whitespace-nowrap rounded-full border border-white/30 px-4 py-2 text-xs text-white transition-colors hover:border-white">
                        Choose Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleColorImageChange(index, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <label className="mb-3 block text-sm text-white/70">
              Images (up to {MAX_GALLERY_IMAGES})
            </label>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {galleryImages.map((slot, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-white/20 p-3"
                >
                  {slot.preview ? (
                    <img
                      src={slot.preview}
                      alt=""
                      className="h-20 w-20 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded border border-white/10 text-[10px] text-white/30">
                      Empty
                    </div>
                  )}
                  <label className="cursor-pointer text-center text-[11px] text-white/70 underline underline-offset-2 hover:text-white">
                    {slot.preview ? "Replace" : "Add"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleGalleryImageChange(index, e)}
                      className="hidden"
                    />
                  </label>
                  {slot.preview && (
                    <button
                      type="button"
                      onClick={() => clearGalleryImage(index)}
                      className="text-[11px] text-white/40 hover:text-white/70"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-white/70">Types</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addType();
                    }
                  }}
                  className={inputClasses}
                  placeholder="e.g. One-piece"
                />
                <button
                  type="button"
                  onClick={addType}
                  className="shrink-0 rounded-full border border-white/30 px-5 text-sm text-white transition-colors hover:border-white"
                >
                  Add
                </button>
              </div>
              {types.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {types.map((type, index) => (
                    <span
                      key={`${type}-${index}`}
                      className="flex items-center gap-2 border border-white/30 px-3 py-1 text-xs text-white/80"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => removeType(index)}
                        aria-label={`Remove ${type}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-white/70">Sizes</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSize();
                    }
                  }}
                  className={inputClasses}
                  placeholder="e.g. Standard height"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="shrink-0 rounded-full border border-white/30 px-5 text-sm text-white transition-colors hover:border-white"
                >
                  Add
                </button>
              </div>
              {sizes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((size, index) => (
                    <span
                      key={`${size}-${index}`}
                      className="flex items-center gap-2 border border-white/30 px-3 py-1 text-xs text-white/80"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeSize(index)}
                        aria-label={`Remove ${size}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <label className="mb-1 block text-sm text-white/70">Design File (PDF)</label>
            <div className="flex flex-wrap items-center gap-3">
              {designFileUrl && !designFile && (
                <a
                  href={designFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white underline underline-offset-2"
                >
                  Current file
                </a>
              )}
              {designFile && (
                <span className="text-sm text-white/70">{designFile.name}</span>
              )}
              <label className="cursor-pointer rounded-full border border-white/30 px-6 py-2 text-sm text-white transition-colors hover:border-white">
                {designFileUrl || designFile ? "Replace File" : "Choose File"}
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleDesignFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-white/30 px-10 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:border-white"
          >
            Cancel Edit
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-white px-10 py-3 text-sm font-medium uppercase tracking-wide text-black transition-colors hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default ProductManager;
