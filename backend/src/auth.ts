import type { Request, Response } from "express";
import { createHash, timingSafeEqual } from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";
import {
  PASSWORD_MIN_LENGTH,
  PHONE_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
  isValidEmail,
  isValidPhone,
  trimmedField,
} from "./validation";

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
    const body = req.body ?? {};
    // Every field is required; a value of only spaces counts as empty.
    const username = trimmedField(body.username);
    const email = trimmedField(body.email);
    const phone = trimmedField(body.phone);
    const password = typeof body.password === "string" ? body.password : "";

    const missing = [
      !username && "username",
      !email && "email",
      !phone && "phone number",
      !password.trim() && "password",
    ].filter((field): field is string => Boolean(field));
    if (missing.length) {
      res.status(400).json({ message: `Please fill in: ${missing.join(", ")}` });
      return;
    }

    if (username.length > USERNAME_MAX_LENGTH) {
      res
        .status(400)
        .json({ message: `Username must be at most ${USERNAME_MAX_LENGTH} characters` });
      return;
    }
    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Enter a valid email address" });
      return;
    }
    if (phone.length > PHONE_MAX_LENGTH || !isValidPhone(phone)) {
      res.status(400).json({ message: "Enter a valid phone number" });
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      res
        .status(400)
        .json({ message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { username, email, phone, passwordHash },
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

    // Emails are stored trimmed (see signUp).
    const user = await prisma.user.findUnique({ where: { email: email.trim() } });
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

// The word a user must type on the "Forgot password?" form to be allowed to
// set a new password. Checked only here on the server so it never ships in
// the frontend bundle. Can be changed via RESET_PASSWORD_WORD without a code
// change; it's case-sensitive ("sanipure", all lowercase, by default).
const RESET_PASSWORD_WORD = process.env.RESET_PASSWORD_WORD || "sanipure";

// Compare hashes so the check takes the same time whatever was typed.
const matchesResetWord = (value: string) =>
  timingSafeEqual(
    createHash("sha256").update(value).digest(),
    createHash("sha256").update(RESET_PASSWORD_WORD).digest()
  );

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, resetWord, newPassword } = req.body ?? {};

    if (!isFilledString(email) || !isFilledString(resetWord) || !isFilledString(newPassword)) {
      res.status(400).json({ message: "email, reset word, and new password are required" });
      return;
    }
    if (!matchesResetWord(resetWord.trim())) {
      res.status(403).json({ message: "The reset word is incorrect" });
      return;
    }
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      res
        .status(400)
        .json({ message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (!user) {
      res.status(404).json({ message: "No account exists with this email" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("resetPassword failed:", err);
    res.status(500).json({ message: "Something went wrong resetting the password" });
  }
};
