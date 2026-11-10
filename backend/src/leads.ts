import type { Response } from "express";
import { prisma } from "./prisma";
import type { AuthedRequest } from "./authMiddleware";

// A product's thumbnail: its own photo, else the first gallery photo, else
// the first color photo. Defensive about shape since older rows may differ.
const productThumbnail = (attributes: unknown): string | null => {
  const attrs = (attributes ?? {}) as Record<string, unknown>;
  if (typeof attrs.image === "string" && attrs.image) return attrs.image;

  const display = (attrs.display ?? {}) as Record<string, unknown>;
  const images = Array.isArray(display.images) ? display.images : [];
  if (typeof images[0] === "string") return images[0];

  const colors = Array.isArray(display.colors) ? display.colors : [];
  for (const color of colors) {
    const image = (color as Record<string, unknown> | null)?.image;
    if (typeof image === "string" && image) return image;
  }
  return null;
};

interface LeadProduct {
  id: string;
  name: string;
  category: string;
  image: string | null;
  addedAt: Date;
}

interface Lead {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  products: LeadProduct[];
}

// GET /api/leads — the "Leads Report" on the dashboard: one entry per user who
// saved products to their wishlist, with their contact details and every
// product they saved. Users with the most recent save come first, and each
// user's products are newest first. Open to any signed-in user, like the
// rest of the dashboard.
export const getLeads = async (_req: AuthedRequest, res: Response) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, username: true, fullName: true, email: true, phone: true } },
        product: {
          select: {
            id: true,
            name: true,
            attributes: true,
            category: { select: { slug: true } },
          },
        },
      },
    });

    // Items arrive newest first, so each user's first item is their latest
    // save and Map insertion order already sorts users by it.
    const leads = new Map<string, Lead>();
    for (const item of items) {
      let lead = leads.get(item.user.id);
      if (!lead) {
        lead = {
          userId: item.user.id,
          name: item.user.fullName || item.user.username,
          email: item.user.email,
          phone: item.user.phone,
          products: [],
        };
        leads.set(item.user.id, lead);
      }
      lead.products.push({
        id: item.product.id,
        name: item.product.name,
        category: item.product.category.slug,
        image: productThumbnail(item.product.attributes),
        addedAt: item.createdAt,
      });
    }

    res.json([...leads.values()]);
  } catch (err) {
    console.error("getLeads failed:", err);
    res.status(500).json({ message: "Something went wrong loading the leads report" });
  }
};
