import multer from "multer";
import type { Request, Response } from "express";
import { prisma } from "./prisma";
import type { AuthedRequest } from "./authMiddleware";
import { supabase, PRODUCT_IMAGES_BUCKET } from "./supabase";

// Files are held in memory (not written to local disk) so they can be
// streamed straight to Supabase Storage — Render's filesystem is ephemeral
// and wipes local uploads on every redeploy/restart.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Larger limit for the "For Display" product spec sheet upload — real
// design/spec PDFs (often with embedded diagrams or scans) run bigger than
// a single photo. Handled by uploadDesignFile below.
export const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// Raster formats only — an SVG (or HTML, etc.) can carry script, and the
// bucket serves files publicly with whatever content type was uploaded.
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const ALLOWED_DESIGN_FILE_TYPES = ["application/pdf"];

// Every URL a product stores (photo, gallery, colors, design file) must be a
// plain http(s) link — anything else (e.g. "javascript:") is dropped.
const httpUrl = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
};

// Keys the API itself sets on every product response ({ id, name, ...attributes }),
// so a submitted attribute must never be stored under one of them.
const RESERVED_ATTRIBUTE_KEYS = new Set(["id", "name", "display"]);

const parseAttributes = (rawAttributes: Record<string, unknown>) => {
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawAttributes)) {
    if (RESERVED_ATTRIBUTE_KEYS.has(key)) continue;
    if (typeof value === "string" && value.trim() !== "") {
      attributes[key] = value;
    }
  }
  if ("image" in attributes) {
    const image = httpUrl(attributes.image);
    if (image) attributes.image = image;
    else delete attributes.image;
  }
  return attributes;
};

// The "For Display" section's shape: full spec-sheet data shown on a
// product's public detail page, distinct from the top-level filter
// attributes above (which only ever hold single strings). Stored under
// attributes.display so it rides along in the same Json column.
export interface ProductDisplayColor {
  name: string;
  image?: string;
}

// The "For Required Items" section: companion items needed with the product,
// each with up to MAX_REQUIRED_ITEM_IMAGES photos of its own.
export interface ProductRequiredItem {
  name: string;
  productCode?: string;
  color?: string;
  quantity?: string;
  description?: string;
  images?: string[];
}

export interface ProductDisplay {
  productCode?: string;
  description?: string;
  colors?: ProductDisplayColor[];
  images?: string[];
  types?: string[];
  sizes?: string[];
  designFile?: string;
  requiredItems?: ProductRequiredItem[];
}

const MAX_REQUIRED_ITEMS = 10;
const MAX_REQUIRED_ITEM_IMAGES = 4;

const trimmedString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const sanitizeRequiredItems = (raw: unknown): ProductRequiredItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item) => {
      const images = Array.isArray(item.images)
        ? item.images
            .map(httpUrl)
            .filter((i): i is string => i !== undefined)
            .slice(0, MAX_REQUIRED_ITEM_IMAGES)
        : [];
      const fields = {
        productCode: trimmedString(item.productCode),
        color: trimmedString(item.color),
        quantity: trimmedString(item.quantity),
        description: trimmedString(item.description),
      };
      return {
        name: trimmedString(item.name) ?? "",
        ...Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined)),
        ...(images.length ? { images } : {}),
      } as ProductRequiredItem;
    })
    .filter((item) => item.name)
    .slice(0, MAX_REQUIRED_ITEMS);
};

const sanitizeDisplay = (raw: unknown): ProductDisplay | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const src = raw as Record<string, unknown>;
  const display: ProductDisplay = {};

  if (typeof src.productCode === "string" && src.productCode.trim()) {
    display.productCode = src.productCode.trim();
  }
  if (typeof src.description === "string" && src.description.trim()) {
    display.description = src.description.trim();
  }

  if (Array.isArray(src.colors)) {
    const colors = src.colors
      .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
      .map((c) => {
        const image = httpUrl(c.image);
        return {
          name: typeof c.name === "string" ? c.name.trim() : "",
          ...(image ? { image } : {}),
        };
      })
      .filter((c) => c.name || c.image);
    if (colors.length) display.colors = colors;
  }

  if (Array.isArray(src.images)) {
    const images = src.images
      .map(httpUrl)
      .filter((i): i is string => i !== undefined)
      .slice(0, 5);
    if (images.length) display.images = images;
  }

  if (Array.isArray(src.types)) {
    const types = src.types.filter((t): t is string => typeof t === "string" && t.trim() !== "");
    if (types.length) display.types = types;
  }

  if (Array.isArray(src.sizes)) {
    const sizes = src.sizes.filter((s): s is string => typeof s === "string" && s.trim() !== "");
    if (sizes.length) display.sizes = sizes;
  }

  const designFile = httpUrl(src.designFile);
  if (designFile) display.designFile = designFile;

  const requiredItems = sanitizeRequiredItems(src.requiredItems);
  if (requiredItems.length) display.requiredItems = requiredItems;

  return Object.keys(display).length ? display : undefined;
};

