import ProductDetail from "../components/shared/ProductDetail";
import concealedFlushTankApi from "../api/concealedFlushTankApi";

// Product pages live under the category page itself (there's no separate
// shop list page for this category), so "Back" and the recommendations
// both resolve against it.
const ConcealedFlushTankProductPage = () => (
  <ProductDetail
    categoryId="concealed-flush-tank"
    categoryLabel="Concealed Flush Tank"
    api={concealedFlushTankApi}
    shopPath="/products/concealed-flush-tank/categories"
  />
);

export default ConcealedFlushTankProductPage;
