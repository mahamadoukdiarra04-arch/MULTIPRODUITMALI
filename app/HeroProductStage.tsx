"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";

import { HERO_UNIVERSES, type HeroUniverse } from "./hero-universes";
import { HeroScene3D } from "./HeroScene3D";

type HeroProductStageProps = {
  activeIndex: number;
  previousIndex: number | null;
  transitioning: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

type UniverseState = "active" | "incoming" | "outgoing";

function universeStyle(universe: HeroUniverse) {
  return {
    "--universe-background": universe.palette.background,
    "--universe-deep": universe.palette.backgroundDeep,
    "--universe-accent": universe.palette.accent,
    "--universe-foreground": universe.palette.foreground === "light" ? "#ffffff" : "#161714",
  } as CSSProperties;
}

function UniverseLayer({ universe, state }: { universe: HeroUniverse; state: UniverseState }) {
  const [modelReady, setModelReady] = useState(false);
  const modelIsActive = state !== "outgoing" && universe.model.enabled && Boolean(universe.modelSrc);
  const showModel = modelIsActive && modelReady;
  const handleModelReady = useCallback(() => setModelReady(true), []);

  return (
    <div
      className={`hero-stage__universe hero-stage__universe--${state}`}
      style={universeStyle(universe)}
    >
      <div className="hero-stage__glow" />
      <p className="hero-stage__brand">{universe.brand}</p>
      <div className={`hero-stage__poster${universe.model.enabled ? " hero-stage__poster--model" : ""}`}>
        <img
          className={`hero-stage__poster-image${showModel ? " is-model-ready" : ""}`}
          src={universe.posterSrc}
          alt=""
          fetchPriority={universe.id === HERO_UNIVERSES[0].id ? "high" : "auto"}
        />
        {modelIsActive ? <HeroScene3D universe={universe} onReady={handleModelReady} /> : null}
      </div>
      <p className="hero-stage__name">{universe.productName}</p>
      {universe.assets.map((asset, index) => (
        <img
          className={`hero-stage__asset hero-stage__asset--${asset.depth}`}
          src={asset.src}
          alt={asset.alt}
          key={`${universe.id}-asset-${index}`}
          style={{
            "--asset-desktop-x": `${asset.desktop.x}%`,
            "--asset-desktop-y": `${asset.desktop.y}%`,
            "--asset-desktop-scale": asset.desktop.scale,
            "--asset-desktop-rotate": `${asset.desktop.rotate}deg`,
            "--asset-mobile-x": `${asset.mobile.x}%`,
            "--asset-mobile-y": `${asset.mobile.y}%`,
            "--asset-mobile-scale": asset.mobile.scale,
            "--asset-mobile-rotate": `${asset.mobile.rotate}deg`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

export function HeroProductStage({
  activeIndex,
  previousIndex,
  transitioning,
  onPointerEnter,
  onPointerLeave,
}: HeroProductStageProps) {
  const activeUniverse = HERO_UNIVERSES[activeIndex];
  const previousUniverse = previousIndex === null ? null : HERO_UNIVERSES[previousIndex];

  useEffect(() => {
    const nextUniverse = HERO_UNIVERSES[(activeIndex + 1) % HERO_UNIVERSES.length];
    const preload = new Image();
    preload.src = nextUniverse.posterSrc;
  }, [activeIndex]);

  return (
    <div
      className="hero-stage"
      aria-hidden="true"
      role="presentation"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {previousUniverse ? (
        <UniverseLayer universe={previousUniverse} state="outgoing" key={previousUniverse.id} />
      ) : null}
      <UniverseLayer
        universe={activeUniverse}
        state={transitioning ? "incoming" : "active"}
        key={activeUniverse.id}
      />
    </div>
  );
}
