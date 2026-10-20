import ProductDetail from "../components/shared/ProductDetail";
import bathtubsApi from "../api/bathtubsApi";

const BathtubProductPage = () => (
  <ProductDetail
    categoryId="bathtubs"
    categoryLabel="Bathtubs"
    api={bathtubsApi}
    shopPath="/products/bathtubs/shop-bathtubs"
  />
);

export default BathtubProductPage;
