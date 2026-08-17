import express from "express";
import cors from "cors";
import path from "path";
import { washbasinsShop, type CatalogEntry } from "./washbasinsShop";
import { toiletsShop } from "./ToiletsShop";
import { bathtubsShop } from "./BathtubsShop";





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
  res.json({ category, ...catalog });
});

// SPA fallback: any non-API route should load the React app, which then
// handles routing (e.g. /products/washbasins) on the client via React Router.
app.get(/^\/(?!api\/).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});