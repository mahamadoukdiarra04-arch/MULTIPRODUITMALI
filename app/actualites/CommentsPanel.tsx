"use client";

import { useMemo, useState, type FormEvent } from "react";

import type { EditorialComment } from "./types";

type CommentsPanelProps = {
  publicationSlug: string;
  commentsEnabled: boolean;
  invitation: string;
  initialComments: EditorialComment[];
};

type SubmitState = "idle" | "sending" | "error";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "M";
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function replaceComment(comments: EditorialComment[], id: string, update: (comment: EditorialComment) => EditorialComment): EditorialComment[] {
  return comments.map((comment) => comment.id === id
    ? update(comment)
    : { ...comment, replies: comment.replies.map((reply) => reply.id === id ? update(reply) : reply) });
}

function addReply(comments: EditorialComment[], parentId: string, reply: EditorialComment) {
  return comments.map((comment) => comment.id === parentId ? { ...comment, replies: [...comment.replies, reply] } : comment);
}

function CommentForm({ onSubmit, compact = false }: { onSubmit: (payload: { authorName: string; content: string }) => Promise<void>; compact?: boolean }) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");
    try {
      await onSubmit({ authorName, content });
      setContent("");
      if (!compact) setAuthorName("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Votre commentaire n’a pas pu être publié.");
    } finally {
      setState("idle");
    }
  }

  return (
    <form className={`comment-form${compact ? " comment-form--reply" : ""}`} onSubmit={submit}>
      <label>Nom ou pseudonyme<input value={authorName} onChange={(event) => setAuthorName(event.target.value)} minLength={2} maxLength={60} required /></label>
      <label>Votre commentaire<textarea value={content} onChange={(event) => setContent(event.target.value)} minLength={2} maxLength={1500} rows={compact ? 3 : 5} required /></label>
      {error ? <p className="comment-form__error" role="alert">{error}</p> : null}
      <button type="submit" disabled={state === "sending"}>{state === "sending" ? "Publication…" : "Publier"}</button>
    </form>
  );
}

function CommentItem({ comment, onReply, onTranslate, onReport }: {
  comment: EditorialComment;
  onReply: (comment: EditorialComment) => void;
  onTranslate: (comment: EditorialComment) => Promise<void>;
  onReport: (comment: EditorialComment, kind: "comment" | "translation") => Promise<void>;
}) {
  const [translationVisible, setTranslationVisible] = useState(Boolean(comment.translation));
  const [originalVisible, setOriginalVisible] = useState(true);
  const [error, setError] = useState("");
  const [translating, setTranslating] = useState(false);
  const target = comment.language === "fr" ? "anglais" : "français";

  async function translate() {
    setTranslating(true);
    setError("");
    try {
      await onTranslate(comment);
      setTranslationVisible(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "La traduction est indisponible.");
    } finally {
      setTranslating(false);
    }
  }

  async function report(kind: "comment" | "translation") {
    setError("");
    try {
      await onReport(comment, kind);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Le signalement est indisponible.");
    }
  }

  return (
    <article className={`comment${comment.parentId ? " comment--reply" : ""}`}>
      <div className="comment__avatar" aria-hidden="true">{initials(comment.authorName)}</div>
      <div className="comment__body">
        <header>
          <strong>{comment.authorName}</strong>
          {comment.isOfficial ? <b>ÉQUIPE MULTIPRODUIT MALI</b> : null}
          <small>{comment.language.toUpperCase()} · {displayDate(comment.createdAt)}</small>
        </header>
        {originalVisible ? <p className="comment__original">{comment.content}</p> : null}
        {translationVisible && comment.translation ? <div className="comment__translation"><span>Traduction automatique · {comment.translation.targetLanguage.toUpperCase()}</span><p>{comment.translation.content}</p></div> : null}
        <div className="comment__actions">
          {comment.translation ? <button type="button" onClick={() => setTranslationVisible((visible) => !visible)}>{translationVisible ? "Masquer la traduction" : `Traduire en ${target}`}</button> : <button type="button" onClick={translate} disabled={translating}>{translating ? "Traduction…" : `Traduire en ${target}`}</button>}
          {comment.translation ? <button type="button" onClick={() => setOriginalVisible((visible) => !visible)}>{originalVisible ? "Masquer l’original" : "Afficher l’original"}</button> : null}
          <button type="button" onClick={() => onReply(comment)} disabled={Boolean(comment.parentId)}>Répondre</button>
          <button type="button" onClick={() => report("comment")}>Signaler</button>
          {comment.translation ? <button type="button" onClick={() => report("translation")}>Signaler la traduction</button> : null}
        </div>
        {error ? <p className="comment__error" role="alert">{error}</p> : null}
      </div>
    </article>
  );
}

