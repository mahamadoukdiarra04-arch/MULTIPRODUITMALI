import {
  createDecorativeLayers,
  type DecorativeAssetDefinition,
  type DecorativeLayers,
} from "./decorative-assets";

export const HERO_DISPLAY_MS = 5000;
export const HERO_TRANSITION_MS = 800;
export const HERO_RESUME_DELAY_MS = 2000;
export const HERO_TOUCH_PAUSE_MS = 8000;
export const HERO_MIN_VISIBLE_RATIO = 0.55;

export type HeroUniverse = {
  id: string;
  brand: "Tropicoul" | "Triplex" | "Vimto";
  productName: string;
  accessibleLabel: string;
  posterSrc: string;
  posterAvifSrc: string;
  posterWebpSrc: string;
  posterMobileSrc: string;
  posterMobileAvifSrc: string;
  posterMobileWebpSrc: string;
  packshotSrc: string;
  packshotAvifSrc: string;
  packshotWebpSrc: string;
  modelSrc?: string;
  textureSrc?: string;
  palette: {
    background: string;
    backgroundDeep: string;
    accent: string;
    foreground: "light" | "dark";
  };
  decorativeLayers: DecorativeLayers;
  model: {
    enabled: boolean;
    scale: number;
    rotationOffset: number;
    mobileScale: number;
  };
};

const webModel = {
  enabled: true,
  scale: 0.74,
  rotationOffset: 0,
  mobileScale: 1.05,
} as const;

