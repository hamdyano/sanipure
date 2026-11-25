import type { Response } from "express";
import { prisma } from "./prisma";
import type { AuthedRequest } from "./authMiddleware";
import { trimmedField } from "./validation";

// Managing who is on the data entry team. Admin only (see index.ts).
// Admins themselves can't be made or removed here, only with
// scripts/setRoles.ts on the server, so nobody can lock every admin out or
// hand out admin rights from the website.

const MIN_SEARCH_LENGTH = 2;
const MAX_SEARCH_RESULTS = 10;

const memberFields = {
  id: true,
  username: true,
  fullName: true,
  email: true,
  role: true,
  _count: { select: { products: true } },
} as const;

const toMember = (user: {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  role: string;
  _count: { products: number };
}) => ({
  id: user.id,
  name: user.fullName || user.username,
  email: user.email,
  role: user.role,
  productCount: user._count.products,
});

// GET /api/users/data-entry — everyone on the data entry team.
export const getDataEntryTeam = async (_req: AuthedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "data_entry" },
      select: memberFields,
      orderBy: { email: "asc" },
    });
    res.json(users.map(toMember));
  } catch (err) {
    console.error("getDataEntryTeam failed:", err);
    res.status(500).json({ message: "Something went wrong loading the data entry team" });
  }
};

// GET /api/users/search?q=… — visitor accounts whose email contains the text.
export const searchVisitors = async (req: AuthedRequest, res: Response) => {
  try {
    const query = trimmedField(req.query.q);
    if (query.length < MIN_SEARCH_LENGTH) {
      res.json([]);
      return;
    }
    const users = await prisma.user.findMany({
      where: { role: "visitor", email: { contains: query, mode: "insensitive" } },
      select: memberFields,
      orderBy: { email: "asc" },
      take: MAX_SEARCH_RESULTS,
    });
    res.json(users.map(toMember));
  } catch (err) {
    console.error("searchVisitors failed:", err);
    res.status(500).json({ message: "Something went wrong searching accounts" });
  }
};

// PUT /api/users/:id/role { role: "data_entry" | "visitor" }
export const setUserRole = async (req: AuthedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const role = (req.body ?? {}).role;
    if (role !== "data_entry" && role !== "visitor") {
      res.status(400).json({ message: 'role must be "data_entry" or "visitor"' });
      return;
    }

    // The role is part of the condition, so an admin account never matches.
    const { count } = await prisma.user.updateMany({
      where: { id, role: { in: ["visitor", "data_entry"] } },
      data: { role },
    });
    const user = await prisma.user.findUnique({ where: { id }, select: memberFields });
    if (!user) {
      res.status(404).json({ message: "That account no longer exists" });
      return;
    }
    if (!count) {
      res.status(403).json({ message: "An admin's role can't be changed here" });
      return;
    }
    res.json(toMember(user));
  } catch (err) {
    console.error("setUserRole failed:", err);
    res.status(500).json({ message: "Something went wrong changing the role" });
  }
};
