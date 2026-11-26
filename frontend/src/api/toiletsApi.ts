import apiClient, {
  getCatalog,
  getProduct,
  type CatalogResponse,
  type ManagedProduct,
  type Product,
  type ProductInput,
} from "./clientApi";

const CATEGORY = "toilets";

// Read (all) — GET /api/products?category=toilets
// Public, no auth required — this is what ShopToiletsPage uses.
export const getToilets = async (): Promise<CatalogResponse> => getCatalog(CATEGORY);

// Read (one) — GET /api/products/toilets/:id
// Public, no auth required — powers the toilet product detail page.
export const getToiletById = async (id: string): Promise<Product> =>
  getProduct(CATEGORY, id);

// Read (mine) — GET /api/products/toilets/mine
// Auth required. The signed-in user's own toilets, for the dashboard
// list (with edit/delete actions) above the "Add Toilets" button.
export const getMyToilets = async (): Promise<ManagedProduct[]> => {
  const { data } = await apiClient.get<ManagedProduct[]>(`/products/${CATEGORY}/mine`);
  return data;
};

// Create — POST /api/products/toilets
// Auth required. Takes a plain JSON payload (name, any selected filter
// attributes, and an optional "image" URL already uploaded via
// uploadProductImage) for the admin "Add Toilets" form.
export const createToilet = async (payload: ProductInput): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    payload,
  );
  return data;
};

// Update — PUT /api/products/toilets/:id
// Data entry or admin only; any of them may update any product. Same JSON
// shape as create; omitting "image" keeps the existing photo.
export const updateToilet = async (
  id: string,
  payload: ProductInput,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    payload,
  );
  return data;
};

// Delete — DELETE /api/products/toilets/:id
// Data entry or admin only; any of them may delete any product.
export const deleteToilet = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${CATEGORY}/${id}`);
};

const toiletsApi = {
  getAll: getToilets,
  getById: getToiletById,
  getMine: getMyToilets,
  create: createToilet,
  update: updateToilet,
  remove: deleteToilet,
};

export default toiletsApi;
