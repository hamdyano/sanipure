import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import type { Role } from "./generated/prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Augment Request with the signed-in user's id, set by requireAuth below
// once the Bearer token has been verified, and their role and email, set by
// requireRole.
export interface AuthedRequest extends Request {
  userId?: string;
  userRole?: Role;
  userEmail?: string;
}

export const requireAuth = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Sign in required" });
    return;
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please sign in again." });
  }
};

// Only lets accounts with one of these roles through. The role is read from
// the database on every request rather than kept in the token, so taking
// someone off the data entry team works immediately, even while signed in.
export const requireRole = (...allowed: Role[]) => [
  requireAuth,
  async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { role: true, email: true },
    });
    if (!user) {
      res.status(401).json({ message: "Your account no longer exists. Please sign in again." });
      return;
    }
    if (!allowed.includes(user.role)) {
      res.status(403).json({ message: "Your account doesn't have permission to do this." });
      return;
    }
    req.userRole = user.role;
    req.userEmail = user.email;
    next();
  },
];