// Every uploaded file a product's attributes point at: its main photo plus,
// under "display", gallery photos, color photos, the design file and each
// required item's photos. Defensive about shape since older rows may differ.
const collectFileUrls = (attributes: unknown): Set<string> => {
  const urls = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && value) urls.add(value);
  };
  const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
  const field = (value: unknown, key: string): unknown =>
    value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;

  add(field(attributes, "image"));
  const display = field(attributes, "display");
  list(field(display, "images")).forEach(add);
  list(field(display, "colors")).forEach((color) => add(field(color, "image")));
  add(field(display, "designFile"));
  list(field(display, "requiredItems")).forEach((item) =>
    list(field(item, "images")).forEach(add)
  );
  return urls;
};

// Best-effort cleanup of previously-uploaded Supabase Storage objects once
// they're no longer referenced (replaced, removed, or the product deleted) —
// a leftover file isn't worth failing the request over, so errors here are
// only logged. URLs that aren't from our bucket are ignored.
const deleteStorageObjects = async (urls: Iterable<string>) => {
  const marker = `/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const objectPaths: string[] = [];
  for (const url of urls) {
    const index = url.indexOf(marker);
    if (index !== -1) objectPaths.push(url.slice(index + marker.length));
  }
  if (!objectPaths.length) return;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove(objectPaths);
  if (error) {
    console.error("Failed to delete old product files from storage:", error);
  }
};

// Uploads a single file to the product-images Supabase Storage bucket and
// returns its public URL. Used by the admin product form before
// create/update, decoupled from saving the product itself.
const makeUploadHandler =
  (allowedTypes: string[], wrongTypeMessage: string) =>
  async (req: AuthedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file was provided" });
        return;
      }
      if (!allowedTypes.includes(req.file.mimetype)) {
        res.status(400).json({ message: wrongTypeMessage });
        return;
      }

      // Only keep a plain extension like ".jpg" from the client's file name.
      const ext = /\.[a-z0-9]{1,8}$/i.exec(req.file.originalname)?.[0] ?? "";
      const objectPath = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      const { error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(objectPath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error("Supabase Storage upload failed:", error);
        res.status(500).json({ message: "Failed to upload file" });
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(objectPath);

      res.status(201).json({ url: publicUrl });
    } catch (err) {
      console.error("upload failed:", err);
      res.status(500).json({ message: "Something went wrong uploading the file" });
    }
  };

export const uploadImage = makeUploadHandler(
  ALLOWED_IMAGE_TYPES,
  "Please choose a JPG, PNG, WEBP, GIF or AVIF image."
);

export const uploadDesignFile = makeUploadHandler(
  ALLOWED_DESIGN_FILE_TYPES,
  "Please choose a PDF file."
);

// Creates a product under the given category (from the route param), taking
// whatever attribute fields were submitted (all optional — filter selects the
// admin left blank simply won't be present in req.body) plus an optional
// "image" field, which is a plain Supabase Storage public URL string already
// uploaded via uploadImage above. The category row is created on first use
// so this works without needing to pre-seed Category rows for every shop
// category. Requires auth (see requireAuth) so the product is tied to its
// creator.
export const createProduct = async (req: AuthedRequest, res: Response) => {
  try {
    const category = String(req.params.category);
    const { name, display: rawDisplay, ...rawAttributes } = req.body ?? {};

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ message: "Product name is required" });
      return;
    }

    const categoryRecord = await prisma.category.upsert({
      where: { slug: category },
      update: {},
      create: { slug: category, name: category },
    });

    const attributes: Record<string, unknown> = parseAttributes(rawAttributes);
    const display = sanitizeDisplay(rawDisplay);
    if (display) attributes.display = display;

    const product = await prisma.product.create({
      data: {
        categoryId: categoryRecord.id,
        name: name.trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attributes: attributes as any,
        createdById: req.userId,
      },
    });

    res.status(201).json({
      id: product.id,
      name: product.name,
      ...(product.attributes as Record<string, unknown>),
    });
  } catch (err) {
    console.error("createProduct failed:", err);
    res.status(500).json({ message: "Something went wrong saving the product" });
  }
};

// Updates a product, but only if the signed-in user is the one who created
// it. File URLs in the body are expected to be either the existing public
// URLs (unchanged) or new ones from uploadImage/uploadDesignFile; once the
// update is saved, any old Supabase Storage object no longer referenced is
// cleaned up.
export const updateProduct = async (req: AuthedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (existing.createdById !== req.userId) {
      res.status(403).json({ message: "You can only edit products you added" });
      return;
    }

    const { name, display: rawDisplay, ...rawAttributes } = req.body ?? {};
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ message: "Product name is required" });
      return;
    }

    const attributes: Record<string, unknown> = parseAttributes(rawAttributes);
    const display = sanitizeDisplay(rawDisplay);
    if (display) attributes.display = display;

    const updated = await prisma.product.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { name: name.trim(), attributes: attributes as any },
    });

    // Only after the save succeeds, so a failed update never leaves the
    // product pointing at files that were already deleted.
    const stillUsed = collectFileUrls(updated.attributes);
    await deleteStorageObjects(
      [...collectFileUrls(existing.attributes)].filter((url) => !stillUsed.has(url))
    );

    res.json({
      id: updated.id,
      name: updated.name,
      ...(updated.attributes as Record<string, unknown>),
    });
  } catch (err) {
    console.error("updateProduct failed:", err);
    res.status(500).json({ message: "Something went wrong updating the product" });
  }
};

// Deletes a product, but only if the signed-in user is the one who created
// it. Also removes all of its uploaded files from Supabase Storage.
export const deleteProduct = async (req: AuthedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (existing.createdById !== req.userId) {
      res.status(403).json({ message: "You can only delete products you added" });
      return;
    }

    await prisma.product.delete({ where: { id } });

    await deleteStorageObjects(collectFileUrls(existing.attributes));

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("deleteProduct failed:", err);
    res.status(500).json({ message: "Something went wrong deleting the product" });
  }
};

// The signed-in user's own products for a category — shown on the dashboard
// above the "Add" button, with edit/delete actions.
export const getMyProducts = async (req: AuthedRequest, res: Response) => {
  try {
    const category = String(req.params.category);
    const categoryRecord = await prisma.category.findUnique({
      where: { slug: category },
    });
    if (!categoryRecord) {
      res.json([]);
      return;
    }

    const rows = await prisma.product.findMany({
      where: { categoryId: categoryRecord.id, createdById: req.userId },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        ...(row.attributes as Record<string, unknown>),
      }))
    );
  } catch (err) {
    console.error("getMyProducts failed:", err);
    res.status(500).json({ message: "Something went wrong loading your products" });
  }
};

// A single product's full record — public, no auth — for the product detail
// page a shop grid card links to. Includes the "display" spec-sheet data
// (colors, gallery images, types, sizes, design file) alongside the filter
// attributes, since the detail page renders both.
export const getProductById = async (req: Request, res: Response) => {
  try {
    const category = String(req.params.category);
    const id = String(req.params.id);

    const categoryRecord = await prisma.category.findUnique({
      where: { slug: category },
    });
    if (!categoryRecord) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id, categoryId: categoryRecord.id },
    });
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({
      id: product.id,
      name: product.name,
      ...(product.attributes as Record<string, unknown>),
    });
  } catch (err) {
    console.error("getProductById failed:", err);
    res.status(500).json({ message: "Something went wrong loading the product" });
  }
};

// Products created through the admin form, shaped to match the stub
// products (id, name, ...attributes) so they can be appended to the
// in-memory catalog's product list with no frontend changes needed.
export const getDbProducts = async (categorySlug: string) => {
  const categoryRecord = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });
  if (!categoryRecord) return [];

  const rows = await prisma.product.findMany({
    where: { categoryId: categoryRecord.id },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    ...(row.attributes as Record<string, unknown>),
  }));
};
