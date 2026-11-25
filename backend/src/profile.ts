import type { NextFunction, Response } from "express";
import { prisma } from "./prisma";
import type { AuthedRequest } from "./authMiddleware";
import { ALLOWED_IMAGE_TYPES, IMAGE_TYPE_MESSAGE, deleteStorageObjects } from "./products";
import { UPLOADS_URL_PREFIX, isUploadUrl, saveUpload } from "./storage";
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
    role: user.role,
    fullName: user.fullName,
    phone: user.phone,
    jobTitle: user.jobTitle,
    location: user.location,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };
};

// Profile photos carry their owner's id in the file name, so a visitor can
// only ever use, and so replace and delete, their own photos and never a
// product's.
const avatarPrefix = (userId: string) => `avatar-${userId}-`;
const isOwnAvatar = (userId: string, url: string) =>
  isUploadUrl(url) && url.startsWith(UPLOADS_URL_PREFIX + avatarPrefix(userId));

// Any visitor can upload a profile photo, so each account gets a limited
// number per hour to keep the server's disk from being filled.
const MAX_AVATARS_PER_HOUR = 10;
const HOUR_MS = 60 * 60 * 1000;
const avatarUploads = new Map<string, number[]>();

const takeAvatarSlot = (userId: string): boolean => {
  const now = Date.now();
  for (const [id, times] of avatarUploads) {
    const recent = times.filter((time) => now - time < HOUR_MS);
    if (recent.length) avatarUploads.set(id, recent);
    else avatarUploads.delete(id);
  }
  const times = avatarUploads.get(userId) ?? [];
  if (times.length >= MAX_AVATARS_PER_HOUR) return false;
  avatarUploads.set(userId, [...times, now]);
  return true;
};

// Runs before the file is read, so a blocked upload costs nothing.
export const limitAvatarUploads = (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (!takeAvatarSlot(req.userId!)) {
    res.status(429).json({ message: "Too many photos uploaded. Please try again in an hour." });
    return;
  }
  next();
};

// POST /api/profile/upload-image — stores a profile photo and returns its URL,
// which the profile form then sends as avatarUrl. Open to every signed-in user.
export const uploadAvatar = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file was provided" });
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
      res.status(400).json({ message: IMAGE_TYPE_MESSAGE });
      return;
    }
    const userId = req.userId!;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      res.status(401).json({ message: "Your account no longer exists. Please sign in again." });
      return;
    }
    const url = await saveUpload(req.file.buffer, req.file.mimetype, avatarPrefix(userId));
    res.status(201).json({ url });
  } catch (err) {
    console.error("uploadAvatar failed:", err);
    res.status(500).json({ message: "Something went wrong uploading the photo" });
  }
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

    const existing = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!existing) {
      res.status(404).json({ message: "Your account no longer exists. Please sign in again." });
      return;
    }

    // avatarUrl: the current photo, a URL from uploadAvatar, or empty to
    // remove it.
    let avatarUrl: string | null | undefined;
    if (body.avatarUrl !== undefined) {
      const sent = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : body.avatarUrl;
      if (sent === null || sent === "") {
        avatarUrl = null;
      } else if (
        typeof sent === "string" &&
        (sent === existing.avatarUrl || isOwnAvatar(existing.id, sent))
      ) {
        avatarUrl = sent;
      } else {
        res.status(400).json({ message: "Invalid profile photo" });
        return;
      }
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: { username, ...data, ...(avatarUrl !== undefined ? { avatarUrl } : {}) },
    });

    // Remove the old photo from storage once it's been replaced or removed.
    // (Photos from before avatarPrefix are left alone.)
    if (
      avatarUrl !== undefined &&
      existing.avatarUrl &&
      existing.avatarUrl !== avatarUrl &&
      isOwnAvatar(existing.id, existing.avatarUrl)
    ) {
      await deleteStorageObjects([existing.avatarUrl]);
    }

    res.json(await loadProfile(existing.id));
  } catch (err) {
    console.error("updateProfile failed:", err);
    res.status(500).json({ message: "Something went wrong saving your profile" });
  }
};
