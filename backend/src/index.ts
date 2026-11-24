import "dotenv/config";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { washbasinsShop, type CatalogEntry } from "./washbasinsShop";
import { toiletsShop } from "./ToiletsShop";
import { bathtubsShop } from "./BathtubsShop";
import { concealedFlushTankShop } from "./ConcealedFlushTankShop";
import { publicBathroomsShop } from "./PublicBathroomsShop";
import { accessoriesShop } from "./AccessoriesShop";
import { resetPassword, signIn, signUp } from "./auth";
import { requireAuth } from "./authMiddleware";
import { getProfile, updateProfile } from "./profile";
import { addToWishlist, getWishlist, removeFromWishlist } from "./wishlist";
import { getLeads } from "./leads";
import {
  createProduct,
  deleteProduct,
  getDbProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  uploadDesignFile,
  uploadImage,
  upload,
  uploadFile,
} from "./products";
import { UPLOADS_DIR } from "./storage";





const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
      origin: "http://localhost:5173", // Frontend origin
      credentials: true, // Allow credentials (cookies) to be sent
    })
  );

  

const FRONTEND_DIST = path.join(__dirname, "../../frontend/dist");

// The built site's JS, CSS, photos and videos. Vite puts a hash of the
// content in every file name here, so a changed file always has a new name
// and browsers can keep these for a year without asking again. (Asking again
// didn't work anyway: Apache adds "-gzip" to the ETag of files it compresses,
// so the check never matched and the whole file was downloaded each visit.)
app.use(
  "/assets",
  express.static(path.join(FRONTEND_DIST, "assets"), { maxAge: "1y", immutable: true })
);
// A missing file is a plain 404, not the React app's index.html.
app.use("/assets", (req, res) => {
  res.status(404).end();
});

// Everything else keeps its name between deploys. index.html is checked on
// every visit, since it's what points to the current JS and CSS files.
app.use(
  express.static(FRONTEND_DIST, {
    maxAge: "1d",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
    },
  })
);

// Uploaded product photos, PDFs and profile photos (see storage.ts). File
// names are unique and never reused, so browsers may cache them for long.
// nosniff stops a browser from treating a file as anything other than its
// declared type.
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    maxAge: "30d",
    immutable: true,
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
  })
);
// A missing upload is a plain 404, not the React app's index.html.
app.use("/uploads", (req, res) => {
  res.status(404).end();
});


// API replies can hold personal data (profile, wishlist, leads), so nothing
// may store them unless a route below says otherwise.
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// For the public catalog: browsers keep a copy but check it's still current,
// which costs a tiny "304 Not Modified" instead of the full reply.
const checkBeforeReuse = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "no-cache");
  next();
};

app.get("/api/test", async (req, res) => {
  res.json({ message: "Test successful!" });
});

// Stub product catalog, keyed by category slug. Replace with real
// DB-backed data once the product schema/API is built.
const productCatalog: Record<string, CatalogEntry> = {
  bathtubs: bathtubsShop,
  washbasins: washbasinsShop,
  toilets: toiletsShop,
  "concealed-flush-tank": concealedFlushTankShop,
  "public-bathrooms": publicBathroomsShop,
  accessories: accessoriesShop,
};

// Own keys only, so a slug like "constructor" or "__proto__" doesn't resolve
// to something inherited from Object.prototype.
const getCatalog = (category: string): CatalogEntry | undefined =>
  Object.prototype.hasOwnProperty.call(productCatalog, category)
    ? productCatalog[category]
    : undefined;

// Products can only be read from or added to one of the shop categories above
// — otherwise createProduct would create a Category row, and getDbProducts a
// cache entry, for any slug sent.
const requireKnownCategory = (req: Request, res: Response, next: NextFunction) => {
  if (!getCatalog(String(req.params.category))) {
    res.status(404).json({ message: `Unknown category "${req.params.category}"` });
    return;
  }
  next();
};

app.get("/api/products", checkBeforeReuse, async (req, res) => {
  const category = String(req.query.category || "");
  const catalog = getCatalog(category);
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
  uploadDesignFile
);
app.post("/api/products/:category", requireAuth, requireKnownCategory, createProduct);
app.get("/api/products/:category/:id", requireKnownCategory, checkBeforeReuse, getProductById);
app.put("/api/products/:category/:id", requireAuth, updateProduct);
app.delete("/api/products/:category/:id", requireAuth, deleteProduct);

app.post("/api/auth/signup", signUp);
app.post("/api/auth/signin", signIn);
app.post("/api/auth/reset-password", resetPassword);

app.get("/api/profile", requireAuth, getProfile);
app.put("/api/profile", requireAuth, updateProfile);

app.get("/api/wishlist", requireAuth, getWishlist);
app.post("/api/wishlist/:productId", requireAuth, addToWishlist);
app.delete("/api/wishlist/:productId", requireAuth, removeFromWishlist);

app.get("/api/leads", requireAuth, getLeads);

// SPA fallback: any non-API route should load the React app, which then
// handles routing (e.g. /products/washbasins) on the client via React Router.
app.get(/^\/(?!api\/).*$/, (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, "index.html"), {
    headers: { "Cache-Control": "no-cache" },
  });
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