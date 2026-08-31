import type { CSSProperties } from "react";
import Link from "next/link";

import { DecorativePicture } from "./DecorativePicture";
import { DECORATIVE_DEPTHS, getDecorativeAssets, type DecorativeAsset } from "./decorative-assets";
import { createProductPagePoster, type ProductPageContent } from "./product-page-data";
import { productPageMotionDuration } from "./product-page-motion-config";
import { ProductPageMotion } from "./ProductPageMotion";
import type { Product } from "./products";

function assetStyle(asset: DecorativeAsset) {
  return {
    "--asset-desktop-x": `${asset.desktop.x}%`,
    "--asset-desktop-y": `${asset.desktop.y}%`,
    "--asset-desktop-scale": asset.desktop.scale,
    "--asset-desktop-rotate": `${asset.desktop.rotate}deg`,
    "--asset-mobile-x": `${asset.mobile.x}%`,
    "--asset-mobile-y": `${asset.mobile.y}%`,
    "--asset-mobile-scale": asset.mobile.scale,
    "--asset-mobile-rotate": `${asset.mobile.rotate}deg`,
    "--asset-motion-duration": `${productPageMotionDuration(asset.motion.durationMs)}ms`,
    "--asset-motion-declared-duration": `${asset.motion.durationMs}ms`,
    "--asset-motion-delay": `${asset.motion.delayMs}ms`,
    "--asset-motion-amplitude": `${Math.min(asset.motion.amplitude, 0.75)}rem`,
  } as CSSProperties;
}

function heroAssets(product: Product, ids: readonly string[]) {
  const assets = DECORATIVE_DEPTHS.flatMap((depth) =>
    getDecorativeAssets(product.decorativeLayers, depth),
  );
  return ids.map((id) => assets.find((asset) => asset.id === id)).filter(Boolean) as DecorativeAsset[];
}

function ProductHeroPoster({ product }: { product: Product }) {
  const alt = product.heroAlt ?? `Canette ${product.brand} ${product.name} 330 ml.`;

  if (product.slug === "vimto-sparkling") {
    return (
      <picture className="product-page-hero__poster">
        <source media="(max-width: 900px)" type="image/avif" srcSet={product.posterMobileAvif} width="1440" height="1920" />
        <source media="(max-width: 900px)" type="image/webp" srcSet={product.posterMobileWebp} width="1440" height="1920" />
        <source type="image/avif" srcSet={product.posterAvif} width="2560" height="1440" />
        <source type="image/webp" srcSet={product.posterWebp} width="2560" height="1440" />
        <img
          src={product.posterWebp}
          alt={alt}
          width="2560"
          height="1440"
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
    );
  }

  const poster = createProductPagePoster(product.slug);
  return (
    <picture className="product-page-hero__poster">
      <source
        media="(max-width: 900px)"
        type="image/avif"
        srcSet={poster.mobile.avifSrcSet}
        sizes="100vw"
        width={poster.mobile.width}
        height={poster.mobile.height}
      />
      <source
        media="(max-width: 900px)"
        type="image/webp"
        srcSet={poster.mobile.webpSrcSet}
        sizes="100vw"
        width={poster.mobile.width}
        height={poster.mobile.height}
      />
      <source
        type="image/avif"
        srcSet={poster.desktop.avifSrcSet}
        sizes="100vw"
        width={poster.desktop.width}
        height={poster.desktop.height}
      />
      <source
        type="image/webp"
        srcSet={poster.desktop.webpSrcSet}
        sizes="100vw"
        width={poster.desktop.width}
        height={poster.desktop.height}
      />
      <img
        src={poster.desktop.fallback}
        alt={alt}
        width={poster.desktop.width}
        height={poster.desktop.height}
        sizes="100vw"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  );
}

export function ProductPageHero({ product, content }: { product: Product; content: ProductPageContent }) {
  const layers = heroAssets(product, content.heroLayerIds).slice(0, 2);

  return (
    <ProductPageMotion className="product-page-hero" labelledBy="product-page-title">
      <ProductHeroPoster product={product} />
      <div className="product-page-hero__layers" aria-hidden="true">
        {layers.map((asset, index) => (
          <DecorativePicture
            key={asset.id}
            asset={asset}
            className={`product-page-hero__layer product-page-hero__layer--${index + 1}`}
            sizes="(max-width: 767px) 120vw, 74vw"
            style={assetStyle(asset)}
            loading="lazy"
            fetchPriority="low"
          />
        ))}
      </div>
      <div className="product-page-hero__veil" aria-hidden="true" />
      <div className="product-page-hero__copy">
        <p>{product.brand} / {product.name}</p>
        <h1 id="product-page-title">{product.brand} {product.name}</h1>
        <span>{content.heroLead}</span>
        <div className="product-page-hero__actions">
          <Link className="product-page-hero__primary" href="#signature">Découvrir l’univers</Link>
          <Link className="product-page-hero__secondary" href="/#marques">Voir toute la gamme</Link>
        </div>
      </div>
    </ProductPageMotion>
  );
}
