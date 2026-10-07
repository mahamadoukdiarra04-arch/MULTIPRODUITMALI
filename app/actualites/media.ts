export function isVideoMedia(url: string) {
  if (url.includes("/video/upload/")) return true;
  try {
    return /\.(mp4|webm|mov|m4v|ogv)$/i.test(new URL(url, "https://multiproduitmali.ml").pathname);
  } catch {
    return false;
  }
}
