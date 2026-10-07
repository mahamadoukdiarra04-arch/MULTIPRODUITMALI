/* eslint-disable @next/next/no-img-element, jsx-a11y/media-has-caption -- editorial videos can be published before an optional caption file is supplied. */
import type { Metadata } from "next";
import Link from "../../PlainLink";
import { notFound } from "next/navigation";

import { getPublicationBySlug, listComments } from "../../../db/editorial";
import { CommentsPanel } from "../CommentsPanel";
import { EditorialFooter } from "../EditorialFooter";
import { EditorialHeader } from "../EditorialHeader";
import { EditorialMeta, formatEditorialDate } from "../EditorialMeta";
import { isVideoMedia } from "../media";

type PublicationPageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

function discussionInvitation(type: string, startsAt: string | null) {
  if (type === "event" && startsAt && new Date(startsAt) > new Date()) return "Une question sur cet événement ?";
  if (type === "activity") return "Que pensez-vous de cette initiative ?";
  if (type === "event") return "Partagez votre expérience";
  return "Rejoignez la discussion";
}

export async function generateMetadata({ params }: PublicationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);
  if (!publication) return { title: "Publication introuvable | Multiproduit Mali", robots: { index: false, follow: false } };
  return {
    title: `${publication.title} | Multiproduit Mali`,
    description: publication.excerpt,
    openGraph: { title: publication.title, description: publication.excerpt, images: [publication.coverImage], type: "article" },
  };
}

export default async function PublicationPage({ params }: PublicationPageProps) {
  const { slug } = await params;
  const publication = await getPublicationBySlug(slug);
  if (!publication) notFound();
  const comments = await listComments(publication.id).catch(() => []);
  const paragraphs = publication.body.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="editorial-page editorial-detail-page">
      <EditorialHeader />
      <main id="main-content">
        <section className="publication-hero">
          <img src={publication.coverImage} alt="" fetchPriority="high" />
          <div className="publication-hero__veil" />
          <div className="publication-hero__copy"><Link href="/actualites">← Toutes les actualités</Link><p>{publication.brand}</p><h1>{publication.title}</h1><span>{publication.excerpt}</span><EditorialMeta publication={publication} /></div>
        </section>
        <section className="publication-content"><article><p className="section-kicker">{publication.brand} · {publication.type === "event" ? "RENDEZ-VOUS" : "ACTUALITÉ"}</p>{paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</article><aside className="publication-practical"><p>INFORMATIONS PRATIQUES</p>{publication.location ? <div><span>Lieu</span><strong>{publication.location}</strong></div> : null}{publication.startsAt ? <div><span>{publication.type === "event" ? "Date" : "Publié le"}</span><strong>{formatEditorialDate(publication.startsAt, publication.type === "event")}</strong></div> : null}{publication.endsAt ? <div><span>Fin</span><strong>{formatEditorialDate(publication.endsAt, true)}</strong></div> : null}<Link className="button-link" href={"/contact?source=actualite-" + publication.slug}>Nous écrire <i aria-hidden="true">↗</i></Link><a className="publication-practical__discussion" href="#discussion">Participer à la discussion ↓</a></aside></section>
        {publication.gallery.length ? <section className="publication-gallery" aria-labelledby="gallery-title"><div><p>GALERIE</p><h2 id="gallery-title">L’histoire en images.</h2></div><div>{publication.gallery.map((media, index) => <figure key={`${media}-${index}`}>{isVideoMedia(media) ? <video src={media} controls preload="metadata" aria-label={`Vidéo ${index + 1} de ${publication.title}`} /> : <img src={media} alt={`Visuel ${index + 1} de ${publication.title}`} loading="lazy" decoding="async" />}</figure>)}</div></section> : null}
        <CommentsPanel publicationSlug={publication.slug} commentsEnabled={publication.commentsEnabled} invitation={discussionInvitation(publication.type, publication.startsAt)} initialComments={comments} />
      </main>
      <EditorialFooter />
    </div>
  );
}
