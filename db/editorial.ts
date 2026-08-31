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

type PublicationRow = Omit<EditorialPublication, "gallery" | "commentCount" | "isFeatured" | "commentsEnabled"> & {
  gallery: string;
  isFeatured: number;
  commentsEnabled: number;
  commentCount?: number | string;
};

type CommentRow = Omit<EditorialComment, "translation" | "replies" | "isOfficial" | "isPinned" | "reportCount"> & {
  isOfficial: number;
  isPinned: number;
  reportCount: number;
  translationContent: string | null;
  translationLanguage: CommentLanguage | null;
  translationReportCount: number | null;
};

type PublicationInput = Omit<EditorialPublication, "id" | "commentCount" | "createdAt" | "updatedAt"> & { id?: string };

let schemaReady: Promise<void> | null = null;

async function getRuntimeD1(): Promise<D1Database | null> {
  try {
    const { getOptionalD1 } = await import("./index");
    return getOptionalD1();
  } catch {
    // The Node-only rendered HTML test has no Cloudflare runtime binding.
    return null;
  }
}

async function getTranslationRuntime() {
  try {
    const { env } = await import("cloudflare:workers");
    return env as unknown as { TRANSLATION_API_URL?: string; TRANSLATION_API_TOKEN?: string };
  } catch {
    return {} as { TRANSLATION_API_URL?: string; TRANSLATION_API_TOKEN?: string };
  }
}

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS editorial_publications (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    brand TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    gallery TEXT NOT NULL DEFAULT '[]',
    location TEXT NOT NULL DEFAULT '',
    starts_at TEXT,
    ends_at TEXT,
    published_at TEXT,
    scheduled_at TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    comments_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS editorial_comments (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL,
    parent_id TEXT,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    language TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    is_official INTEGER NOT NULL DEFAULT 0,
    is_pinned INTEGER NOT NULL DEFAULT 0,
    report_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS editorial_comment_translations (
    id TEXT PRIMARY KEY,
    comment_id TEXT NOT NULL,
    target_language TEXT NOT NULL,
    content TEXT NOT NULL,
    provider TEXT NOT NULL,
    report_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    UNIQUE(comment_id, target_language)
  )`,
  `CREATE TABLE IF NOT EXISTS editorial_comment_reports (
    id TEXT PRIMARY KEY,
    comment_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS idx_editorial_publications_status_published_at ON editorial_publications(status, published_at)",
  "CREATE INDEX IF NOT EXISTS idx_editorial_publications_type_brand ON editorial_publications(type, brand)",
  "CREATE INDEX IF NOT EXISTS idx_editorial_comments_publication_created ON editorial_comments(publication_id, created_at)",
  "CREATE INDEX IF NOT EXISTS idx_editorial_comments_status_created ON editorial_comments(status, created_at)",
  "CREATE INDEX IF NOT EXISTS idx_editorial_comments_parent ON editorial_comments(parent_id)",
  "CREATE INDEX IF NOT EXISTS idx_editorial_comment_reports_comment ON editorial_comment_reports(comment_id)",
];

async function ensureEditorialSchema(db: D1Database) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.batch(schemaStatements.map((statement) => db.prepare(statement)));
      await db.prepare("PRAGMA optimize").run();
      await seedEditorialPublications(db);
    })();
  }

  return schemaReady;
}

async function seedEditorialPublications(db: D1Database) {
  const current = await db.prepare("SELECT COUNT(*) AS count FROM editorial_publications").first<{ count: number }>();
  if ((current?.count ?? 0) > 0) return;

  await db.batch(editorialSeed.map((publication) => insertPublicationStatement(db, publication)));
}

