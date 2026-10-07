import Link from "./PlainLink";

import { BrandLogo } from "./BrandLogo";

const phone = "+223 76 41 43 49";
const phoneHref = "tel:+22376414349";
const whatsappHref = "https://wa.me/22376414349";
const email = "multiproduitmali@gmail.com";
const triplexFacebookHref = "https://www.facebook.com/share/1BkVFeKfJ9/";
const triplexTiktokHref = "https://www.tiktok.com/@triplex.mali?_r=1&_t=ZN-99vMifRheHW";
const tropicoulFacebookHref = "https://www.facebook.com/share/p/19nAASMHVk/";
const mapsHref = "https://share.google/WSOIbEkudPOsWalCF";
const mapsEmbedSrc = "https://www.google.com/maps?q=Multiproduit%20Mali%20Sarl&output=embed";

function SocialIcon({ network }: { network: "facebook" | "tiktok" | "whatsapp" | "mail" }) {
  if (network === "facebook") {
    return (
      <svg className="site-footer__social-icon site-footer__social-icon--facebook" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M13.6 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.5-1.5h1.8V3.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5v2H7v3.1h2.9v8h3.7Z" />
      </svg>
    );
  }

  if (network === "tiktok") {
    return (
      <svg className="site-footer__social-icon site-footer__social-icon--tiktok" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14.6 3.2c.5 1.7 1.6 3 3.4 3.6v3c-1.3 0-2.5-.4-3.4-1.1v6.6a5.2 5.2 0 1 1-4.5-5.1v3.1a2.1 2.1 0 1 0 1.4 2V3.2h3.1Z" fill="currentColor" />
        <path d="M10.1 10.2v3.1a2.1 2.1 0 0 0-1.4 2" fill="none" stroke="#25f4ee" strokeWidth="1.2" />
        <path d="M11.5 3.2v12.1a2.1 2.1 0 0 1-1.4 2" fill="none" stroke="#fe2c55" strokeWidth="1.2" />
      </svg>
    );
  }

  if (network === "mail") {
    return (
      <svg className="site-footer__social-icon site-footer__social-icon--mail" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3.5 6.2h17v11.6h-17V6.2Zm.8.6 7.7 6.1 7.7-6.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="site-footer__social-icon site-footer__social-icon--whatsapp" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.5a8.4 8.4 0 0 0-7.2 12.8L3.7 20.4l4.2-1.1A8.5 8.5 0 1 0 12 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.9 7.9c.2-.4.4-.4.7-.4h.4c.2 0 .4.1.5.4l.8 1.9c.1.3.1.5-.1.7l-.5.6c.5.9 1.2 1.6 2.2 2.1l.6-.5c.2-.2.5-.2.7-.1l1.9.9c.3.1.4.3.4.5v.3c0 .4-.2.7-.6.8-.5.2-1.1.3-1.6.1-2.6-.8-4.8-3-5.6-5.6-.2-.5-.1-1.1.1-1.7Z" fill="currentColor" />
    </svg>
  );
}

type SiteFooterProps = {
  productRangeHref?: string;
  productRangeLabel?: string;
};

export function SiteFooter({ productRangeHref, productRangeLabel }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <BrandLogo eager={false} />
        <strong>MULTIPRODUIT<br />MALI</strong>
      </div>
      <div>
        <p>EXPLORER</p>
        <Link href="/#entreprise">Notre entreprise</Link>
        <Link href="/#marques">Nos marques</Link>
        <Link href="/livraison">Livraison &amp; distribution</Link>
        <Link href="/actualites">Actualités &amp; événements</Link>
        {productRangeHref && productRangeLabel ? <Link href={productRangeHref}>{productRangeLabel}</Link> : null}
      </div>
      <div className="site-footer__contact">
        <p>CONTACT</p>
        <a href={phoneHref}>Tél. {phone}</a>
        <a className="site-footer__contact-link" href={whatsappHref} target="_blank" rel="noreferrer"><SocialIcon network="whatsapp" />Écrire sur WhatsApp ↗</a>
        <a className="site-footer__contact-link" href={`mailto:${email}`}><SocialIcon network="mail" />{email}</a>
      </div>
      <div className="site-footer__networks">
        <p>RÉSEAUX DES MARQUES</p>
        <section aria-label="Réseaux sociaux Triplex">
          <strong>TRIPLEX</strong>
          <a href={triplexFacebookHref} target="_blank" rel="noreferrer"><SocialIcon network="facebook" />Facebook Triplex ↗</a>
          <a href={triplexTiktokHref} target="_blank" rel="noreferrer"><SocialIcon network="tiktok" />TikTok Triplex ↗</a>
        </section>
        <section aria-label="Réseaux sociaux Tropicoul">
          <strong>TROPICOUL</strong>
          <a href={tropicoulFacebookHref} target="_blank" rel="noreferrer"><SocialIcon network="facebook" />Facebook Tropicoul ↗</a>
          <span><SocialIcon network="tiktok" />TikTok Tropicoul — à venir</span>
        </section>
      </div>
      <div className="site-footer__map">
        <p>NOUS TROUVER</p>
        <iframe title="Localisation Multiproduit Mali" src={mapsEmbedSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <a href={mapsHref} target="_blank" rel="noreferrer">Ouvrir dans Google Maps ↗</a>
      </div>
      <small>© 2026 Multiproduit Mali. Tous droits réservés.</small>
    </footer>
  );
}
