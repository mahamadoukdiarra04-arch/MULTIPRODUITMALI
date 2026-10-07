import { getProductUniverseStories, getProductUniverseSupportingStories } from "./product-universe-gallery";
import Link from "./PlainLink";
import { findProduct, type Product } from "./products";

type VimtoFormatsProps = { product: Product };

export function VimtoFormats({ product }: VimtoFormatsProps) {
  const sparklingProduct = findProduct("vimto-sparkling");
  const syrupProduct = findProduct("vimto-sirop");
  const maltProduct = findProduct("vimto-malt");
  if (!sparklingProduct || !syrupProduct || !maltProduct) return null;

  // The shared gallery must always be based on the core Vimto range, rather
  // than on the page currently being viewed (Sparkling, Sirop or Malt).
  const stories = getProductUniverseStories("vimto-sparkling");
  const supportingStories = getProductUniverseSupportingStories("vimto-sparkling");
  const syrup = stories.find((story) => story.order === 2);
  const family = stories.find((story) => story.order === 1);
  const syrupOnly = supportingStories.find((story) => story.id === "vimto-bottle-lantern");

  const cards = [
    {
      id: "sparkling",
      eyebrow: "Vimto Sparkling",
      title: "L’icône rouge",
      format: "Canette 330 ml",
      href: "/produits/vimto-sparkling",
      slug: sparklingProduct.slug,
      src: sparklingProduct.packshotWebp,
      avif: sparklingProduct.packshotAvif,
      alt: sparklingProduct.packshotAlt ?? "Canette Vimto Sparkling 330 ml, vue de face.",
      className: "vimto-format-card--packshot",
      width: sparklingProduct.packshotWidth ?? 2048,
      height: sparklingProduct.packshotHeight ?? 2048,
    },
    {
      id: "original",
      eyebrow: "Vimto Sirop",
      title: "Le goût historique se verse",
      format: "Bouteille en verre · sirop",
      href: "/produits/vimto-sirop",
      slug: syrupProduct.slug,
      src: syrupOnly?.src ?? syrup?.src ?? syrupProduct.packshotWebp,
      avif: syrupOnly?.avif ?? syrup?.avif ?? syrupProduct.packshotAvif,
      alt: syrupOnly?.alt ?? syrup?.alt ?? syrupProduct.packshotAlt ?? "Bouteille en verre de sirop Vimto dans un décor chaleureux.",
      className: "vimto-format-card--original",
      width: syrupOnly?.width ?? syrup?.width ?? 1440,
      height: syrupOnly?.height ?? syrup?.height ?? 941,
    },
    {
      id: "malt",
      eyebrow: "Vimto Malt",
      title: "Une identité plus intense",
      format: "Canette 330 ml",
      href: "/produits/vimto-malt",
      slug: maltProduct.slug,
      src: maltProduct.packshotWebp,
      avif: maltProduct.packshotAvif,
      alt: maltProduct.packshotAlt ?? "Canette noire Vimto Malt 330 ml, vue de face.",
      className: "vimto-format-card--packshot vimto-format-card--malt",
      width: maltProduct.packshotWidth ?? 2048,
      height: maltProduct.packshotHeight ?? 2048,
    },
    {
      id: "family",
      eyebrow: "La gamme",
      title: "À chacun son format",
      format: "Voir les formats et les saveurs",
      href: "/gammes/vimto",
      slug: "vimto-range",
      src: family?.src ?? sparklingProduct.lifestyleWebp ?? sparklingProduct.lifestyle,
      avif: family?.avif ?? sparklingProduct.lifestyleAvif,
      alt: family?.alt ?? "Différents formats de la gamme Vimto réunis sur glace.",
      className: "vimto-format-card--family",
      width: family?.width ?? 1440,
      height: family?.height ?? 941,
    },
  ];

  return (
    <section className="vimto-formats" id="vimto-formats" data-product-section="formats" aria-labelledby="vimto-formats-title">
      <header className="vimto-formats__header">
        <div>
          <p>VIMTO / LA GAMME</p>
          <h2 id="vimto-formats-title">Plusieurs formats,<br />un même esprit.</h2>
        </div>
        <span>De la canette Sparkling à la bouteille de sirop, sans oublier Vimto Malt : chaque expression garde le goût qui rassemble.</span>
      </header>
      <div className="vimto-formats__grid">
        {cards.map((card) => (
          <Link className={`vimto-format-card ${card.className}`} href={card.href} key={card.id} aria-current={card.slug === product.slug ? "page" : undefined}>
            <picture className="vimto-format-card__media">
              <img src={card.src} alt={card.alt} width={card.width} height={card.height} loading="lazy" decoding="async" />
            </picture>
            <div className="vimto-format-card__copy">
              <p>{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <span>{card.format} <b aria-hidden="true">↗</b></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
