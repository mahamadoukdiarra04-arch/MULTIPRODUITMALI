import {
  createDecorativeLayers,
  type DecorativeAssetDefinition,
  type DecorativeLayers,
} from "./decorative-assets";

export type Product = {
  slug: string;
  publicationStatus: "published" | "prototype" | "pending-confirmation";
  brand: "Tropicoul" | "Triplex" | "Vimto";
  name: string;
  tags: readonly string[];
  headline: string;
  description: string;
  benefitTitle: string;
  benefit: string;
  poster: string;
  posterAvif: string;
  posterWebp: string;
  posterMobile: string;
  posterMobileAvif: string;
  posterMobileWebp: string;
  packshot: string;
  packshotAvif: string;
  packshotWebp: string;
  productHero: string;
  lifestyle: string;
  lifestyleAvif?: string;
  lifestyleWebp?: string;
  lifestyleAlt?: string;
  macroAvif?: string;
  macroWebp?: string;
  macroAlt?: string;
  heroAlt?: string;
  packshotAlt?: string;
  packshotWidth?: number;
  packshotHeight?: number;
  modelSrc: string;
  accent: string;
  deep: string;
  soft: string;
  surface: string;
  foreground: string;
  heading: string;
  accentText: string;
  ctaText: string;
  decorativeLayers: DecorativeLayers;
};

function productAssets(id: string, modelFile: string, lifestyle?: string) {
  const root = `/media/mpm/products/${id}`;
  return {
    poster: `${root}/poster.png`,
    posterAvif: `${root}/poster.avif`,
    posterWebp: `${root}/poster.webp`,
    posterMobile: `${root}/poster-mobile.png`,
    posterMobileAvif: `${root}/poster-mobile.avif`,
    posterMobileWebp: `${root}/poster-mobile.webp`,
    packshot: `${root}/packshot.png`,
    packshotAvif: `${root}/packshot.avif`,
    packshotWebp: `${root}/packshot.webp`,
    productHero: `${root}/product-hero.png`,
    lifestyle: lifestyle ?? `${root}/lifestyle-fallback.png`,
    modelSrc: `/models/mpm/${modelFile}`,
  };
}

function universeMedia(
  product: string,
  desktopId: string,
  desktop: { width: number; height: number },
  mobileId?: string,
  mobile?: { width: number; height: number },
) {
  const root = `/media/mpm/universes/${product}`;
  const media = (id: string, dimensions: { width: number; height: number }) => ({
    avif: `${root}/${id}.avif`,
    webp: `${root}/${id}.webp`,
    ...dimensions,
  });

  return {
    src: `${root}/${desktopId}.webp`,
    sources: {
      desktop: media(desktopId, desktop),
      ...(mobileId && mobile ? { mobile: media(mobileId, mobile) } : {}),
    },
  };
}

type ProductDecorationSpec = Omit<DecorativeAssetDefinition, "src" | "sources" | "alt"> & {
  dimensions: { width: number; height: number };
};

function createProductUniverse(
  product: string,
  prefix: string,
  decorations: readonly ProductDecorationSpec[],
) {
  return createDecorativeLayers([
    {
      id: `${prefix}-background-product-v01`,
      role: "background",
      depth: "back",
      ...universeMedia(
        product,
        `${prefix}-background-product-desktop-v01`,
        { width: 2880, height: 1800 },
        `${prefix}-background-product-mobile-v01`,
        { width: 1440, height: 1920 },
      ),
      alt: "",
      blend: "normal",
      fit: "cover",
      desktop: { x: 50, y: 50, scale: 1, rotate: 0 },
      mobile: { x: 50, y: 50, scale: 1, rotate: 0 },
      motion: { preset: "static", durationMs: 1, delayMs: 0, amplitude: 0 },
    },
    ...decorations.map(({ dimensions, ...asset }) => ({
      ...universeMedia(product, asset.id, dimensions),
      ...asset,
      alt: "" as const,
    })),
  ]);
}

