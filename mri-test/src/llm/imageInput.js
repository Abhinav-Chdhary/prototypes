import fs from "node:fs/promises";
import path from "node:path";

const mimeByExtension = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export function getImageMimeType(imagePath) {
  const extension = path.extname(imagePath).toLowerCase();
  return mimeByExtension[extension] || "application/octet-stream";
}

export async function assertReadableImagePath(imagePath) {
  const stat = await fs.stat(imagePath);

  if (!stat.isFile()) {
    throw new Error(`Image path is not a file: ${imagePath}`);
  }

  return true;
}

export async function readImageAsDataUrl(imagePath) {
  await assertReadableImagePath(imagePath);

  const buffer = await fs.readFile(imagePath);
  const mimeType = getImageMimeType(imagePath);

  if (!mimeType.startsWith("image/")) {
    throw new Error(`Unsupported image type for ${imagePath}`);
  }

  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

