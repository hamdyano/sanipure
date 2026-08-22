import multer from "multer";
import type { Response } from "express";
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

const parseAttributes = (rawAttributes: Record<string, unknown>) => {
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawAttributes)) {
    if (typeof value === "string" && value.trim() !== "") {
      attributes[key] = value;
    }
  }
  return attributes;
};

// Best-effort cleanup of a previously-uploaded Supabase Storage object when
// it's replaced or the product is deleted — a leftover file isn't worth
// failing the request over, so errors here are only logged.
const deleteStorageObject = async (imageUrl: string) => {
  const marker = `/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return;

  const objectPath = imageUrl.slice(index + marker.length);
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([objectPath]);
  if (error) {
    console.error("Failed to delete old product image from storage:", error);
  }
};

// Uploads a single image file to the product-images Supabase Storage bucket
// and returns its public URL. Used by the admin product form before
// create/update, decoupled from saving the product itself.
export const uploadImage = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file was provided" });
      return;
    }

    const ext = req.file.originalname.includes(".")
      ? req.file.originalname.slice(req.file.originalname.lastIndexOf("."))
      : "";
    const objectPath = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(objectPath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (error) {
      console.error("Supabase Storage upload failed:", error);
      res.status(500).json({ message: "Failed to upload image" });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(objectPath);

    res.status(201).json({ url: publicUrl });
  } catch (err) {
    console.error("uploadImage failed:", err);
    res.status(500).json({ message: "Something went wrong uploading the image" });
  }
};

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
    const { name, ...rawAttributes } = req.body ?? {};

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ message: "Product name is required" });
      return;
    }

    const categoryRecord = await prisma.category.upsert({
      where: { slug: category },
      update: {},
      create: { slug: category, name: category },
    });

    const attributes = parseAttributes(rawAttributes);

    const product = await prisma.product.create({
      data: {
        categoryId: categoryRecord.id,
        name: name.trim(),
        attributes,
        createdById: req.userId,
      },
    });

    res.status(201).json({
      id: product.id,
      name: product.name,
      ...(product.attributes as Record<string, string>),
    });
  } catch (err) {
    console.error("createProduct failed:", err);
    res.status(500).json({ message: "Something went wrong saving the product" });
  }
};

// Updates a product, but only if the signed-in user is the one who created
// it. "image" in the body is expected to be either the existing public URL
// (unchanged) or a new one from uploadImage; if it changed, the old Supabase
// Storage object is cleaned up.
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

    const { name, ...rawAttributes } = req.body ?? {};
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ message: "Product name is required" });
      return;
    }

    const attributes = parseAttributes(rawAttributes);
    const existingAttributes = existing.attributes as Record<string, string>;

    if (
      existingAttributes.image &&
      attributes.image &&
      attributes.image !== existingAttributes.image
    ) {
      await deleteStorageObject(existingAttributes.image);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { name: name.trim(), attributes },
    });

    res.json({
      id: updated.id,
      name: updated.name,
      ...(updated.attributes as Record<string, string>),
    });
  } catch (err) {
    console.error("updateProduct failed:", err);
    res.status(500).json({ message: "Something went wrong updating the product" });
  }
};

// Deletes a product, but only if the signed-in user is the one who created
// it. Also removes its uploaded image from Supabase Storage, if any.
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

    const existingAttributes = existing.attributes as Record<string, string>;
    if (existingAttributes.image) {
      await deleteStorageObject(existingAttributes.image);
    }

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
        ...(row.attributes as Record<string, string>),
      }))
    );
  } catch (err) {
    console.error("getMyProducts failed:", err);
    res.status(500).json({ message: "Something went wrong loading your products" });
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
    ...(row.attributes as Record<string, string>),
  }));
};
