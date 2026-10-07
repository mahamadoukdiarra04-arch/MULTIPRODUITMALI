"use client";

import { useRef, type CSSProperties, type FocusEvent } from "react";
import Link from "./PlainLink";

import { HeroProductStage } from "./HeroProductStage";
import { HERO_UNIVERSES } from "./hero-universes";
import { useHeroAutoplay } from "./useHeroAutoplay";

const heroCopy = {
  fr: {
    headline: "Multiproduit Mali, des goûts qui rassemblent.",
    introduction:
      "Tropicoul apporte l’évasion fruitée, Triplex garde le rythme et Vimto réveille les souvenirs. Des canettes pleines de caractère, faites pour les pauses fraîches, les tables animées et les moments qui comptent.",
    primaryCta: "Découvrir nos boissons",
    secondaryCta: "Nous écrire",
  },
} as const;

type HeroShowcaseProps = {
  locale?: keyof typeof heroCopy;
};

function emitHeroEvent(name: "hero_contact_click" | "hero_products_click" | "hero_motion_paused", locale: "fr", source?: "keyboard" | "touch") {
  window.dispatchEvent(new CustomEvent("mpm:analytics", { detail: { name, locale, source } }));
}

export function HeroShowcase({ locale = "fr" }: HeroShowcaseProps) {
  const heroRef = useRef<HTMLElement>(null);
  const autoplay = useHeroAutoplay(heroRef, HERO_UNIVERSES.length);
  const activeUniverse = HERO_UNIVERSES[autoplay.activeIndex];
  const copy = heroCopy[locale];
  const heroStyle = {
    "--hero-mobile-copy": activeUniverse.palette.foreground === "light" ? "#ffffff" : "#161714",
  } as CSSProperties;

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) autoplay.setFocused(false);
  };

  return (
    <section
      className="hero"
      id="accueil"
      ref={heroRef}
      style={heroStyle}
      data-playback-state={autoplay.playbackState}
      onFocusCapture={() => autoplay.setFocused(true)}
      onBlurCapture={handleBlur}
      onTouchStart={() => {
        autoplay.pauseForTouch();
        emitHeroEvent("hero_motion_paused", locale, "touch");
      }}
    >
      <div className="hero__copy">
        <h1>{copy.headline}</h1>
        <p className="hero__lead">{copy.introduction}</p>
        <div className="hero__actions">
          <Link className="hero__cta hero__cta--primary" href="/#marques" onClick={() => emitHeroEvent("hero_products_click", locale)}>
            {copy.primaryCta} <span aria-hidden="true">↗</span>
          </Link>
          <Link className="hero__cta hero__cta--secondary" href="/contact?source=hero" onClick={() => emitHeroEvent("hero_contact_click", locale)}>
            {copy.secondaryCta} <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      <HeroProductStage
        activeIndex={autoplay.activeIndex}
        previousIndex={autoplay.previousIndex}
        transitioning={autoplay.transitioning}
      />

      <button
        className={`hero__motion-control${autoplay.controlsRevealed ? " is-revealed" : ""}`}
        type="button"
        aria-pressed={autoplay.manualPaused}
        aria-label={autoplay.manualPaused ? "Reprendre l’animation des produits" : "Mettre l’animation des produits en pause"}
        onClick={() => {
          autoplay.toggleManualPause();
          emitHeroEvent("hero_motion_paused", locale, "keyboard");
        }}
      >
        {autoplay.manualPaused ? "Lecture" : "Pause"}
      </button>
    </section>
  );
}
