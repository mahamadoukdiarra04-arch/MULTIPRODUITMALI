import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { editorialMediaDirectory } from "../../../../../db/media-storage";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ filename: string }> };

const mediaTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { filename } = await params;
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp|avif|mp4|webm)$/.test(filename)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const bytes = await readFile(join(editorialMediaDirectory(), filename));
    return new Response(bytes, {
      headers: {
        "Content-Type": mediaTypes[filename.slice(filename.lastIndexOf("."))],
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
