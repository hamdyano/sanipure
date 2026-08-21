import apiClient, {
  type CatalogResponse,
  type Product,
  type ProductInput,
} from "./clientApi";

const CATEGORY = "washbasins";

// Read (all) — GET /api/products?category=washbasins
// Live today: this is the only endpoint the backend actually implements.
export const getWashbasins = async (): Promise<CatalogResponse> => {
  const { data } = await apiClient.get<CatalogResponse>("/products", {
    params: { category: CATEGORY },
  });
  return data;
};

// Read (one) — GET /api/products/washbasins/:id
// Not implemented on the backend yet.
export const getWashbasinById = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get<Product>(`/products/${CATEGORY}/${id}`);
  return data;
};

// Create — POST /api/products/washbasins
// Not implemented on the backend yet.
export const createWashbasin = async (
  product: ProductInput,
): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    product,
  );
  return data;
};

// Update — PUT /api/products/washbasins/:id
// Not implemented on the backend yet.
export const updateWashbasin = async (
  id: string,
  product: Partial<ProductInput>,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    product,
  );
  return data;
};

// Delete — DELETE /api/products/washbasins/:id
// Not implemented on the backend yet.
export const deleteWashbasin = async (id: string): Promise<Product> => {
  const { data } = await apiClient.delete<Product>(
    `/products/${CATEGORY}/${id}`,
  );
  return data;
};

const washbasinsApi = {
  getAll: getWashbasins,
  getById: getWashbasinById,
  create: createWashbasin,
  update: updateWashbasin,
  remove: deleteWashbasin,
};

export default washbasinsApi;
