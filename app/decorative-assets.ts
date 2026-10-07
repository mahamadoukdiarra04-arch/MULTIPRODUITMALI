export const DECORATIVE_DEPTHS = ["back", "mid", "front", "atmosphere"] as const;
export const DECORATIVE_ROLES = [
  "background",
  "atmosphere",
  "fruit",
  "leaf",
  "splash",
  "particle",
  "foreground",
  "texture",
  "lifestyle",
] as const;

export type DecorativeDepth = (typeof DECORATIVE_DEPTHS)[number];
export type DecorativeRole = (typeof DECORATIVE_ROLES)[number];
export type DecorativeMotion = "drift" | "float" | "parallax" | "pulse" | "static";

export type DecorativeMediaSet = {
  avif?: string;
  webp?: string;
  png?: string;
  width: number;
  height: number;
};

export type DecorativeResponsiveSources = {
  desktop: DecorativeMediaSet;
  mobile?: DecorativeMediaSet;
};

export type DecorativeAsset = {
  id: string;
  src: string;
  sources?: DecorativeResponsiveSources;
  hideOnMobile?: boolean;
  alt: "";
  blend: "normal" | "multiply" | "screen";
  fit?: "contain" | "cover";
  opacity?: number;
  desktop: { x: number; y: number; scale: number; rotate: number };
  mobile: { x: number; y: number; scale: number; rotate: number };
  motion: {
    preset: DecorativeMotion;
    durationMs: number;
    delayMs: number;
    amplitude: number;
  };
};

export type DecorativeLayers = Record<
  DecorativeDepth,
  Record<DecorativeRole, readonly DecorativeAsset[]>
>;

export type DecorativeAssetDefinition = DecorativeAsset & {
  depth: DecorativeDepth;
  role: DecorativeRole;
};

export function createDecorativeLayers(
  assets: readonly DecorativeAssetDefinition[] = [],
): DecorativeLayers {
  const layers = Object.fromEntries(
    DECORATIVE_DEPTHS.map((depth) => [
      depth,
      Object.fromEntries(DECORATIVE_ROLES.map((role) => [role, [] as DecorativeAsset[]])),
    ]),
  ) as Record<DecorativeDepth, Record<DecorativeRole, DecorativeAsset[]>>;

  for (const { depth, role, ...asset } of assets) {
    layers[depth][role].push(asset);
  }

  return layers;
}

export function getDecorativeAssets(
  layers: DecorativeLayers,
  depth: DecorativeDepth,
) {
  return DECORATIVE_ROLES.flatMap((role) =>
    layers[depth][role].map((asset) => ({ ...asset, role })),
  );
}

export function getDecorativePreloadSource(asset: DecorativeAsset, mobile: boolean) {
  const media = mobile && asset.sources?.mobile
    ? asset.sources.mobile
    : asset.sources?.desktop;
  return media?.webp ?? media?.png ?? media?.avif ?? asset.src;
}
