import { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import type { CatalogResponse, Product } from "../../api/clientApi";
import {
  showErrorToast,
  showSuccessToast,
  showUnexpectedErrorToast,
} from "../../lib/toast";

interface Filter {
  id: string;
  label: string;
  options: string[];
}

export interface ProductManagerApi {
  getAll: () => Promise<CatalogResponse>;
  getMine: () => Promise<Product[]>;
  create: (formData: FormData) => Promise<Product>;
  update: (id: string, formData: FormData) => Promise<Product>;
  remove: (id: string) => Promise<void>;
}

interface ProductManagerProps {
  categoryLabel: string;
  api: ProductManagerApi;
  onClose: () => void;
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

const ProductManager = ({ categoryLabel, api, onClose }: ProductManagerProps) => {
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
  };

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
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showErrorToast("Enter a product name.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    Object.entries(selected).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.update(editingId, formData);
        showSuccessToast(`${categoryLabel.slice(0, -1)} updated successfully`);
      } else {
        await api.create(formData);
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
        <div className="mb-10 flex flex-col gap-4">
          {myProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-black p-4"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-white/5">
                {typeof product.image === "string" && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-white">{product.name}</p>
                <p className="truncate text-sm text-white/50">
                  {describeProduct(product, filters) || "No attributes set"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditForm(product)}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-medium uppercase tracking-wide text-white transition-colors hover:border-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  disabled={deletingId === product.id}
                  className="rounded-full border border-red-500/40 px-4 py-2 text-xs font-medium uppercase tracking-wide text-red-300 transition-colors hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === product.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className="mb-4 text-lg font-semibold text-white">
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
