import ProductDetail from "../components/shared/ProductDetail";
import publicBathroomsApi from "../api/publicBathroomsApi";

// Like Concealed Flush Tank, product pages live under the category page
// itself, so "Back" and the recommendations both resolve against it.
const PublicBathroomsProductPage = () => (
  <ProductDetail
    categoryId="public-bathrooms"
    categoryLabel="Public Bathrooms"
    api={publicBathroomsApi}
    shopPath="/products/public-bathrooms/categories"
  />
);

export default PublicBathroomsProductPage;
