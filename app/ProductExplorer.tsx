"use client";

import { useState } from "react";

const products = [
  {
    brand: "Tropicoul",
    name: "Ananas",
    note: "Une fraîcheur solaire, nette et généreuse.",
    image: "/media/simpara/tropicoul/ananas/ananas-hero.png",
    tone: "sun",
  },
  {
    brand: "Tropicoul",
    name: "Mangue",
    note: "Le fruit velouté qui rassemble autour du même goût.",
    image: "/media/simpara/tropicoul/mangue/mangue-hero.png",
    tone: "mango",
  },
  {
    brand: "Tropicoul",
    name: "Orange",
    note: "Une énergie acidulée, à vivre sans attendre.",
    image: "/media/simpara/tropicoul/orange/orange-card.png",
    tone: "orange",
  },
  {
    brand: "Tropicoul",
    name: "Goyave",
    note: "Une saveur douce et singulière qui marque les moments.",
    image: "/media/simpara/tropicoul/goyave/goyave-card.png",
    tone: "guava",
  },
  {
    brand: "Tropicoul",
    name: "Cocktail",
    note: "Plusieurs fruits, une même envie de partager.",
    image: "/media/simpara/tropicoul/cocktail/cocktail-card.png",
    tone: "cocktail",
  },
  {
    brand: "Triplex",
    name: "Original",
    note: "L’énergie qui accompagne les rythmes les plus soutenus.",
    image: "/media/simpara/triplex/triplex-hero.png",
    tone: "triplex",
  },
] as const;

export function ProductExplorer() {
  const [selected, setSelected] = useState(0);
  const product = products[selected];

  const selectProduct = (index: number) => {
    setSelected((index + products.length) % products.length);
  };

  return (
    <div className={`product-explorer product-explorer--${product.tone}`}>
      <div className="product-explorer__topline">
        <span>LA SÉLECTION SIMPARA</span>
        <span>{String(selected + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}</span>
      </div>

      <div className="product-explorer__stage" aria-live="polite">
        <div className="product-explorer__copy" key={product.name}>
          <p>{product.brand}</p>
          <h3>{product.name}</h3>
          <span>{product.note}</span>
          <a href="#contact">Découvrir le produit <b aria-hidden="true">↗</b></a>
        </div>
        <div className="product-explorer__image" key={`${product.name}-image`}>
          <img src={product.image} alt={`${product.brand} ${product.name}`} />
        </div>
      </div>

      <div className="product-explorer__controls">
        <p>Faites défiler ou choisissez une saveur</p>
        <div className="product-explorer__rail" role="toolbar" aria-label="Choisir un produit">
          {products.map((item, index) => (
            <button
              className={index === selected ? "is-selected" : undefined}
              type="button"
              key={item.name}
              aria-pressed={index === selected}
              onClick={() => selectProduct(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  selectProduct(index + 1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  selectProduct(index - 1);
                }
              }}
            >
              <span>{item.brand}</span>
              <strong>{item.name}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
