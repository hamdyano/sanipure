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
import ShopToiletsPage from "./pages/ShopToiletsPage";
import ShopWashbasinsPage from "./pages/ShopWashbasinsPage";
import ShopBathtubsPage from "./pages/ShopBathtubsPage";
import ProjectsPage from "./pages/ProjectsPage";

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
          path="/products/toilets/shop-toilets"
          element={
            <Layout>
              <ShopToiletsPage />
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
          path="/products/bathtubs/shop-bathtubs"
          element={
            <Layout>
              <ShopBathtubsPage />
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
