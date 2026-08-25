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
  modelSrc?: string;
  textureSrc?: string;
  palette: {
    background: string;
    backgroundDeep: string;
    accent: string;
    foreground: "light" | "dark";
  };
  assets: Array<{
    src: string;
    alt: "";
    desktop: { x: number; y: number; scale: number; rotate: number };
    mobile: { x: number; y: number; scale: number; rotate: number };
    depth: "back" | "mid" | "front";
  }>;
  model: {
    enabled: boolean;
    scale: number;
    rotationOffset: number;
    mobileScale: number;
  };
};

const posterModel = {
  enabled: false,
  scale: 1,
  rotationOffset: 0,
  mobileScale: 0.82,
} as const;

export const HERO_UNIVERSES: readonly HeroUniverse[] = [
  {
    id: "tropicoul-ananas",
    brand: "Tropicoul",
    productName: "Ananas",
    accessibleLabel: "Tropicoul Ananas",
    posterSrc: "/media/mpm/hero/tropicoul-ananas/poster.png",
    palette: { background: "#ffd957", backgroundDeep: "#ea7d20", accent: "#1f7a39", foreground: "dark" },
    assets: [],
    model: posterModel,
  },
  {
    id: "tropicoul-orange",
    brand: "Tropicoul",
    productName: "Orange",
    accessibleLabel: "Tropicoul Orange",
    posterSrc: "/media/mpm/hero/tropicoul-orange/poster.png",
    palette: { background: "#ffb139", backgroundDeep: "#e24e1c", accent: "#ffe27a", foreground: "dark" },
    assets: [],
    model: posterModel,
  },
  {
    id: "tropicoul-mangue",
    brand: "Tropicoul",
    productName: "Mangue",
    accessibleLabel: "Tropicoul Mangue",
    posterSrc: "/media/mpm/hero/tropicoul-mangue/poster.png",
    palette: { background: "#f5bd3e", backgroundDeep: "#e96b24", accent: "#6a8d2e", foreground: "dark" },
    assets: [],
    model: posterModel,
  },
  {
    id: "tropicoul-goyave",
    brand: "Tropicoul",
    productName: "Goyave",
    accessibleLabel: "Tropicoul Goyave",
    posterSrc: "/media/mpm/hero/tropicoul-goyave/poster.png",
    palette: { background: "#f08aa5", backgroundDeep: "#c93f69", accent: "#365f31", foreground: "dark" },
    assets: [],
    model: posterModel,
  },
  {
    id: "tropicoul-cocktail",
    brand: "Tropicoul",
    productName: "Cocktail",
    accessibleLabel: "Tropicoul Cocktail",
    posterSrc: "/media/mpm/hero/tropicoul-cocktail/poster.png",
    palette: { background: "#e6c94e", backgroundDeep: "#77963b", accent: "#dc5f31", foreground: "dark" },
    assets: [],
    model: posterModel,
  },
  {
    id: "tropicoul-tamarin",
    brand: "Tropicoul",
    productName: "Tamarin",
    accessibleLabel: "Tropicoul Tamarin",
    posterSrc: "/media/mpm/hero/tropicoul-tamarin/poster.png",
    palette: { background: "#67824b", backgroundDeep: "#2d4b31", accent: "#d98b45", foreground: "light" },
    assets: [],
    model: posterModel,
  },
  {
    id: "triplex",
    brand: "Triplex",
    productName: "Energy Drink",
    accessibleLabel: "Triplex Energy Drink",
    posterSrc: "/media/mpm/hero/triplex/poster.png",
    palette: { background: "#3d1514", backgroundDeep: "#120d0d", accent: "#e3402d", foreground: "light" },
    assets: [],
    model: posterModel,
  },
];

// Vimto reste volontairement hors de la séquence tant que son poster et sa
// palette officiels ne sont pas validés.
export const PENDING_HERO_UNIVERSES = ["Vimto"] as const;
