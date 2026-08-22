import apiClient, { type CatalogResponse, type Product } from "./clientApi";

const CATEGORY = "washbasins";

// Read (all) — GET /api/products?category=washbasins
// Public, no auth required — this is what ShopWashbasinsPage uses.
export const getWashbasins = async (): Promise<CatalogResponse> => {
  const { data } = await apiClient.get<CatalogResponse>("/products", {
    params: { category: CATEGORY },
  });
  return data;
};

// Read (mine) — GET /api/products/washbasins/mine
// Auth required. The signed-in user's own washbasins, for the dashboard
// list (with edit/delete actions) above the "Add Washbasins" button.
export const getMyWashbasins = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>(`/products/${CATEGORY}/mine`);
  return data;
};

// Create — POST /api/products/washbasins
// Auth required. Takes a FormData (name, any selected filter attributes,
// and an optional "image" file) so the admin "Add Washbasins" form can
// upload a photo alongside the product's attributes in one request.
export const createWashbasin = async (formData: FormData): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    formData,
  );
  return data;
};

// Update — PUT /api/products/washbasins/:id
// Auth required, and only the product's creator may update it. Same
// FormData shape as create; omitting "image" keeps the existing photo.
export const updateWashbasin = async (
  id: string,
  formData: FormData,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    formData,
  );
  return data;
};

// Delete — DELETE /api/products/washbasins/:id
// Auth required, and only the product's creator may delete it.
export const deleteWashbasin = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${CATEGORY}/${id}`);
};

const washbasinsApi = {
  getAll: getWashbasins,
  getMine: getMyWashbasins,
  create: createWashbasin,
  update: updateWashbasin,
  remove: deleteWashbasin,
};

export default washbasinsApi;
