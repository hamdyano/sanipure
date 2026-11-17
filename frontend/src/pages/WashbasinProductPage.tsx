import ProductDetail from "../components/shared/ProductDetail";
import washbasinsApi from "../api/washbasinsApi";

const WashbasinProductPage = () => (
  <ProductDetail
    categoryId="washbasins"
    categoryLabel="Washbasins"
    api={washbasinsApi}
    shopPath="/products/washbasins/shop-washbasins"
    backPath="/products/washbasins/categories"
  />
);

export default WashbasinProductPage;
