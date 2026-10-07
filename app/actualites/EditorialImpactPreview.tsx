"use client";

/* eslint-disable @next/next/no-img-element -- the editorial preview accepts protected media URLs entered by the team. */
import { useState } from "react";

import {
  publicationStatusLabels,
  publicationTypeLabels,
  type EditorialPublication,
} from "./types";

type PreviewMode = "forum" | "article" | "home";
type PreviewDevice = "desktop" | "mobile";

type EditorialImpactPreviewProps = {
  publication: EditorialPublication;
  hasUnsavedChanges: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const previewModes: ReadonlyArray<{ id: PreviewMode; label: string }> = [
  { id: "forum", label: "Dans le forum" },
  { id: "article", label: "Page complète" },
  { id: "home", label: "Sur l’accueil" },
];

function publicationDate(publication: EditorialPublication) {
  const value = publication.startsAt ?? publication.publishedAt ?? publication.scheduledAt;
  if (!value) return "Date à définir";
  return dateFormatter.format(new Date(value));
}

function statusImpact(publication: EditorialPublication) {
  switch (publication.status) {
    case "published":
      return "La publication sera visible immédiatement dans le forum.";
    case "scheduled":
      return publication.scheduledAt
        ? `La publication sera mise en ligne le ${dateFormatter.format(new Date(publication.scheduledAt))}.`
        : "Ajoutez une date de programmation avant l’enregistrement.";
    case "archived":
      return "La publication restera accessible dans les archives du forum.";
    case "review":
      return "La publication restera invisible du public pendant la relecture.";
    default:
      return "Le brouillon restera invisible du public.";
  }
}

function PreviewImage({ publication }: { publication: EditorialPublication }) {
  return publication.coverImage
    ? <img src={publication.coverImage} alt="" />
    : <span>Ajoutez une image de couverture pour voir le rendu.</span>;
}

function ForumPreview({ publication }: { publication: EditorialPublication }) {
  return (
    <article className="impact-preview-card">
      <div className="impact-preview-card__image"><PreviewImage publication={publication} /></div>
      <div className="impact-preview-card__copy">
        <p>{publication.brand}</p>
        <small>{publicationTypeLabels[publication.type]} · {publicationDate(publication)}</small>
        <h3>{publication.title || "Titre de votre publication"}</h3>
        <span>{publication.excerpt || "Le résumé apparaîtra ici dans la liste des actualités."}</span>
        <strong>Lire la publication ↗</strong>
      </div>
    </article>
  );
}

function ArticlePreview({ publication }: { publication: EditorialPublication }) {
  const paragraphs = publication.body.split(/\n{2,}/).filter(Boolean).slice(0, 2);

  return (
    <article className="impact-preview-article">
      <header>
        <PreviewImage publication={publication} />
        <div>
          <p>{publication.brand}</p>
          <h3>{publication.title || "Titre de votre publication"}</h3>
          <span>{publication.excerpt || "Le résumé introduira la publication."}</span>
        </div>
      </header>
      <div className="impact-preview-article__body">
        <main>
          {paragraphs.length
            ? paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            : <p>Le contenu complet apparaîtra ici, avec les paragraphes et les informations pratiques.</p>}
        </main>
        <aside>
          <small>INFORMATIONS PRATIQUES</small>
          <strong>{publication.location || "Lieu à définir"}</strong>
          <span>{publicationDate(publication)}</span>
        </aside>
      </div>
      <footer>{publication.commentsEnabled ? "Discussion ouverte" : "Discussion fermée"}</footer>
    </article>
  );
}

function HomePreview({ publication }: { publication: EditorialPublication }) {
  return (
    <article className={`impact-preview-home${publication.isFeatured ? " is-featured" : ""}`}>
      <div>
        <p>ACTUALITÉS &amp; DISCUSSIONS</p>
        <h3>Les marques se vivent aussi ici.</h3>
      </div>
      {publication.isFeatured ? (
        <section>
          <div><PreviewImage publication={publication} /></div>
          <small>À LA UNE · {publication.brand}</small>
          <strong>{publication.title || "Titre de votre publication"}</strong>
          <span>Lire et participer ↗</span>
        </section>
      ) : (
        <section className="impact-preview-home__empty">
          <strong>Cette publication ne remplacera pas le contenu à la une.</strong>
          <span>Activez « Mettre cette publication à la une » pour voir son impact sur l’accueil.</span>
        </section>
      )}
    </article>
  );
}

export function EditorialImpactPreview({ publication, hasUnsavedChanges }: EditorialImpactPreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("article");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const isPublic = publication.status === "published" || publication.status === "archived";
  const articleHref = publication.slug ? `/actualites/${publication.slug}` : "/actualites";

  return (
    <aside className="back-office-impact" id="impact-preview" aria-labelledby="impact-preview-title">
      <header>
        <div>
          <p>IMPACT SUR LE SITE</p>
          <h3 id="impact-preview-title">Voyez le résultat avant de publier.</h3>
        </div>
        <span className={hasUnsavedChanges ? "is-dirty" : "is-saved"}>
          {hasUnsavedChanges ? "Modifications non enregistrées" : "Version enregistrée"}
        </span>
      </header>

      <div className="back-office-impact__toolbar">
        <div aria-label="Zone du site à prévisualiser">
          {previewModes.map((previewMode) => (
            <button
              type="button"
              aria-pressed={mode === previewMode.id}
              onClick={() => setMode(previewMode.id)}
              key={previewMode.id}
            >
              {previewMode.label}
            </button>
          ))}
        </div>
        <div aria-label="Format de prévisualisation">
          <button type="button" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}>Ordinateur</button>
          <button type="button" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}>Mobile</button>
        </div>
      </div>

      <div className={`back-office-impact__stage back-office-impact__stage--${device}`}>
        <div className="back-office-impact__browser-bar"><i /><i /><i /><span>multiproduitmali.com</span></div>
        <div className="back-office-impact__viewport">
          {mode === "forum" ? <ForumPreview publication={publication} /> : null}
          {mode === "article" ? <ArticlePreview publication={publication} /> : null}
          {mode === "home" ? <HomePreview publication={publication} /> : null}
        </div>
      </div>

      <div className="back-office-impact__summary">
        <div>
          <small>VISIBILITÉ</small>
          <strong>{publicationStatusLabels[publication.status]}</strong>
          <span>{statusImpact(publication)}</span>
        </div>
        <div>
          <small>ACCUEIL DU SITE</small>
          <strong>{publication.isFeatured ? "À la une" : "Sans changement"}</strong>
          <span>{publication.isFeatured ? "Cette publication deviendra la publication mise en avant." : "La publication à la une actuelle sera conservée."}</span>
        </div>
        <div>
          <small>DISCUSSION</small>
          <strong>{publication.commentsEnabled ? "Ouverte" : "Fermée"}</strong>
          <span>{publication.commentsEnabled ? "Les visiteurs pourront commenter et répondre." : "Les commentaires resteront visibles, sans nouvel ajout."}</span>
        </div>
      </div>

      <footer>
        <a href="/actualites" target="_blank" rel="noreferrer">Voir le forum actuel ↗</a>
        {isPublic && publication.id ? <a href={articleHref} target="_blank" rel="noreferrer">Voir la page publiée ↗</a> : null}
      </footer>
    </aside>
  );
}
