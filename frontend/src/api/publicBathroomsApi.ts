import apiClient, {
  getProduct,
  type CatalogResponse,
  type Product,
  type ProductInput,
} from "./clientApi";

const CATEGORY = "public-bathrooms";

// Read (all) — GET /api/products?category=public-bathrooms
// Public, no auth required.
export const getPublicBathrooms = async (): Promise<CatalogResponse> => {
  const { data } = await apiClient.get<CatalogResponse>("/products", {
    params: { category: CATEGORY },
  });
  return data;
};

// Read (one) — GET /api/products/public-bathrooms/:id
// Public, no auth required — powers the public bathrooms product page.
export const getPublicBathroomById = async (id: string): Promise<Product> =>
  getProduct(CATEGORY, id);

// Read (mine) — GET /api/products/public-bathrooms/mine
// Auth required. The signed-in user's own public bathroom products, for the
// dashboard list (with edit/delete actions).
export const getMyPublicBathrooms = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>(`/products/${CATEGORY}/mine`);
  return data;
};

// Create — POST /api/products/public-bathrooms
// Auth required. Same JSON payload as the other categories (name, any
// selected filter attributes, and an optional uploaded "image" URL).
export const createPublicBathroom = async (payload: ProductInput): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    payload,
  );
  return data;
};

// Update — PUT /api/products/public-bathrooms/:id
// Auth required, and only the product's creator may update it.
export const updatePublicBathroom = async (
  id: string,
  payload: ProductInput,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    payload,
  );
  return data;
};

// Delete — DELETE /api/products/public-bathrooms/:id
// Auth required, and only the product's creator may delete it.
export const deletePublicBathroom = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${CATEGORY}/${id}`);
};

const publicBathroomsApi = {
  getAll: getPublicBathrooms,
  getById: getPublicBathroomById,
  getMine: getMyPublicBathrooms,
  create: createPublicBathroom,
  update: updatePublicBathroom,
  remove: deletePublicBathroom,
};

export default publicBathroomsApi;
