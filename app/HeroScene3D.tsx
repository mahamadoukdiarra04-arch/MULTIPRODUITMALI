"use client";

import type { HeroUniverse } from "./hero-universes";

type HeroScene3DProps = {
  universe: HeroUniverse;
};

// Point d'extension prévu pour les futurs GLB validés. Tant que les modèles
// officiels ne sont pas livrés, le poster 2.5D reste le rendu de référence.
export function HeroScene3D({ universe }: HeroScene3DProps) {
  void universe;
  return null;
}
