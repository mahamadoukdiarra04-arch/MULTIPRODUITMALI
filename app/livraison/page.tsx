import { BrandLogo } from "../BrandLogo";
import { MobileMenu } from "../MobileMenu";
import Link from "../PlainLink";
import { ScrollAtmosphere } from "../ScrollAtmosphere";
import { SiteExperienceLoader } from "../SiteExperienceLoader";
import { SiteFooter } from "../SiteFooter";

const navigation = [
  ["Notre entreprise", "/#entreprise"],
  ["Nos marques", "/#marques"],
  ["Livraison", "/livraison"],
  ["Actualités", "/actualites", "Actualités & événements"],
  ["Contact", "/contact"],
] as const;

const fleet = [
  {
    image: "/media/mpm/delivery/fleet-tropicoul-truck.jpg",
    alt: "Camion de livraison Tropicoul aux couleurs des différents parfums de la marque.",
    label: "Flotte Tropicoul",
  },
  {
    image: "/media/mpm/delivery/fleet-triplex-front.png",
    alt: "Camion de livraison Triplex photographié de face et de côté.",
    label: "Flotte Triplex",
  },
  {
    image: "/media/mpm/delivery/fleet-triplex-rear.png",
    alt: "Vue arrière d'un camion de livraison Triplex sur le terrain.",
    label: "Triplex sur le terrain",
  },
] as const;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function DeliveryPage() {
  return (
    <main id="main-content" className="delivery-page">
      <SiteExperienceLoader />
      <ScrollAtmosphere />

      <header className="site-header">
        <Link className="wordmark wordmark--logo" href="/" aria-label="Multiproduit Mali, retour à l’accueil">
          <BrandLogo />
        </Link>

        <nav className="desktop-nav" aria-label="Navigation principale">
          {navigation.map(([label, href, title]) => (
            <Link href={href} key={href} aria-current={href === "/livraison" ? "page" : undefined} title={title}>
              {label}
            </Link>
          ))}
        </nav>

        <MobileMenu navigation={navigation} />
      </header>

      <section className="delivery-page__hero" aria-labelledby="delivery-page-title">
        <div className="delivery-page__copy">
          <p className="section-kicker">NOTRE SERVICE</p>
          <h1 id="delivery-page-title">Livraison &amp; distribution.</h1>
          <p>
            Multiproduit Mali s’appuie sur sa propre flotte, aux couleurs de ses marques,
            pour accompagner l’approvisionnement de ses partenaires.
          </p>
          <a className="button-link" href="https://wa.me/22376414349" target="_blank" rel="noreferrer">
            Écrire sur WhatsApp <Arrow />
          </a>
        </div>
        <figure className="delivery-page__hero-image">
          <img
            src="/media/mpm/delivery/fleet-triplex-front-alt.png"
            alt="Camion de livraison Triplex aux couleurs de la marque."
          />
        </figure>
      </section>

      <section className="delivery-page__fleet" aria-labelledby="fleet-title">
        <div className="delivery-page__fleet-heading">
          <p className="section-kicker">NOS MOYENS</p>
          <h2 id="fleet-title">Une distribution qui va jusqu’à vous.</h2>
          <p>
            Nos camions aux couleurs de Tropicoul et Triplex témoignent de notre présence
            sur le terrain.
          </p>
        </div>

        <div className="delivery-page__fleet-grid">
          {fleet.map((item) => (
            <figure key={item.image}>
              <img src={item.image} alt={item.alt} loading="lazy" />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="delivery-page__contact" aria-labelledby="delivery-contact-title">
        <div>
          <p className="section-kicker">PARLONS ENSEMBLE</p>
          <h2 id="delivery-contact-title">Un besoin de livraison&nbsp;?</h2>
        </div>
        <p>Notre équipe est disponible pour échanger sur vos besoins professionnels.</p>
        <Link className="button-link" href="/contact?source=delivery-page">
          Nous contacter <Arrow />
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
