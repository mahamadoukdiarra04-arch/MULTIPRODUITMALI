import { products } from "./products";

const continuousProducts = [...products, ...products];

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
          <span className="product-loop__orb">
            <img src={product.image} alt="" loading="lazy" />
            <span className="product-loop__explore">Explorer <b aria-hidden="true">↗</b></span>
          </span>
        </a>
      ))}
    </div>
  );
}

export function ProductExplorer() {
  return (
    <section className="product-marquee" aria-label="Sélection de produits Simpara">
      <div className="product-marquee__heading">
        <p>LA SÉLECTION SIMPARA</p>
        <span>FAITES DÉFILER POUR EXPLORER</span>
      </div>
      <div className="product-marquee__viewport">
        <ProductLoop />
        <ProductLoop reverse />
      </div>
    </section>
  );
}
