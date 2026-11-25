import path from "path";
import { mkdir, unlink, writeFile } from "fs/promises";

// Uploaded files (product photos, gallery/color images, PDF design files,
// profile photos) are saved on this server's disk and served by Express at
// /uploads/<file name> (see index.ts).
//
// On the live server, set UPLOADS_DIR in .env to a folder OUTSIDE the code
// folder (e.g. /home/deploy/sanipure-uploads) so `git pull` and redeploys
// never touch the files. Locally it defaults to backend/uploads, which is
// git-ignored.
export const UPLOADS_DIR = path.resolve(
  process.env.UPLOADS_DIR || path.join(__dirname, "../uploads")
);

export const UPLOADS_URL_PREFIX = "/uploads/";

// The file extension comes from the checked content type, never from the
// client's file name — otherwise a file called "x.html" sent as "image/png"
// would be served back as a web page from our own site.
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
};

// Only plain file names like the ones we generate: no folders, no "..".
// (Files copied from the old Supabase bucket may have upper-case extensions.)
const SAFE_FILE_NAME = /^[A-Za-z0-9_-]+\.[A-Za-z0-9]{1,8}$/;

export const isUploadUrl = (value: string) =>
  value.startsWith(UPLOADS_URL_PREFIX) &&
  SAFE_FILE_NAME.test(value.slice(UPLOADS_URL_PREFIX.length));

// Saves a file and returns its public URL path, e.g. "/uploads/1795...-123.jpg".
// The optional prefix goes in front of the generated file name.
export const saveUpload = async (
  buffer: Buffer,
  contentType: string,
  prefix = ""
): Promise<string> => {
  const ext = EXTENSION_BY_TYPE[contentType];
  if (!ext) throw new Error(`Unsupported file type: ${contentType}`);
  const fileName = `${prefix}${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  await mkdir(UPLOADS_DIR, { recursive: true });
  await writeFile(path.join(UPLOADS_DIR, fileName), buffer);
  return `${UPLOADS_URL_PREFIX}${fileName}`;
};

// Best-effort delete of files no longer referenced. URLs that aren't ours
// (e.g. an old external link) are ignored, and a missing file isn't an error.
export const deleteUploads = async (urls: Iterable<string>) => {
  for (const url of urls) {
    if (!isUploadUrl(url)) continue;
    const fileName = url.slice(UPLOADS_URL_PREFIX.length);
    try {
      await unlink(path.join(UPLOADS_DIR, fileName));
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error(`Failed to delete uploaded file ${fileName}:`, err);
      }
    }
  }
};
