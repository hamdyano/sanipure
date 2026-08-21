import apiClient, {
  type CatalogResponse,
  type Product,
  type ProductInput,
} from "./clientApi";

const CATEGORY = "bathtubs";

// Read (all) — GET /api/products?category=bathtubs
// Live today: this is the only endpoint the backend actually implements.
export const getBathtubs = async (): Promise<CatalogResponse> => {
  const { data } = await apiClient.get<CatalogResponse>("/products", {
    params: { category: CATEGORY },
  });
  return data;
};

// Read (one) — GET /api/products/bathtubs/:id
// Not implemented on the backend yet.
export const getBathtubById = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get<Product>(`/products/${CATEGORY}/${id}`);
  return data;
};

// Create — POST /api/products/bathtubs
// Not implemented on the backend yet.
export const createBathtub = async (
  product: ProductInput,
): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    product,
  );
  return data;
};

// Update — PUT /api/products/bathtubs/:id
// Not implemented on the backend yet.
export const updateBathtub = async (
  id: string,
  product: Partial<ProductInput>,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    product,
  );
  return data;
};

// Delete — DELETE /api/products/bathtubs/:id
// Not implemented on the backend yet.
export const deleteBathtub = async (id: string): Promise<Product> => {
  const { data } = await apiClient.delete<Product>(
    `/products/${CATEGORY}/${id}`,
  );
  return data;
};

const bathtubsApi = {
  getAll: getBathtubs,
  getById: getBathtubById,
  create: createBathtub,
  update: updateBathtub,
  remove: deleteBathtub,
};

export default bathtubsApi;
