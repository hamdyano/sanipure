import apiClient, {
  type CatalogResponse,
  type Product,
  type ProductInput,
} from "./clientApi";

const CATEGORY = "toilets";

// Read (all) — GET /api/products?category=toilets
// Live today: this is the only endpoint the backend actually implements.
export const getToilets = async (): Promise<CatalogResponse> => {
  const { data } = await apiClient.get<CatalogResponse>("/products", {
    params: { category: CATEGORY },
  });
  return data;
};

// Read (one) — GET /api/products/toilets/:id
// Not implemented on the backend yet.
export const getToiletById = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get<Product>(`/products/${CATEGORY}/${id}`);
  return data;
};

// Create — POST /api/products/toilets
// Not implemented on the backend yet.
export const createToilet = async (product: ProductInput): Promise<Product> => {
  const { data } = await apiClient.post<Product>(
    `/products/${CATEGORY}`,
    product,
  );
  return data;
};

// Update — PUT /api/products/toilets/:id
// Not implemented on the backend yet.
export const updateToilet = async (
  id: string,
  product: Partial<ProductInput>,
): Promise<Product> => {
  const { data } = await apiClient.put<Product>(
    `/products/${CATEGORY}/${id}`,
    product,
  );
  return data;
};

// Delete — DELETE /api/products/toilets/:id
// Not implemented on the backend yet.
export const deleteToilet = async (id: string): Promise<Product> => {
  const { data } = await apiClient.delete<Product>(
    `/products/${CATEGORY}/${id}`,
  );
  return data;
};

const toiletsApi = {
  getAll: getToilets,
  getById: getToiletById,
  create: createToilet,
  update: updateToilet,
  remove: deleteToilet,
};

export default toiletsApi;
