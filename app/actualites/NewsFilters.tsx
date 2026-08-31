"use client";

import { useMemo, useState } from "react";

import { EditorialCard } from "./EditorialCard";
import type { Brand, EditorialPublication, PublicationType } from "./types";

const categories: Array<["all" | PublicationType, string]> = [["all", "Tout"], ["activity", "Activités"], ["event", "Événements"], ["partnership", "Partenariats"]];
const brands: Array<["all" | Brand, string]> = [["all", "Toutes les marques"], ["Tropicoul", "Tropicoul"], ["Triplex", "Triplex"], ["Vimto", "Vimto"], ["Multiproduit Mali", "Multiproduit Mali"]];

export function NewsFilters({ publications }: { publications: EditorialPublication[] }) {
  const [category, setCategory] = useState<(typeof categories)[number][0]>("all");
  const [brand, setBrand] = useState<(typeof brands)[number][0]>("all");
  const filtered = useMemo(() => publications.filter((publication) => (category === "all" || publication.type === category) && (brand === "all" || publication.brand === brand)), [brand, category, publications]);

  return (
    <section className="news-filtered" aria-labelledby="all-publications-title">
      <div className="news-filtered__heading"><p>TOUTES LES PUBLICATIONS</p><h2 id="all-publications-title">Suivre les histoires de Multiproduit Mali.</h2></div>
      <div className="news-filters"><div role="group" aria-label="Filtrer par catégorie">{categories.map(([value, label]) => <button type="button" key={value} onClick={() => setCategory(value)} aria-pressed={category === value}>{label}</button>)}</div><div role="group" aria-label="Filtrer par marque">{brands.map(([value, label]) => <button type="button" key={value} onClick={() => setBrand(value)} aria-pressed={brand === value}>{label}</button>)}</div></div>
      <div className="editorial-card-grid">{filtered.length ? filtered.map((publication) => <EditorialCard publication={publication} key={publication.id} />) : <p className="news-filtered__empty">Aucune publication ne correspond à ces filtres.</p>}</div>
    </section>
  );
}
