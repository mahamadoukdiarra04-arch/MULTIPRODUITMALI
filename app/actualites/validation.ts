import { brands, commentStatuses, publicationStatuses, publicationTypes, type Brand, type CommentStatus, type EditorialPublication, type PublicationStatus, type PublicationType } from "./types";

export function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, maximum) : "";
}

export function cleanParagraphs(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().replace(/\r\n/g, "\n").slice(0, maximum) : "";
}

function oneOf<T extends readonly string[]>(value: unknown, options: T, fallback: T[number]) {
  return typeof value === "string" && (options as readonly string[]).includes(value) ? value as T[number] : fallback;
}

function nullableDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function cleanImageUrl(value: unknown) {
  const url = cleanText(value, 700);
  if (!url) return "";
  return url.startsWith("/") || /^https:\/\//i.test(url) ? url : "";
}

export function parsePublicationInput(value: unknown): Omit<EditorialPublication, "commentCount" | "createdAt" | "updatedAt"> | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const title = cleanText(record.title, 160);
  const slug = cleanText(record.slug, 100).toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const coverImage = cleanImageUrl(record.coverImage);
  if (!title || !slug || !coverImage) return null;

  const gallery = Array.isArray(record.gallery)
    ? record.gallery.map(cleanImageUrl).filter(Boolean).slice(0, 12)
    : [];

  return {
    id: cleanText(record.id, 100) || slug,
    slug,
    type: oneOf(record.type, publicationTypes, "activity") as PublicationType,
    brand: oneOf(record.brand, brands, "Multiproduit Mali") as Brand,
    status: oneOf(record.status, publicationStatuses, "draft") as PublicationStatus,
    title,
    excerpt: cleanText(record.excerpt, 360),
    body: cleanParagraphs(record.body, 12000),
    coverImage,
    gallery,
    location: cleanText(record.location, 160),
    startsAt: nullableDate(record.startsAt),
    endsAt: nullableDate(record.endsAt),
    publishedAt: nullableDate(record.publishedAt),
    scheduledAt: nullableDate(record.scheduledAt),
    isFeatured: record.isFeatured === true,
    commentsEnabled: record.commentsEnabled !== false,
  };
}

export function parseCommentStatus(value: unknown): CommentStatus | null {
  return typeof value === "string" && (commentStatuses as readonly string[]).includes(value) ? value as CommentStatus : null;
}
