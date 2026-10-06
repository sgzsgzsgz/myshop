import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const PUBLIC_IMAGES_DIR = path.join(process.cwd(), "public", "images");

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function generatePlaceholderSvg(label: string, bg: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="${bg}"/><text x="200" y="200" font-size="110" text-anchor="middle" dominant-baseline="middle" fill="#4b5563">${label}</text></svg>`;
}

export function savePlaceholderImage(label: string, bg: string): string {
  fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}.svg`;
  fs.writeFileSync(
    path.join(PUBLIC_IMAGES_DIR, filename),
    generatePlaceholderSvg(label, bg)
  );
  return `/images/${filename}`;
}

export async function saveUploadedFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new UploadError("图片格式不正确，只支持 JPG、PNG、WebP、AVIF");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError("图片不能超过 2MB");
  }
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new UploadError("图片格式不正确，只支持 JPG、PNG、WebP、AVIF");
  }
  const filename = `${crypto.randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

export function deleteUploadedFile(image: string): void {
  if (!image.startsWith("/uploads/")) return;
  try {
    fs.unlinkSync(path.join(UPLOADS_DIR, path.basename(image)));
  } catch {
    // 文件已不存在则忽略
  }
}

export function deletePlaceholderImage(image: string): void {
  if (!image.startsWith("/images/")) return;
  try {
    fs.unlinkSync(path.join(PUBLIC_IMAGES_DIR, path.basename(image)));
  } catch {
    // 文件已不存在则忽略
  }
}

export function contentTypeFor(ext: string): string {
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".avif": "image/avif",
  };
  return map[ext] ?? "application/octet-stream";
}

export class UploadError extends Error {}
