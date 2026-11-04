import ProductDetail from "../components/shared/ProductDetail";
import accessoriesApi from "../api/accessoriesApi";

// Like Concealed Flush Tank, product pages live under the category page
// itself, so "Back" and the recommendations both resolve against it.
const AccessoriesProductPage = () => (
  <ProductDetail
    categoryId="accessories"
    categoryLabel="Accessories & Furniture"
    api={accessoriesApi}
    shopPath="/products/accessories/categories"
  />
);

export default AccessoriesProductPage;
