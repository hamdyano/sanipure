import apiClient, {
  getCatalog,
  getProduct,
  type CatalogResponse,
  type ManagedProduct,
  type Product,
  type ProductInput,
} from "./clientApi";

const CATEGORY = "concealed-flush-tank";

// Read (all) — GET /api/products?category=concealed-flush-tank
// Public, no auth required.
export const getConcealedFlushTanks = async (): Promise<CatalogResponse> => getCatalog(CATEGORY);

// Read (one) — GET /api/products/concealed-flush-tank/:id
// Public, no auth required — powers the concealed flush tank product page.
export const getConcealedFlushTankById = async (id: string): Promise<Product> =>
  getProduct(CATEGORY, id);

// Read (mine) — GET /api/products/concealed-flush-tank/mine
// Auth required. The signed-in user's own concealed flush tanks, for the
// dashboard list (with edit/delete actions).
export const getMyConcealedFlushTanks = async (): Promise<ManagedProduct[]> => {
  const { data } = await apiClient.get<ManagedProduct[]>(`/products/${CATEGORY}/mine`);
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
// Data entry or admin only; any of them may update any product.
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
// Data entry or admin only; any of them may delete any product.
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
