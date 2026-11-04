import apiClient, {
  getProduct,
  type CatalogResponse,
  type Product,
  type ProductInput,
} from "./clientApi";

const CATEGORY = "concealed-flush-tank";

// Read (all) — GET /api/products?category=concealed-flush-tank
// Public, no auth required.
export const getConcealedFlushTanks = async (): Promise<CatalogResponse> => {
  const { data } = await apiClient.get<CatalogResponse>("/products", {
    params: { category: CATEGORY },
  });
  return data;
};

// Read (one) — GET /api/products/concealed-flush-tank/:id
// Public, no auth required — powers the concealed flush tank product page.
export const getConcealedFlushTankById = async (id: string): Promise<Product> =>
  getProduct(CATEGORY, id);

// Read (mine) — GET /api/products/concealed-flush-tank/mine
// Auth required. The signed-in user's own concealed flush tanks, for the
// dashboard list (with edit/delete actions).
export const getMyConcealedFlushTanks = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>(`/products/${CATEGORY}/mine`);
  return data;
};

// Create — POST /api/products/concealed-flush-tank
// Auth required. Same JSON payload as the other categories (name, any
// selected filter attributes, and an optional uploaded "image" URL).
export const createConcealedFlushTank = async (payload: ProductInput): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    payload,
  );
  return data;
};

// Update — PUT /api/products/concealed-flush-tank/:id
// Auth required, and only the product's creator may update it.
export const updateConcealedFlushTank = async (
  id: string,
  payload: ProductInput,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    payload,
  );
  return data;
};

// Delete — DELETE /api/products/concealed-flush-tank/:id
// Auth required, and only the product's creator may delete it.
export const deleteConcealedFlushTank = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${CATEGORY}/${id}`);
};

const concealedFlushTankApi = {
  getAll: getConcealedFlushTanks,
  getById: getConcealedFlushTankById,
  getMine: getMyConcealedFlushTanks,
  create: createConcealedFlushTank,
  update: updateConcealedFlushTank,
  remove: deleteConcealedFlushTank,
};

export default concealedFlushTankApi;
