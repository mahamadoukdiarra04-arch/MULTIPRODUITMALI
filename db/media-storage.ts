import { resolve } from "node:path";

export function editorialMediaDirectory() {
  const configuredDirectory = process.env.MEDIA_STORAGE_DIR?.trim();
  if (configuredDirectory) return resolve(configuredDirectory);

  const accountHome = process.env.HOME || process.env.USERPROFILE;
  if (accountHome) return resolve(accountHome, "domains", "multiproduitmali.ml", "media-uploads");

  return resolve(process.cwd(), ".media-uploads");
}
