export const publicationTypes = ["activity", "event", "partnership"] as const;
export const publicationStatuses = ["draft", "review", "scheduled", "published", "archived"] as const;
export const commentStatuses = ["published", "pending", "reported", "hidden", "deleted"] as const;
export const brands = ["Multiproduit Mali", "Tropicoul", "Triplex", "Vimto"] as const;

export type PublicationType = (typeof publicationTypes)[number];
export type PublicationStatus = (typeof publicationStatuses)[number];
export type CommentStatus = (typeof commentStatuses)[number];
export type Brand = (typeof brands)[number];
export type CommentLanguage = "fr" | "en";

export type EditorialPublication = {
  id: string;
  slug: string;
  type: PublicationType;
  brand: Brand;
  status: PublicationStatus;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  gallery: string[];
  location: string;
  startsAt: string | null;
  endsAt: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  isFeatured: boolean;
  commentsEnabled: boolean;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type EditorialComment = {
  id: string;
  publicationId: string;
  parentId: string | null;
  authorName: string;
  content: string;
  language: CommentLanguage;
  status: CommentStatus;
  isOfficial: boolean;
  isPinned: boolean;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  translation: CommentTranslation | null;
  replies: EditorialComment[];
};

export type CommentTranslation = {
  targetLanguage: CommentLanguage;
  content: string;
  reportCount: number;
};

export const publicationTypeLabels: Record<PublicationType, string> = {
  activity: "Activité",
  event: "Événement",
  partnership: "Partenariat",
};

export const publicationStatusLabels: Record<PublicationStatus, string> = {
  draft: "Brouillon",
  review: "À relire",
  scheduled: "Programmé",
  published: "Publié",
  archived: "Archivé",
};

export const commentStatusLabels: Record<CommentStatus, string> = {
  published: "Publié",
  pending: "En attente",
  reported: "Signalé",
  hidden: "Masqué",
  deleted: "Supprimé",
};
