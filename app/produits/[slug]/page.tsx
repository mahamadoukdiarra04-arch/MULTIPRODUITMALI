import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "../../PlainLink";

import { BrandLogo } from "../../BrandLogo";
import { DecorativePicture } from "../../DecorativePicture";
import { DECORATIVE_DEPTHS, getDecorativeAssets, type DecorativeAsset } from "../../decorative-assets";
import { productPageContent } from "../../product-page-data";
import { PRODUCT_PAGE_MOTION_FACTOR, productPageMotionDuration } from "../../product-page-motion-config";
import { ProductPageHero } from "../../ProductPageHero";
import { ProductPageMotion } from "../../ProductPageMotion";
import { ProductRangeTurntable } from "../../ProductRangeTurntable";
import { findProduct, products, type Product } from "../../products";

type ProductPageProps = { params: Promise<{ slug: string }> };

function decorativeStyle(asset: DecorativeAsset) {
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
    "--asset-motion-amplitude": `${Math.min(asset.motion.amplitude, 0.8)}rem`,
  } as CSSProperties;
}

function allProductAssets(product: Product) {
  return DECORATIVE_DEPTHS.flatMap((depth) => getDecorativeAssets(product.decorativeLayers, depth));
}

function ProductDecorLayer({ product, depth }: { product: Product; depth: (typeof DECORATIVE_DEPTHS)[number] }) {
  const assets = getDecorativeAssets(product.decorativeLayers, depth);

  return (
    <div className={`product-decor-layer product-decor-layer--${depth}`} aria-hidden="true">
      {assets.map((asset) => (
        <DecorativePicture
          asset={asset}
          className={`product-decor-asset product-decor-asset--${asset.role} product-decor-asset--blend-${asset.blend}`}
          sizes="(max-width: 720px) 138vw, 58vw"
          style={decorativeStyle(asset)}
          loading="lazy"
          fetchPriority="low"
          key={`${depth}-${asset.role}-${asset.id}`}
        />
      ))}
    </div>
  );
}

function AssetPicture({ asset, className }: { asset: DecorativeAsset; className: string }) {
  const desktop = asset.sources?.desktop;
  const mobile = asset.sources?.mobile;
  const fallback = desktop?.webp ?? desktop?.avif ?? asset.src;

  return (
    <picture className={className}>
      {mobile?.avif ? <source media="(max-width: 720px)" type="image/avif" srcSet={mobile.avif} /> : null}
      {mobile?.webp ? <source media="(max-width: 720px)" type="image/webp" srcSet={mobile.webp} /> : null}
      {desktop?.avif ? <source type="image/avif" srcSet={desktop.avif} /> : null}
      {desktop?.webp ? <source type="image/webp" srcSet={desktop.webp} /> : null}
      <img
        src={fallback}
        alt=""
        width={desktop?.width ?? 1600}
        height={desktop?.height ?? 1600}
        sizes="(max-width: 720px) 100vw, 58vw"
        loading="lazy"
        fetchPriority="low"
        decoding="async"
      />
    </picture>
  );
}

function PackshotPicture({ product, className, alt }: { product: Product; className: string; alt: string }) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={product.packshotAvif} />
      <source type="image/webp" srcSet={product.packshotWebp} />
      <img
        src={product.brand === "Vimto" ? product.packshot : product.packshotWebp}
        alt={alt}
        width={product.packshotWidth ?? 2048}
        height={product.packshotHeight ?? 2048}
        sizes="(max-width: 720px) 78vw, 42vw"
        loading="lazy"
        fetchPriority="low"
        decoding="async"
      />
    </picture>
  );
}

