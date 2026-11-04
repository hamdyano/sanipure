import apiClient, {
  getProduct,
  type CatalogResponse,
  type Product,
  type ProductInput,
} from "./clientApi";

const CATEGORY = "accessories";

// Read (all) — GET /api/products?category=accessories
// Public, no auth required.
export const getAccessories = async (): Promise<CatalogResponse> => {
  const { data } = await apiClient.get<CatalogResponse>("/products", {
    params: { category: CATEGORY },
  });
  return data;
};

// Read (one) — GET /api/products/accessories/:id
// Public, no auth required — powers the accessories & furniture product page.
export const getAccessoryById = async (id: string): Promise<Product> =>
  getProduct(CATEGORY, id);

// Read (mine) — GET /api/products/accessories/mine
// Auth required. The signed-in user's own accessories & furniture, for the
// dashboard list (with edit/delete actions).
export const getMyAccessories = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>(`/products/${CATEGORY}/mine`);
  return data;
};

// Create — POST /api/products/accessories
// Auth required. Same JSON payload as the other categories (name, any
// selected filter attributes, and an optional uploaded "image" URL).
export const createAccessory = async (payload: ProductInput): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    payload,
  );
  return data;
};

// Update — PUT /api/products/accessories/:id
// Auth required, and only the product's creator may update it.
export const updateAccessory = async (
  id: string,
  payload: ProductInput,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    payload,
  );
  return data;
};

// Delete — DELETE /api/products/accessories/:id
// Auth required, and only the product's creator may delete it.
export const deleteAccessory = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${CATEGORY}/${id}`);
};

const accessoriesApi = {
  getAll: getAccessories,
  getById: getAccessoryById,
  getMine: getMyAccessories,
  create: createAccessory,
  update: updateAccessory,
  remove: deleteAccessory,
};

export default accessoriesApi;
