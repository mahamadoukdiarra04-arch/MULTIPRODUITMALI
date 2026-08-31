import Link from "../PlainLink";

import { BrandLogo } from "../BrandLogo";

export function EditorialFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand"><BrandLogo /><strong>MULTIPRODUIT<br />MALI</strong></div>
      <div><p>EXPLORER</p><Link href="/#entreprise">Notre entreprise</Link><Link href="/#marques">Nos marques</Link><Link href="/actualites">Actualités &amp; événements</Link></div>
      <div><p>CONTACT</p><Link href="/contact">Écrire à l’équipe</Link><Link href="/">Retour à l’accueil ↑</Link></div>
      <small>© 2026 Multiproduit Mali. Tous droits réservés.</small>
    </footer>
  );
}