const goyaveDecorations = () => createDecorativeLayers([
  {
    id: "goyave-background-product-v01",
    role: "background",
    depth: "back",
    ...universeMedia(
      "tropicoul-goyave",
      "goyave-background-product-desktop-v01",
      { width: 2880, height: 1800 },
      "goyave-background-product-mobile-v01",
      { width: 1440, height: 1920 },
    ),
    alt: "",
    blend: "normal",
    fit: "cover",
    desktop: { x: 50, y: 50, scale: 1, rotate: 0 },
    mobile: { x: 50, y: 50, scale: 1, rotate: 0 },
    motion: { preset: "static", durationMs: 1, delayMs: 0, amplitude: 0 },
  },
  {
    id: "goyave-leaf-background-back-v01",
    role: "leaf",
    depth: "back",
    ...universeMedia("tropicoul-goyave", "goyave-leaf-background-back-v01", { width: 1800, height: 1800 }),
    alt: "",
    blend: "normal",
    opacity: 0.58,
    desktop: { x: 14, y: 24, scale: 0.34, rotate: -7 },
    mobile: { x: 13, y: 23, scale: 0.38, rotate: -9 },
    motion: { preset: "drift", durationMs: 14500, delayMs: 0, amplitude: 0.51 },
  },
  {
    id: "goyave-atmosphere-product-v01",
    role: "atmosphere",
    depth: "back",
    ...universeMedia("tropicoul-goyave", "goyave-atmosphere-back-v01", { width: 2048, height: 1536 }),
    alt: "",
    blend: "screen",
    opacity: 0.56,
    desktop: { x: 70, y: 34, scale: 0.5, rotate: 0 },
    mobile: { x: 70, y: 34, scale: 0.58, rotate: 0 },
    motion: { preset: "drift", durationMs: 15200, delayMs: 180, amplitude: 0.47 },
  },
  {
    id: "goyave-splash-product-v01",
    role: "splash",
    depth: "mid",
    ...universeMedia("tropicoul-goyave", "goyave-splash-mid-v01", { width: 2200, height: 1650 }),
    alt: "",
    blend: "screen",
    opacity: 0.72,
    desktop: { x: 58, y: 63, scale: 0.5, rotate: -2 },
    mobile: { x: 58, y: 62, scale: 0.58, rotate: -2 },
    motion: { preset: "float", durationMs: 10800, delayMs: 80, amplitude: 0.5 },
  },
  {
    id: "goyave-fruit-cluster-product-v01",
    role: "fruit",
    depth: "mid",
    ...universeMedia("tropicoul-goyave", "goyave-fruit-cluster-mid-v01", { width: 1600, height: 1600 }),
    alt: "",
    blend: "normal",
    opacity: 0.84,
    desktop: { x: 79, y: 69, scale: 0.31, rotate: 3 },
    mobile: { x: 82, y: 70, scale: 0.32, rotate: 4 },
    motion: { preset: "parallax", durationMs: 12800, delayMs: 160, amplitude: 0.62 },
  },
  {
    id: "goyave-quarter-front-product-v01",
    role: "fruit",
    depth: "front",
    ...universeMedia("tropicoul-goyave", "goyave-quarter-front-v01", { width: 1200, height: 1200 }),
    alt: "",
    blend: "normal",
    opacity: 0.9,
    desktop: { x: 84, y: 79, scale: 0.24, rotate: 7 },
    mobile: { x: 86, y: 78, scale: 0.26, rotate: 7 },
    motion: { preset: "float", durationMs: 11600, delayMs: 260, amplitude: 0.56 },
  },
  {
    id: "goyave-particle-product-v01",
    role: "particle",
    depth: "atmosphere",
    ...universeMedia("tropicoul-goyave", "goyave-particle-front-v01", { width: 2048, height: 2048 }),
    alt: "",
    blend: "screen",
    opacity: 0.68,
    desktop: { x: 84, y: 38, scale: 0.34, rotate: 0 },
    mobile: { x: 82, y: 38, scale: 0.39, rotate: 0 },
    motion: { preset: "drift", durationMs: 8800, delayMs: 0, amplitude: 0.47 },
  },
]);

const triplexDecorations = () => createDecorativeLayers([
  {
    id: "triplex-background-product-v01",
    role: "background",
    depth: "back",
    ...universeMedia(
      "triplex-original",
      "triplex-background-product-desktop-v01",
      { width: 2880, height: 1800 },
      "triplex-background-product-mobile-v01",
      { width: 1440, height: 1920 },
    ),
    alt: "",
    blend: "normal",
    fit: "cover",
    desktop: { x: 50, y: 50, scale: 1, rotate: 0 },
    mobile: { x: 50, y: 50, scale: 1, rotate: 0 },
    motion: { preset: "static", durationMs: 1, delayMs: 0, amplitude: 0 },
  },
  {
    id: "triplex-carbon-product-v01",
    role: "texture",
    depth: "back",
    ...universeMedia("triplex-original", "triplex-carbon-pattern-back-v01", { width: 2048, height: 2048 }),
    alt: "",
    blend: "screen",
    fit: "cover",
    opacity: 0.045,
    desktop: { x: 50, y: 50, scale: 1, rotate: 0 },
    mobile: { x: 50, y: 50, scale: 1, rotate: 0 },
    motion: { preset: "static", durationMs: 1, delayMs: 0, amplitude: 0 },
  },
  {
    id: "triplex-atmosphere-product-v01",
    role: "atmosphere",
    depth: "back",
    ...universeMedia("triplex-original", "triplex-atmosphere-back-v01", { width: 2048, height: 1536 }),
    alt: "",
    blend: "screen",
    opacity: 0.46,
    desktop: { x: 65, y: 40, scale: 0.52, rotate: 0 },
    mobile: { x: 64, y: 42, scale: 0.58, rotate: 0 },
    motion: { preset: "drift", durationMs: 16200, delayMs: 0, amplitude: 0.45 },
  },
  {
    id: "triplex-energy-ribbon-product-v01",
    role: "splash",
    depth: "back",
    ...universeMedia("triplex-original", "triplex-energy-ribbon-back-v01", { width: 2200, height: 1650 }),
    alt: "",
    blend: "screen",
    opacity: 0.7,
    desktop: { x: 57, y: 60, scale: 0.52, rotate: -2 },
    mobile: { x: 58, y: 61, scale: 0.6, rotate: -2 },
    motion: { preset: "float", durationMs: 12400, delayMs: 120, amplitude: 0.51 },
  },
  {
    id: "triplex-shadow-ground-product-v01",
    role: "atmosphere",
    depth: "back",
    ...universeMedia("triplex-original", "triplex-shadow-ground-v01", { width: 1600, height: 800 }),
    alt: "",
    blend: "multiply",
    opacity: 0.72,
    desktop: { x: 50, y: 82, scale: 0.42, rotate: 0 },
    mobile: { x: 50, y: 82, scale: 0.48, rotate: 0 },
    motion: { preset: "static", durationMs: 1, delayMs: 0, amplitude: 0 },
  },
  {
    id: "triplex-foreground-energy-product-v01",
    role: "foreground",
    depth: "front",
    ...universeMedia("triplex-original", "triplex-foreground-energy-front-v01", { width: 2200, height: 1650 }),
    alt: "",
    blend: "screen",
    opacity: 0.62,
    desktop: { x: 72, y: 76, scale: 0.48, rotate: 0 },
    mobile: { x: 75, y: 75, scale: 0.54, rotate: 0 },
    motion: { preset: "float", durationMs: 11200, delayMs: 60, amplitude: 0.47 },
  },
  {
    id: "triplex-spark-product-v01",
    role: "particle",
    depth: "atmosphere",
    ...universeMedia("triplex-original", "triplex-spark-front-v01", { width: 2048, height: 2048 }),
    alt: "",
    blend: "screen",
    opacity: 0.64,
    desktop: { x: 83, y: 34, scale: 0.3, rotate: 0 },
    mobile: { x: 82, y: 36, scale: 0.34, rotate: 0 },
    motion: { preset: "pulse", durationMs: 3400, delayMs: 0, amplitude: 0.25 },
  },
]);