function insertPublicationStatement(db: D1Database, publication: EditorialPublication) {
  return db.prepare(`INSERT INTO editorial_publications (
    id, slug, type, brand, status, title, excerpt, body, cover_image, gallery,
    location, starts_at, ends_at, published_at, scheduled_at, is_featured,
    comments_enabled, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(
      publication.id,
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
      publication.createdAt,
      publication.updatedAt,
    );
}

async function editorialDb() {
  const db = await getRuntimeD1();
  if (!db) return null;
  await ensureEditorialSchema(db);
  await db.prepare(`UPDATE editorial_publications
    SET status = 'published', published_at = COALESCE(published_at, scheduled_at), updated_at = ?
    WHERE status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at <= ?`)
    .bind(new Date().toISOString(), new Date().toISOString())
    .run();
  return db;
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
    ...row,
    type: row.type as PublicationType,
    brand: row.brand as Brand,
    status: row.status as PublicationStatus,
    gallery: parseGallery(row.gallery),
    isFeatured: Boolean(row.isFeatured),
    commentsEnabled: Boolean(row.commentsEnabled),
    commentCount: Number(row.commentCount ?? 0),
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

const publicationSelect = `
  SELECT
    p.id, p.slug, p.type, p.brand, p.status, p.title, p.excerpt, p.body,
    p.cover_image AS coverImage, p.gallery, p.location,
    p.starts_at AS startsAt, p.ends_at AS endsAt, p.published_at AS publishedAt,
    p.scheduled_at AS scheduledAt, p.is_featured AS isFeatured,
    p.comments_enabled AS commentsEnabled, p.created_at AS createdAt,
    p.updated_at AS updatedAt,
    COUNT(CASE WHEN c.status = 'published' THEN 1 END) AS commentCount
  FROM editorial_publications p
  LEFT JOIN editorial_comments c ON c.publication_id = p.id
  `;

const commentColumns = `
  c.id, c.publication_id AS publicationId, c.parent_id AS parentId,
  c.author_name AS authorName, c.content, c.language, c.status,
  c.is_official AS isOfficial, c.is_pinned AS isPinned,
  c.report_count AS reportCount, c.created_at AS createdAt, c.updated_at AS updatedAt
`;

export async function listPublications(options: { includePrivate?: boolean } = {}): Promise<EditorialPublication[]> {
  const db = await editorialDb();
  if (!db) return editorialSeed.map((publication) => ({ ...publication, gallery: [...publication.gallery] }));

  const where = options.includePrivate ? "" : "WHERE p.status IN ('published', 'archived')";
  const result = await db.prepare(`${publicationSelect} ${where} GROUP BY p.id ORDER BY p.is_featured DESC, COALESCE(p.starts_at, p.published_at, p.created_at) DESC`).all<PublicationRow>();
  return result.results.map(toPublication);
}

export async function getPublicationBySlug(slug: string, options: { includePrivate?: boolean } = {}): Promise<EditorialPublication | null> {
  const db = await editorialDb();
  if (!db) return editorialSeed.find((publication) => publication.slug === slug) ?? null;

  const visible = options.includePrivate ? "" : "AND p.status IN ('published', 'archived')";
  const result = await db.prepare(`${publicationSelect} WHERE p.slug = ? ${visible} GROUP BY p.id`).bind(slug).first<PublicationRow>();
  return result ? toPublication(result) : null;
}

export async function listComments(publicationId: string, order: "newest" | "oldest" = "newest"): Promise<EditorialComment[]> {
  const db = await editorialDb();
  if (!db) return [];

  const direction = order === "oldest" ? "ASC" : "DESC";
  const result = await db.prepare(`
    SELECT ${commentColumns}, t.content AS translationContent, t.target_language AS translationLanguage,
      t.report_count AS translationReportCount
    FROM editorial_comments c
    LEFT JOIN editorial_comment_translations t
      ON t.comment_id = c.id
      AND t.target_language = CASE WHEN c.language = 'fr' THEN 'en' ELSE 'fr' END
    WHERE c.publication_id = ? AND c.status = 'published'
    ORDER BY c.is_pinned DESC, c.created_at ${direction}
  `).bind(publicationId).all<CommentRow>();

  const roots = new Map<string, EditorialComment>();
  const replies: EditorialComment[] = [];
  for (const row of result.results) {
    const comment = toComment(row);
    if (comment.parentId) replies.push(comment);
    else roots.set(comment.id, comment);
  }
  for (const reply of replies) {
    roots.get(reply.parentId ?? "")?.replies.push(reply);
  }
  return [...roots.values()];
}

export async function createVisitorComment(input: { publicationId: string; authorName: string; content: string; parentId?: string | null }): Promise<EditorialComment> {
  const db = await editorialDb();
  if (!db) throw new Error("La base de commentaires n’est pas encore disponible.");

  const publication = await db.prepare("SELECT id, comments_enabled AS commentsEnabled FROM editorial_publications WHERE id = ? AND status IN ('published', 'archived')").bind(input.publicationId).first<{ id: string; commentsEnabled: number }>();
  if (!publication) throw new Error("Cette publication n’est pas disponible.");
  if (!publication.commentsEnabled) throw new Error("La discussion est fermée pour cette publication.");

  if (input.parentId) {
    const parent = await db.prepare("SELECT publication_id AS publicationId, parent_id AS parentId FROM editorial_comments WHERE id = ?").bind(input.parentId).first<{ publicationId: string; parentId: string | null }>();
    if (!parent || parent.publicationId !== input.publicationId || parent.parentId) throw new Error("Cette réponse ne peut pas être ajoutée.");
  }

  const createdAt = new Date().toISOString();
  const id = crypto.randomUUID();
  const language = detectCommentLanguage(input.content);
  await db.prepare(`INSERT INTO editorial_comments (
    id, publication_id, parent_id, author_name, content, language, status,
    is_official, is_pinned, report_count, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, 'published', 0, 0, 0, ?, ?)`)
    .bind(id, input.publicationId, input.parentId ?? null, input.authorName, input.content, language, createdAt, createdAt)
    .run();

  return {
    id,
    publicationId: input.publicationId,
    parentId: input.parentId ?? null,
    authorName: input.authorName,
    content: input.content,
    language,
    status: "published",
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
  const db = await editorialDb();
  if (!db) throw new Error("Le service de traduction n’est pas encore disponible.");

  const comment = await db.prepare("SELECT id, content, language FROM editorial_comments WHERE id = ? AND status = 'published'").bind(commentId).first<{ id: string; content: string; language: CommentLanguage }>();
  if (!comment) throw new Error("Ce commentaire n’est pas disponible.");

  const targetLanguage: CommentLanguage = comment.language === "fr" ? "en" : "fr";
  const cached = await db.prepare("SELECT content, report_count AS reportCount FROM editorial_comment_translations WHERE comment_id = ? AND target_language = ?").bind(commentId, targetLanguage).first<{ content: string; reportCount: number }>();
  if (cached) return { targetLanguage, content: cached.content, reportCount: Number(cached.reportCount), cached: true };

  const runtime = await getTranslationRuntime();
  if (!runtime.TRANSLATION_API_URL) {
    throw new Error("La traduction automatique doit être connectée avant sa mise en ligne.");
  }

  const response = await fetch(runtime.TRANSLATION_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(runtime.TRANSLATION_API_TOKEN ? { authorization: `Bearer ${runtime.TRANSLATION_API_TOKEN}` } : {}),
    },
    body: JSON.stringify({ q: comment.content, source: comment.language, target: targetLanguage, format: "text" }),
  });
  if (!response.ok) throw new Error("Le service de traduction ne répond pas pour le moment.");

  const payload = await response.json() as { translatedText?: unknown; translation?: unknown; text?: unknown };
  const translation = [payload.translatedText, payload.translation, payload.text].find((value): value is string => typeof value === "string")?.trim();
  if (!translation) throw new Error("Le service de traduction a renvoyé une réponse invalide.");

  const createdAt = new Date().toISOString();
  await db.prepare(`INSERT INTO editorial_comment_translations (
    id, comment_id, target_language, content, provider, report_count, created_at
  ) VALUES (?, ?, ?, ?, ?, 0, ?)`)
    .bind(crypto.randomUUID(), commentId, targetLanguage, translation, runtime.TRANSLATION_API_URL, createdAt)
    .run();

  return { targetLanguage, content: translation, reportCount: 0, cached: false };
}

export async function reportComment(commentId: string, kind: "comment" | "translation") {
  const db = await editorialDb();
  if (!db) throw new Error("Le service de signalement n’est pas encore disponible.");

  if (kind === "translation") {
    await db.prepare("UPDATE editorial_comment_translations SET report_count = report_count + 1 WHERE comment_id = ?").bind(commentId).run();
  } else {
    await db.batch([
      db.prepare("UPDATE editorial_comments SET report_count = report_count + 1, status = CASE WHEN status = 'published' THEN 'reported' ELSE status END, updated_at = ? WHERE id = ?").bind(new Date().toISOString(), commentId),
      db.prepare("INSERT INTO editorial_comment_reports (id, comment_id, kind, created_at) VALUES (?, ?, 'comment', ?)").bind(crypto.randomUUID(), commentId, new Date().toISOString()),
    ]);
  }
}

export async function savePublication(input: PublicationInput): Promise<EditorialPublication> {
  const db = await editorialDb();
  if (!db) throw new Error("La base éditoriale n’est pas encore disponible.");

  const createdAt = new Date().toISOString();
  const id = input.id?.trim() || input.slug;
  if (input.isFeatured) {
    await db.prepare("UPDATE editorial_publications SET is_featured = 0, updated_at = ? WHERE id != ? AND is_featured = 1")
      .bind(createdAt, id)
      .run();
  }
  await db.prepare(`INSERT INTO editorial_publications (
    id, slug, type, brand, status, title, excerpt, body, cover_image, gallery,
    location, starts_at, ends_at, published_at, scheduled_at, is_featured,
    comments_enabled, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    slug = excluded.slug, type = excluded.type, brand = excluded.brand, status = excluded.status,
    title = excluded.title, excerpt = excluded.excerpt, body = excluded.body,
    cover_image = excluded.cover_image, gallery = excluded.gallery, location = excluded.location,
    starts_at = excluded.starts_at, ends_at = excluded.ends_at, published_at = excluded.published_at,
    scheduled_at = excluded.scheduled_at, is_featured = excluded.is_featured,
    comments_enabled = excluded.comments_enabled, updated_at = excluded.updated_at`)
    .bind(
      id, input.slug, input.type, input.brand, input.status, input.title, input.excerpt,
      input.body, input.coverImage, JSON.stringify(input.gallery), input.location,
      input.startsAt, input.endsAt, input.publishedAt, input.scheduledAt,
      Number(input.isFeatured), Number(input.commentsEnabled), createdAt, createdAt,
    )
    .run();

  const publication = await getPublicationBySlug(input.slug, { includePrivate: true });
  if (!publication) throw new Error("La publication n’a pas pu être enregistrée.");
  return publication;
}

export async function listModerationComments(): Promise<EditorialComment[]> {
  const db = await editorialDb();
  if (!db) return [];

  const result = await db.prepare(`
    SELECT ${commentColumns}, t.content AS translationContent, t.target_language AS translationLanguage,
      t.report_count AS translationReportCount
    FROM editorial_comments c
    LEFT JOIN editorial_comment_translations t
      ON t.comment_id = c.id
      AND t.target_language = CASE WHEN c.language = 'fr' THEN 'en' ELSE 'fr' END
    ORDER BY CASE WHEN c.status IN ('reported', 'pending') THEN 0 ELSE 1 END, c.created_at DESC
    LIMIT 80
  `).all<CommentRow>();
  return result.results.map(toComment);
}

export async function moderateComment(id: string, change: { status?: CommentStatus; isPinned?: boolean }) {
  const db = await editorialDb();
  if (!db) throw new Error("La base éditoriale n’est pas encore disponible.");

  const now = new Date().toISOString();
  await db.prepare(`UPDATE editorial_comments SET
    status = COALESCE(?, status),
    is_pinned = COALESCE(?, is_pinned),
    updated_at = ?
    WHERE id = ?`)
    .bind(change.status ?? null, typeof change.isPinned === "boolean" ? Number(change.isPinned) : null, now, id)
    .run();
}

export async function replyAsEditorialTeam(input: { publicationId: string; parentId: string; content: string }) {
  const db = await editorialDb();
  if (!db) throw new Error("La base éditoriale n’est pas encore disponible.");

  const parent = await db.prepare("SELECT publication_id AS publicationId, parent_id AS parentId FROM editorial_comments WHERE id = ?").bind(input.parentId).first<{ publicationId: string; parentId: string | null }>();
  if (!parent || parent.publicationId !== input.publicationId || parent.parentId) throw new Error("Cette réponse ne peut pas être ajoutée.");

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const language = detectCommentLanguage(input.content);
  await db.prepare(`INSERT INTO editorial_comments (
    id, publication_id, parent_id, author_name, content, language, status,
    is_official, is_pinned, report_count, created_at, updated_at
  ) VALUES (?, ?, ?, 'Équipe Multiproduit Mali', ?, ?, 'published', 1, 0, 0, ?, ?)`)
    .bind(id, input.publicationId, input.parentId, input.content, language, createdAt, createdAt)
    .run();

  return id;
}
