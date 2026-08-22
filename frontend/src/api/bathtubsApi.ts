import apiClient, {
  type CatalogResponse,
  type Product,
  type ProductInput,
} from "./clientApi";

const CATEGORY = "bathtubs";

// Read (all) — GET /api/products?category=bathtubs
// Public, no auth required — this is what ShopBathtubsPage uses.
export const getBathtubs = async (): Promise<CatalogResponse> => {
  const { data } = await apiClient.get<CatalogResponse>("/products", {
    params: { category: CATEGORY },
  });
  return data;
};

// Read (mine) — GET /api/products/bathtubs/mine
// Auth required. The signed-in user's own bathtubs, for the dashboard
// list (with edit/delete actions) above the "Add Bathtubs" button.
export const getMyBathtubs = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>(`/products/${CATEGORY}/mine`);
  return data;
};

// Create — POST /api/products/bathtubs
// Auth required. Takes a plain JSON payload (name, any selected filter
// attributes, and an optional "image" URL already uploaded via
// uploadProductImage) for the admin "Add Bathtubs" form.
export const createBathtub = async (payload: ProductInput): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    payload,
  );
  return data;
};

// Update — PUT /api/products/bathtubs/:id
// Auth required, and only the product's creator may update it. Same JSON
// shape as create; omitting "image" keeps the existing photo.
export const updateBathtub = async (
  id: string,
  payload: ProductInput,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    payload,
  );
  return data;
};

// Delete — DELETE /api/products/bathtubs/:id
// Auth required, and only the product's creator may delete it.
export const deleteBathtub = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${CATEGORY}/${id}`);
};

const bathtubsApi = {
  getAll: getBathtubs,
  getMine: getMyBathtubs,
  create: createBathtub,
  update: updateBathtub,
  remove: deleteBathtub,
};

export default bathtubsApi;
