"use client";

/* eslint-disable @next/next/no-img-element -- editor previews accept a protected editorial image URL. */
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
    const publication = { ...draft, gallery: galleryText.split(/\n+/).map((item) => item.trim()).filter(Boolean) };
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
      setMessage("Publication enregistrée.");
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
      setMessage("Commentaire mis à jour.");
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
        <div><p>ESPACE ÉQUIPE</p><h1>Bonjour, {displayName}.</h1><span>Créez, programmez et modérez les actualités Multiproduit Mali depuis un seul espace.</span></div>
        <div className="back-office__metrics" aria-label="Vue d’ensemble"><span><strong>{publications.length}</strong> publications</span><span><strong>{comments.length}</strong> commentaires</span><span><strong>{flaggedCount}</strong> à traiter</span></div>
      </header>

      <nav className="back-office__shortcuts" aria-label="Actions rapides"><button type="button" onClick={() => startNewPublication("activity")}>+ Nouvelle actualité</button><button type="button" onClick={() => startNewPublication("event")}>+ Nouvel événement</button><a href="#moderation">Gérer les commentaires <strong>{flaggedCount}</strong></a></nav>
      {previewOnly ? <p className="back-office__notice" role="status">Aperçu local en lecture seule. Les publications et la modération sont protégées dans l’espace équipe.</p> : null}
      {message ? <p className="back-office__message" role="status">{message}</p> : null}

      <div className="back-office__layout">
        <aside className="back-office__list" aria-label="Vos publications">
          <div className="back-office__list-heading"><div><p>PUBLICATIONS</p><strong>Retrouvez ou préparez un contenu</strong></div></div>
          <label className="back-office__search">Rechercher une publication<input value={publicationQuery} onChange={(event) => setPublicationQuery(event.target.value)} placeholder="Titre, marque ou statut" /></label>
          <div className="back-office__publication-items">{visiblePublications.length ? visiblePublications.map((publication) => <button type="button" className={selectedId === publication.id ? "is-active" : ""} onClick={() => choosePublication(publication)} key={publication.id}><span className={statusClass(publication.status)}>{publicationStatusLabels[publication.status]}</span><strong>{publication.title}</strong><small>{publication.brand} · {publication.commentCount} commentaire{publication.commentCount === 1 ? "" : "s"}</small></button>) : <p className="back-office__empty">Aucune publication ne correspond à cette recherche.</p>}</div>
        </aside>

        <form className="back-office__editor" id="editor" onSubmit={save}>
          <header className="back-office__editor-heading"><div><p>ÉDITEUR</p><h2>{draft.id ? "Mettre à jour la publication" : "Préparer une publication"}</h2></div><button type="submit">{previewOnly ? "Tester l’aperçu" : "Enregistrer"}</button></header>
          <div className="back-office__editor-body">
            <div className="back-office__fields">
              <section className="back-office__form-section"><div><p>1. L’essentiel</p><span>Ces informations seront visibles par le public.</span></div><div className="back-office__field-grid">
                <label className="back-office__field--wide">Titre<input value={draft.title} onChange={(event) => changeTitle(event.target.value)} required maxLength={160} placeholder="Ex. Tropicoul au marché de Bamako" /></label>
                <label>Type<select value={draft.type} onChange={(event) => change("type", event.target.value as PublicationType)}>{publicationTypes.map((type) => <option value={type} key={type}>{publicationTypeLabels[type]}</option>)}</select></label>
                <label>Marque<select value={draft.brand} onChange={(event) => change("brand", event.target.value as EditorialPublication["brand"])}>{brands.map((brand) => <option value={brand} key={brand}>{brand}</option>)}</select></label>
                <label>Lieu<input value={draft.location} onChange={(event) => change("location", event.target.value)} maxLength={160} placeholder="Ex. Bamako, Mali" /></label>
                <label>Adresse web<input value={draft.slug} onChange={(event) => change("slug", slugify(event.target.value))} required maxLength={100} placeholder="Générée à partir du titre" /><small>Générée automatiquement, modifiable si besoin.</small></label>
                <label className="back-office__field--wide">Résumé<textarea value={draft.excerpt} onChange={(event) => change("excerpt", event.target.value)} maxLength={360} rows={3} placeholder="Le texte court qui présente la publication." /></label>
                <label className="back-office__field--wide">Contenu<textarea value={draft.body} onChange={(event) => change("body", event.target.value)} maxLength={12000} rows={10} placeholder="Le récit complet, les informations utiles et les éventuels liens." /></label>
              </div></section>

              <section className="back-office__form-section"><div><p>2. Visuels</p><span>Ajoutez la couverture, puis les images complémentaires si nécessaire.</span></div><div className="back-office__field-grid">
                <label className="back-office__field--wide">Image de couverture<input value={draft.coverImage} onChange={(event) => change("coverImage", event.target.value)} required placeholder="/media/... ou https://..." /><small>Utilisez une image horizontale nette, adaptée à la publication.</small></label>
                <label className="back-office__field--wide">Galerie — une image par ligne<textarea value={galleryText} onChange={(event) => setGalleryText(event.target.value)} rows={4} placeholder={"/media/photo-1.jpg\n/media/photo-2.jpg"} /></label>
              </div></section>

              <section className="back-office__form-section"><div><p>3. Diffusion et discussion</p><span>Choisissez le moment de publication et ouvrez les échanges si nécessaire.</span></div><div className="back-office__field-grid">
                <label>Statut<select value={draft.status} onChange={(event) => change("status", event.target.value as PublicationStatus)}>{publicationStatuses.map((status) => <option value={status} key={status}>{publicationStatusLabels[status]}</option>)}</select></label>
                <label>Date de publication<input type="datetime-local" value={toInputDate(draft.publishedAt)} onChange={(event) => change("publishedAt", event.target.value ? new Date(event.target.value).toISOString() : null)} /></label>
                <label>Date de début<input type="datetime-local" value={toInputDate(draft.startsAt)} onChange={(event) => change("startsAt", event.target.value ? new Date(event.target.value).toISOString() : null)} /></label>
                <label>Date de fin<input type="datetime-local" value={toInputDate(draft.endsAt)} onChange={(event) => change("endsAt", event.target.value ? new Date(event.target.value).toISOString() : null)} /></label>
                <label className="back-office__field--wide">Programmer la mise en ligne<input type="datetime-local" value={toInputDate(draft.scheduledAt)} onChange={(event) => change("scheduledAt", event.target.value ? new Date(event.target.value).toISOString() : null)} /><small>À utiliser avec le statut « Programmé ».</small></label>
                <label className="back-office__checkbox"><input type="checkbox" checked={draft.isFeatured} onChange={(event) => change("isFeatured", event.target.checked)} /> Mettre cette publication à la une</label>
                <label className="back-office__checkbox"><input type="checkbox" checked={draft.commentsEnabled} onChange={(event) => change("commentsEnabled", event.target.checked)} /> Autoriser les commentaires</label>
              </div></section>
            </div>

            <aside className="back-office__preview" aria-label="Aperçu de la publication"><p>APERÇU EN DIRECT</p><div className="back-office__preview-cover">{draft.coverImage ? <img src={draft.coverImage} alt="" /> : <span>Votre image de couverture apparaîtra ici.</span>}</div><span className={statusClass(draft.status)}>{publicationStatusLabels[draft.status]}</span><small>{publicationTypeLabels[draft.type]} · {draft.brand}</small><h3>{draft.title || "Titre de votre publication"}</h3><p>{draft.excerpt || "Le résumé s’affichera ici pour vérifier la longueur et la lisibilité."}</p><div><span>{draft.commentsEnabled ? "Discussion ouverte" : "Discussion fermée"}</span><span>{draft.isFeatured ? "Mise à la une" : "Publication standard"}</span></div></aside>
          </div>
        </form>
      </div>

      <section className="back-office__comments" id="moderation" aria-labelledby="moderation-title">
        <header><div><p>MODÉRATION</p><h2 id="moderation-title">Commentaires à garder sous contrôle.</h2></div><div className="back-office__moderation-filter" aria-label="Filtrer les commentaires"><button type="button" className={moderationView === "attention" ? "is-active" : ""} onClick={() => setModerationView("attention")}>À traiter <strong>{flaggedCount}</strong></button><button type="button" className={moderationView === "all" ? "is-active" : ""} onClick={() => setModerationView("all")}>Tous <strong>{comments.length}</strong></button></div></header>
        <div className="back-office__comment-list">{moderationComments.length ? moderationComments.map((comment) => <article key={comment.id}><header><strong>{comment.authorName}</strong>{comment.isOfficial ? <b>ÉQUIPE MULTIPRODUIT MALI</b> : null}<small>{comment.language.toUpperCase()} · {comment.publicationId}</small><span className={statusClass(comment.status)}>{commentStatusLabels[comment.status]}</span></header><p>{comment.content}</p>{comment.translation ? <aside><small>TRADUCTION AUTOMATIQUE · {comment.translation.targetLanguage.toUpperCase()}</small><p>{comment.translation.content}</p></aside> : null}<div className="back-office__comment-actions"><label>Décision<select value={comment.status} onChange={(event) => moderate(comment, { status: event.target.value as CommentStatus })}>{commentStatuses.map((status) => <option value={status} key={status}>{commentStatusLabels[status]}</option>)}</select></label><label><input type="checkbox" checked={comment.isPinned} onChange={(event) => moderate(comment, { isPinned: event.target.checked })} /> Épingler</label>{!comment.parentId ? <button type="button" onClick={() => setReplyTo(comment.id)}>Répondre</button> : null}</div>{replyTo === comment.id ? <div className="back-office__reply"><textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={3} placeholder="Réponse de l’équipe…" /><button type="button" onClick={() => sendReply(comment)}>Publier avec le badge officiel</button><button type="button" onClick={() => setReplyTo(null)}>Annuler</button></div> : null}</article>) : <p className="back-office__empty">{moderationView === "attention" ? "Aucun commentaire n’attend votre attention." : "Aucun commentaire pour le moment."}</p>}</div>
      </section>
    </div>
  );
}