const ananasDecorations = () => createProductUniverse("tropicoul-ananas", "ananas", [
  {
    id: "ananas-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
    role: "atmosphere", depth: "back", blend: "screen", opacity: 0.54,
    desktop: { x: 67, y: 35, scale: 0.52, rotate: -2 }, mobile: { x: 70, y: 34, scale: 0.58, rotate: -4 },
    motion: { preset: "drift", durationMs: 14800, delayMs: 0, amplitude: 0.5 },
  },
  {
    id: "ananas-splash-mid-v01", dimensions: { width: 2200, height: 1650 },
    role: "splash", depth: "mid", blend: "screen", opacity: 0.7,
    desktop: { x: 56, y: 62, scale: 0.5, rotate: -4 }, mobile: { x: 58, y: 64, scale: 0.57, rotate: -6 },
    motion: { preset: "float", durationMs: 10800, delayMs: 80, amplitude: 0.62 },
  },
  {
    id: "ananas-pieces-set-mid-v01", dimensions: { width: 1200, height: 1200 },
    role: "fruit", depth: "mid", blend: "normal", opacity: 0.86,
    desktop: { x: 78, y: 34, scale: 0.23, rotate: 10 }, mobile: { x: 82, y: 33, scale: 0.27, rotate: 12 },
    motion: { preset: "parallax", durationMs: 12600, delayMs: 160, amplitude: 0.68 },
  },
  {
    id: "ananas-fruit-cluster-mid-v01", dimensions: { width: 1600, height: 1600 },
    role: "fruit", depth: "front", blend: "normal", opacity: 0.9,
    desktop: { x: 80, y: 74, scale: 0.29, rotate: -5 }, mobile: { x: 83, y: 76, scale: 0.32, rotate: -7 },
    motion: { preset: "float", durationMs: 11600, delayMs: 220, amplitude: 0.64 },
  },
  {
    id: "ananas-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
    role: "particle", depth: "atmosphere", blend: "screen", opacity: 0.62,
    desktop: { x: 82, y: 43, scale: 0.31, rotate: 2 }, mobile: { x: 85, y: 44, scale: 0.35, rotate: 4 },
    motion: { preset: "drift", durationMs: 8800, delayMs: 0, amplitude: 0.5 },
  },
]);

const mangueDecorations = () => createProductUniverse("tropicoul-mangue", "mangue", [
  {
    id: "mangue-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
    role: "atmosphere", depth: "back", blend: "screen", opacity: 0.55,
    desktop: { x: 67, y: 34, scale: 0.52, rotate: -2 }, mobile: { x: 70, y: 33, scale: 0.58, rotate: -4 },
    motion: { preset: "drift", durationMs: 15000, delayMs: 0, amplitude: 0.5 },
  },
  {
    id: "mangue-branch-background-back-v01", dimensions: { width: 1800, height: 1800 },
    role: "leaf", depth: "back", blend: "normal", opacity: 0.66,
    desktop: { x: 20, y: 23, scale: 0.32, rotate: -8 }, mobile: { x: 16, y: 22, scale: 0.36, rotate: -10 },
    motion: { preset: "drift", durationMs: 15600, delayMs: 140, amplitude: 0.54 },
  },
  {
    id: "mangue-nectar-ribbon-mid-v01", dimensions: { width: 2200, height: 1650 },
    role: "splash", depth: "mid", blend: "screen", opacity: 0.7,
    desktop: { x: 56, y: 62, scale: 0.5, rotate: -3 }, mobile: { x: 58, y: 64, scale: 0.57, rotate: -5 },
    motion: { preset: "float", durationMs: 11200, delayMs: 80, amplitude: 0.62 },
  },
  {
    id: "mangue-fruit-cluster-mid-v01", dimensions: { width: 1600, height: 1600 },
    role: "fruit", depth: "front", blend: "normal", opacity: 0.9,
    desktop: { x: 80, y: 74, scale: 0.29, rotate: -4 }, mobile: { x: 83, y: 76, scale: 0.32, rotate: -6 },
    motion: { preset: "parallax", durationMs: 12400, delayMs: 200, amplitude: 0.66 },
  },
  {
    id: "mangue-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
    role: "particle", depth: "atmosphere", blend: "screen", opacity: 0.62,
    desktop: { x: 82, y: 42, scale: 0.3, rotate: 3 }, mobile: { x: 85, y: 43, scale: 0.34, rotate: 5 },
    motion: { preset: "drift", durationMs: 9000, delayMs: 0, amplitude: 0.5 },
  },
]);

