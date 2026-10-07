"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

import { HERO_UNIVERSES } from "./hero-universes";
import {
  getThreeRuntime,
  preloadModel,
  resolvePresentationModelSource,
} from "./three-model-cache";

const BRAND_LOGO_SRC = "/media/mpm/brand/multiproduit-mali-logo-512.webp";
const MINIMUM_VISIBLE_MS = 680;
const MAXIMUM_VISIBLE_MS = 2800;
const FILL_COMPLETE_MS = 700;
const EXIT_DURATION_MS = 360;

type LoaderPhase = "loading" | "filling" | "complete" | "hidden";

function preloadImage(candidates: readonly string[]) {
  return new Promise<void>((resolve) => {
    let index = 0;

    const tryNext = () => {
      const src = candidates[index];
      index += 1;
      if (!src) {
        resolve();
        return;
      }

      const image = new window.Image();
      image.fetchPriority = "high";
      image.onload = () => resolve();
      image.onerror = tryNext;
      image.src = src;
    };

    tryNext();
  });
}

export function SiteExperienceLoader() {
  const [phase, setPhase] = useState<LoaderPhase>("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const firstUniverse = HERO_UNIVERSES[0];
    const startedAt = performance.now();
    let disposed = false;
    let criticalAssetsReady = false;
    let firstFrameReady = root.dataset.mpmHeroReady === firstUniverse.id;
    let finishScheduled = false;
    let fillTimer = 0;
    let exitTimer = 0;
    let minimumTimer = 0;

    root.classList.add("is-site-loading");
    const initialProgressFrame = window.requestAnimationFrame(() => setProgress((current) => Math.max(current, 0.12)));

    const finish = () => {
      if (disposed || finishScheduled || !criticalAssetsReady || !firstFrameReady) return;
      finishScheduled = true;
      const remaining = Math.max(0, MINIMUM_VISIBLE_MS - (performance.now() - startedAt));
      window.clearTimeout(minimumTimer);
      minimumTimer = window.setTimeout(() => {
        if (disposed) return;
        setProgress(1);
        setPhase("filling");
        fillTimer = window.setTimeout(() => {
          if (disposed) return;
          setPhase("complete");
          root.classList.remove("is-site-loading");
          exitTimer = window.setTimeout(() => {
            if (!disposed) setPhase("hidden");
          }, EXIT_DURATION_MS);
        }, FILL_COMPLETE_MS);
      }, remaining);
    };

    const handleFirstFrame = () => {
      firstFrameReady = true;
      setProgress((current) => Math.max(current, 0.88));
      finish();
    };

    window.addEventListener("mpm:hero-3d-ready", handleFirstFrame, { once: true });
    window.addEventListener("hero_3d_fallback", handleFirstFrame, { once: true });

    const maximumTimer = window.setTimeout(() => {
      criticalAssetsReady = true;
      firstFrameReady = true;
      finish();
    }, MAXIMUM_VISIBLE_MS);

    const warmCriticalAssets = async () => {
      await Promise.allSettled([
        getThreeRuntime(),
        preloadModel(resolvePresentationModelSource(
          firstUniverse.modelSrc,
          firstUniverse.modelHdSrc,
        )),
        preloadImage([
          firstUniverse.packshotAvifSrc,
          firstUniverse.packshotWebpSrc,
          firstUniverse.packshotSrc,
        ]),
      ]);
      if (disposed) return;

      criticalAssetsReady = true;
      setProgress((current) => Math.max(current, 0.76));
      finish();

      // The entry sequence prepares only the model currently on screen. Parsing
      // every hero GLB here competes with the visitor's first scroll; subsequent
      // universes load on demand and keep their packshot fallback meanwhile.
    };

    void warmCriticalAssets();

    return () => {
      disposed = true;
      root.classList.remove("is-site-loading");
      window.cancelAnimationFrame(initialProgressFrame);
      window.clearTimeout(maximumTimer);
      window.clearTimeout(minimumTimer);
      window.clearTimeout(fillTimer);
      window.clearTimeout(exitTimer);
      window.removeEventListener("mpm:hero-3d-ready", handleFirstFrame);
      window.removeEventListener("hero_3d_fallback", handleFirstFrame);
    };
  }, []);

  if (phase === "hidden") return null;

  const loaderStyle = {
    "--site-loader-clip": `${(1 - progress) * 100}%`,
  } as CSSProperties;

  return (
    <div
      className={`site-loader site-loader--${phase}`}
      data-loader-phase={phase}
      role="status"
      aria-live="polite"
      aria-label="Préparation de l’expérience Multiproduit Mali"
      style={loaderStyle}
    >
      <div className="site-loader__content">
        <div className="site-loader__logo" aria-hidden="true">
          <Image
            className="site-loader__logo-base"
            src={BRAND_LOGO_SRC}
            alt=""
            width={512}
            height={512}
            priority
            fetchPriority="high"
            unoptimized
          />
          <span className="site-loader__logo-color">
            <Image
              src={BRAND_LOGO_SRC}
              alt=""
              width={512}
              height={512}
              priority
              fetchPriority="high"
              unoptimized
            />
          </span>
          <span className="site-loader__shine" />
        </div>
        <p>Multiproduit Mali</p>
      </div>
    </div>
  );
}
