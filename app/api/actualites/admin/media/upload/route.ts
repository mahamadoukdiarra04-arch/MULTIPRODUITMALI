import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getEditorialUser } from "../../../../../actualites/access";
import { editorialMediaDirectory } from "../../../../../../db/media-storage";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const mediaTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
]);

export async function POST(request: Request) {
  if (!await getEditorialUser()) {
    return Response.json({ error: "Accès réservé à l’équipe éditoriale." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Le fichier envoyé est invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Sélectionnez un fichier à envoyer." }, { status: 400 });

  const extension = mediaTypes.get(file.type);
  if (!extension) return Response.json({ error: "Format non accepté. Utilisez JPG, PNG, WebP, AVIF, MP4 ou WebM." }, { status: 415 });

  const isVideo = file.type.startsWith("video/");
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (!file.size || file.size > maxBytes) {
    return Response.json({ error: `La taille maximale est de ${isVideo ? "20" : "10"} Mo pour ce fichier.` }, { status: 413 });
  }

  const fileName = `${crypto.randomUUID()}${extension}`;
  const directory = editorialMediaDirectory();
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, fileName), Buffer.from(await file.arrayBuffer()), { flag: "wx" });

  return Response.json({ url: `/api/actualites/media/${fileName}` }, { status: 201 });
}
