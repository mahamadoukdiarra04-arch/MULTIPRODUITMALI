import { listPublications } from "../db/editorial";
import Link from "./PlainLink";
import { BrandLogo } from "./BrandLogo";
import { BrandTriptych } from "./BrandTriptych";
import { FeaturedPublication } from "./actualites/FeaturedPublication";
import { HeroShowcase } from "./HeroShowcase";
import { MobileMenu } from "./MobileMenu";
import { ProductExplorer } from "./ProductExplorer";
import { ScrollAtmosphere } from "./ScrollAtmosphere";
import { SiteExperienceLoader } from "./SiteExperienceLoader";

const navigation = [
  ["Notre entreprise", "#entreprise"],
  ["Nos marques", "#marques"],
  ["Actualités", "/actualites", "Actualités & événements"],
  ["Contact", "/contact"],
] as const;

const Arrow = () => <span aria-hidden="true">↗</span>;

export default async function Home() {
  const publications = await listPublications();
  const featuredPublication = publications.find((publication) => publication.isFeatured) ?? publications[0];

  return (
    <main id="main-content">
      <SiteExperienceLoader />
      <ScrollAtmosphere />
      <header className="site-header">
        <a className="wordmark wordmark--logo" href="#accueil" aria-label="Multiproduit Mali, retour à l’accueil">
          <BrandLogo />
        </a>

        <nav className="desktop-nav" aria-label="Navigation principale">
          {navigation.map(([label, href]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>

        <MobileMenu navigation={navigation} />
      </header>

      <HeroShowcase />

      <section className="company-intro" id="entreprise">
        <div className="company-intro__heading">
          <p className="section-kicker">NOTRE ENTREPRISE</p>
          <div>
            <h2>Trois marques. Trois façons de se faire plaisir.</h2>
            <p>
              Tropicoul apporte l’évasion fruitée, Triplex accompagne les journées qui s’accélèrent et Vimto Sparkling rassemble autour de son goût pétillant.
            </p>
          </div>
        </div>
        <BrandTriptych />
        <Link className="text-link company-intro__cta" href="/contact">Nous contacter <Arrow /></Link>
      </section>

      <section className="brands" id="marques">
        <div className="section-heading section-heading--light">
          <p className="section-kicker">NOS MARQUES</p>
          <h2>À chaque envie, sa canette.</h2>
        </div>
        <ProductExplorer />
      </section>

      <section className="purpose">
        <div className="purpose__word" aria-hidden="true">FORUM</div>
        <div className="purpose__copy">
          <p className="section-kicker">ACTUALITÉS &amp; DISCUSSIONS</p>
          <h2>Les marques se vivent aussi ici.</h2>
          <p>Le forum Multiproduit Mali réunit nos actualités, nos événements et les échanges autour de Tropicoul, Triplex et Vimto. Découvrez la publication à la une, puis rejoignez la conversation sans créer de compte.</p>
          <Link className="purpose__forum-cta" href="/actualites">
            <span>Le forum Multiproduit Mali</span>
            <strong>Accéder aux actualités <i aria-hidden="true">↗</i></strong>
          </Link>
        </div>
        {featuredPublication ? <FeaturedPublication publication={featuredPublication} /> : null}
      </section>

      <section className="contact-cta">
        <div>
          <p className="section-kicker">PARLONS ENSEMBLE</p>
          <h2>Envie de faire découvrir nos boissons ?</h2>
        </div>
        <Link className="button-link" href="/contact?mode=partnership&source=home-contact">Construire un partenariat <Arrow /></Link>
      </section>

      <footer className="site-footer">
        <div className="site-footer__brand">
          <BrandLogo />
          <strong>MULTIPRODUIT<br />MALI</strong>
        </div>
        <div>
          <p>EXPLORER</p>
          <a href="#entreprise">Notre entreprise</a>
          <a href="#marques">Nos marques</a>
          <Link href="/actualites">Actualités &amp; événements</Link>
        </div>
        <div>
          <p>CONTACT</p>
          <Link href="/contact">Écrire à l’équipe</Link>
          <a href="#accueil">Retour en haut ↑</a>
        </div>
        <small>© 2026 Multiproduit Mali. Tous droits réservés.</small>
      </footer>
    </main>
  );
}
