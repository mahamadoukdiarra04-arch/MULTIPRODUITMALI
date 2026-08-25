"use client";

import { useEffect, type CSSProperties } from "react";

import { HERO_UNIVERSES, type HeroUniverse } from "./hero-universes";

type HeroProductStageProps = {
  activeIndex: number;
  previousIndex: number | null;
  transitioning: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

function universeStyle(universe: HeroUniverse) {
  return {
    "--universe-background": universe.palette.background,
    "--universe-deep": universe.palette.backgroundDeep,
    "--universe-accent": universe.palette.accent,
    "--universe-foreground": universe.palette.foreground === "light" ? "#ffffff" : "#161714",
  } as CSSProperties;
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

  const renderUniverse = (universe: HeroUniverse, state: "active" | "incoming" | "outgoing") => (
    <div
      className={`hero-stage__universe hero-stage__universe--${state}`}
      style={universeStyle(universe)}
      key={`${universe.id}-${state}`}
    >
      <div className="hero-stage__glow" />
      <p className="hero-stage__brand">{universe.brand}</p>
      <div className="hero-stage__poster">
        <img
          src={universe.posterSrc}
          alt=""
          fetchPriority={universe.id === HERO_UNIVERSES[0].id ? "high" : "auto"}
        />
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

  return (
    <div
      className="hero-stage"
      aria-hidden="true"
      role="presentation"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {previousUniverse ? renderUniverse(previousUniverse, "outgoing") : null}
      {renderUniverse(activeUniverse, transitioning ? "incoming" : "active")}
    </div>
  );
}

