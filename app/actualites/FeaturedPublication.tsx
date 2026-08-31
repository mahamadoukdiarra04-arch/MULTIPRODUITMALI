import { EditorialCard } from "./EditorialCard";
import type { EditorialPublication } from "./types";

export function FeaturedPublication({ publication }: { publication: EditorialPublication }) {
  return (
    <aside className="purpose-featured" aria-label="Publication mise à la une du forum Multiproduit Mali">
      <p className="purpose-featured__label">Publication à la une <span>Forum &amp; actualités</span></p>
      <EditorialCard publication={publication} featured />
    </aside>
  );
}
