import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Layout from "./layouts/Layout";
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
import ProjectsPage from "./pages/ProjectsPage";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";

const App = () => {

  return (
    <Router>
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
          path="/projects"
          element={
            <Layout>
              <ProjectsPage />
            </Layout>
          }
        />
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
