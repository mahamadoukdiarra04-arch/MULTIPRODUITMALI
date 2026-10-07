import Link from "./PlainLink";

import { createProductPagePoster, type ProductPageContent } from "./product-page-data";
import { ProductPageMotion } from "./ProductPageMotion";
import type { Product } from "./products";

function ProductHeroPoster({ product }: { product: Product }) {
  const alt = product.heroAlt ?? `Canette ${product.brand} ${product.name} 330 ml.`;

  if (product.slug === "vimto-sparkling") {
    return (
      <picture className="product-page-hero__poster">
        <source media="(max-width: 900px)" type="image/webp" srcSet="/media/mpm/universes/vimto-sparkling/vimto-background-hero-mobile-v02.webp" width="1440" height="1920" />
        <source type="image/webp" srcSet="/media/mpm/universes/vimto-sparkling/vimto-background-hero-desktop-v02.webp" width="2560" height="1440" />
        <img
          src="/media/mpm/universes/vimto-sparkling/vimto-background-hero-desktop-v02.webp"
          alt=""
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

  if (product.brand === "Vimto") {
    return (
      <picture className="product-page-hero__poster">
        <source media="(max-width: 900px)" type="image/webp" srcSet={product.posterMobileWebp} width="1440" height="1920" />
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
        type="image/webp"
        srcSet={poster.mobile.webpSrcSet}
        sizes="100vw"
        width={poster.mobile.width}
        height={poster.mobile.height}
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

function VimtoHeroStillLife({ product }: { product: Product }) {
  if (product.slug !== "vimto-sparkling") return null;

  return (
    <div className="product-page-hero__vimto-still-life">
      <picture className="product-page-hero__vimto-fruit">
        <source type="image/webp" srcSet="/media/mpm/universes/vimto/vimto-fruit-cluster-mid-v01.webp" />
        <img
          src="/media/mpm/universes/vimto/vimto-fruit-cluster-mid-v01.webp"
          alt=""
          width="1600"
          height="1600"
          loading="lazy"
          decoding="async"
        />
      </picture>
      <picture className="product-page-hero__vimto-can">
        <source type="image/webp" srcSet={product.packshotWebp} />
        <img
          src={product.packshot}
          alt={product.heroAlt ?? "Canette Vimto Sparkling 330 ml, vue de face."}
          width={product.packshotWidth ?? 2400}
          height={product.packshotHeight ?? 3200}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </picture>
    </div>
  );
}

const heroBrandLogos = {
  Tropicoul: {
    src: "/media/mpm/brand/tropicoul-wordmark-hero-v01.png",
    webp: "/media/mpm/brand/tropicoul-wordmark-hero-v01.webp",
    avif: "/media/mpm/brand/tropicoul-wordmark-hero-v01.avif",
    alt: "Tropicoul",
    width: 2170,
    height: 725,
    className: "product-page-hero__brand-logo--tropicoul",
  },
  Triplex: {
    src: "/media/mpm/brand/triplex-emblem-hero-v01.png",
    webp: "/media/mpm/brand/triplex-emblem-hero-v01.webp",
    avif: "/media/mpm/brand/triplex-emblem-hero-v01.avif",
    alt: "Triplex",
    width: 1122,
    height: 1402,
    className: "product-page-hero__brand-logo--triplex",
  },
} as const;

function ProductHeroBrandLogo({ product }: { product: Product }) {
  if (product.slug === "vimto-sparkling") {
    return (
      <>
        <img className="product-page-hero__brand-logo" src="/media/mpm/universes/vimto-sparkling/vimto-wordmark-header-v03.png" alt="Vimto" width="1536" height="1024" />
        <span className="product-page-hero__brand-name">{product.brand} {product.name}</span>
      </>
    );
  }

  if (product.slug === "vimto-sirop") {
    return (
      <>
        <span className="product-page-hero__vimto-syrup-lockup" aria-hidden="true">
          <span className="product-page-hero__vimto-syrup-mark">
            <span className="product-page-hero__vimto-syrup-arabic" lang="ar" dir="rtl">فيمتو</span>
            <span className="product-page-hero__vimto-syrup-wordmark">VIMTO</span>
          </span>
          <span className="product-page-hero__brand-variant">Sirop</span>
        </span>
        <span className="product-page-hero__brand-name">Vimto Sirop</span>
      </>
    );
  }

  if (product.slug === "vimto-malt") {
    return (
      <>
        <span className="product-page-hero__vimto-lockup" aria-hidden="true">
          <img className="product-page-hero__brand-logo product-page-hero__brand-logo--vimto-variant" src="/media/mpm/universes/vimto-sparkling/vimto-wordmark-header-v03.png" alt="" width="1536" height="1024" />
          <span className="product-page-hero__brand-variant">{product.name}</span>
        </span>
        <span className="product-page-hero__brand-name">{product.brand} {product.name}</span>
      </>
    );
  }

  const brandLogo = heroBrandLogos[product.brand as keyof typeof heroBrandLogos];
  if (!brandLogo) return <>{product.brand} {product.name}</>;

  return (
    <>
      <picture className={`product-page-hero__brand-logo ${brandLogo.className}`}>
        <source type="image/webp" srcSet={brandLogo.webp} />
        <img src={brandLogo.src} alt={brandLogo.alt} width={brandLogo.width} height={brandLogo.height} decoding="async" />
      </picture>
      <span className="product-page-hero__brand-name">{product.brand} {product.name}</span>
    </>
  );
}

export function ProductPageHero({ product, content }: { product: Product; content: ProductPageContent }) {
  return (
    <ProductPageMotion className="product-page-hero" labelledBy="product-page-title">
      <ProductHeroPoster product={product} />
      <VimtoHeroStillLife product={product} />
      <div className="product-page-hero__veil" aria-hidden="true" />
      <div className="product-page-hero__copy">
        <p>{product.brand} / {product.name}</p>
        <h1 id="product-page-title">
          <ProductHeroBrandLogo product={product} />
        </h1>
        <span>{content.heroLead}</span>
        <div className="product-page-hero__actions">
          <Link className="product-page-hero__primary" href={`/produits/${product.slug}/univers`}>Découvrir l’univers</Link>
          {product.brand !== "Triplex" ? <Link className="product-page-hero__secondary" href={`/gammes/${product.brand.toLocaleLowerCase()}`}>Voir toute la gamme</Link> : null}
        </div>
      </div>
    </ProductPageMotion>
  );
}
