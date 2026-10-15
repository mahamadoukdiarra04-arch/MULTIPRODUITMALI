import type { CSSProperties } from "react";

import { CatalogueTurntable } from "./CatalogueTurntable";
import { products } from "./products";

const publishedProducts = products.filter((product) => product.publicationStatus === "published" && product.showInCarousel !== false);
const continuousProducts = [...publishedProducts, ...publishedProducts];
const editorialTilts = [-6, 5, -4, 6, -5, 4, -7, 5] as const;

function productDestination(slug: string) {
  return slug === "vimto-sparkling" ? "/gammes/vimto" : `/produits/${slug}`;
}

function ProductLoop({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className={`product-loop${reverse ? " product-loop--reverse" : ""}`}>
      {continuousProducts.map((product, index) => (
        <a
          className="product-loop__item"
          href={productDestination(product.slug)}
          key={`${product.name}-${index}`}
          aria-label={product.slug === "vimto-sparkling" ? "Découvrir toute la gamme Vimto" : `Découvrir ${product.brand} ${product.name}`}
          data-product-link={product.slug === "vimto-sparkling" ? "vimto-range" : "product"}
        >
          <span className="product-loop__label">
            <small>{product.brand}</small>
            <strong>{product.name}</strong>
          </span>
          <span
            className="product-loop__orb"
            data-turntable-model={product.modelSrc}
            data-turntable-tilt={editorialTilts[index % editorialTilts.length]}
            data-turntable-phase={index % publishedProducts.length}
            style={{ "--product-tilt": `${editorialTilts[index % editorialTilts.length]}deg` } as CSSProperties}
          >
            <span className="product-loop__fallback">
              <img src={product.packshotWebp} alt="" width={product.packshotWidth ?? 2048} height={product.packshotHeight ?? 2048} loading="lazy" decoding="async" />
            </span>
            <span className="product-loop__explore" aria-hidden="true">↗</span>
          </span>
        </a>
      ))}
    </div>
  );
}

export function ProductExplorer() {
  return (
    <section className="product-marquee" aria-label="Sélection de produits Multiproduit Mali">
      <div className="product-marquee__viewport">
        <CatalogueTurntable />
        <ProductLoop />
        <ProductLoop reverse />
      </div>
    </section>
  );
}
