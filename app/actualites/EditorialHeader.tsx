import Link from "../PlainLink";

import { BrandLogo } from "../BrandLogo";
import { HomePointer } from "../HomePointer";
import { MobileMenu } from "../MobileMenu";

const editorialNavigation = [
  ["Notre entreprise", "/#entreprise"],
  ["Nos marques", "/#marques"],
  ["Actualités", "/actualites", "Actualités & événements"],
  ["Contact", "/contact"],
] as const;

export function EditorialHeader() {
  return (
    <header className="site-header editorial-header">
      <Link className="wordmark wordmark--logo" href="/" aria-label="Multiproduit Mali, retour à l’accueil"><BrandLogo /></Link>
      <HomePointer />
      <nav className="desktop-nav" aria-label="Navigation principale">
        {editorialNavigation.map(([label, href]) => <Link href={href} key={href} aria-current={href === "/actualites" ? "page" : undefined}>{label}</Link>)}
      </nav>
      <MobileMenu navigation={editorialNavigation} />
    </header>
  );
}
