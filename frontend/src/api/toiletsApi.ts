import apiClient, { type CatalogResponse, type Product } from "./clientApi";

const CATEGORY = "toilets";

// Read (all) — GET /api/products?category=toilets
// Public, no auth required — this is what ShopToiletsPage uses.
export const getToilets = async (): Promise<CatalogResponse> => {
  const { data } = await apiClient.get<CatalogResponse>("/products", {
    params: { category: CATEGORY },
  });
  return data;
};

// Read (mine) — GET /api/products/toilets/mine
// Auth required. The signed-in user's own toilets, for the dashboard
// list (with edit/delete actions) above the "Add Toilets" button.
export const getMyToilets = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>(`/products/${CATEGORY}/mine`);
  return data;
};

// Create — POST /api/products/toilets
// Auth required. Takes a FormData (name, any selected filter attributes,
// and an optional "image" file) so the admin "Add Toilets" form can
// upload a photo alongside the product's attributes in one request.
export const createToilet = async (formData: FormData): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    formData,
  );
  return data;
};

// Update — PUT /api/products/toilets/:id
// Auth required, and only the product's creator may update it. Same
// FormData shape as create; omitting "image" keeps the existing photo.
export const updateToilet = async (
  id: string,
  formData: FormData,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    formData,
  );
  return data;
};

// Delete — DELETE /api/products/toilets/:id
// Auth required, and only the product's creator may delete it.
export const deleteToilet = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${CATEGORY}/${id}`);
};

const toiletsApi = {
  getAll: getToilets,
  getMine: getMyToilets,
  create: createToilet,
  update: updateToilet,
  remove: deleteToilet,
};

export default toiletsApi;
