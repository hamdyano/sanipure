import type { Response } from "express";
import { prisma } from "./prisma";
import type { AuthedRequest } from "./authMiddleware";

// Shapes a saved product like the rest of the product API ({ id, name,
// ...attributes }), plus its category slug so the frontend can link to the
// right product page, and when it was saved.
const toWishlistEntry = (item: {
  createdAt: Date;
  product: { id: string; name: string; attributes: unknown; category: { slug: string } };
}) => ({
  ...(item.product.attributes as Record<string, unknown>),
  id: item.product.id,
  name: item.product.name,
  category: item.product.category.slug,
  addedAt: item.createdAt,
});

const withProduct = {
  product: { include: { category: { select: { slug: true } } } },
} as const;

// GET /api/wishlist — the signed-in user's saved products, newest first.
export const getWishlist = async (req: AuthedRequest, res: Response) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.userId! },
      include: withProduct,
      orderBy: { createdAt: "desc" },
    });
    res.json(items.map(toWishlistEntry));
  } catch (err) {
    console.error("getWishlist failed:", err);
    res.status(500).json({ message: "Something went wrong loading your wishlist" });
  }
};

// POST /api/wishlist/:productId — saves a product. Saving one that's already
// saved is fine and just returns it again.
export const addToWishlist = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const productId = String(req.params.productId);

    const [user, product] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
    ]);
    if (!user) {
      res.status(401).json({ message: "Your account no longer exists. Please sign in again." });
      return;
    }
    if (!product) {
      res.status(404).json({ message: "That product no longer exists" });
      return;
    }

    const item = await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
      include: withProduct,
    });
    res.status(201).json(toWishlistEntry(item));
  } catch (err) {
    console.error("addToWishlist failed:", err);
    res.status(500).json({ message: "Something went wrong adding to your wishlist" });
  }
};

// DELETE /api/wishlist/:productId — removes a saved product. Removing one
// that isn't saved is a no-op.
export const removeFromWishlist = async (req: AuthedRequest, res: Response) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.userId!, productId: String(req.params.productId) },
    });
    res.status(204).end();
  } catch (err) {
    console.error("removeFromWishlist failed:", err);
    res.status(500).json({ message: "Something went wrong removing from your wishlist" });
  }
};
