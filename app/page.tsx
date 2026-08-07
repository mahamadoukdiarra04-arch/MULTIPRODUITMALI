const navigation = [
  ["Notre entreprise", "#entreprise"],
  ["Nos marques", "#marques"],
  ["Actualités", "#actualites"],
  ["Contact", "#contact"],
] as const;

const news = [
  {
    type: "Distribution",
    title: "Simpara se rapproche des lieux de vie qui font vibrer la ville.",
    image: "/media/simpara/tropicoul/mangue/mangue-market.png",
  },
  {
    type: "Marques",
    title: "Tropicoul : des recettes fruitées à partager à tout moment.",
    image: "/media/simpara/tropicoul/cocktail/cocktail-market.png",
  },
  {
    type: "Communauté",
    title: "Triplex accompagne les défis qui font avancer toute une génération.",
    image: "/media/simpara/triplex/triplex-champions.png",
  },
];

const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  return (
    <main>
      <ScrollAtmosphere />
      <header className="site-header">
        <a className="wordmark" href="#accueil" aria-label="Simpara Distribution, accueil">
          <span className="wordmark__stamp">S</span>
          <span>
            <strong>SIMPARA</strong>
            <small>DISTRIBUTION</small>
          </span>
        </a>

        <nav className="desktop-nav" aria-label="Navigation principale">
          {navigation.map(([label, href]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a href="#contact">FR</a>
          <a className="header-actions__search" href="#actualites" aria-label="Rechercher sur le site">
            <span aria-hidden="true">⌕</span>
          </a>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Ouvrir la navigation"><i /><i /></summary>
          <nav aria-label="Navigation mobile">
            {navigation.map(([label, href]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
          </nav>
        </details>
      </header>

      <section className="hero" id="accueil">
        <div className="hero__copy">
          <p className="eyebrow">SIMPARA DISTRIBUTION — AFRIQUE DE L&apos;OUEST</p>
          <h1>Des boissons qui créent des moments.</h1>
          <p className="hero__lead">
            Nous distribuons des marques généreuses, colorées et proches des gens pour accompagner chaque instant de la journée.
          </p>
          <a className="text-link" href="#entreprise">
            Découvrir Simpara <Arrow />
          </a>
        </div>

        <div className="hero__visual" aria-label="Tropicoul Ananas">
          <div className="hero__disc">GOÛTER<br />PARTAGER<br />RECOMMENCER</div>
          <img
            src="/media/simpara/tropicoul/ananas/ananas-hero.png"
            alt="Boisson Tropicoul Ananas"
            fetchPriority="high"
          />
          <p className="hero__caption">Tropicoul<br /><em>Le fruit au cœur</em></p>
        </div>
      </section>

      <section className="company-intro" id="entreprise">
        <p className="section-kicker">NOTRE ENTREPRISE</p>
        <div>
          <h2>Une énergie locale, distribuée avec exigence.</h2>
          <p>
            Simpara Distribution rend les boissons Tropicoul et Triplex accessibles là où les rencontres, les efforts et les célébrations se vivent vraiment.
          </p>
          <a className="text-link" href="#marques">En savoir plus <Arrow /></a>
        </div>
        <div className="company-intro__image">
          <img src="/media/simpara/triplex/triplex-work.png" alt="Univers Triplex" loading="lazy" />
        </div>
      </section>

      <section className="brands" id="marques">
        <div className="section-heading section-heading--light">
          <p className="section-kicker">NOS MARQUES</p>
          <h2>Une réponse pour chaque moment.</h2>
          <a className="text-link" href="#marques">Découvrir les produits <Arrow /></a>
        </div>
        <ProductExplorer />
      </section>

      <section className="news" id="actualites">
        <div className="section-heading">
          <p className="section-kicker">À LA UNE</p>
          <h2>Les histoires qui animent Simpara.</h2>
          <a className="text-link" href="#contact">Toutes les actualités <Arrow /></a>
        </div>
        <div className="news-grid">
          {news.map((item) => (
            <article className="news-card" key={item.title}>
              <img src={item.image} alt="" loading="lazy" />
              <p>{item.type}</p>
              <h3>{item.title}</h3>
              <a href="#contact" aria-label={`Lire : ${item.title}`}><Arrow /></a>
            </article>
          ))}
        </div>
      </section>

      <section className="purpose">
        <div className="purpose__word">ENSEMBLE</div>
        <div className="purpose__copy">
          <p className="section-kicker">NOTRE RAISON D&apos;ÊTRE</p>
          <h2>Faire circuler la fraîcheur, l&apos;optimisme et les possibilités.</h2>
          <a className="text-link" href="#contact">Ce qui nous anime <Arrow /></a>
        </div>
        <img src="/media/simpara/tropicoul/goyave/goyave-lifestyle.png" alt="Moment de partage Tropicoul" loading="lazy" />
      </section>

      <section className="contact-cta" id="contact">
        <div>
          <p className="section-kicker">TRAVAILLONS ENSEMBLE</p>
          <h2>Votre prochain moment Simpara commence ici.</h2>
        </div>
        <a className="button-link" href="mailto:contact@simpara-distribution.com">Nous contacter <Arrow /></a>
      </section>

      <footer className="site-footer">
        <div className="site-footer__brand">
          <span className="wordmark__stamp">S</span>
          <strong>SIMPARA<br />DISTRIBUTION</strong>
        </div>
        <div>
          <p>EXPLORER</p>
          <a href="#entreprise">Notre entreprise</a>
          <a href="#marques">Nos marques</a>
          <a href="#actualites">Actualités</a>
        </div>
        <div>
          <p>RESTONS EN CONTACT</p>
          <a href="mailto:contact@simpara-distribution.com">contact@simpara-distribution.com</a>
          <a href="#accueil">Retour en haut ↑</a>
        </div>
        <small>© 2026 Simpara Distribution. Tous droits réservés.</small>
      </footer>
    </main>
  );
}
import { ProductExplorer } from "./ProductExplorer";
import { ScrollAtmosphere } from "./ScrollAtmosphere";
