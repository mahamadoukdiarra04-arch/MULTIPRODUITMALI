import type { CSSProperties } from "react";
import Link from "next/link";

import { findProduct } from "../../products";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = findProduct(slug);

  if (!product) {
    return (
      <main className="product-not-found">
        <Link href="/#marques">← Retour aux produits</Link>
        <h1>Ce produit n’est pas disponible.</h1>
      </main>
    );
  }

  const productTheme = {
    "--product-accent": product.accent,
    "--product-deep": product.deep,
    "--product-soft": product.soft,
  } as CSSProperties;

  return (
    <main className="product-page" style={productTheme}>
      <header className="product-page__header">
        <Link className="wordmark" href="/" aria-label="Simpara Distribution, accueil">
          <span className="wordmark__stamp">S</span>
          <span>
            <strong>SIMPARA</strong>
            <small>DISTRIBUTION</small>
          </span>
        </Link>
        <nav aria-label="Navigation produit">
          <Link href="/#marques">Toutes les saveurs</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        <Link className="product-page__back" href="/#marques">← Retour</Link>
      </header>

      <section className="product-hero">
        <div className={`product-hero__visual${product.packshot ? " product-hero__visual--packshot" : ""}`}>
          <img src={product.image} alt={`${product.brand} ${product.name}`} fetchPriority="high" />
          <span>{product.brand}</span>
        </div>

        <div className="product-hero__copy">
          <p className="product-hero__tags">{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</p>
          <h1>{product.headline}</h1>
          <Link className="product-button" href="#formule">Découvrir la saveur <b aria-hidden="true">↓</b></Link>
          <div
            className={`product-hero__mini${product.packshot ? " product-hero__mini--packshot" : ""}`}
            aria-label={`${product.brand} ${product.name}`}
          >
            <img src={product.image} alt="" />
            <span>{product.name}</span>
          </div>
        </div>
      </section>

      <section className="product-story" id="formule">
        <p>{product.description}</p>
        <aside>
          <span>{product.benefitTitle}</span>
          <strong>{product.benefit}</strong>
          <Link href="/#contact">Nous contacter <b aria-hidden="true">↗</b></Link>
        </aside>
      </section>
    </main>
  );
}
