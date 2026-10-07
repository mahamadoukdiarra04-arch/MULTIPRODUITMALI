import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "../../../PlainLink";

import { BrandLogo } from "../../../BrandLogo";
import { HomePointer } from "../../../HomePointer";
import { SiteFooter } from "../../../SiteFooter";
import { DECORATIVE_DEPTHS, getDecorativeAssets } from "../../../decorative-assets";
import { createProductPagePoster } from "../../../product-page-data";
import { getProductUniverseStories, getProductUniverseSupportingStories, type ProductUniverseStory } from "../../../product-universe-gallery";
import { findProduct, type Product } from "../../../products";

type ProductUniversePageProps = { params: Promise<{ slug: string }> };

type GalleryItem = {
  id: string;
  eyebrow: string;
  title: string;
  body?: string;
  alt: string;
  src: string;
  avif?: string;
  mobileAvif?: string;
  mobileWebp?: string;
  width?: number;
  height?: number;
  className?: string;
  kind?: "packshot";
};

function productTheme(product: Product) {
  return {
    "--product-accent": product.accent,
    "--product-deep": product.deep,
    "--product-soft": product.soft,
    "--product-surface": product.surface,
    "--product-foreground": product.foreground,
    "--product-heading": product.heading,
    "--product-accent-text": product.accentText,
    "--product-cta-text": product.ctaText,
  } as CSSProperties;
}

function decorativeAssets(product: Product) {
  return DECORATIVE_DEPTHS.flatMap((depth) => getDecorativeAssets(product.decorativeLayers, depth));
}

function GalleryPicture({ item }: { item: GalleryItem }) {
  if (item.kind === "packshot") {
    return (
      <div className="universe-gallery__packshot">
        <img src={item.src} alt={item.alt} width={item.width ?? 2048} height={item.height ?? 2048} loading="lazy" decoding="async" />
      </div>
    );
  }

  return (
    <picture>
      {item.mobileWebp ? <source media="(max-width: 720px)" type="image/webp" srcSet={item.mobileWebp} /> : null}
      <img src={item.src} alt={item.alt} width={item.width ?? 1440} height={item.height ?? 941} loading="lazy" decoding="async" />
    </picture>
  );
}

function storyClass(story: ProductUniverseStory, index: number) {
  // Keep the opening visual in the same scene slot used by the legacy fallback.
  // This preserves the full-bleed composition while retaining the editorial story.
  if (index === 0) return "universe-gallery__item--scene universe-gallery__item--story-full";
  if (story.layout === "full-bleed") return "universe-gallery__item--story-full";
  return index % 2 === 0 ? "universe-gallery__item--story-feature" : "universe-gallery__item--story-compact";
}

function buildGallery(product: Product): GalleryItem[] {
  const poster = product.brand === "Vimto"
    ? {
        src: product.posterWebp,
        avif: product.posterAvif,
        mobileAvif: product.posterMobileAvif,
        mobileWebp: product.posterMobileWebp,
      }
    : (() => {
        const generated = createProductPagePoster(product.slug);
        return {
          src: generated.desktop.fallback,
          avif: generated.desktop.avifSrcSet,
          mobileAvif: generated.mobile.avifSrcSet,
          mobileWebp: generated.mobile.webpSrcSet,
        };
      })();
  const macroAsset = decorativeAssets(product).find((asset) => asset.id === productPageMacroId(product.slug));
  const fallbackItems: GalleryItem[] = [
    {
      id: "scene",
      eyebrow: "L’univers",
      title: "Le produit dans son décor",
      alt: product.heroAlt ?? `Canette ${product.brand} ${product.name} dans son univers.`,
      src: poster.src,
      avif: poster.avif,
      mobileAvif: poster.mobileAvif,
      mobileWebp: poster.mobileWebp,
      className: "universe-gallery__item--scene",
    },
    {
      id: "packshot",
      eyebrow: "Le produit",
      title: "Seul, dans tous ses détails",
      alt: product.packshotAlt ?? `Canette ${product.brand} ${product.name}, vue de face.`,
      src: product.packshotWebp,
      className: "universe-gallery__item--packshot",
      kind: "packshot",
    },
    {
      id: "detail",
      eyebrow: "Le détail",
      title: "Une identité qui se reconnaît",
      alt: product.macroAlt ?? `Détail de l’univers ${product.brand} ${product.name}.`,
      src: product.macroWebp ?? macroAsset?.sources?.desktop?.webp ?? macroAsset?.src ?? product.packshotWebp,
      avif: product.macroAvif ?? macroAsset?.sources?.desktop?.avif,
      className: "universe-gallery__item--detail",
    },
    {
      id: "moment",
      eyebrow: "Le moment",
      title: "Pensé pour les instants partagés",
      alt: product.lifestyleAlt ?? `Moment de dégustation avec ${product.brand} ${product.name}.`,
      src: product.lifestyleWebp ?? product.lifestyle,
      avif: product.lifestyleAvif,
      className: "universe-gallery__item--moment",
    },
  ];

  const stories = getProductUniverseStories(product.slug);
  if (stories.length === 0) return fallbackItems;

  const storyItems = stories.map((story, index) => ({
    id: story.id,
    eyebrow: story.eyebrow,
    title: story.title,
    body: story.body,
    alt: story.alt,
    src: story.src,
    avif: story.avif,
    width: story.width,
    height: story.height,
    className: `universe-gallery__item--story ${storyClass(story, index)}`,
  } satisfies GalleryItem));
  // These two Vimto variants use deliberately curated six-image sequences. Do
  // not blend them with product-page fallback images, which would add repeats.
  if (product.slug === "vimto-sirop" || product.slug === "vimto-malt") return storyItems;
  const supportingItems = getProductUniverseSupportingStories(product.slug).map((story, index) => ({
    id: story.id,
    eyebrow: story.eyebrow,
    title: story.title,
    body: story.body,
    alt: story.alt,
    src: story.src,
    avif: story.avif,
    width: story.width,
    height: story.height,
    className: `universe-gallery__item--story universe-gallery__item--story-support ${index % 2 === 0 ? "universe-gallery__item--story-feature" : "universe-gallery__item--story-compact"}`,
  } satisfies GalleryItem));
  const packshot = fallbackItems.find((item) => item.kind === "packshot");
  return packshot ? [storyItems[0], packshot, ...storyItems.slice(1), ...supportingItems] : [...storyItems, ...supportingItems];
}