const orangeDecorations = () => createProductUniverse("tropicoul-orange", "orange", [
  {
    id: "orange-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
    role: "atmosphere", depth: "back", blend: "screen", opacity: 0.54,
    desktop: { x: 67, y: 34, scale: 0.51, rotate: -2 }, mobile: { x: 70, y: 33, scale: 0.58, rotate: -4 },
    motion: { preset: "drift", durationMs: 14800, delayMs: 0, amplitude: 0.5 },
  },
  {
    id: "orange-botanical-background-back-v01", dimensions: { width: 1800, height: 1800 },
    role: "leaf", depth: "back", blend: "normal", opacity: 0.68,
    desktop: { x: 19, y: 23, scale: 0.32, rotate: -8 }, mobile: { x: 15, y: 22, scale: 0.36, rotate: -10 },
    motion: { preset: "drift", durationMs: 15800, delayMs: 140, amplitude: 0.54 },
  },
  {
    id: "orange-splash-mid-v01", dimensions: { width: 2200, height: 1650 },
    role: "splash", depth: "mid", blend: "screen", opacity: 0.72,
    desktop: { x: 56, y: 63, scale: 0.5, rotate: -4 }, mobile: { x: 58, y: 65, scale: 0.57, rotate: -6 },
    motion: { preset: "float", durationMs: 10600, delayMs: 80, amplitude: 0.62 },
  },
  {
    id: "orange-rings-set-mid-v01", dimensions: { width: 1600, height: 1600 },
    role: "fruit", depth: "front", blend: "normal", opacity: 0.9,
    desktop: { x: 80, y: 72, scale: 0.29, rotate: 7 }, mobile: { x: 83, y: 75, scale: 0.32, rotate: 9 },
    motion: { preset: "parallax", durationMs: 12600, delayMs: 180, amplitude: 0.68 },
  },
  {
    id: "orange-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
    role: "particle", depth: "atmosphere", blend: "screen", opacity: 0.62,
    desktop: { x: 82, y: 43, scale: 0.3, rotate: 3 }, mobile: { x: 85, y: 44, scale: 0.34, rotate: 5 },
    motion: { preset: "drift", durationMs: 8600, delayMs: 0, amplitude: 0.5 },
  },
]);

const cocktailDecorations = () => createProductUniverse("tropicoul-cocktail", "cocktail", [
  {
    id: "cocktail-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
    role: "atmosphere", depth: "back", blend: "screen", opacity: 0.52,
    desktop: { x: 67, y: 34, scale: 0.52, rotate: -2 }, mobile: { x: 70, y: 33, scale: 0.59, rotate: -4 },
    motion: { preset: "drift", durationMs: 15000, delayMs: 0, amplitude: 0.5 },
  },
  {
    id: "cocktail-ribbon-back-v01", dimensions: { width: 2200, height: 1650 },
    role: "splash", depth: "back", blend: "screen", opacity: 0.64,
    desktop: { x: 57, y: 58, scale: 0.5, rotate: -4 }, mobile: { x: 59, y: 61, scale: 0.57, rotate: -6 },
    motion: { preset: "float", durationMs: 12200, delayMs: 100, amplitude: 0.6 },
  },
  {
    id: "cocktail-fruit-cluster-mid-v01", dimensions: { width: 1600, height: 1600 },
    role: "fruit", depth: "mid", blend: "normal", opacity: 0.9,
    desktop: { x: 80, y: 72, scale: 0.29, rotate: -4 }, mobile: { x: 83, y: 75, scale: 0.32, rotate: -6 },
    motion: { preset: "parallax", durationMs: 12600, delayMs: 180, amplitude: 0.68 },
  },
  {
    id: "cocktail-splash-mid-v01", dimensions: { width: 2200, height: 1650 },
    role: "splash", depth: "front", blend: "screen", opacity: 0.66,
    desktop: { x: 60, y: 76, scale: 0.46, rotate: 3 }, mobile: { x: 62, y: 79, scale: 0.52, rotate: 5 },
    motion: { preset: "float", durationMs: 10800, delayMs: 60, amplitude: 0.62 },
  },
  {
    id: "cocktail-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
    role: "particle", depth: "atmosphere", blend: "screen", opacity: 0.6,
    desktop: { x: 82, y: 42, scale: 0.3, rotate: 2 }, mobile: { x: 85, y: 43, scale: 0.34, rotate: 4 },
    motion: { preset: "drift", durationMs: 9000, delayMs: 0, amplitude: 0.5 },
  },
]);

