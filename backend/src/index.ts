import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { washbasinsShop, type CatalogEntry } from "./washbasinsShop";
import { toiletsShop } from "./ToiletsShop";
import { bathtubsShop } from "./BathtubsShop";
import { signIn, signUp } from "./auth";
import { requireAuth } from "./authMiddleware";
import {
  UPLOADS_DIR,
  createProduct,
  deleteProduct,
  getDbProducts,
  getMyProducts,
  updateProduct,
  upload,
} from "./products";





const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
      origin: "http://localhost:5173", // Frontend origin
      credentials: true, // Allow credentials (cookies) to be sent
    })
  );

  

app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.use("/uploads", express.static(UPLOADS_DIR));


app.get("/api/test", async (req, res) => {
  res.json({ message: "Test successful!" });
});

// Stub product catalog, keyed by category slug. Replace with real
// DB-backed data once the product schema/API is built.
const productCatalog: Record<string, CatalogEntry> = {
  bathtubs: bathtubsShop,
  washbasins: washbasinsShop,
  toilets: toiletsShop,
};

app.get("/api/products", async (req, res) => {
  const category = String(req.query.category || "");
  const catalog = productCatalog[category];
  if (!catalog) {
    res.status(404).json({ message: `No catalog for category "${category}"` });
    return;
  }

  const dbProducts = await getDbProducts(category);
  res.json({
    category,
    filters: catalog.filters,
    products: [...catalog.products, ...dbProducts],
  });
});

app.get("/api/products/:category/mine", requireAuth, getMyProducts);
app.post(
  "/api/products/:category",
  requireAuth,
  upload.single("image"),
  createProduct
);
app.put(
  "/api/products/:category/:id",
  requireAuth,
  upload.single("image"),
  updateProduct
);
app.delete("/api/products/:category/:id", requireAuth, deleteProduct);

app.post("/api/auth/signup", signUp);
app.post("/api/auth/signin", signIn);

// SPA fallback: any non-API route should load the React app, which then
// handles routing (e.g. /products/washbasins) on the client via React Router.
app.get(/^\/(?!api\/).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});