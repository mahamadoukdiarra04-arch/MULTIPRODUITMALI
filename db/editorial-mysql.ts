import type { RowDataPacket } from "mysql2/promise";

import { editorialSeed } from "../app/actualites/seed";
import type {
  Brand,
  CommentLanguage,
  CommentStatus,
  EditorialComment,
  EditorialPublication,
  PublicationStatus,
  PublicationType,
} from "../app/actualites/types";
import { executeSql, queryOne, queryRows, withTransaction } from "./mysql";

type PublicationRow = RowDataPacket & Omit<EditorialPublication, "gallery" | "commentCount" | "isFeatured" | "commentsEnabled"> & {
  gallery: string;
  isFeatured: number;
  commentsEnabled: number;
  commentCount?: number | string;
};

type CommentRow = RowDataPacket & Omit<EditorialComment, "translation" | "replies" | "isOfficial" | "isPinned" | "reportCount"> & {
  isOfficial: number;
  isPinned: number;
  reportCount: number;
  translationContent: string | null;
  translationLanguage: CommentLanguage | null;
  translationReportCount: number | null;
};

type PublicationInput = Omit<EditorialPublication, "id" | "commentCount" | "createdAt" | "updatedAt"> & { id?: string };

let schemaReady: Promise<void> | null = null;

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS editorial_publications (
    id VARCHAR(100) PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL,
    brand VARCHAR(80) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    title VARCHAR(160) NOT NULL,
    excerpt VARCHAR(360) NOT NULL DEFAULT '',
    body LONGTEXT NOT NULL,
    cover_image VARCHAR(700) NOT NULL DEFAULT '',
    gallery LONGTEXT NOT NULL,
    location VARCHAR(160) NOT NULL DEFAULT '',
    starts_at VARCHAR(40) NULL,
    ends_at VARCHAR(40) NULL,
    published_at VARCHAR(40) NULL,
    scheduled_at VARCHAR(40) NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    comments_enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at VARCHAR(40) NOT NULL,
    updated_at VARCHAR(40) NOT NULL,
    INDEX idx_editorial_publications_status_published_at (status, published_at),
    INDEX idx_editorial_publications_type_brand (type, brand)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS editorial_comments (
    id VARCHAR(100) PRIMARY KEY,
    publication_id VARCHAR(100) NOT NULL,
    parent_id VARCHAR(100) NULL,
    author_name VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    language VARCHAR(8) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    is_official TINYINT(1) NOT NULL DEFAULT 0,
    is_pinned TINYINT(1) NOT NULL DEFAULT 0,
    report_count INT NOT NULL DEFAULT 0,
    created_at VARCHAR(40) NOT NULL,
    updated_at VARCHAR(40) NOT NULL,
    INDEX idx_editorial_comments_publication_created (publication_id, created_at),
    INDEX idx_editorial_comments_status_created (status, created_at),
    INDEX idx_editorial_comments_parent (parent_id)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS editorial_comment_translations (
    id VARCHAR(100) PRIMARY KEY,
    comment_id VARCHAR(100) NOT NULL,
    target_language VARCHAR(8) NOT NULL,
    content TEXT NOT NULL,
    provider VARCHAR(700) NOT NULL,
    report_count INT NOT NULL DEFAULT 0,
    created_at VARCHAR(40) NOT NULL,
    UNIQUE KEY idx_editorial_comment_translations_comment_language (comment_id, target_language)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS editorial_comment_reports (
    id VARCHAR(100) PRIMARY KEY,
    comment_id VARCHAR(100) NOT NULL,
    kind VARCHAR(32) NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    INDEX idx_editorial_comment_reports_comment (comment_id)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
];

const publicationSelect = `
  SELECT
    p.id, p.slug, p.type, p.brand, p.status, p.title, p.excerpt, p.body,
    p.cover_image AS coverImage, p.gallery, p.location,
    p.starts_at AS startsAt, p.ends_at AS endsAt, p.published_at AS publishedAt,
    p.scheduled_at AS scheduledAt, p.is_featured AS isFeatured,
    p.comments_enabled AS commentsEnabled, p.created_at AS createdAt,
    p.updated_at AS updatedAt,
    (SELECT COUNT(*) FROM editorial_comments c
      WHERE c.publication_id = p.id AND c.status = 'published') AS commentCount
  FROM editorial_publications p`;

const commentColumns = `
  c.id, c.publication_id AS publicationId, c.parent_id AS parentId,
  c.author_name AS authorName, c.content, c.language, c.status,
  c.is_official AS isOfficial, c.is_pinned AS isPinned,
  c.report_count AS reportCount, c.created_at AS createdAt, c.updated_at AS updatedAt`;

function publicationValues(publication: EditorialPublication | PublicationInput, id: string, createdAt: string) {
  return [
    id,
    publication.slug,
    publication.type,
    publication.brand,
    publication.status,
    publication.title,
    publication.excerpt,
    publication.body,
    publication.coverImage,
    JSON.stringify(publication.gallery),
    publication.location,
    publication.startsAt,
    publication.endsAt,
    publication.publishedAt,
    publication.scheduledAt,
    Number(publication.isFeatured),
    Number(publication.commentsEnabled),
    "createdAt" in publication ? publication.createdAt : createdAt,
    createdAt,
  ];
}

async function ensureSchema() {
  schemaReady ??= (async () => {
    for (const statement of schemaStatements) await executeSql(statement);
    const current = await queryOne<RowDataPacket & { count: number | string }>("SELECT COUNT(*) AS count FROM editorial_publications");
    if (Number(current?.count ?? 0) === 0) {
      await withTransaction(async (connection) => {
        for (const publication of editorialSeed) {
          await connection.execute(`INSERT INTO editorial_publications (
            id, slug, type, brand, status, title, excerpt, body, cover_image, gallery,
            location, starts_at, ends_at, published_at, scheduled_at, is_featured,
            comments_enabled, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, publicationValues(publication, publication.id, publication.updatedAt));
        }
      });
    }
  })();
  await schemaReady;
}

async function editorialDb() {
  await ensureSchema();
  const now = new Date().toISOString();
  await executeSql(`UPDATE editorial_publications
    SET status = 'published', published_at = COALESCE(published_at, scheduled_at), updated_at = ?
    WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= ?`, [now, now]);
}

function parseGallery(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function toPublication(row: PublicationRow): EditorialPublication {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type as PublicationType,
    brand: row.brand as Brand,
    status: row.status as PublicationStatus,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverImage: row.coverImage,
    gallery: parseGallery(row.gallery),
    location: row.location,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    publishedAt: row.publishedAt,
    scheduledAt: row.scheduledAt,
    isFeatured: Boolean(row.isFeatured),
    commentsEnabled: Boolean(row.commentsEnabled),
    commentCount: Number(row.commentCount ?? 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toComment(row: CommentRow): EditorialComment {
  return {
    id: row.id,
    publicationId: row.publicationId,
    parentId: row.parentId,
    authorName: row.authorName,
    content: row.content,
    language: row.language as CommentLanguage,
    status: row.status as CommentStatus,
    isOfficial: Boolean(row.isOfficial),
    isPinned: Boolean(row.isPinned),
    reportCount: Number(row.reportCount),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translation: row.translationContent && row.translationLanguage
      ? { targetLanguage: row.translationLanguage, content: row.translationContent, reportCount: Number(row.translationReportCount ?? 0) }
      : null,
    replies: [],
  };
}

export async function listPublications(options: { includePrivate?: boolean } = {}) {
  await editorialDb();
  const where = options.includePrivate ? "" : "WHERE p.status IN ('published', 'archived')";
  const rows = await queryRows<PublicationRow>(`${publicationSelect} ${where}
    ORDER BY p.is_featured DESC, COALESCE(p.starts_at, p.published_at, p.created_at) DESC`);
  return rows.map(toPublication);
}

export async function getPublicationBySlug(slug: string, options: { includePrivate?: boolean } = {}) {
  await editorialDb();
  const visible = options.includePrivate ? "" : "AND p.status IN ('published', 'archived')";
  const row = await queryOne<PublicationRow>(`${publicationSelect} WHERE p.slug = ? ${visible} LIMIT 1`, [slug]);
  return row ? toPublication(row) : null;
}

export async function listComments(publicationId: string, order: "newest" | "oldest" = "newest") {
  await editorialDb();
  const direction = order === "oldest" ? "ASC" : "DESC";
  const rows = await queryRows<CommentRow>(`
    SELECT ${commentColumns}, t.content AS translationContent, t.target_language AS translationLanguage,
      t.report_count AS translationReportCount
    FROM editorial_comments c
    LEFT JOIN editorial_comment_translations t
      ON t.comment_id = c.id
      AND t.target_language = CASE WHEN c.language = 'fr' THEN 'en' ELSE 'fr' END
    WHERE c.publication_id = ? AND c.status = 'published'
    ORDER BY c.is_pinned DESC, c.created_at ${direction}`, [publicationId]);

  const roots = new Map<string, EditorialComment>();
  const replies: EditorialComment[] = [];
  for (const row of rows) {
    const comment = toComment(row);
    if (comment.parentId) replies.push(comment);
    else roots.set(comment.id, comment);
  }
  for (const reply of replies) roots.get(reply.parentId ?? "")?.replies.push(reply);
  return [...roots.values()];
}

export async function createVisitorComment(input: { publicationId: string; authorName: string; content: string; parentId?: string | null }) {
  await editorialDb();
  const publication = await queryOne<RowDataPacket & { id: string; commentsEnabled: number }>(
    "SELECT id, comments_enabled AS commentsEnabled FROM editorial_publications WHERE id = ? AND status IN ('published', 'archived')",
    [input.publicationId],
  );
  if (!publication) throw new Error("Cette publication n’est pas disponible.");
  if (!publication.commentsEnabled) throw new Error("La discussion est fermée pour cette publication.");

  if (input.parentId) {
    const parent = await queryOne<RowDataPacket & { publicationId: string; parentId: string | null }>(
      "SELECT publication_id AS publicationId, parent_id AS parentId FROM editorial_comments WHERE id = ?",
      [input.parentId],
    );
    if (!parent || parent.publicationId !== input.publicationId || parent.parentId) throw new Error("Cette réponse ne peut pas être ajoutée.");
  }

  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const language = detectCommentLanguage(input.content);
  await executeSql(`INSERT INTO editorial_comments (
    id, publication_id, parent_id, author_name, content, language, status,
    is_official, is_pinned, report_count, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, 'published', 0, 0, 0, ?, ?)`, [
    id, input.publicationId, input.parentId ?? null, input.authorName, input.content, language, createdAt, createdAt,
  ]);

  return {
    id,
    publicationId: input.publicationId,
    parentId: input.parentId ?? null,
    authorName: input.authorName,
    content: input.content,
    language,
    status: "published" as const,
    isOfficial: false,
    isPinned: false,
    reportCount: 0,
    createdAt,
    updatedAt: createdAt,
    translation: null,
    replies: [],
  };
}

export function detectCommentLanguage(content: string): CommentLanguage {
  const normalized = ` ${content.toLocaleLowerCase("fr-FR")} `;
  const frenchSignals = /\b(le|la|les|des|une|un|avec|pour|dans|cette|très|merci|bonjour|j'aime|c'est|est|et|que|qui|au|aux|pas)\b|[àâçéèêëîïôùûüÿœ]/;
  const englishSignals = /\b(the|and|with|for|this|that|very|thank|hello|love|is|are|to|of|in|my|your)\b/;
  if (frenchSignals.test(normalized)) return "fr";
  if (englishSignals.test(normalized)) return "en";
  return "fr";
}

export async function requestCommentTranslation(commentId: string) {
  await editorialDb();
  const comment = await queryOne<RowDataPacket & { id: string; content: string; language: CommentLanguage }>(
    "SELECT id, content, language FROM editorial_comments WHERE id = ? AND status = 'published'",
    [commentId],
  );
  if (!comment) throw new Error("Ce commentaire n’est pas disponible.");

  const targetLanguage: CommentLanguage = comment.language === "fr" ? "en" : "fr";
  const cached = await queryOne<RowDataPacket & { content: string; reportCount: number }>(
    "SELECT content, report_count AS reportCount FROM editorial_comment_translations WHERE comment_id = ? AND target_language = ?",
    [commentId, targetLanguage],
  );
  if (cached) return { targetLanguage, content: cached.content, reportCount: Number(cached.reportCount), cached: true };

  const apiUrl = process.env.TRANSLATION_API_URL;
  if (!apiUrl) throw new Error("La traduction automatique doit être connectée avant sa mise en ligne.");
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(process.env.TRANSLATION_API_TOKEN ? { authorization: `Bearer ${process.env.TRANSLATION_API_TOKEN}` } : {}),
    },
    body: JSON.stringify({ q: comment.content, source: comment.language, target: targetLanguage, format: "text" }),
  });
  if (!response.ok) throw new Error("Le service de traduction ne répond pas pour le moment.");

  const payload = await response.json() as { translatedText?: unknown; translation?: unknown; text?: unknown };
  const translation = [payload.translatedText, payload.translation, payload.text]
    .find((value): value is string => typeof value === "string")?.trim();
  if (!translation) throw new Error("Le service de traduction a renvoyé une réponse invalide.");

  const createdAt = new Date().toISOString();
  await executeSql(`INSERT INTO editorial_comment_translations (
    id, comment_id, target_language, content, provider, report_count, created_at
  ) VALUES (?, ?, ?, ?, ?, 0, ?)`, [crypto.randomUUID(), commentId, targetLanguage, translation, apiUrl, createdAt]);
  return { targetLanguage, content: translation, reportCount: 0, cached: false };
}

export async function reportComment(commentId: string, kind: "comment" | "translation") {
  await editorialDb();
  if (kind === "translation") {
    await executeSql("UPDATE editorial_comment_translations SET report_count = report_count + 1 WHERE comment_id = ?", [commentId]);
    return;
  }

  const now = new Date().toISOString();
  await withTransaction(async (connection) => {
    await connection.execute("UPDATE editorial_comments SET report_count = report_count + 1, status = CASE WHEN status = 'published' THEN 'reported' ELSE status END, updated_at = ? WHERE id = ?", [now, commentId]);
    await connection.execute("INSERT INTO editorial_comment_reports (id, comment_id, kind, created_at) VALUES (?, ?, 'comment', ?)", [crypto.randomUUID(), commentId, now]);
  });
}

export async function savePublication(input: PublicationInput) {
  await editorialDb();
  const updatedAt = new Date().toISOString();
  const id = input.id?.trim() || input.slug;
  if (input.isFeatured) {
    await executeSql("UPDATE editorial_publications SET is_featured = 0, updated_at = ? WHERE id != ? AND is_featured = 1", [updatedAt, id]);
  }

  await executeSql(`INSERT INTO editorial_publications (
    id, slug, type, brand, status, title, excerpt, body, cover_image, gallery,
    location, starts_at, ends_at, published_at, scheduled_at, is_featured,
    comments_enabled, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE
    slug = VALUES(slug), type = VALUES(type), brand = VALUES(brand), status = VALUES(status),
    title = VALUES(title), excerpt = VALUES(excerpt), body = VALUES(body),
    cover_image = VALUES(cover_image), gallery = VALUES(gallery), location = VALUES(location),
    starts_at = VALUES(starts_at), ends_at = VALUES(ends_at), published_at = VALUES(published_at),
    scheduled_at = VALUES(scheduled_at), is_featured = VALUES(is_featured),
    comments_enabled = VALUES(comments_enabled), updated_at = VALUES(updated_at)`,
  publicationValues(input, id, updatedAt));

  const publication = await getPublicationBySlug(input.slug, { includePrivate: true });
  if (!publication) throw new Error("La publication n’a pas pu être enregistrée.");
  return publication;
}

export async function listModerationComments() {
  await editorialDb();
  const rows = await queryRows<CommentRow>(`
    SELECT ${commentColumns}, t.content AS translationContent, t.target_language AS translationLanguage,
      t.report_count AS translationReportCount
    FROM editorial_comments c
    LEFT JOIN editorial_comment_translations t
      ON t.comment_id = c.id
      AND t.target_language = CASE WHEN c.language = 'fr' THEN 'en' ELSE 'fr' END
    ORDER BY CASE WHEN c.status IN ('reported', 'pending') THEN 0 ELSE 1 END, c.created_at DESC
    LIMIT 80`);
  return rows.map(toComment);
}

export async function moderateComment(id: string, change: { status?: CommentStatus; isPinned?: boolean }) {
  await editorialDb();
  await executeSql(`UPDATE editorial_comments SET
    status = COALESCE(?, status), is_pinned = COALESCE(?, is_pinned), updated_at = ?
    WHERE id = ?`, [change.status ?? null, typeof change.isPinned === "boolean" ? Number(change.isPinned) : null, new Date().toISOString(), id]);
}

export async function replyAsEditorialTeam(input: { publicationId: string; parentId: string; content: string }) {
  await editorialDb();
  const parent = await queryOne<RowDataPacket & { publicationId: string; parentId: string | null }>(
    "SELECT publication_id AS publicationId, parent_id AS parentId FROM editorial_comments WHERE id = ?",
    [input.parentId],
  );
  if (!parent || parent.publicationId !== input.publicationId || parent.parentId) throw new Error("Cette réponse ne peut pas être ajoutée.");

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const language = detectCommentLanguage(input.content);
  await executeSql(`INSERT INTO editorial_comments (
    id, publication_id, parent_id, author_name, content, language, status,
    is_official, is_pinned, report_count, created_at, updated_at
  ) VALUES (?, ?, ?, 'Équipe Multiproduit Mali', ?, ?, 'published', 1, 0, 0, ?, ?)`, [
    id, input.publicationId, input.parentId, input.content, language, createdAt, createdAt,
  ]);
  return id;
}