export function CommentsPanel({ publicationSlug, commentsEnabled, invitation, initialComments }: CommentsPanelProps) {
  const [comments, setComments] = useState(initialComments);
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const [replyTo, setReplyTo] = useState<EditorialComment | null>(null);
  const [status, setStatus] = useState("");
  const count = useMemo(() => comments.reduce((total, comment) => total + 1 + comment.replies.length, 0), [comments]);

  async function postComment(payload: { authorName: string; content: string }, parentId?: string) {
    const response = await fetch(`/api/actualites/${publicationSlug}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, parentId }),
    });
    const result = await response.json() as { comment?: EditorialComment; error?: string };
    if (!response.ok || !result.comment) throw new Error(result.error ?? "Votre commentaire n’a pas pu être publié.");
    setComments((current) => parentId ? addReply(current, parentId, result.comment!) : order === "newest" ? [result.comment!, ...current] : [...current, result.comment!]);
    setStatus("Votre commentaire est publié.");
  }

  async function refresh(nextOrder: "newest" | "oldest") {
    setOrder(nextOrder);
    const response = await fetch(`/api/actualites/${publicationSlug}/comments?order=${nextOrder}`, { cache: "no-store" });
    const result = await response.json() as { comments?: EditorialComment[]; error?: string };
    if (response.ok && result.comments) setComments(result.comments);
    else setStatus(result.error ?? "Les commentaires ne peuvent pas être actualisés pour le moment.");
  }

  async function translate(comment: EditorialComment) {
    const response = await fetch(`/api/actualites/comments/${comment.id}/translation`, { method: "POST" });
    const result = await response.json() as { translation?: EditorialComment["translation"]; error?: string };
    if (!response.ok || !result.translation) throw new Error(result.error ?? "La traduction est indisponible.");
    setComments((current) => replaceComment(current, comment.id, (item) => ({ ...item, translation: result.translation! })));
  }

  async function report(comment: EditorialComment, kind: "comment" | "translation") {
    const response = await fetch(`/api/actualites/comments/${comment.id}/report`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Le signalement est indisponible.");
    setStatus(kind === "translation" ? "La traduction a été signalée à l’équipe." : "Le commentaire a été signalé à l’équipe.");
  }

  return (
    <section className="comments-panel" id="discussion" aria-labelledby="discussion-title">
      <div className="comments-panel__heading"><div><p>DISCUSSION</p><h2 id="discussion-title">{invitation}</h2><span>{count} commentaire{count === 1 ? "" : "s"}</span></div>{commentsEnabled ? <a href="#comment-form">Ajouter un commentaire</a> : null}</div>
      {status ? <p className="comments-panel__status" role="status">{status}</p> : null}
      {commentsEnabled ? <div id="comment-form"><CommentForm onSubmit={(payload) => postComment(payload)} /></div> : <p className="comments-panel__closed">Cette discussion est fermée.</p>}
      <div className="comments-panel__sort" aria-label="Tri des commentaires"><span>Trier</span><button type="button" onClick={() => refresh("newest")} aria-pressed={order === "newest"}>Plus récents</button><button type="button" onClick={() => refresh("oldest")} aria-pressed={order === "oldest"}>Plus anciens</button></div>
      <div className="comments-list">
        {comments.length ? comments.map((comment) => <div className="comment-thread" key={comment.id}><CommentItem comment={comment} onReply={setReplyTo} onTranslate={translate} onReport={report} />{replyTo?.id === comment.id ? <div className="comment-reply-form"><p>Répondre à {comment.authorName}</p><CommentForm compact onSubmit={async (payload) => { await postComment(payload, comment.id); setReplyTo(null); }} /><button type="button" onClick={() => setReplyTo(null)}>Annuler</button></div> : null}{comment.replies.map((reply) => <CommentItem comment={reply} onReply={setReplyTo} onTranslate={translate} onReport={report} key={reply.id} />)}</div>) : <p className="comments-panel__empty">Soyez la première personne à partager votre avis.</p>}
      </div>
    </section>
  );
}
