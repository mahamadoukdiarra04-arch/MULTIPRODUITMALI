"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";

import { DecorativePicture } from "./DecorativePicture";
import {
  DECORATIVE_DEPTHS,
  getDecorativeAssets,
  getDecorativePreloadSource,
} from "./decorative-assets";
import { HERO_UNIVERSES, type HeroUniverse } from "./hero-universes";
import { HeroScene3D } from "./HeroScene3D";
import { preloadModel } from "./three-model-cache";

type HeroProductStageProps = {
  activeIndex: number;
  previousIndex: number | null;
  transitioning: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

type UniverseState = "active" | "incoming" | "outgoing";
type IdleWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function preloadImageCandidates(candidates: readonly string[], priority: "high" | "low") {
  let cancelled = false;

  const run = async () => {
    for (const src of candidates) {
      if (cancelled) return;
      const preload = new Image();
      preload.fetchPriority = priority;
      preload.src = src;
      try {
        await preload.decode();
        return;
      } catch {
        // Try the next supported fallback.
      }
    }
  };

  void run();
  return () => {
    cancelled = true;
  };
}

function scheduleIdlePreload(callback: () => void) {
  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(callback, { timeout: 1200 });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }

  const handle = window.setTimeout(callback, 350);
  return () => window.clearTimeout(handle);
}

function universeStyle(universe: HeroUniverse) {
  return {
    "--universe-background": universe.palette.background,
    "--universe-deep": universe.palette.backgroundDeep,
    "--universe-accent": universe.palette.accent,
    "--universe-foreground": universe.palette.foreground === "light" ? "#ffffff" : "#161714",
    "--universe-poster": `url("${universe.posterSrc}")`,
  } as CSSProperties;
}

function DecorLayer({
  universe,
  depth,
  priority = false,
}: {
  universe: HeroUniverse;
  depth: (typeof DECORATIVE_DEPTHS)[number];
  priority?: boolean;
}) {
  return (
    <div className={`hero-stage__decor-layer hero-stage__decor-layer--${depth}`}>
      {getDecorativeAssets(universe.decorativeLayers, depth).map((asset) => {
        const isBackground = asset.role === "background";
        const backgroundIsPriority = priority && isBackground;
        return (
          <DecorativePicture
          asset={asset}
          className={`hero-stage__asset hero-stage__asset--${asset.role} hero-stage__asset--blend-${asset.blend}`}
          sizes="(max-width: 760px) 138vw, 78vw"
          key={`${universe.id}-${depth}-${asset.role}-${asset.id}`}
          loading={backgroundIsPriority ? "eager" : "lazy"}
          fetchPriority={backgroundIsPriority ? "high" : "low"}
          reveal={!isBackground}
          style={{
            "--asset-desktop-x": `${asset.desktop.x}%`,
            "--asset-desktop-y": `${asset.desktop.y}%`,
            "--asset-desktop-scale": asset.desktop.scale,
            "--asset-desktop-rotate": `${asset.desktop.rotate}deg`,
            "--asset-mobile-x": `${asset.mobile.x}%`,
            "--asset-mobile-y": `${asset.mobile.y}%`,
            "--asset-mobile-scale": asset.mobile.scale,
            "--asset-mobile-rotate": `${asset.mobile.rotate}deg`,
            "--asset-motion-duration": `${asset.motion.durationMs}ms`,
            "--asset-motion-delay": `${asset.motion.delayMs}ms`,
            "--asset-motion-amplitude": `${asset.motion.amplitude}rem`,
          } as CSSProperties}
        />
        );
      })}
    </div>
  );
}

function UniverseLayer({ universe, state }: { universe: HeroUniverse; state: UniverseState }) {
  return (
    <div
      className={`hero-stage__universe hero-stage__universe--${state}`}
      data-universe={universe.id}
      style={universeStyle(universe)}
    >
      <div className="hero-stage__glow" />
      <p className="hero-stage__brand">{universe.brand}</p>
      <DecorLayer universe={universe} depth="back" priority={state !== "outgoing"} />
      <DecorLayer universe={universe} depth="mid" />
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
  const [modelReadyId, setModelReadyId] = useState<string | null>(null);
  const modelHasRendered = modelReadyId !== null;
  const handleModelReady = useCallback(() => setModelReadyId(activeUniverse.id), [activeUniverse.id]);

  useEffect(() => {
    const nextUniverse = HERO_UNIVERSES[(activeIndex + 1) % HERO_UNIVERSES.length];
    const cancelNextPackshot = preloadImageCandidates([
      nextUniverse.packshotAvifSrc,
      nextUniverse.packshotWebpSrc,
      nextUniverse.packshotSrc,
    ], "low");

    void preloadModel(activeUniverse.modelSrc).catch(() => undefined);
    void preloadModel(nextUniverse.modelSrc).catch(() => undefined);
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    DECORATIVE_DEPTHS.flatMap((depth) => getDecorativeAssets(nextUniverse.decorativeLayers, depth))
      .filter((asset) => asset.role === "background")
      .forEach((asset) => {
        const preload = new Image();
        preload.fetchPriority = "low";
        preload.src = getDecorativePreloadSource(asset, mobile);
      });

    return cancelNextPackshot;
  }, [activeIndex, activeUniverse.modelSrc]);

  useEffect(() => {
    if (modelReadyId !== activeUniverse.id) return;

    const nextUniverse = HERO_UNIVERSES[(activeIndex + 2) % HERO_UNIVERSES.length];
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    let cancelled = false;

    const cancelIdlePreload = scheduleIdlePreload(() => {
      if (cancelled) return;
      void preloadModel(nextUniverse.modelSrc).catch(() => undefined);
      DECORATIVE_DEPTHS.flatMap((depth) => getDecorativeAssets(nextUniverse.decorativeLayers, depth))
        .filter((asset) => asset.role !== "background")
        .slice(0, 2)
        .forEach((asset) => {
          const preload = new Image();
          preload.fetchPriority = "low";
          preload.src = getDecorativePreloadSource(asset, mobile);
        });
    });

    return () => {
      cancelled = true;
      cancelIdlePreload();
    };
  }, [activeIndex, activeUniverse.id, modelReadyId]);

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
      <div className="hero-stage__model">
        <picture className="hero-stage__packshot">
          <source type="image/avif" srcSet={activeUniverse.packshotAvifSrc} />
          <source type="image/webp" srcSet={activeUniverse.packshotWebpSrc} />
          <img
            className={`hero-stage__packshot-image${modelHasRendered ? " is-model-ready" : ""}`}
            src={activeUniverse.packshotSrc}
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </picture>
        <HeroScene3D universe={activeUniverse} onReady={handleModelReady} />
      </div>
      <DecorLayer universe={activeUniverse} depth="front" />
      <DecorLayer universe={activeUniverse} depth="atmosphere" />
      <p className="hero-stage__name">{activeUniverse.productName}</p>
    </div>
  );
}
