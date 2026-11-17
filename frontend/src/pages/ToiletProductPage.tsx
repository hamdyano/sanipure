import ProductDetail from "../components/shared/ProductDetail";
import toiletsApi from "../api/toiletsApi";

const ToiletProductPage = () => (
  <ProductDetail
    categoryId="toilets"
    categoryLabel="Toilets"
    api={toiletsApi}
    shopPath="/products/toilets/shop-toilets"
    backPath="/products/toilets/categories"
  />
);

export default ToiletProductPage;