const tamarinDecorations = () => createProductUniverse("tropicoul-tamarin", "tamarin", [
  {
    id: "tamarin-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
    role: "atmosphere", depth: "back", blend: "screen", opacity: 0.54,
    desktop: { x: 67, y: 35, scale: 0.52, rotate: -2 }, mobile: { x: 70, y: 34, scale: 0.58, rotate: -4 },
    motion: { preset: "drift", durationMs: 15200, delayMs: 0, amplitude: 0.5 },
  },
  {
    id: "tamarin-leaf-branch-mid-v01", dimensions: { width: 1800, height: 1800 },
    role: "leaf", depth: "back", blend: "normal", opacity: 0.68,
    desktop: { x: 19, y: 23, scale: 0.33, rotate: -7 }, mobile: { x: 15, y: 22, scale: 0.37, rotate: -9 },
    motion: { preset: "drift", durationMs: 15800, delayMs: 140, amplitude: 0.54 },
  },
  {
    id: "tamarin-amber-ribbon-mid-v01", dimensions: { width: 2200, height: 1650 },
    role: "splash", depth: "mid", blend: "screen", opacity: 0.68,
    desktop: { x: 56, y: 62, scale: 0.5, rotate: -4 }, mobile: { x: 58, y: 64, scale: 0.57, rotate: -6 },
    motion: { preset: "float", durationMs: 11600, delayMs: 100, amplitude: 0.62 },
  },
  {
    id: "tamarin-open-pod-mid-v01", dimensions: { width: 1600, height: 1600 },
    role: "fruit", depth: "front", blend: "normal", opacity: 0.9,
    desktop: { x: 80, y: 73, scale: 0.27, rotate: -8 }, mobile: { x: 83, y: 76, scale: 0.3, rotate: -10 },
    motion: { preset: "parallax", durationMs: 12800, delayMs: 180, amplitude: 0.68 },
  },
  {
    id: "tamarin-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
    role: "particle", depth: "atmosphere", blend: "screen", opacity: 0.62,
    desktop: { x: 82, y: 43, scale: 0.3, rotate: 3 }, mobile: { x: 85, y: 44, scale: 0.34, rotate: 5 },
    motion: { preset: "drift", durationMs: 8800, delayMs: 0, amplitude: 0.5 },
  },
]);

const vimtoDecorations = () => createDecorativeLayers([
  {
    id: "vimto-background-product-v02",
    role: "background",
    depth: "back",
    ...universeMedia(
      "vimto-sparkling",
      "vimto-background-product-desktop-v02",
      { width: 2560, height: 1440 },
      "vimto-background-product-mobile-v02",
      { width: 1440, height: 1920 },
    ),
    alt: "",
    blend: "normal",
    fit: "cover",
    desktop: { x: 50, y: 50, scale: 1, rotate: 0 },
    mobile: { x: 50, y: 50, scale: 1, rotate: 0 },
    motion: { preset: "static", durationMs: 1, delayMs: 0, amplitude: 0 },
  },
  {
    id: "vimto-white-panel-back-v02",
    role: "texture",
    depth: "back",
    src: "/media/mpm/universes/vimto-sparkling/vimto-white-panel-back-v02.svg",
    alt: "",
    blend: "screen",
    opacity: 0.42,
    desktop: { x: 62, y: 51, scale: 0.56, rotate: 0 },
    mobile: { x: 52, y: 58, scale: 0.72, rotate: 0 },
    motion: { preset: "static", durationMs: 1, delayMs: 0, amplitude: 0 },
  },
  {
    id: "vimto-red-liquid-ribbon-mid-v02",
    role: "splash",
    depth: "mid",
    ...universeMedia("vimto-sparkling", "vimto-red-liquid-ribbon-mid-v02", { width: 2000, height: 1600 }),
    alt: "",
    blend: "screen",
    opacity: 0.68,
    desktop: { x: 59, y: 62, scale: 0.5, rotate: -4 },
    mobile: { x: 58, y: 67, scale: 0.58, rotate: -6 },
    motion: { preset: "float", durationMs: 11600, delayMs: 80, amplitude: 0.58 },
  },
  {
    id: "vimto-lemon-line-mid-v02",
    role: "foreground",
    depth: "front",
    src: "/media/mpm/universes/vimto-sparkling/vimto-lemon-line-mid-v02.svg",
    alt: "",
    blend: "normal",
    opacity: 0.68,
    desktop: { x: 69, y: 49, scale: 0.48, rotate: -2 },
    mobile: { x: 60, y: 61, scale: 0.58, rotate: -4 },
    motion: { preset: "static", durationMs: 1, delayMs: 0, amplitude: 0 },
  },
  {
    id: "vimto-bubble-particle-front-v02",
    role: "particle",
    depth: "atmosphere",
    ...universeMedia("vimto-sparkling", "vimto-bubble-particle-front-v02", { width: 2000, height: 1600 }),
    alt: "",
    blend: "screen",
    opacity: 0.62,
    desktop: { x: 78, y: 47, scale: 0.43, rotate: 2 },
    mobile: { x: 76, y: 55, scale: 0.5, rotate: 4 },
    motion: { preset: "drift", durationMs: 13200, delayMs: 0, amplitude: 0.5 },
  },
]);