function LifestyleSection({ product }: { product: Product }) {
  const content = productPageContent[product.slug];
  const macroAsset = allProductAssets(product).find((asset) => asset.id === content.macroAssetId);

  return (
    <section className={`product-lifestyle${content.showLifestyle ? "" : " product-lifestyle--abstract"}`} data-product-section="lifestyle" aria-labelledby="lifestyle-title">
      {content.showLifestyle ? (
        <picture className="product-lifestyle__media">
          {product.lifestyleAvif ? <source type="image/avif" srcSet={product.lifestyleAvif} /> : null}
          {product.lifestyleWebp ? <source type="image/webp" srcSet={product.lifestyleWebp} /> : null}
          <img
            src={product.lifestyleWebp ?? product.lifestyle}
            alt={product.lifestyleAlt ?? `Moment de dégustation avec ${product.brand} ${product.name}.`}
            width="2400"
            height="1600"
            sizes="(max-width: 720px) 100vw, 62vw"
            loading="lazy"
            fetchPriority="low"
            decoding="async"
          />
        </picture>
      ) : macroAsset ? <AssetPicture asset={macroAsset} className="product-lifestyle__media product-lifestyle__media--abstract" /> : null}
      <div className="product-lifestyle__copy">
        <p>{product.brand}</p>
        <h2 id="lifestyle-title">{content.lifestyleTitle}</h2>
        <span>{content.lifestyleCopy}</span>
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  const content = product ? productPageContent[product.slug] : undefined;
  if (!product || !content) return { title: "Produit indisponible | Multiproduit Mali", robots: { index: false, follow: false } };

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;
  const imagePath = product.slug === "vimto-sparkling"
    ? product.posterWebp
    : `/media/mpm/product-pages/${product.slug}/images/${product.slug}__hero-desktop__1280w.webp`;
  const image = new URL(imagePath, origin).toString();
  const title = `${product.brand} ${product.name} 330 ml | Multiproduit Mali`;
  const shouldIndex = product.publicationStatus === "published";

  return {
    title,
    description: content.metaDescription,
    alternates: { canonical: new URL(`/produits/${product.slug}`, origin).toString() },
    robots: { index: shouldIndex, follow: shouldIndex },
    openGraph: { title, description: content.metaDescription, images: [image], type: "website" },
    twitter: { card: "summary_large_image", title, description: content.metaDescription, images: [image] },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = findProduct(slug);
  const content = product ? productPageContent[product.slug] : undefined;

  if (!product || !content) {
    return (
      <main className="product-not-found" id="main-content">
        <Link href="/#marques">Voir les produits</Link>
        <h1>Ce produit n’est pas disponible.</h1>
        <p>Cette fiche n’est pas accessible pour le moment. Retrouvez les produits actuellement publiés dans notre sélection.</p>
      </main>
    );
  }

  const productTheme = {
    "--product-accent": product.accent,
    "--product-deep": product.deep,
    "--product-soft": product.soft,
    "--product-surface": product.surface,
    "--product-foreground": product.foreground,
    "--product-heading": product.heading,
    "--product-accent-text": product.accentText,
    "--product-cta-text": product.ctaText,
  } as CSSProperties;
  const macroAsset = allProductAssets(product).find((asset) => asset.id === content.macroAssetId);
  const publishedProducts = products.filter((candidate) => candidate.publicationStatus === "published");
  const facts = [
    ["Marque", product.brand],
    [product.brand === "Tropicoul" ? "Saveur" : "Version", product.name],
    ...(product.publicationStatus !== "pending-confirmation" ? [["Format", "Canette 330 ml"]] : []),
  ];
  const contactParameters = new URLSearchParams({ mode: "partnership", source: "product-" + product.slug });
  if (product.brand === "Tropicoul") {
    contactParameters.set("brand", "tropicoul");
    contactParameters.set("flavour", product.slug);
  }
  if (product.brand === "Triplex") contactParameters.set("brand", "triplex");
  const contactHref = "/contact?" + contactParameters.toString();

  return (
    <div
      className="product-page"
      style={productTheme}
      data-publication-status={product.publicationStatus}
      data-product-slug={product.slug}
      data-product-motion-factor={PRODUCT_PAGE_MOTION_FACTOR}
    >
      <header className="product-page__header">
        <Link className="wordmark wordmark--logo" href="/" aria-label="Multiproduit Mali, retour à l’accueil">
          <BrandLogo />
        </Link>
        <nav aria-label="Navigation produit"><Link href="/#marques">Tous les produits</Link><Link href={contactHref}>Contact</Link></nav>
        <Link className="product-page__back" href="/#marques">Retour à la gamme</Link>
      </header>

      <main id="main-content">
        <ProductPageHero product={product} content={content} />

        <section className="product-facts" aria-label="Informations sur le produit" data-product-section="facts">
          <dl>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{label === "Format" ? <>Canette <span className="product-facts__nowrap">330 ml</span></> : value}</dd></div>)}</dl>
        </section>

        <section className="product-signature" id="signature" data-product-section="signature" aria-labelledby="signature-title">
          <p>{content.signatureEyebrow}</p><h2 id="signature-title">{content.signatureTitle}</h2><span>{content.signatureCopy}</span>
        </section>

        <ProductPageMotion className="product-focus" labelledBy="product-focus-title" dataSection="product">
          <div className="product-focus__copy"><p>{product.brand} {product.name}</p><h2 id="product-focus-title">{content.productTitle}</h2><span>{content.productCopy}</span></div>
          <div className="product-focus__stage">
            <ProductDecorLayer product={product} depth="back" />
            <ProductDecorLayer product={product} depth="mid" />
            <PackshotPicture
              product={product}
              className="product-focus__packshot"
              alt={product.packshotAlt ?? `Canette ${product.brand} ${product.name}, vue de face.`}
            />
            <ProductDecorLayer product={product} depth="front" />
            <ProductDecorLayer product={product} depth="atmosphere" />
          </div>
        </ProductPageMotion>

        <section className="product-macro" data-product-section="macro" aria-labelledby="macro-title">
          {product.macroAvif && product.macroWebp ? (
            <picture className="product-macro__media">
              <source type="image/avif" srcSet={product.macroAvif} />
              <source type="image/webp" srcSet={product.macroWebp} />
              <img
                src={product.macroWebp}
                alt={product.macroAlt ?? ""}
                width="2560"
                height="1440"
                sizes="(max-width: 720px) 100vw, 58vw"
                loading="lazy"
                fetchPriority="low"
                decoding="async"
              />
            </picture>
          ) : macroAsset ? <AssetPicture asset={macroAsset} className="product-macro__media" /> : null}
          <div><p>AU PLUS PRÈS</p><h2 id="macro-title">{content.macroTitle}</h2><span>{content.macroCopy}</span></div>
        </section>

        <LifestyleSection product={product} />

        <section className="product-range" data-product-section="range" aria-labelledby="range-title">
          <div className="product-range__heading"><p>À DÉCOUVRIR</p><h2 id="range-title">D’autres saveurs à découvrir</h2></div>
          <nav aria-label="Autres produits Multiproduit Mali">
            <ProductRangeTurntable />
            <ul>{publishedProducts.map((candidate) => (
              <li key={candidate.slug}>
                <Link href={`/produits/${candidate.slug}`} aria-current={candidate.slug === product.slug ? "page" : undefined}>
                  <picture
                    className="product-range__fallback"
                    data-turntable-model={candidate.modelSrc}
                    data-turntable-rotation="180"
                    data-turntable-state="waiting"
                  >
                    <source type="image/avif" srcSet={candidate.packshotAvif} />
                    <source type="image/webp" srcSet={candidate.packshotWebp} />
                    <img src={candidate.packshotWebp} alt="" width="2048" height="2048" loading="lazy" decoding="async" />
                  </picture>
                  <span><small>{candidate.brand}</small><strong>{candidate.name}</strong></span>
                </Link>
              </li>
            ))}</ul>
          </nav>
        </section>

        <section className="product-final-cta" data-product-section="cta" aria-labelledby="final-cta-title">
          <div><p>MULTIPRODUIT MALI</p><h2 id="final-cta-title">Quelle saveur vous fera envie ensuite ?</h2></div>
          <div className="product-final-cta__actions"><Link href="/#marques">Voir toutes les saveurs</Link><Link href={contactHref}>Contacter Multiproduit Mali</Link></div>
        </section>
      </main>

      <footer className="product-page__footer">
        <span>Multiproduit Mali</span>
        <nav aria-label="Navigation de bas de page">
          <Link href="/#marques">Voir les produits</Link>
          <Link href="/">Retour à l’accueil</Link>
        </nav>
      </footer>
    </div>
  );
}
