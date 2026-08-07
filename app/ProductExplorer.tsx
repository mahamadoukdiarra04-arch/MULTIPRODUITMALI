const products = [
  {
    brand: "Tropicoul",
    name: "Ananas",
    image: "/media/simpara/tropicoul/ananas/ananas-hero.png",
  },
  {
    brand: "Tropicoul",
    name: "Mangue",
    image: "/media/simpara/tropicoul/mangue/mangue-hero.png",
  },
  {
    brand: "Tropicoul",
    name: "Orange",
    image: "/media/simpara/tropicoul/orange/orange-card.png",
  },
  {
    brand: "Tropicoul",
    name: "Goyave",
    image: "/media/simpara/tropicoul/goyave/goyave-card.png",
  },
  {
    brand: "Tropicoul",
    name: "Cocktail",
    image: "/media/simpara/tropicoul/cocktail/cocktail-card.png",
  },
  {
    brand: "Triplex",
    name: "Original",
    image: "/media/simpara/triplex/triplex-hero.png",
  },
] as const;

const continuousProducts = [...products, ...products];

function ProductLoop({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className={`product-loop${reverse ? " product-loop--reverse" : ""}`}>
      {continuousProducts.map((product, index) => (
        <a
          className="product-loop__item"
          href="#contact"
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
