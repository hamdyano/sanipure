import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { washbasinsShop, type CatalogEntry } from "./washbasinsShop";
import { toiletsShop } from "./ToiletsShop";
import { bathtubsShop } from "./BathtubsShop";
import { signIn, signUp } from "./auth";
import { requireAuth } from "./authMiddleware";
import {
  createProduct,
  deleteProduct,
  getDbProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  uploadImage,
  upload,
  uploadFile,
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
  "/api/products/upload-image",
  requireAuth,
  upload.single("image"),
  uploadImage
);
app.post(
  "/api/products/upload-file",
  requireAuth,
  uploadFile.single("file"),
  uploadImage
);
app.post("/api/products/:category", requireAuth, createProduct);
app.get("/api/products/:category/:id", getProductById);
app.put("/api/products/:category/:id", requireAuth, updateProduct);
app.delete("/api/products/:category/:id", requireAuth, deleteProduct);

app.post("/api/auth/signup", signUp);
app.post("/api/auth/signin", signIn);

// SPA fallback: any non-API route should load the React app, which then
// handles routing (e.g. /products/washbasins) on the client via React Router.
app.get(/^\/(?!api\/).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

// Without this, an error thrown/passed to next() before reaching a route's
// own try/catch (e.g. Multer rejecting an oversized upload) falls through to
// Express's default handler, which renders an HTML error page. The frontend
// only ever expects JSON (it reads err.response.data.message), so that HTML
// page was silently swallowed into a generic "Something went wrong" toast —
// this turns it back into a real, specific message.
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ message: "That file is too large. Please choose a smaller one." });
    return;
  }
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: "Something went wrong uploading that file." });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});