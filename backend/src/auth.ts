import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const SALT_ROUNDS = 10;

const toPublicUser = (user: { id: string; username: string; email: string }) => ({
  id: user.id,
  username: user.username,
  email: user.email,
});

// Request bodies are untrusted JSON — a number or object here would otherwise
// reach bcrypt/Prisma and surface as a 500 instead of a 400.
const isFilledString = (value: unknown): value is string =>
  typeof value === "string" && value !== "";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body ?? {};

    if (!isFilledString(username) || !isFilledString(email) || !isFilledString(password)) {
      res.status(400).json({ message: "username, email, and password are required" });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { username, email, passwordHash },
    });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("signUp failed:", err);
    res.status(500).json({ message: "Something went wrong creating the account" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};

    if (!isFilledString(email) || !isFilledString(password)) {
      res.status(400).json({ message: "email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    console.error("signIn failed:", err);
    res.status(500).json({ message: "Something went wrong signing in" });
  }
};
