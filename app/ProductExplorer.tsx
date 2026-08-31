import Image from "next/image";
import type { CSSProperties } from "react";

import { CatalogueTurntable } from "./CatalogueTurntable";
import { products } from "./products";

const publishedProducts = products.filter((product) => product.publicationStatus === "published");
const continuousProducts = [...publishedProducts, ...publishedProducts];
const editorialTilts = [-6, 5, -4, 6, -5, 4, -7, 5] as const;

function ProductLoop({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className={`product-loop${reverse ? " product-loop--reverse" : ""}`}>
      {continuousProducts.map((product, index) => (
        <a
          className="product-loop__item"
          href={`/produits/${product.slug}`}
          key={`${product.name}-${index}`}
          aria-label={`Découvrir ${product.brand} ${product.name}`}
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
            <picture className="product-loop__fallback">
              <source type="image/avif" srcSet={product.packshotAvif} />
              <source type="image/webp" srcSet={product.packshotWebp} />
              <Image src={product.packshot} alt="" width={2048} height={2048} sizes="(max-width: 760px) 104px, 128px" />
            </picture>
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
      <div className="product-marquee__heading">
        <p>NOS SAVEURS</p>
        <span>FAITES DÉFILER POUR CHOISIR</span>
      </div>
      <div className="product-marquee__viewport">
        <CatalogueTurntable />
        <ProductLoop />
        <ProductLoop reverse />
      </div>
    </section>
  );
}
