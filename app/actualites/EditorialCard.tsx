/* eslint-disable @next/next/no-img-element -- publication covers can be supplied from the protected editorial media source. */
import Link from "next/link";

import { EditorialMeta } from "./EditorialMeta";
import type { EditorialPublication } from "./types";

export function EditorialCard({ publication, featured = false }: { publication: EditorialPublication; featured?: boolean }) {
  return (
    <article className={`editorial-card${featured ? " editorial-card--featured" : ""}`}>
      <Link className="editorial-card__image" href={`/actualites/${publication.slug}`} aria-label={`Lire : ${publication.title}`}>
        <img src={publication.coverImage} alt="" loading={featured ? "eager" : "lazy"} decoding="async" />
        {featured ? <span className="editorial-card__forum-word" aria-hidden="true">FORUM</span> : null}
      </Link>
      <div className="editorial-card__copy">
        <p>{publication.brand}</p>
        <EditorialMeta publication={publication} compact />
        <h3><Link href={`/actualites/${publication.slug}`}>{publication.title}</Link></h3>
        <span>{publication.excerpt}</span>
        <Link className="text-link" href={`/actualites/${publication.slug}`}>{featured ? "Lire et participer" : "Lire la publication"} <i aria-hidden="true">↗</i></Link>
      </div>
    </article>
  );
}
