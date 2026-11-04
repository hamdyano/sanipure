import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./layouts/Layout";
import ScrollToTop from "./components/shared/ScrollToTop";
import HomePage from "./pages/HomePage";
import WhoWeArePage from "./pages/WhoWeArePage";
import ProductsPage from "./pages/ProductsPage";
import ToiletsCategoriesPage from "./pages/ToiletsCategoriesPage";
import ShopToiletsPage from "./pages/ShopToiletsPage";
import ToiletProductPage from "./pages/ToiletProductPage";
import WashbasinsCategoriesPage from "./pages/WashbasinsCategoriesPage";
import ShopWashbasinsPage from "./pages/ShopWashbasinsPage";
import WashbasinProductPage from "./pages/WashbasinProductPage";
import BathtubsCategoriesPage from "./pages/BathtubsCategoriesPage";
import ShopBathtubsPage from "./pages/ShopBathtubsPage";
import BathtubProductPage from "./pages/BathtubProductPage";
import ConcealedFlushTankCategoriesPage from "./pages/ConcealedFlushTankCategoriesPage";
import ConcealedFlushTankProductPage from "./pages/ConcealedFlushTankProductPage";
import BathroomCollectionPage from "./pages/BathroomCollectionPage";
import PublicBathroomsCategoriesPage from "./pages/PublicBathroomsCategoriesPage";
import PublicBathroomsProductPage from "./pages/PublicBathroomsProductPage";
import AccessoriesCategoriesPage from "./pages/AccessoriesCategoriesPage";
import AccessoriesProductPage from "./pages/AccessoriesProductPage";
import ProjectsPage from "./pages/ProjectsPage";
import NewsPage from "./pages/NewsPage";
import NewsArticlePage from "./pages/NewsArticlePage";
import ResourcesPage from "./pages/ResourcesPage";
import FindUsPage from "./pages/FindUsPage";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />
        <Route
          path="/who-we-are"
          element={
            <Layout>
              <WhoWeArePage />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout>
              <ProductsPage />
            </Layout>
          }
        />
        <Route
          path="/products/:category"
          element={
            <Layout>
              <ProductsPage />
            </Layout>
          }
        />
        <Route
          path="/products/toilets/categories"
          element={
            <Layout>
              <ToiletsCategoriesPage />
            </Layout>
          }
        />
        <Route
          path="/products/toilets/shop-toilets"
          element={
            <Layout>
              <ShopToiletsPage />
            </Layout>
          }
        />
        <Route
          path="/products/toilets/shop-toilets/:id"
          element={
            <Layout>
              <ToiletProductPage />
            </Layout>
          }
        />
        <Route
          path="/products/washbasins/categories"
          element={
            <Layout>
              <WashbasinsCategoriesPage />
            </Layout>
          }
        />
        <Route
          path="/products/washbasins/shop-washbasins"
          element={
            <Layout>
              <ShopWashbasinsPage />
            </Layout>
          }
        />
        <Route
          path="/products/washbasins/shop-washbasins/:id"
          element={
            <Layout>
              <WashbasinProductPage />
            </Layout>
          }
        />
        <Route
          path="/products/bathtubs/categories"
          element={
            <Layout>
              <BathtubsCategoriesPage />
            </Layout>
          }
        />
        <Route
          path="/products/bathtubs/shop-bathtubs"
          element={
            <Layout>
              <ShopBathtubsPage />
            </Layout>
          }
        />
        <Route
          path="/products/bathtubs/shop-bathtubs/:id"
          element={
            <Layout>
              <BathtubProductPage />
            </Layout>
          }
        />
        <Route
          path="/products/concealed-flush-tank/categories"
          element={
            <Layout>
              <ConcealedFlushTankCategoriesPage />
            </Layout>
          }
        />
        <Route
          path="/products/concealed-flush-tank/categories/:id"
          element={
            <Layout>
              <ConcealedFlushTankProductPage />
            </Layout>
          }
        />
        <Route
          path="/products/bathroom-collection/categories"
          element={
            <Layout>
              <BathroomCollectionPage />
            </Layout>
          }
        />
        <Route
          path="/products/public-bathrooms/categories"
          element={
            <Layout>
              <PublicBathroomsCategoriesPage />
            </Layout>
          }
        />
        <Route
          path="/products/public-bathrooms/categories/:id"
          element={
            <Layout>
              <PublicBathroomsProductPage />
            </Layout>
          }
        />
        <Route
          path="/products/accessories/categories"
          element={
            <Layout>
              <AccessoriesCategoriesPage />
            </Layout>
          }
        />
        <Route
          path="/products/accessories/categories/:id"
          element={
            <Layout>
              <AccessoriesProductPage />
            </Layout>
          }
        />
        <Route
          path="/projects"
          element={
            <Layout>
              <ProjectsPage />
            </Layout>
          }
        />
        <Route
          path="/news"
          element={
            <Layout>
              <NewsPage />
            </Layout>
          }
        />
        <Route
          path="/news/:slug"
          element={
            <Layout>
              <NewsArticlePage />
            </Layout>
          }
        />
        <Route
          path="/resources"
          element={
            <Layout>
              <ResourcesPage />
            </Layout>
          }
        />
        {/* "/find-us" is kept so old links to the Contact Us page still work. */}
        {["/find-us", "/contact-us"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              <Layout>
                <FindUsPage />
              </Layout>
            }
          />
        ))}
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminPage />
            </Layout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
