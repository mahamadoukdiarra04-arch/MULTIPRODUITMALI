import type { EditorialPublication } from "./types";
import { publicationStatusLabels, publicationTypeLabels } from "./types";

export function formatEditorialDate(value: string | null, withTime = false) {
  if (!value) return "Date à confirmer";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

export function statusForPublication(publication: EditorialPublication) {
  if (publication.type === "event" && publication.startsAt && new Date(publication.startsAt) > new Date()) return "À venir";
  return publicationStatusLabels[publication.status];
}

export function EditorialMeta({ publication, compact = false }: { publication: EditorialPublication; compact?: boolean }) {
  return (
    <div className={`editorial-meta${compact ? " editorial-meta--compact" : ""}`}>
      <span>{publicationTypeLabels[publication.type]}</span>
      <span>{formatEditorialDate(publication.startsAt ?? publication.publishedAt)}</span>
      {publication.location ? <span>{publication.location}</span> : null}
      <span className="editorial-status">{statusForPublication(publication)}</span>
      <span>{publication.commentCount} commentaire{publication.commentCount === 1 ? "" : "s"}</span>
    </div>
  );
}
