import type { Response } from "express";
import { prisma } from "./prisma";
import type { AuthedRequest } from "./authMiddleware";
import { deleteStorageObjects, httpUrl } from "./products";
import { PHONE_MAX_LENGTH, USERNAME_MAX_LENGTH, isValidPhone } from "./validation";

// The fields a user can fill in on their profile page, with the longest
// value each one accepts.
const PROFILE_FIELDS = {
  fullName: 100,
  phone: PHONE_MAX_LENGTH,
  jobTitle: 100,
  location: 100,
  bio: 500,
} as const;
type ProfileField = keyof typeof PROFILE_FIELDS;

const USERNAME_MAX = USERNAME_MAX_LENGTH;

const loadProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    jobTitle: user.jobTitle,
    location: user.location,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
};

// GET /api/profile — the signed-in user's own profile.
export const getProfile = async (req: AuthedRequest, res: Response) => {
  try {
    const profile = await loadProfile(req.userId!);
    if (!profile) {
      res.status(404).json({ message: "Your account no longer exists. Please sign in again." });
      return;
    }
    res.json(profile);
  } catch (err) {
    console.error("getProfile failed:", err);
    res.status(500).json({ message: "Something went wrong loading your profile" });
  }
};

// PUT /api/profile — updates the signed-in user's username and optional
// profile details. Email isn't editable here since it's the sign-in login.
// An optional field sent as an empty string is cleared.
export const updateProfile = async (req: AuthedRequest, res: Response) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;

    const username = typeof body.username === "string" ? body.username.trim() : "";
    if (!username) {
      res.status(400).json({ message: "Username is required" });
      return;
    }
    if (username.length > USERNAME_MAX) {
      res.status(400).json({ message: `Username must be at most ${USERNAME_MAX} characters` });
      return;
    }

    const data: Partial<Record<ProfileField, string | null>> = {};
    for (const [field, maxLength] of Object.entries(PROFILE_FIELDS) as [ProfileField, number][]) {
      const value = body[field];
      if (value === undefined) continue;
      if (value !== null && typeof value !== "string") {
        res.status(400).json({ message: `Invalid value for ${field}` });
        return;
      }
      const trimmed = value?.trim() ?? "";
      if (trimmed.length > maxLength) {
        res.status(400).json({ message: `${field} must be at most ${maxLength} characters` });
        return;
      }
      data[field] = trimmed || null;
    }

    // Phone is required at sign-up, so it can be changed here but not cleared.
    // (Accounts made before that may still have none until they add one.)
    if (data.phone === null) {
      res.status(400).json({ message: "Phone number is required" });
      return;
    }
    if (data.phone && !isValidPhone(data.phone)) {
      res.status(400).json({ message: "Enter a valid phone number" });
      return;
    }

    // avatarUrl: a URL from the image upload endpoint, or empty to remove it.
    let avatarUrl: string | null | undefined;
    if (body.avatarUrl !== undefined) {
      if (body.avatarUrl === null || body.avatarUrl === "") {
        avatarUrl = null;
      } else {
        avatarUrl = httpUrl(body.avatarUrl);
        if (!avatarUrl) {
          res.status(400).json({ message: "Invalid profile photo" });
          return;
        }
      }
    }

    const existing = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!existing) {
      res.status(404).json({ message: "Your account no longer exists. Please sign in again." });
      return;
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: { username, ...data, ...(avatarUrl !== undefined ? { avatarUrl } : {}) },
    });

    // Remove the old photo from storage once it's been replaced or removed.
    if (avatarUrl !== undefined && existing.avatarUrl && existing.avatarUrl !== avatarUrl) {
      await deleteStorageObjects([existing.avatarUrl]);
    }

    res.json(await loadProfile(existing.id));
  } catch (err) {
    console.error("updateProfile failed:", err);
    res.status(500).json({ message: "Something went wrong saving your profile" });
  }
};