function productPageMacroId(slug: string) {
  const ids: Record<string, string> = {
    "tropicoul-ananas": "ananas-fruit-cluster-mid-v01",
    "tropicoul-mangue": "mangue-fruit-cluster-mid-v01",
    "tropicoul-orange": "orange-splash-mid-v01",
    "tropicoul-goyave": "goyave-quarter-front-product-v01",
    "tropicoul-cocktail": "cocktail-ribbon-back-v01",
    "tropicoul-tamarin": "tamarin-open-pod-mid-v01",
    "triplex-original": "triplex-carbon-product-v01",
    "vimto-sparkling": "vimto-red-liquid-ribbon-mid-v02",
  };
  return ids[slug] ?? "";
}

function GalleryCard({ item }: { item: GalleryItem }) {
  return (
    <figure className={`universe-gallery__item ${item.className ?? ""}`} data-gallery-id={item.id}>
      <GalleryPicture item={item} />
      <figcaption>
        <span>{item.eyebrow}</span>
        <strong>{item.title}</strong>
        {item.body ? <p>{item.body}</p> : null}
      </figcaption>
    </figure>
  );
}

export async function generateMetadata({ params }: ProductUniversePageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return { title: "Produit indisponible | Multiproduit Mali" };
  return {
    title: `${product.brand} ${product.name} — L’univers | Multiproduit Mali`,
    description: `Découvrez l’univers visuel de ${product.brand} ${product.name} et ses images en situation.`,
  };
}

export default async function ProductUniversePage({ params }: ProductUniversePageProps) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) notFound();

  const gallery = buildGallery(product);

  return (
    <div className="universe-page" style={productTheme(product)} data-product-slug={product.slug}>
      <header className="universe-page__header">
        <Link className="wordmark wordmark--logo" href={`/produits/${product.slug}`} aria-label="Retour à la fiche produit">
          <BrandLogo />
        </Link>
        <HomePointer />
        <nav aria-label="Navigation de l’univers">
          <Link href={`/produits/${product.slug}`}>Fiche produit</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </header>

      <main id="main-content">
        <section className="universe-page__intro" aria-labelledby="universe-page-title">
          <div>
            <p className="universe-page__eyebrow">{product.brand} / {product.name}</p>
            <h1 id="universe-page-title">L’univers de<br />{product.brand} {product.name}</h1>
          </div>
          <p className="universe-page__lead">Un produit, une atmosphère, des moments à imaginer. Retrouvez ici les visuels de {product.brand} {product.name}, seul ou dans son décor.</p>
        </section>

        <section className="universe-gallery" aria-label={`Galerie ${product.brand} ${product.name}`}>
          {gallery.map((item) => <GalleryCard key={item.id} item={item} />)}
        </section>

        <section className="universe-page__footer-cta" aria-label="Actions produit">
          <p>Envie d’aller plus loin ?</p>
          <div>
            <Link className="universe-page__cta universe-page__cta--primary" href={`/produits/${product.slug}`}>Retour à la fiche produit <span aria-hidden="true">↗</span></Link>
            <Link className="universe-page__cta" href="/contact">Parler à l’équipe <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      </main>
      <SiteFooter productRangeHref={`/gammes/${product.brand.toLowerCase()}`} productRangeLabel={`Gamme ${product.brand}`} />
    </div>
  );
}