export const products: readonly Product[] = [
  {
    slug: "tropicoul-ananas",
    publicationStatus: "published",
    brand: "Tropicoul",
    name: "Ananas",
    tags: ["Fruitée", "Ananas", "Fraîche"],
    headline: "L’ANANAS, BIEN FRAIS.",
    description: "Une canette 330 ml qui met le goût généreux de l’ananas au centre de chaque pause.",
    benefitTitle: "L’ÉVASION FRUITÉE",
    benefit: "Une saveur solaire, faite pour les repas animés, les retrouvailles et toutes les envies de fraîcheur.",
    ...productAssets("tropicoul-ananas", "tropicoul-ananas.glb", "/media/simpara/tropicoul/ananas/ananas-card.png"),
    lifestyle: "/media/mpm/universes/tropicoul-ananas/ananas-lifestyle-mid-v01.webp",
    lifestyleAvif: "/media/mpm/universes/tropicoul-ananas/ananas-lifestyle-mid-v01.avif",
    lifestyleWebp: "/media/mpm/universes/tropicoul-ananas/ananas-lifestyle-mid-v01.webp",
    heroAlt: "Canette Tropicoul Ananas 330 ml dans un décor jaune et vert aux reliefs tropicaux.",
    packshotAlt: "Canette Tropicoul Ananas 330 ml, vue de face.",
    lifestyleAlt: "Canette Tropicoul Ananas 330 ml mise en scène dans un décor lumineux jaune et vert.",
    accent: "#f2b523",
    deep: "#195830",
    soft: "#fff6c9",
    surface: "#fff6c9",
    foreground: "#131412",
    heading: "#195830",
    accentText: "#195830",
    ctaText: "#195830",
    decorativeLayers: ananasDecorations(),
  },
  {
    slug: "tropicoul-mangue",
    publicationStatus: "published",
    brand: "Tropicoul",
    name: "Mangue",
    tags: ["Fruitée", "Mangue", "Généreuse"],
    headline: "LA MANGUE, SANS DÉTOUR.",
    description: "Une canette 330 ml au goût de mangue généreux, à savourer bien fraîche quand l’envie d’une pause fruitée arrive.",
    benefitTitle: "LE PLAISIR MANGUE",
    benefit: "Une saveur douce et solaire qui apporte une note gourmande aux moments simples.",
    ...productAssets("tropicoul-mangue", "tropicoul-mangue.glb", "/media/simpara/tropicoul/mangue/mangue-market.png"),
    lifestyle: "/media/mpm/universes/tropicoul-mangue/mangue-lifestyle-mid-v01.webp",
    lifestyleAvif: "/media/mpm/universes/tropicoul-mangue/mangue-lifestyle-mid-v01.avif",
    lifestyleWebp: "/media/mpm/universes/tropicoul-mangue/mangue-lifestyle-mid-v01.webp",
    heroAlt: "Canette Tropicoul Mangue 330 ml dans un décor doré aux courbes amples.",
    packshotAlt: "Canette Tropicoul Mangue 330 ml, vue de face.",
    lifestyleAlt: "Canette Tropicoul Mangue 330 ml intégrée à une scène chaleureuse aux tons dorés.",
    accent: "#ee842b",
    deep: "#6a2b13",
    soft: "#ffe1b2",
    surface: "#ffe1b2",
    foreground: "#131412",
    heading: "#6a2b13",
    accentText: "#4a1b0b",
    ctaText: "#4a1b0b",
    decorativeLayers: mangueDecorations(),
  },
  {
    slug: "tropicoul-orange",
    publicationStatus: "published",
    brand: "Tropicoul",
    name: "Orange",
    tags: ["Fruitée", "Orange", "Vive"],
    headline: "L’ORANGE QUI RÉVEILLE L’ENVIE.",
    description: "Une canette 330 ml au goût d’orange éclatant, pour mettre une note de fraîcheur dans les journées bien remplies.",
    benefitTitle: "LA VIVACITÉ ORANGE",
    benefit: "Une saveur franche et ensoleillée à ouvrir quand on veut une pause qui a du goût.",
    ...productAssets("tropicoul-orange", "tropicoul-orange.glb", "/media/simpara/tropicoul/orange/orange-card.png"),
    lifestyle: "/media/mpm/universes/tropicoul-orange/orange-lifestyle-mid-v01.webp",
    lifestyleAvif: "/media/mpm/universes/tropicoul-orange/orange-lifestyle-mid-v01.avif",
    lifestyleWebp: "/media/mpm/universes/tropicoul-orange/orange-lifestyle-mid-v01.webp",
    heroAlt: "Canette Tropicoul Orange 330 ml entourée de formes circulaires orange et bleu cobalt.",
    packshotAlt: "Canette Tropicoul Orange 330 ml, vue de face.",
    lifestyleAlt: "Canette Tropicoul Orange 330 ml dans une scène contemporaine orange et bleu cobalt.",
    accent: "#f26e24",
    deep: "#7a2808",
    soft: "#ffe0ad",
    surface: "#ffe0ad",
    foreground: "#131412",
    heading: "#7a2808",
    accentText: "#531a04",
    ctaText: "#531a04",
    decorativeLayers: orangeDecorations(),
  },
  {
    slug: "tropicoul-goyave",
    publicationStatus: "published",
    brand: "Tropicoul",
    name: "Goyave",
    tags: ["Fruitée", "Goyave", "Originale"],
    headline: "LA GOYAVE QUI SORT DU CADRE.",
    description: "Une canette 330 ml à la saveur goyave, pour celles et ceux qui aiment faire entrer un peu de nouveauté dans leurs pauses.",
    benefitTitle: "LE GOÛT DE LA DÉCOUVERTE",
    benefit: "Une saveur fruitée singulière, fraîche et généreuse, à partager avec les curieux.",
    ...productAssets("tropicoul-goyave", "tropicoul-goyave.glb", "/media/simpara/tropicoul/goyave/goyave-lifestyle.png"),
    lifestyle: "/media/mpm/universes/tropicoul-goyave/goyave-lifestyle-mid-v01.webp",
    lifestyleAvif: "/media/mpm/universes/tropicoul-goyave/goyave-lifestyle-mid-v01.avif",
    lifestyleWebp: "/media/mpm/universes/tropicoul-goyave/goyave-lifestyle-mid-v01.webp",
    heroAlt: "Canette Tropicoul Goyave 330 ml dans un décor botanique rose et vert.",
    packshotAlt: "Canette Tropicoul Goyave 330 ml, vue de face.",
    lifestyleAlt: "Canette Tropicoul Goyave 330 ml mise en scène dans un décor botanique rose et vert.",
    accent: "#e65074",
    deep: "#8e1744",
    soft: "#ffd5df",
    surface: "#ffd5df",
    foreground: "#131412",
    heading: "#8e1744",
    accentText: "#63102f",
    ctaText: "#36091a",
    decorativeLayers: goyaveDecorations(),
  },
  {
    slug: "tropicoul-cocktail",
    publicationStatus: "published",
    brand: "Tropicoul",
    name: "Cocktail",
    tags: ["Fruitée", "Cocktail", "Festive"],
    headline: "LE GOÛT DES FRUITS EN MODE FESTIF.",
    description: "Une canette 330 ml qui réunit des saveurs fruitées pour les moments où l’on a envie de plus de fraîcheur et de plaisir.",
    benefitTitle: "LA NOTE COCKTAIL",
    benefit: "Un goût fruité expressif, à savourer bien frais quand l’ambiance commence à monter.",
    ...productAssets("tropicoul-cocktail", "tropicoul-cocktail.glb", "/media/simpara/tropicoul/cocktail/cocktail-market.png"),
    lifestyle: "/media/mpm/universes/tropicoul-cocktail/cocktail-lifestyle-mid-v01.webp",
    lifestyleAvif: "/media/mpm/universes/tropicoul-cocktail/cocktail-lifestyle-mid-v01.avif",
    lifestyleWebp: "/media/mpm/universes/tropicoul-cocktail/cocktail-lifestyle-mid-v01.webp",
    heroAlt: "Canette Tropicoul Cocktail 330 ml dans un décor abstrait bleu aux éclats lumineux.",
    packshotAlt: "Canette Tropicoul Cocktail 330 ml, vue de face.",
    lifestyleAlt: "Canette Tropicoul Cocktail 330 ml intégrée à une scène contemporaine bleu profond.",
    accent: "#f6c544",
    deep: "#063a5b",
    soft: "#a9e6f4",
    surface: "#0b5ea8",
    foreground: "#f7fcff",
    heading: "#ffffff",
    accentText: "#082a3a",
    ctaText: "#082a3a",
    decorativeLayers: cocktailDecorations(),
  },
  {
    slug: "tropicoul-tamarin",
    publicationStatus: "published",
    brand: "Tropicoul",
    name: "Tamarin",
    tags: ["Fruitée", "Tamarin", "Singulière"],
    headline: "LE TAMARIN AU CARACTÈRE FRANC.",
    description: "Une canette 330 ml au goût de tamarin, pour les envies de saveurs plus profondes et moins attendues.",
    benefitTitle: "LE GOÛT QUI CHANGE",
    benefit: "Une pause fruitée avec du caractère, faite pour être découverte et commentée.",
    ...productAssets("tropicoul-tamarin", "tropicoul-tamarin.glb", "/media/simpara/tropicoul/tamarin/tamarin-card.png"),
    lifestyle: "/media/mpm/universes/tropicoul-tamarin/tamarin-lifestyle-mid-v01.webp",
    lifestyleAvif: "/media/mpm/universes/tropicoul-tamarin/tamarin-lifestyle-mid-v01.avif",
    lifestyleWebp: "/media/mpm/universes/tropicoul-tamarin/tamarin-lifestyle-mid-v01.webp",
    heroAlt: "Canette Tropicoul Tamarin 330 ml dans un décor végétal sombre éclairé de tons ambrés.",
    packshotAlt: "Canette Tropicoul Tamarin 330 ml, vue de face.",
    lifestyleAlt: "Canette Tropicoul Tamarin 330 ml mise en scène dans un décor contemporain aux tons ambrés.",
    accent: "#846243",
    deep: "#43281b",
    soft: "#eadac5",
    surface: "#eadac5",
    foreground: "#131412",
    heading: "#43281b",
    accentText: "#321c12",
    ctaText: "#fffaf4",
    decorativeLayers: tamarinDecorations(),
  },
  {
    slug: "triplex-original",
    publicationStatus: "published",
    brand: "Triplex",
    name: "Original",
    tags: ["Énergisante", "Intense", "330 ml"],
    headline: "TRIPLEX. GARDEZ LE RYTHME.",
    description: "Une boisson énergisante 330 ml au goût intense, prête à accompagner les journées rapides et les nuits qui se prolongent.",
    benefitTitle: "L’ÉNERGIE DU MOMENT",
    benefit: "Une canette fraîche et assumée pour rester dans le mouvement lorsque le tempo monte.",
    ...productAssets("triplex", "triplex-energy-drink.glb", "/media/simpara/triplex/triplex-work.png"),
    lifestyle: "/media/mpm/universes/triplex-original/triplex-lifestyle-mid-v01.webp",
    lifestyleAvif: "/media/mpm/universes/triplex-original/triplex-lifestyle-mid-v01.avif",
    lifestyleWebp: "/media/mpm/universes/triplex-original/triplex-lifestyle-mid-v01.webp",
    heroAlt: "Canette Triplex Original 330 ml, boisson énergisante au goût intense, dans une scène de nuit.",
    packshotAlt: "Canette Triplex Original 330 ml, vue de face.",
    lifestyleAlt: "Canette Triplex Original 330 ml au premier plan d’une scène urbaine nocturne rouge et noire.",
    accent: "#d63a2b",
    deep: "#050505",
    soft: "#121212",
    surface: "#080808",
    foreground: "#f7f7f3",
    heading: "#ffffff",
    accentText: "#ffffff",
    ctaText: "#ffffff",
    decorativeLayers: triplexDecorations(),
  },
  {
    slug: "vimto-sparkling",
    publicationStatus: "published",
    brand: "Vimto",
    name: "Sparkling",
    tags: ["Fruitée", "Pétillante", "Emblématique"],
    headline: "VIMTO. LE GOÛT QUI RASSEMBLE.",
    description: "Une boisson fruitée pétillante 330 ml au goût emblématique, à partager autour d’un repas ou d’un bon moment.",
    benefitTitle: "LA FRAÎCHEUR À PARTAGER",
    benefit: "Une canette bien fraîche qui apporte une note fruitée et pétillante aux moments qui comptent.",
    ...productAssets("vimto", "vimto-sparkling-v2.glb"),
    poster: "/media/mpm/product-pages/vimto-sparkling/v2/hero-desktop.webp",
    posterAvif: "/media/mpm/product-pages/vimto-sparkling/v2/hero-desktop.avif",
    posterWebp: "/media/mpm/product-pages/vimto-sparkling/v2/hero-desktop.webp",
    posterMobile: "/media/mpm/product-pages/vimto-sparkling/v2/hero-mobile.webp",
    posterMobileAvif: "/media/mpm/product-pages/vimto-sparkling/v2/hero-mobile.avif",
    posterMobileWebp: "/media/mpm/product-pages/vimto-sparkling/v2/hero-mobile.webp",
    packshot: "/media/mpm/universes/vimto-sparkling/vimto-can-cutout-approved-v002.png",
    packshotAvif: "/media/mpm/universes/vimto-sparkling/vimto-can-cutout-approved-v002.avif",
    packshotWebp: "/media/mpm/universes/vimto-sparkling/vimto-can-cutout-approved-v002.webp",
    productHero: "/media/mpm/universes/vimto-sparkling/vimto-can-cutout-approved-v002.png",
    modelSrc: "/models/mpm/vimto-sparkling-v2.glb",
    heroAlt: "Canette compacte rouge Vimto Sparkling 330 ml dans un décor rétro rouge, blanc et jaune.",
    packshotAlt: "Canette compacte rouge Vimto Sparkling 330 ml, vue de face, avec panneau blanc bordé de jaune et sertissages argentés.",
    packshotWidth: 2400,
    packshotHeight: 3200,
    macroAvif: "/media/mpm/universes/vimto-sparkling/vimto-editorial-macro-v02.avif",
    macroWebp: "/media/mpm/universes/vimto-sparkling/vimto-editorial-macro-v02.webp",
    macroAlt: "Gros plan du lettrage Vimto rouge entouré de jaune sur le panneau blanc de la canette.",
    lifestyle: "/media/mpm/universes/vimto-sparkling/vimto-editorial-lifestyle-v03.webp",
    lifestyleAvif: "/media/mpm/universes/vimto-sparkling/vimto-editorial-lifestyle-v03.avif",
    lifestyleWebp: "/media/mpm/universes/vimto-sparkling/vimto-editorial-lifestyle-v03.webp",
    lifestyleAlt: "Canette Vimto Sparkling rouge au premier plan d’un repas partagé par quatre adultes en extérieur.",
    accent: "#FDE002",
    deep: "#650B1A",
    soft: "#E3EDF2",
    surface: "#B1172D",
    foreground: "#E3EDF2",
    heading: "#ffffff",
    accentText: "#FDE002",
    ctaText: "#0B0909",
    decorativeLayers: vimtoDecorations(),
  },
];

export function findProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
