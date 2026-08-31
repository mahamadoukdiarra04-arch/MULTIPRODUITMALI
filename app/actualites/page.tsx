import type { Metadata } from "next";

import { listPublications } from "../../db/editorial";
import { EditorialCard } from "./EditorialCard";
import { EditorialFooter } from "./EditorialFooter";
import { EditorialHeader } from "./EditorialHeader";
import { NewsFilters } from "./NewsFilters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Actualités & événements | Multiproduit Mali",
  description: "Les actualités, événements et rencontres de Tropicoul, Triplex, Vimto et Multiproduit Mali.",
};

export default async function NewsPage() {
  const publications = await listPublications();
  const featured = publications.find((publication) => publication.isFeatured) ?? publications[0];
  const now = new Date();
  const upcoming = publications.filter((publication) => publication.type === "event" && publication.startsAt && new Date(publication.startsAt) >= now);
  const activities = publications.filter((publication) => publication.type === "activity" && publication.id !== featured?.id).slice(0, 3);
  const pastEvents = publications.filter((publication) => publication.type === "event" && publication.startsAt && new Date(publication.startsAt) < now);
  const archives = publications.filter((publication) => publication.status === "archived");

  return (
    <div className="editorial-page">
      <EditorialHeader />
      <main id="main-content">
        <section className="editorial-hero"><p>ACTUALITÉS &amp; ÉVÉNEMENTS</p><h1>Les marques Multiproduit Mali vivent aussi en dehors de la canette.</h1><span>Découvrez nos rencontres, nos événements et les histoires qui rapprochent Tropicoul, Triplex, Vimto et leurs publics.</span></section>
        {featured ? <section className="news-feature" aria-labelledby="featured-title"><div className="news-feature__intro"><p>À LA UNE</p><h2 id="featured-title">À ne pas manquer.</h2><span>Une sélection d’informations utiles, de rendez-vous et de moments à partager.</span></div><EditorialCard publication={featured} featured /></section> : null}
        {upcoming.length ? <section className="editorial-rail" aria-labelledby="upcoming-title"><div><p>ÉVÉNEMENTS À VENIR</p><h2 id="upcoming-title">Nos prochains rendez-vous.</h2></div><div className="editorial-card-grid editorial-card-grid--two">{upcoming.map((publication) => <EditorialCard publication={publication} key={publication.id} />)}</div></section> : null}
        {activities.length ? <section className="editorial-rail editorial-rail--dark" aria-labelledby="activities-title"><div><p>DERNIÈRES ACTIVITÉS</p><h2 id="activities-title">Ce qui se passe sur le terrain.</h2></div><div className="editorial-card-grid editorial-card-grid--three">{activities.map((publication) => <EditorialCard publication={publication} key={publication.id} />)}</div></section> : null}
        <NewsFilters publications={publications} />
        {pastEvents.length ? <section className="editorial-rail" aria-labelledby="past-events-title"><div><p>ÉVÉNEMENTS PASSÉS</p><h2 id="past-events-title">En images et en souvenirs.</h2></div><div className="editorial-card-grid editorial-card-grid--two">{pastEvents.map((publication) => <EditorialCard publication={publication} key={publication.id} />)}</div></section> : null}
        {archives.length ? <section className="editorial-archives" aria-labelledby="archives-title"><p>ARCHIVES</p><h2 id="archives-title">Les rendez-vous à retrouver.</h2><div>{archives.map((publication) => <EditorialCard publication={publication} key={publication.id} />)}</div></section> : null}
      </main>
      <EditorialFooter />
    </div>
  );
}