function posterAssets(id: string) {
  const root = `/media/mpm/products/${id}`;
  return {
    posterSrc: `${root}/poster.png`,
    posterAvifSrc: `${root}/poster.avif`,
    posterWebpSrc: `${root}/poster.webp`,
    posterMobileSrc: `${root}/poster-mobile.png`,
    posterMobileAvifSrc: `${root}/poster-mobile.avif`,
    posterMobileWebpSrc: `${root}/poster-mobile.webp`,
    packshotSrc: `${root}/packshot.png`,
    packshotAvifSrc: `${root}/packshot.avif`,
    packshotWebpSrc: `${root}/packshot.webp`,
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
  return {
    src: `${root}/${desktopId}.webp`,
    sources: {
      desktop: {
        avif: `${root}/${desktopId}.avif`,
        webp: `${root}/${desktopId}.webp`,
        ...desktop,
      },
      ...(mobileId && mobile ? {
        mobile: {
          avif: `${root}/${mobileId}.avif`,
          webp: `${root}/${mobileId}.webp`,
          ...mobile,
        },
      } : {}),
    },
  };
}

type HeroDecorationSpec = Omit<DecorativeAssetDefinition, "src" | "sources" | "alt"> & {
  dimensions: { width: number; height: number };
};

function createHeroUniverse(
  product: string,
  prefix: string,
  decorations: readonly HeroDecorationSpec[],
) {
  return createDecorativeLayers([
    {
      id: `${prefix}-background-hero-v01`,
      ...universeMedia(
        product,
        `${prefix}-background-hero-desktop-v01`,
        { width: 2880, height: 1800 },
        `${prefix}-background-hero-mobile-v01`,
        { width: 1440, height: 1920 },
      ),
      alt: "",
      desktop: { x: 50, y: 50, scale: 1.02, rotate: 0 },
      mobile: { x: 50, y: 50, scale: 1.02, rotate: 0 },
      depth: "back",
      role: "background",
      blend: "normal",
      fit: "cover",
      motion: { preset: "static", durationMs: 0, delayMs: 0, amplitude: 0 },
    },
    ...decorations.map(({ dimensions, ...asset }) => ({
      ...universeMedia(product, asset.id, dimensions),
      ...asset,
      alt: "" as const,
    })),
  ]);
}

const allHeroUniverses: readonly HeroUniverse[] = [
  {
    id: "tropicoul-goyave",
    brand: "Tropicoul",
    productName: "Goyave",
    accessibleLabel: "Tropicoul Goyave",
    ...posterAssets("tropicoul-goyave"),
    modelSrc: "/models/mpm/tropicoul-goyave.glb",
    palette: { background: "#f08aa5", backgroundDeep: "#c93f69", accent: "#365f31", foreground: "dark" },
    decorativeLayers: createDecorativeLayers([
      {
        id: "goyave-background-hero-v01",
        ...universeMedia(
          "tropicoul-goyave",
          "goyave-background-hero-desktop-v01",
          { width: 2880, height: 1800 },
          "goyave-background-hero-mobile-v01",
          { width: 1440, height: 1920 },
        ),
        alt: "",
        desktop: { x: 50, y: 50, scale: 1.02, rotate: 0 },
        mobile: { x: 50, y: 50, scale: 1.02, rotate: 0 },
        depth: "back",
        role: "background",
        blend: "normal",
        fit: "cover",
        motion: { preset: "static", durationMs: 0, delayMs: 0, amplitude: 0 },
      },
      {
        id: "goyave-atmosphere-back-v01",
        ...universeMedia("tropicoul-goyave", "goyave-atmosphere-back-v01", { width: 2048, height: 1536 }),
        alt: "",
        desktop: { x: 73, y: 35, scale: 0.58, rotate: -4 },
        mobile: { x: 78, y: 31, scale: 0.68, rotate: -6 },
        depth: "back",
        role: "atmosphere",
        blend: "screen",
        opacity: 0.68,
        motion: { preset: "drift", durationMs: 14500, delayMs: 0, amplitude: 0.62 },
      },
      {
        id: "goyave-splash-mid-v01",
        ...universeMedia("tropicoul-goyave", "goyave-splash-mid-v01", { width: 2200, height: 1650 }),
        alt: "",
        desktop: { x: 63, y: 70, scale: 0.53, rotate: -5 },
        mobile: { x: 73, y: 73, scale: 0.64, rotate: -8 },
        depth: "mid",
        role: "splash",
        blend: "screen",
        opacity: 0.72,
        motion: { preset: "float", durationMs: 10600, delayMs: 180, amplitude: 0.56 },
      },
      {
        id: "goyave-quarter-left-mid-v01",
        ...universeMedia("tropicoul-goyave", "goyave-quarter-left-mid-v01", { width: 1200, height: 1200 }),
        alt: "",
        desktop: { x: 43, y: 79, scale: 0.26, rotate: -14 },
        mobile: { x: 70, y: 84, scale: 0.31, rotate: -18 },
        depth: "mid",
        role: "fruit",
        blend: "normal",
        opacity: 0.9,
        motion: { preset: "parallax", durationMs: 12800, delayMs: 80, amplitude: 0.7 },
      },
      {
        id: "goyave-quarter-right-mid-v01",
        ...universeMedia("tropicoul-goyave", "goyave-quarter-right-mid-v01", { width: 1200, height: 1200 }),
        alt: "",
        desktop: { x: 88, y: 57, scale: 0.23, rotate: 17 },
        mobile: { x: 94, y: 42, scale: 0.27, rotate: 20 },
        depth: "mid",
        role: "fruit",
        blend: "normal",
        opacity: 0.86,
        motion: { preset: "float", durationMs: 11600, delayMs: 260, amplitude: 0.62 },
      },
      {
        id: "goyave-particle-front-v01",
        ...universeMedia("tropicoul-goyave", "goyave-particle-front-v01", { width: 2048, height: 2048 }),
        alt: "",
        desktop: { x: 91, y: 58, scale: 0.34, rotate: 4 },
        mobile: { x: 96, y: 58, scale: 0.38, rotate: 7 },
        depth: "front",
        role: "particle",
        blend: "screen",
        opacity: 0.72,
        motion: { preset: "drift", durationMs: 8600, delayMs: 120, amplitude: 0.54 },
      },
    ]),
    model: webModel,
  },
  {
    id: "tropicoul-ananas",
    brand: "Tropicoul",
    productName: "Ananas",
    accessibleLabel: "Tropicoul Ananas",
    ...posterAssets("tropicoul-ananas"),
    modelSrc: "/models/mpm/tropicoul-ananas.glb",
    palette: { background: "#ffd957", backgroundDeep: "#ea7d20", accent: "#1f7a39", foreground: "dark" },
    decorativeLayers: createHeroUniverse("tropicoul-ananas", "ananas", [
      {
        id: "ananas-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
        depth: "back", role: "atmosphere", blend: "screen", opacity: 0.62,
        desktop: { x: 80, y: 38, scale: 0.56, rotate: -3 }, mobile: { x: 88, y: 34, scale: 0.66, rotate: -5 },
        motion: { preset: "drift", durationMs: 14500, delayMs: 0, amplitude: 0.55 },
      },
      {
        id: "ananas-splash-mid-v01", dimensions: { width: 2200, height: 1650 },
        depth: "mid", role: "splash", blend: "screen", opacity: 0.68,
        desktop: { x: 71, y: 66, scale: 0.54, rotate: -7 }, mobile: { x: 82, y: 70, scale: 0.62, rotate: -9 },
        motion: { preset: "float", durationMs: 10500, delayMs: 120, amplitude: 0.62 },
      },
      {
        id: "ananas-pieces-set-mid-v01", dimensions: { width: 1200, height: 1200 },
        depth: "mid", role: "fruit", blend: "normal", opacity: 0.88,
        desktop: { x: 88, y: 42, scale: 0.26, rotate: 10 }, mobile: { x: 96, y: 39, scale: 0.3, rotate: 13 },
        motion: { preset: "parallax", durationMs: 12800, delayMs: 180, amplitude: 0.72 },
      },
      {
        id: "ananas-fruit-cluster-mid-v01", dimensions: { width: 1600, height: 1600 },
        depth: "front", role: "fruit", blend: "normal", opacity: 0.92,
        desktop: { x: 87, y: 78, scale: 0.3, rotate: -6 }, mobile: { x: 91, y: 82, scale: 0.34, rotate: -8 },
        motion: { preset: "float", durationMs: 11400, delayMs: 80, amplitude: 0.68 },
      },
      {
        id: "ananas-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
        depth: "atmosphere", role: "particle", blend: "screen", opacity: 0.66,
        desktop: { x: 92, y: 54, scale: 0.34, rotate: 2 }, mobile: { x: 96, y: 55, scale: 0.37, rotate: 4 },
        motion: { preset: "drift", durationMs: 8600, delayMs: 0, amplitude: 0.54 },
      },
    ]),
    model: webModel,
  },
  {
    id: "tropicoul-orange",
    brand: "Tropicoul",
    productName: "Orange",
    accessibleLabel: "Tropicoul Orange",
    ...posterAssets("tropicoul-orange"),
    modelSrc: "/models/mpm/tropicoul-orange.glb",
    palette: { background: "#ffb139", backgroundDeep: "#e24e1c", accent: "#ffe27a", foreground: "dark" },
    decorativeLayers: createHeroUniverse("tropicoul-orange", "orange", [
      {
        id: "orange-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
        depth: "back", role: "atmosphere", blend: "screen", opacity: 0.6,
        desktop: { x: 78, y: 32, scale: 0.55, rotate: -2 }, mobile: { x: 88, y: 30, scale: 0.64, rotate: -4 },
        motion: { preset: "drift", durationMs: 14800, delayMs: 0, amplitude: 0.54 },
      },
      {
        id: "orange-botanical-background-back-v01", dimensions: { width: 1800, height: 1800 },
        depth: "back", role: "leaf", blend: "normal", opacity: 0.7,
        desktop: { x: 88, y: 24, scale: 0.34, rotate: -7 }, mobile: { x: 94, y: 21, scale: 0.38, rotate: -9 },
        motion: { preset: "drift", durationMs: 15600, delayMs: 120, amplitude: 0.58 },
      },
      {
        id: "orange-splash-mid-v01", dimensions: { width: 2200, height: 1650 },
        depth: "mid", role: "splash", blend: "screen", opacity: 0.72,
        desktop: { x: 70, y: 70, scale: 0.53, rotate: -5 }, mobile: { x: 80, y: 73, scale: 0.62, rotate: -8 },
        motion: { preset: "float", durationMs: 10600, delayMs: 80, amplitude: 0.64 },
      },
      {
        id: "orange-rings-set-mid-v01", dimensions: { width: 1600, height: 1600 },
        depth: "front", role: "fruit", blend: "normal", opacity: 0.9,
        desktop: { x: 88, y: 62, scale: 0.3, rotate: 8 }, mobile: { x: 94, y: 64, scale: 0.34, rotate: 11 },
        motion: { preset: "parallax", durationMs: 12600, delayMs: 160, amplitude: 0.7 },
      },
      {
        id: "orange-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
        depth: "atmosphere", role: "particle", blend: "screen", opacity: 0.64,
        desktop: { x: 92, y: 51, scale: 0.33, rotate: 4 }, mobile: { x: 97, y: 52, scale: 0.37, rotate: 6 },
        motion: { preset: "drift", durationMs: 8400, delayMs: 0, amplitude: 0.53 },
      },
    ]),
    model: webModel,
  },
  {
    id: "tropicoul-mangue",
    brand: "Tropicoul",
    productName: "Mangue",
    accessibleLabel: "Tropicoul Mangue",
    ...posterAssets("tropicoul-mangue"),
    modelSrc: "/models/mpm/tropicoul-mangue.glb",
    palette: { background: "#f5bd3e", backgroundDeep: "#e96b24", accent: "#6a8d2e", foreground: "dark" },
    decorativeLayers: createHeroUniverse("tropicoul-mangue", "mangue", [
      {
        id: "mangue-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
        depth: "back", role: "atmosphere", blend: "screen", opacity: 0.62,
        desktop: { x: 78, y: 33, scale: 0.57, rotate: -3 }, mobile: { x: 87, y: 31, scale: 0.66, rotate: -5 },
        motion: { preset: "drift", durationMs: 14600, delayMs: 0, amplitude: 0.56 },
      },
      {
        id: "mangue-branch-background-back-v01", dimensions: { width: 1800, height: 1800 },
        depth: "back", role: "leaf", blend: "normal", opacity: 0.72,
        desktop: { x: 88, y: 22, scale: 0.35, rotate: 7 }, mobile: { x: 95, y: 20, scale: 0.39, rotate: 10 },
        motion: { preset: "drift", durationMs: 15800, delayMs: 140, amplitude: 0.58 },
      },
      {
        id: "mangue-nectar-ribbon-mid-v01", dimensions: { width: 2200, height: 1650 },
        depth: "mid", role: "splash", blend: "screen", opacity: 0.72,
        desktop: { x: 70, y: 63, scale: 0.52, rotate: -4 }, mobile: { x: 81, y: 68, scale: 0.61, rotate: -7 },
        motion: { preset: "float", durationMs: 11000, delayMs: 80, amplitude: 0.64 },
      },
      {
        id: "mangue-fruit-cluster-mid-v01", dimensions: { width: 1600, height: 1600 },
        depth: "front", role: "fruit", blend: "normal", opacity: 0.92,
        desktop: { x: 88, y: 76, scale: 0.3, rotate: -5 }, mobile: { x: 92, y: 81, scale: 0.34, rotate: -7 },
        motion: { preset: "parallax", durationMs: 12400, delayMs: 160, amplitude: 0.7 },
      },
      {
        id: "mangue-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
        depth: "atmosphere", role: "particle", blend: "screen", opacity: 0.64,
        desktop: { x: 93, y: 47, scale: 0.32, rotate: 3 }, mobile: { x: 97, y: 48, scale: 0.36, rotate: 5 },
        motion: { preset: "drift", durationMs: 8800, delayMs: 0, amplitude: 0.52 },
      },
    ]),
    model: webModel,
  },
  {
    id: "tropicoul-cocktail",
    brand: "Tropicoul",
    productName: "Cocktail",
    accessibleLabel: "Tropicoul Cocktail",
    ...posterAssets("tropicoul-cocktail"),
    modelSrc: "/models/mpm/tropicoul-cocktail.glb",
    palette: { background: "#0b5ea8", backgroundDeep: "#063a5b", accent: "#a9e6f4", foreground: "light" },
    decorativeLayers: createHeroUniverse("tropicoul-cocktail", "cocktail", [
      {
        id: "cocktail-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
        depth: "back", role: "atmosphere", blend: "screen", opacity: 0.56,
        desktop: { x: 78, y: 31, scale: 0.56, rotate: -2 }, mobile: { x: 88, y: 29, scale: 0.66, rotate: -4 },
        motion: { preset: "drift", durationMs: 15000, delayMs: 0, amplitude: 0.54 },
      },
      {
        id: "cocktail-ribbon-back-v01", dimensions: { width: 2200, height: 1650 },
        depth: "back", role: "splash", blend: "screen", opacity: 0.66,
        desktop: { x: 70, y: 60, scale: 0.52, rotate: -5 }, mobile: { x: 80, y: 64, scale: 0.61, rotate: -8 },
        motion: { preset: "float", durationMs: 12200, delayMs: 120, amplitude: 0.62 },
      },
      {
        id: "cocktail-fruit-cluster-mid-v01", dimensions: { width: 1600, height: 1600 },
        depth: "mid", role: "fruit", blend: "normal", opacity: 0.92,
        desktop: { x: 87, y: 71, scale: 0.31, rotate: -4 }, mobile: { x: 92, y: 76, scale: 0.35, rotate: -6 },
        motion: { preset: "parallax", durationMs: 12600, delayMs: 160, amplitude: 0.7 },
      },
      {
        id: "cocktail-splash-mid-v01", dimensions: { width: 2200, height: 1650 },
        depth: "front", role: "splash", blend: "screen", opacity: 0.67,
        desktop: { x: 72, y: 77, scale: 0.49, rotate: 3 }, mobile: { x: 82, y: 82, scale: 0.57, rotate: 5 },
        motion: { preset: "float", durationMs: 10800, delayMs: 60, amplitude: 0.64 },
      },
      {
        id: "cocktail-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
        depth: "atmosphere", role: "particle", blend: "screen", opacity: 0.62,
        desktop: { x: 92, y: 49, scale: 0.32, rotate: 2 }, mobile: { x: 97, y: 50, scale: 0.36, rotate: 4 },
        motion: { preset: "drift", durationMs: 9000, delayMs: 0, amplitude: 0.52 },
      },
    ]),
    model: webModel,
  },
  {
    id: "tropicoul-tamarin",
    brand: "Tropicoul",
    productName: "Tamarin",
    accessibleLabel: "Tropicoul Tamarin",
    ...posterAssets("tropicoul-tamarin"),
    modelSrc: "/models/mpm/tropicoul-tamarin.glb",
    palette: { background: "#67824b", backgroundDeep: "#2d4b31", accent: "#d98b45", foreground: "light" },
    decorativeLayers: createHeroUniverse("tropicoul-tamarin", "tamarin", [
      {
        id: "tamarin-atmosphere-back-v01", dimensions: { width: 2048, height: 1536 },
        depth: "back", role: "atmosphere", blend: "screen", opacity: 0.58,
        desktop: { x: 79, y: 37, scale: 0.56, rotate: -3 }, mobile: { x: 88, y: 34, scale: 0.65, rotate: -5 },
        motion: { preset: "drift", durationMs: 15200, delayMs: 0, amplitude: 0.54 },
      },
      {
        id: "tamarin-leaf-branch-mid-v01", dimensions: { width: 1800, height: 1800 },
        depth: "back", role: "leaf", blend: "normal", opacity: 0.74,
        desktop: { x: 88, y: 22, scale: 0.36, rotate: 8 }, mobile: { x: 95, y: 20, scale: 0.4, rotate: 11 },
        motion: { preset: "drift", durationMs: 15800, delayMs: 140, amplitude: 0.58 },
      },
      {
        id: "tamarin-amber-ribbon-mid-v01", dimensions: { width: 2200, height: 1650 },
        depth: "mid", role: "splash", blend: "screen", opacity: 0.7,
        desktop: { x: 70, y: 61, scale: 0.52, rotate: -5 }, mobile: { x: 81, y: 66, scale: 0.61, rotate: -8 },
        motion: { preset: "float", durationMs: 11600, delayMs: 100, amplitude: 0.64 },
      },
      {
        id: "tamarin-open-pod-mid-v01", dimensions: { width: 1600, height: 1600 },
        depth: "front", role: "fruit", blend: "normal", opacity: 0.92,
        desktop: { x: 88, y: 72, scale: 0.27, rotate: -8 }, mobile: { x: 93, y: 78, scale: 0.31, rotate: -10 },
        motion: { preset: "parallax", durationMs: 12800, delayMs: 160, amplitude: 0.7 },
      },
      {
        id: "tamarin-particle-front-v01", dimensions: { width: 2048, height: 2048 }, hideOnMobile: true,
        depth: "atmosphere", role: "particle", blend: "screen", opacity: 0.64,
        desktop: { x: 92, y: 50, scale: 0.32, rotate: 3 }, mobile: { x: 97, y: 52, scale: 0.36, rotate: 5 },
        motion: { preset: "drift", durationMs: 8600, delayMs: 0, amplitude: 0.52 },
      },
    ]),
    model: webModel,
  },
  {
    id: "triplex",
    brand: "Triplex",
    productName: "Energy Drink",
    accessibleLabel: "Triplex Energy Drink",
    ...posterAssets("triplex"),
    modelSrc: "/models/mpm/triplex-energy-drink.glb",
    palette: { background: "#3d1514", backgroundDeep: "#120d0d", accent: "#e3402d", foreground: "light" },
    decorativeLayers: createDecorativeLayers([
      {
        id: "triplex-background-hero-v01",
        ...universeMedia(
          "triplex-original",
          "triplex-background-hero-desktop-v01",
          { width: 2880, height: 1800 },
          "triplex-background-hero-mobile-v01",
          { width: 1440, height: 1920 },
        ),
        alt: "",
        desktop: { x: 50, y: 50, scale: 1.02, rotate: 0 },
        mobile: { x: 50, y: 50, scale: 1.02, rotate: 0 },
        depth: "back",
        role: "background",
        blend: "normal",
        fit: "cover",
        motion: { preset: "static", durationMs: 0, delayMs: 0, amplitude: 0 },
      },
      {
        id: "triplex-carbon-pattern-back-v01",
        ...universeMedia("triplex-original", "triplex-carbon-pattern-back-v01", { width: 2048, height: 2048 }),
        alt: "",
        desktop: { x: 50, y: 50, scale: 1.03, rotate: 0 },
        mobile: { x: 50, y: 50, scale: 1.03, rotate: 0 },
        depth: "back",
        role: "texture",
        blend: "screen",
        fit: "cover",
        opacity: 0.045,
        motion: { preset: "static", durationMs: 0, delayMs: 0, amplitude: 0 },
      },
      {
        id: "triplex-smoke-back-v01",
        ...universeMedia("triplex-original", "triplex-smoke-back-v01", { width: 2048, height: 1536 }),
        alt: "",
        desktop: { x: 76, y: 62, scale: 0.58, rotate: -4 },
        mobile: { x: 79, y: 66, scale: 0.66, rotate: -7 },
        depth: "back",
        role: "atmosphere",
        blend: "screen",
        opacity: 0.55,
        motion: { preset: "drift", durationMs: 16200, delayMs: 0, amplitude: 0.65 },
      },
      {
        id: "triplex-energy-ribbon-back-v01",
        ...universeMedia("triplex-original", "triplex-energy-ribbon-back-v01", { width: 2200, height: 1650 }),
        alt: "",
        desktop: { x: 66, y: 49, scale: 0.55, rotate: -8 },
        mobile: { x: 75, y: 49, scale: 0.62, rotate: -10 },
        depth: "back",
        role: "foreground",
        blend: "screen",
        opacity: 0.72,
        motion: { preset: "float", durationMs: 12400, delayMs: 100, amplitude: 0.7 },
      },
      {
        id: "triplex-speed-line-mid-v01",
        ...universeMedia("triplex-original", "triplex-speed-line-mid-v01", { width: 1600, height: 1200 }),
        alt: "",
        desktop: { x: 85, y: 45, scale: 0.4, rotate: -4 },
        mobile: { x: 91, y: 43, scale: 0.46, rotate: -7 },
        depth: "mid",
        role: "particle",
        blend: "screen",
        opacity: 0.66,
        motion: { preset: "float", durationMs: 5200, delayMs: 0, amplitude: 0.75 },
      },
      {
        id: "triplex-fragment-mid-v01",
        ...universeMedia("triplex-original", "triplex-fragment-mid-v01", { width: 1200, height: 1200 }),
        alt: "",
        desktop: { x: 90, y: 61, scale: 0.2, rotate: 8 },
        mobile: { x: 96, y: 62, scale: 0.23, rotate: 10 },
        depth: "mid",
        role: "particle",
        blend: "screen",
        opacity: 0.52,
        motion: { preset: "drift", durationMs: 7800, delayMs: 180, amplitude: 0.51 },
      },
      {
        id: "triplex-foreground-energy-front-v01",
        ...universeMedia("triplex-original", "triplex-foreground-energy-front-v01", { width: 2200, height: 1650 }),
        alt: "",
        desktop: { x: 82, y: 79, scale: 0.49, rotate: 0 },
        mobile: { x: 86, y: 82, scale: 0.54, rotate: 0 },
        depth: "front",
        role: "foreground",
        blend: "screen",
        opacity: 0.62,
        motion: { preset: "float", durationMs: 10800, delayMs: 80, amplitude: 0.52 },
      },
      {
        id: "triplex-spark-front-v01",
        ...universeMedia("triplex-original", "triplex-spark-front-v01", { width: 2048, height: 2048 }),
        alt: "",
        desktop: { x: 91, y: 34, scale: 0.28, rotate: 6 },
        mobile: { x: 96, y: 35, scale: 0.32, rotate: 8 },
        depth: "atmosphere",
        role: "particle",
        blend: "screen",
        opacity: 0.68,
        motion: { preset: "pulse", durationMs: 3400, delayMs: 0, amplitude: 0.25 },
      },
    ]),
    model: webModel,
  },
  {
    id: "vimto",
    brand: "Vimto",
    productName: "Sparkling",
    accessibleLabel: "Vimto Sparkling 330 ml",
    posterSrc: "/media/mpm/product-pages/vimto-sparkling/v2/hero-desktop.webp",
    posterAvifSrc: "/media/mpm/product-pages/vimto-sparkling/v2/hero-desktop.avif",
    posterWebpSrc: "/media/mpm/product-pages/vimto-sparkling/v2/hero-desktop.webp",
    posterMobileSrc: "/media/mpm/product-pages/vimto-sparkling/v2/hero-mobile.webp",
    posterMobileAvifSrc: "/media/mpm/product-pages/vimto-sparkling/v2/hero-mobile.avif",
    posterMobileWebpSrc: "/media/mpm/product-pages/vimto-sparkling/v2/hero-mobile.webp",
    packshotSrc: "/media/mpm/universes/vimto-sparkling/vimto-can-cutout-clean-v003.png",
    packshotAvifSrc: "/media/mpm/universes/vimto-sparkling/vimto-can-cutout-clean-v003.avif",
    packshotWebpSrc: "/media/mpm/universes/vimto-sparkling/vimto-can-cutout-clean-v003.webp",
    modelSrc: "/models/mpm/vimto-sparkling-v2.glb",
    palette: { background: "#B1172D", backgroundDeep: "#650B1A", accent: "#FDE002", foreground: "light" },
    decorativeLayers: createDecorativeLayers([
      {
        id: "vimto-background-hero-v02",
        ...universeMedia(
          "vimto-sparkling",
          "vimto-background-hero-desktop-v02",
          { width: 2560, height: 1440 },
          "vimto-background-hero-mobile-v02",
          { width: 1440, height: 1920 },
        ),
        alt: "",
        depth: "back",
        role: "background",
        blend: "normal",
        fit: "cover",
        desktop: { x: 50, y: 50, scale: 1.02, rotate: 0 },
        mobile: { x: 50, y: 50, scale: 1.02, rotate: 0 },
        motion: { preset: "static", durationMs: 0, delayMs: 0, amplitude: 0 },
      },
      {
        id: "vimto-red-liquid-ribbon-mid-v02",
        ...universeMedia("vimto-sparkling", "vimto-red-liquid-ribbon-mid-v02", { width: 2000, height: 1600 }),
        alt: "",
        depth: "mid",
        role: "splash",
        blend: "screen",
        opacity: 0.7,
        desktop: { x: 70, y: 62, scale: 0.5, rotate: -4 },
        mobile: { x: 78, y: 67, scale: 0.58, rotate: -6 },
        motion: { preset: "float", durationMs: 11600, delayMs: 80, amplitude: 0.58 },
      },
      {
        id: "vimto-bubble-particle-front-v02",
        ...universeMedia("vimto-sparkling", "vimto-bubble-particle-front-v02", { width: 2000, height: 1600 }),
        alt: "",
        depth: "atmosphere",
        role: "particle",
        blend: "screen",
        opacity: 0.64,
        desktop: { x: 88, y: 50, scale: 0.4, rotate: 2 },
        mobile: { x: 92, y: 54, scale: 0.46, rotate: 4 },
        motion: { preset: "drift", durationMs: 13200, delayMs: 0, amplitude: 0.5 },
      },
    ]),
    model: webModel,
  },
];

export const HERO_UNIVERSES = allHeroUniverses;
