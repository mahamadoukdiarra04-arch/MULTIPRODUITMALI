import type { Metadata } from "next";
import Image from "next/image";

import Link from "../../PlainLink";
import { BrandLogo } from "../../BrandLogo";
import { HomePointer } from "../../HomePointer";
import { EditorialFooter } from "../../actualites/EditorialFooter";
import { products } from "../../products";

const brandLabels = {
  tropicoul: "Tropicoul",
  vimto: "Vimto",
} as const;

type BrandKey = keyof typeof brandLabels;
type RangePageProps = { params: Promise<{ brand: string }> };

function getBrand(value: string): BrandKey | null {
  return value === "tropicoul" || value === "vimto" ? value : null;
}

export async function generateMetadata({ params }: RangePageProps): Promise<Metadata> {
  const { brand: value } = await params;
  const brand = getBrand(value);
  const label = brand ? brandLabels[brand] : "Gamme";
  return {
    title: `${label} | Multiproduit Mali`,
    description: `Découvrez toute la gamme ${label} proposée par Multiproduit Mali.`,
  };
}

export default async function BrandRangePage({ params }: RangePageProps) {
  const { brand: value } = await params;
  const brand = getBrand(value);
  if (!brand) {
    return (
      <main className="range-not-found" id="main-content">
        <h1>Cette gamme n’est pas disponible.</h1>
        <Link href="/#marques">Voir les produits</Link>
      </main>
    );
  }

  const label = brandLabels[brand];
  const rangeProducts = products.filter((product) => product.brand === (brand === "tropicoul" ? "Tropicoul" : "Vimto") && product.publicationStatus === "published");

  return (
    <div className={`range-page range-page--${brand}`}>
      <header className="range-page__header">
        <Link className="wordmark wordmark--logo" href="/" aria-label="Multiproduit Mali, retour à l’accueil"><BrandLogo /></Link>
        <HomePointer />
        <nav aria-label="Navigation de la gamme"><Link href="/#marques">Nos produits</Link><Link href="/contact?mode=partnership&source=range">Contact</Link></nav>
      </header>
      <main id="main-content">
        <section className="range-page__hero">
          <p className="section-kicker">LA GAMME</p>
          <h1>{label}</h1>
          <p>{brand === "tropicoul" ? "Des saveurs fruitées, généreuses et colorées à choisir selon chaque envie." : "Canette Sparkling, bouteille de sirop et Malt : plusieurs formats, un même goût Vimto à partager."}</p>
        </section>
        <section className="range-page__grid" aria-labelledby="range-products-title">
          <div className="range-page__intro"><p className="section-kicker">À DÉCOUVRIR</p><h2 id="range-products-title">Toute la gamme {label}</h2></div>
          <div className="range-page__products">
            {rangeProducts.map((product) => (
              <Link className={`range-page__card range-page__card--${product.slug}`} href={`/produits/${product.slug}`} key={product.slug}>
                <div className="range-page__card-media"><Image src={product.packshot} alt={product.packshotAlt ?? `${product.brand} ${product.name}`} width={product.packshotWidth ?? 2048} height={product.packshotHeight ?? 2048} sizes="(max-width: 720px) 70vw, 28vw" /></div>
                <p>{product.brand} · {product.formatLabel ?? "Canette 330 ml"}</p><h3>{product.name}</h3><span>Découvrir le produit <b aria-hidden="true">↗</b></span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <EditorialFooter />
    </div>
  );
}
