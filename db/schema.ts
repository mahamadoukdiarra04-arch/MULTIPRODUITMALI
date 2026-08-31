import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const editorialPublications = sqliteTable(
  "editorial_publications",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    type: text("type").notNull(),
    brand: text("brand").notNull(),
    status: text("status").notNull().default("draft"),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    body: text("body").notNull().default(""),
    coverImage: text("cover_image").notNull().default(""),
    gallery: text("gallery").notNull().default("[]"),
    location: text("location").notNull().default(""),
    startsAt: text("starts_at"),
    endsAt: text("ends_at"),
    publishedAt: text("published_at"),
    scheduledAt: text("scheduled_at"),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    commentsEnabled: integer("comments_enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_editorial_publications_slug").on(table.slug),
    index("idx_editorial_publications_status_published_at").on(table.status, table.publishedAt),
    index("idx_editorial_publications_type_brand").on(table.type, table.brand),
  ],
);

export const editorialComments = sqliteTable(
  "editorial_comments",
  {
    id: text("id").primaryKey(),
    publicationId: text("publication_id").notNull(),
    parentId: text("parent_id"),
    authorName: text("author_name").notNull(),
    content: text("content").notNull(),
    language: text("language").notNull(),
    status: text("status").notNull().default("published"),
    isOfficial: integer("is_official", { mode: "boolean" }).notNull().default(false),
    isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
    reportCount: integer("report_count").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("idx_editorial_comments_publication_created").on(table.publicationId, table.createdAt),
    index("idx_editorial_comments_status_created").on(table.status, table.createdAt),
    index("idx_editorial_comments_parent").on(table.parentId),
  ],
);

export const editorialCommentTranslations = sqliteTable(
  "editorial_comment_translations",
  {
    id: text("id").primaryKey(),
    commentId: text("comment_id").notNull(),
    targetLanguage: text("target_language").notNull(),
    content: text("content").notNull(),
    provider: text("provider").notNull(),
    reportCount: integer("report_count").notNull().default(0),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("idx_editorial_comment_translations_comment_language").on(table.commentId, table.targetLanguage),
  ],
);

export const editorialCommentReports = sqliteTable(
  "editorial_comment_reports",
  {
    id: text("id").primaryKey(),
    commentId: text("comment_id").notNull(),
    kind: text("kind").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("idx_editorial_comment_reports_comment").on(table.commentId)],
);

export const contactRequests = sqliteTable(
  "contact_requests",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    name: text("name").notNull(),
    company: text("company").notNull().default(""),
    role: text("role").notNull().default(""),
    country: text("country").notNull().default(""),
    city: text("city").notNull().default(""),
    brands: text("brands").notNull().default("[]"),
    flavours: text("flavours").notNull().default("[]"),
    collaborationType: text("collaboration_type").notNull().default(""),
    preferredChannel: text("preferred_channel").notNull(),
    email: text("email").notNull().default(""),
    phone: text("phone").notNull().default(""),
    message: text("message").notNull().default(""),
    source: text("source").notNull().default(""),
    emailDelivery: text("email_delivery").notNull().default("pending"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("idx_contact_requests_kind_created").on(table.kind, table.createdAt),
    index("idx_contact_requests_delivery_created").on(table.emailDelivery, table.createdAt),
  ],
);
