import fs from "node:fs";
import path from "node:path";
import { UPLOADS_DIR, contentTypeFor } from "@/lib/images";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const name = path.basename(filename);
  if (!/^[a-f0-9-]{36}\.(jpg|jpeg|png|webp|avif)$/i.test(name)) {
    return new Response("Not found", { status: 404 });
  }
  const filePath = path.resolve(UPLOADS_DIR, name);
  if (!filePath.startsWith(path.resolve(UPLOADS_DIR))) {
    return new Response("Not found", { status: 404 });
  }
  if (!fs.existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(name).toLowerCase();
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentTypeFor(ext),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
