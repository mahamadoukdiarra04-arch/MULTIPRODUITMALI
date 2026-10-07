"use client";

import { useMemo, useState, type FormEvent } from "react";

import {
  brands,
  commentStatuses,
  commentStatusLabels,
  publicationStatuses,
  publicationStatusLabels,
  publicationTypes,
  publicationTypeLabels,
  type CommentStatus,
  type EditorialComment,
  type EditorialPublication,
  type PublicationStatus,
  type PublicationType,
} from "./types";
import { EditorialImpactPreview } from "./EditorialImpactPreview";
import { EditorialMediaUploader } from "./EditorialMediaUploader";

type BackOfficeProps = {
  initialPublications: EditorialPublication[];
  initialComments: EditorialComment[];
  displayName: string;
  previewOnly?: boolean;
};

function toInputDate(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createDraft(type: PublicationType = "activity"): EditorialPublication {
  const now = new Date().toISOString();
  return {
    id: "", slug: "", type, brand: "Multiproduit Mali", status: "draft", title: "", excerpt: "", body: "", coverImage: "", gallery: [], location: "", startsAt: null, endsAt: null, publishedAt: null, scheduledAt: null, isFeatured: false, commentsEnabled: true, commentCount: 0, createdAt: now, updatedAt: now,
  };
}

function statusClass(status: string) {
  return `back-office__status back-office__status--${status}`;
}

function galleryFromText(value: string) {
  return value.split(/\n+/).map((item) => item.trim()).filter(Boolean);
}

function publicationFingerprint(publication: EditorialPublication) {
  return JSON.stringify({
    slug: publication.slug,
    type: publication.type,
    brand: publication.brand,
    status: publication.status,
    title: publication.title,
    excerpt: publication.excerpt,
    body: publication.body,
    coverImage: publication.coverImage,
    gallery: publication.gallery,
    location: publication.location,
    startsAt: publication.startsAt,
    endsAt: publication.endsAt,
    publishedAt: publication.publishedAt,
    scheduledAt: publication.scheduledAt,
    isFeatured: publication.isFeatured,
    commentsEnabled: publication.commentsEnabled,
  });
}

function saveLabel(publication: EditorialPublication) {
  if (publication.status === "published") return publication.id ? "Mettre à jour le site" : "Publier sur le site";
  if (publication.status === "scheduled") return "Programmer la publication";
  if (publication.status === "review") return "Envoyer en relecture";
  if (publication.status === "archived") return "Enregistrer dans les archives";
  return publication.id ? "Enregistrer les modifications" : "Enregistrer le brouillon";
}

function statusGuidance(status: PublicationStatus) {
  switch (status) {
    case "published": return "Visible immédiatement dans le forum et accessible au public.";
    case "scheduled": return "Invisible jusqu’à la date de programmation choisie.";
    case "review": return "Réservé à l’équipe pendant la relecture.";
    case "archived": return "Visible dans les archives du forum.";
    default: return "Invisible du public, modifiable à tout moment.";
  }
}

function commentImpact(comment: EditorialComment) {
  if (comment.status === "hidden") return "Masqué du site";
  if (comment.status === "deleted") return "Retiré du site";
  if (comment.status === "pending") return "Invisible, en attente";
  if (comment.status === "reported") return "Masqué automatiquement, à vérifier";
  return comment.isPinned ? "Visible et épinglé en tête" : "Visible dans la discussion";
}

export function EditorialBackOffice({ initialPublications, initialComments, displayName, previewOnly = false }: BackOfficeProps) {
  const [publications, setPublications] = useState(initialPublications);
  const [comments, setComments] = useState(initialComments);
  const [selectedId, setSelectedId] = useState(initialPublications[0]?.id ?? "");
  const [draft, setDraft] = useState<EditorialPublication>(() => initialPublications[0] ?? createDraft());
  const [galleryText, setGalleryText] = useState(() => (initialPublications[0]?.gallery ?? []).join("\n"));
  const [message, setMessage] = useState("");
  const [publicationQuery, setPublicationQuery] = useState("");
  const [moderationView, setModerationView] = useState<"attention" | "all">("attention");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const selectedPublication = useMemo(
    () => publications.find((publication) => publication.id === selectedId) ?? null,
    [publications, selectedId],
  );
  const previewPublication = useMemo(
    () => ({ ...draft, gallery: galleryFromText(galleryText) }),
    [draft, galleryText],
  );
  const hasUnsavedChanges = useMemo(
    () => !selectedPublication || publicationFingerprint(previewPublication) !== publicationFingerprint(selectedPublication),
    [previewPublication, selectedPublication],
  );
  const readiness = useMemo(() => [
    { label: "Titre", ready: Boolean(draft.title.trim()) },
    { label: "Adresse web", ready: Boolean(draft.slug.trim()) },
    { label: "Couverture", ready: Boolean(draft.coverImage.trim()) },
    { label: "Résumé", ready: Boolean(draft.excerpt.trim()) },
    { label: "Contenu", ready: Boolean(draft.body.trim()) },
  ], [draft.body, draft.coverImage, draft.excerpt, draft.slug, draft.title]);
  const readyCount = readiness.filter((item) => item.ready).length;
  const publicationById = useMemo(
    () => new Map(publications.map((publication) => [publication.id, publication])),
    [publications],
  );
  const flaggedCount = useMemo(
    () => comments.filter((comment) => comment.status === "reported" || comment.status === "pending" || comment.reportCount > 0).length,
    [comments],
  );
  const visiblePublications = useMemo(() => {
    const query = publicationQuery.trim().toLocaleLowerCase();
    if (!query) return publications;
    return publications.filter((publication) => `${publication.title} ${publication.brand} ${publicationStatusLabels[publication.status]}`.toLocaleLowerCase().includes(query));
  }, [publicationQuery, publications]);
  const moderationComments = useMemo(
    () => moderationView === "all" ? comments : comments.filter((comment) => comment.status === "reported" || comment.status === "pending" || comment.reportCount > 0),
    [comments, moderationView],
  );

  function choosePublication(publication: EditorialPublication) {
    setSelectedId(publication.id);
    setDraft(publication);
    setGalleryText(publication.gallery.join("\n"));
    setMessage("");
  }

  function startNewPublication(type: PublicationType) {
    setSelectedId("");
    setDraft(createDraft(type));
    setGalleryText("");
    setMessage("");
    document.getElementById("editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function change<K extends keyof EditorialPublication>(key: K, value: EditorialPublication[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function changeTitle(title: string) {
    setDraft((current) => {
      const shouldGenerateSlug = !current.id && (!current.slug || current.slug === slugify(current.title));
      return { ...current, title, slug: shouldGenerateSlug ? slugify(title) : current.slug };
    });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewOnly) {
      setMessage("Aperçu local : les enregistrements sont désactivés. L’équipe peut publier depuis l’environnement sécurisé.");
      return;
    }
    setMessage("Enregistrement…");
    const publication = previewPublication;
    try {
      const response = await fetch("/api/actualites/admin", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ publication }) });
      const result = await response.json() as { publication?: EditorialPublication; error?: string };
      if (!response.ok || !result.publication) { setMessage(result.error ?? "L’enregistrement a échoué."); return; }
      setDraft(result.publication);
      setGalleryText(result.publication.gallery.join("\n"));
      setSelectedId(result.publication.id);
      setPublications((current) => {
        const exists = current.some((item) => item.id === result.publication!.id);
        return exists ? current.map((item) => item.id === result.publication!.id ? result.publication! : item) : [result.publication!, ...current];
      });
      setMessage(result.publication.status === "published"
        ? "Publication enregistrée et visible sur le site."
        : result.publication.status === "scheduled"
          ? "Publication enregistrée et programmée."
          : "Publication enregistrée. Elle reste invisible du public pour le moment.");
    } catch {
      setMessage("L’enregistrement a échoué. Vérifiez votre connexion puis réessayez.");
    }
  }

  async function moderate(comment: EditorialComment, changeSet: { status?: CommentStatus; isPinned?: boolean }) {
    if (previewOnly) { setMessage("Aperçu local : la modération est disponible dans l’environnement sécurisé."); return; }
    try {
      const response = await fetch(`/api/actualites/admin/comments/${comment.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(changeSet) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setMessage(result.error ?? "La modération a échoué."); return; }
      setComments((current) => current.map((item) => item.id === comment.id ? { ...item, ...changeSet } : item));
      const nextComment = { ...comment, ...changeSet };
      setMessage(`Commentaire mis à jour : ${commentImpact(nextComment).toLocaleLowerCase("fr-FR")}.`);
    } catch {
      setMessage("La modération a échoué. Vérifiez votre connexion puis réessayez.");
    }
  }

  async function sendReply(comment: EditorialComment) {
    if (reply.trim().length < 2) return;
    if (previewOnly) { setMessage("Aperçu local : les réponses officielles sont disponibles dans l’environnement sécurisé."); return; }
    try {
      const response = await fetch(`/api/actualites/admin/comments/${comment.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ publicationId: comment.publicationId, content: reply }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setMessage(result.error ?? "La réponse n’a pas été envoyée."); return; }
      setReply("");
      setReplyTo(null);
      setMessage("Réponse officielle publiée.");
    } catch {
      setMessage("La réponse n’a pas été envoyée. Vérifiez votre connexion puis réessayez.");
    }
  }

  return (
    <div className="back-office">
      <header className="back-office__intro">
        <div><p>ESPACE ÉQUIPE</p><h1>Bonjour, {displayName}.</h1><span>Préparez une publication, contrôlez son rendu sur chaque zone du site, puis publiez en toute confiance.</span></div>
        <div className="back-office__session">
          <div className="back-office__metrics" aria-label="Vue d’ensemble"><span><strong>{publications.length}</strong> publications</span><span><strong>{comments.length}</strong> commentaires</span><span><strong>{flaggedCount}</strong> à traiter</span></div>
          {!previewOnly ? <form action="/api/equipe/deconnexion" method="post"><button type="submit">Se déconnecter</button></form> : null}
        </div>
      </header>

      <nav className="back-office__shortcuts" aria-label="Actions rapides">
        <button type="button" onClick={() => startNewPublication("activity")}>+ Nouvelle actualité</button>
        <button type="button" onClick={() => startNewPublication("event")}>+ Nouvel événement</button>
        <a href="#editor">Écrire ou modifier</a>
        <a href="#impact-preview">Voir l’impact sur le site</a>
        <a href="#moderation">Gérer les commentaires <strong>{flaggedCount}</strong></a>
      </nav>
      {previewOnly ? <p className="back-office__notice" role="status">Aperçu local en lecture seule. Les publications et la modération sont protégées dans l’espace équipe.</p> : null}
      {message ? <p className="back-office__message" role="status">{message}</p> : null}

      <div className="back-office__layout">
        <aside className="back-office__list" aria-label="Vos publications">
          <div className="back-office__list-heading"><div><p>PUBLICATIONS</p><strong>Retrouvez ou préparez un contenu</strong></div></div>
          <label className="back-office__search">Rechercher une publication<input value={publicationQuery} onChange={(event) => setPublicationQuery(event.target.value)} placeholder="Titre, marque ou statut" /></label>
          <div className="back-office__publication-items">{visiblePublications.length ? visiblePublications.map((publication) => <button type="button" className={selectedId === publication.id ? "is-active" : ""} onClick={() => choosePublication(publication)} key={publication.id}><span className={statusClass(publication.status)}>{publicationStatusLabels[publication.status]}</span><strong>{publication.title}</strong><small>{publication.brand} · {publication.commentCount} commentaire{publication.commentCount === 1 ? "" : "s"}</small></button>) : <p className="back-office__empty">Aucune publication ne correspond à cette recherche.</p>}</div>
        </aside>

        <form className="back-office__editor" id="editor" onSubmit={save}>
          <header className="back-office__editor-heading">
            <div>
              <p>ÉDITEUR</p>
              <h2>{draft.id ? "Mettre à jour la publication" : "Préparer une publication"}</h2>
              <span>{readyCount}/5 éléments éditoriaux complétés</span>
            </div>
            <div className="back-office__editor-actions">
              <a href="#impact-preview">Prévisualiser</a>
              <button type="submit">{previewOnly ? "Tester l’aperçu" : saveLabel(draft)}</button>
            </div>
          </header>
          <div className="back-office__editor-body">
            <div className="back-office__fields">
              <section className="back-office__readiness" aria-label="État de préparation de la publication">
                <div>
                  <p>PRÊT À PUBLIER</p>
                  <strong>{readyCount === readiness.length ? "Tout est prêt" : `${readiness.length - readyCount} élément${readiness.length - readyCount === 1 ? "" : "s"} à compléter`}</strong>
                </div>
                <ul>
                  {readiness.map((item) => <li className={item.ready ? "is-ready" : ""} key={item.label}><i aria-hidden="true">{item.ready ? "✓" : "·"}</i>{item.label}</li>)}
                </ul>
              </section>
              <section className="back-office__form-section"><div><p>1. L’essentiel</p><span>Ces informations seront visibles par le public.</span></div><div className="back-office__field-grid">
                <label className="back-office__field--wide">Titre<input value={draft.title} onChange={(event) => changeTitle(event.target.value)} required maxLength={160} placeholder="Ex. Tropicoul au marché de Bamako" /></label>
                <label>Type<select value={draft.type} onChange={(event) => change("type", event.target.value as PublicationType)}>{publicationTypes.map((type) => <option value={type} key={type}>{publicationTypeLabels[type]}</option>)}</select></label>
                <label>Marque<select value={draft.brand} onChange={(event) => change("brand", event.target.value as EditorialPublication["brand"])}>{brands.map((brand) => <option value={brand} key={brand}>{brand}</option>)}</select></label>
                <label>Lieu<input value={draft.location} onChange={(event) => change("location", event.target.value)} maxLength={160} placeholder="Ex. Bamako, Mali" /></label>
                <label>Adresse web<input value={draft.slug} onChange={(event) => change("slug", slugify(event.target.value))} required maxLength={100} placeholder="Générée à partir du titre" /><small>Générée automatiquement, modifiable si besoin.</small></label>
                <label className="back-office__field--wide">Résumé<textarea value={draft.excerpt} onChange={(event) => change("excerpt", event.target.value)} maxLength={360} rows={3} placeholder="Le texte court qui présente la publication." /></label>
                <label className="back-office__field--wide">Contenu<textarea value={draft.body} onChange={(event) => change("body", event.target.value)} maxLength={12000} rows={10} placeholder="Le récit complet, les informations utiles et les éventuels liens." /></label>
              </div></section>

              <section className="back-office__form-section"><div><p>2. Visuels et vidéos</p><span>Ajoutez vos fichiers directement. Ils seront optimisés et hébergés dans l’espace médias.</span></div><div className="back-office__field-grid">
                <div className="back-office__field--wide">
                  <EditorialMediaUploader
                    coverImage={draft.coverImage}
                    gallery={galleryFromText(galleryText)}
                    disabled={previewOnly}
                    onCoverChange={(url) => change("coverImage", url)}
                    onGalleryChange={(urls) => setGalleryText(urls.join("\n"))}
                  />
                </div>
                <details className="back-office__media-advanced back-office__field--wide"><summary>Options avancées : utiliser des adresses de médias</summary><div className="back-office__field-grid">
                  <label className="back-office__field--wide">Adresse de la couverture<input value={draft.coverImage} onChange={(event) => change("coverImage", event.target.value)} required placeholder="/media/... ou https://..." /></label>
                  <label className="back-office__field--wide">Galerie — une adresse par ligne<textarea value={galleryText} onChange={(event) => setGalleryText(event.target.value)} rows={4} placeholder={"https://.../photo.jpg\nhttps://.../video.mp4"} /></label>
                </div></details>
              </div></section>

              <section className="back-office__form-section"><div><p>3. Diffusion et discussion</p><span>Choisissez le moment de publication et ouvrez les échanges si nécessaire.</span></div><div className="back-office__field-grid">
                <label>Statut<select value={draft.status} onChange={(event) => change("status", event.target.value as PublicationStatus)}>{publicationStatuses.map((status) => <option value={status} key={status}>{publicationStatusLabels[status]}</option>)}</select><small>{statusGuidance(draft.status)}</small></label>
                <label>Date de publication<input type="datetime-local" value={toInputDate(draft.publishedAt)} onChange={(event) => change("publishedAt", event.target.value ? new Date(event.target.value).toISOString() : null)} /></label>
                <label>Date de début<input type="datetime-local" value={toInputDate(draft.startsAt)} onChange={(event) => change("startsAt", event.target.value ? new Date(event.target.value).toISOString() : null)} /></label>
                <label>Date de fin<input type="datetime-local" value={toInputDate(draft.endsAt)} onChange={(event) => change("endsAt", event.target.value ? new Date(event.target.value).toISOString() : null)} /></label>
                <label className={`back-office__field--wide${draft.status === "scheduled" ? " is-emphasized" : ""}`}>Programmer la mise en ligne<input type="datetime-local" value={toInputDate(draft.scheduledAt)} onChange={(event) => change("scheduledAt", event.target.value ? new Date(event.target.value).toISOString() : null)} /><small>{draft.status === "scheduled" ? "Obligatoire : choisissez le jour et l’heure de mise en ligne." : "Ce champ sera utilisé uniquement avec le statut « Programmé »."}</small></label>
                <label className="back-office__checkbox"><input type="checkbox" checked={draft.isFeatured} onChange={(event) => change("isFeatured", event.target.checked)} /> Mettre cette publication à la une</label>
                <label className="back-office__checkbox"><input type="checkbox" checked={draft.commentsEnabled} onChange={(event) => change("commentsEnabled", event.target.checked)} /> Autoriser les commentaires</label>
              </div></section>
            </div>

            <EditorialImpactPreview publication={previewPublication} hasUnsavedChanges={hasUnsavedChanges} />
          </div>
        </form>
      </div>

      <section className="back-office__comments" id="moderation" aria-labelledby="moderation-title">
        <header>
          <div>
            <p>MODÉRATION</p>
            <h2 id="moderation-title">Décidez clairement de ce qui apparaît sur le site.</h2>
            <span>Chaque décision indique immédiatement son effet dans la discussion publique.</span>
          </div>
          <div className="back-office__moderation-filter" aria-label="Filtrer les commentaires">
            <button type="button" className={moderationView === "attention" ? "is-active" : ""} onClick={() => setModerationView("attention")}>À traiter <strong>{flaggedCount}</strong></button>
            <button type="button" className={moderationView === "all" ? "is-active" : ""} onClick={() => setModerationView("all")}>Tous <strong>{comments.length}</strong></button>
          </div>
        </header>
        <div className="back-office__comment-list">
          {moderationComments.length ? moderationComments.map((comment) => {
            const publication = publicationById.get(comment.publicationId);
            return (
              <article key={comment.id}>
                <header>
                  <strong>{comment.authorName}</strong>
                  {comment.isOfficial ? <b>ÉQUIPE MULTIPRODUIT MALI</b> : null}
                  <small>{comment.language.toUpperCase()} · {publication?.title ?? comment.publicationId}</small>
                  <span className={statusClass(comment.status)}>{commentStatusLabels[comment.status]}</span>
                </header>
                <p>{comment.content}</p>
                {comment.translation ? <aside><small>TRADUCTION AUTOMATIQUE · {comment.translation.targetLanguage.toUpperCase()}</small><p>{comment.translation.content}</p></aside> : null}
                <div className="back-office__comment-impact">
                  <small>IMPACT SUR LE SITE</small>
                  <strong>{commentImpact(comment)}</strong>
                  {publication ? <a href={`/actualites/${publication.slug}#discussion`} target="_blank" rel="noreferrer">Voir la discussion ↗</a> : null}
                </div>
                <div className="back-office__comment-actions">
                  <label>Décision<select value={comment.status} onChange={(event) => moderate(comment, { status: event.target.value as CommentStatus })}>{commentStatuses.map((status) => <option value={status} key={status}>{commentStatusLabels[status]}</option>)}</select></label>
                  <label><input type="checkbox" checked={comment.isPinned} onChange={(event) => moderate(comment, { isPinned: event.target.checked })} /> Épingler en tête</label>
                  {!comment.parentId ? <button type="button" onClick={() => setReplyTo(comment.id)}>Répondre avec le compte officiel</button> : null}
                </div>
                {replyTo === comment.id ? <div className="back-office__reply"><textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={3} placeholder="Réponse de l’équipe…" /><button type="button" onClick={() => sendReply(comment)}>Publier avec le badge officiel</button><button type="button" onClick={() => setReplyTo(null)}>Annuler</button></div> : null}
              </article>
            );
          }) : <p className="back-office__empty">{moderationView === "attention" ? "Aucun commentaire n’attend votre attention." : "Aucun commentaire pour le moment."}</p>}
        </div>
      </section>
    </div>
  );
}
