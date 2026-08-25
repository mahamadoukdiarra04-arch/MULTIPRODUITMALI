"use client";

import { useRef, type CSSProperties, type FocusEvent } from "react";

import { HeroProductStage } from "./HeroProductStage";
import { HERO_UNIVERSES } from "./hero-universes";
import { useHeroAutoplay } from "./useHeroAutoplay";

const heroCopy = {
  fr: {
    eyebrow: "Multiproduit Mali SARL",
    headline: "Des boissons maliennes prêtes pour de nouveaux marchés.",
    introduction:
      "Multiproduit Mali développe et distribue les marques Tropicoul, Triplex et Vimto. Nous recherchons des partenaires capables de les représenter et de les développer dans leur pays.",
    primaryCta: "Devenir partenaire",
    secondaryCta: "Découvrir nos produits",
  },
  en: {
    eyebrow: "Multiproduit Mali SARL",
    headline: "Malian beverages ready for new markets.",
    introduction:
      "Multiproduit Mali develops and distributes Tropicoul, Triplex and Vimto. We are looking for partners to represent and grow our brands in their markets.",
    primaryCta: "Become a partner",
    secondaryCta: "Explore our products",
  },
} as const;

type HeroShowcaseProps = {
  locale?: keyof typeof heroCopy;
};

function emitHeroEvent(name: "hero_partner_click" | "hero_products_click" | "hero_motion_paused", locale: "fr" | "en", source?: "keyboard" | "touch") {
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
      onFocusCapture={() => autoplay.setFocused(true)}
      onBlurCapture={handleBlur}
      onTouchStart={() => {
        autoplay.pauseForTouch();
        emitHeroEvent("hero_motion_paused", locale, "touch");
      }}
    >
      <div className="hero__copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.headline}</h1>
        <p className="hero__lead">{copy.introduction}</p>
        <div className="hero__actions">
          <a className="hero__cta hero__cta--primary" href="#contact" onClick={() => emitHeroEvent("hero_partner_click", locale)}>
            {copy.primaryCta} <span aria-hidden="true">↗</span>
          </a>
          <a className="hero__cta hero__cta--secondary" href="#marques" onClick={() => emitHeroEvent("hero_products_click", locale)}>
            {copy.secondaryCta} <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <HeroProductStage
        activeIndex={autoplay.activeIndex}
        previousIndex={autoplay.previousIndex}
        transitioning={autoplay.transitioning}
        onPointerEnter={() => autoplay.setHovered(true)}
        onPointerLeave={() => autoplay.setHovered(false)}
      />

      <button
        className={`hero__motion-control${autoplay.controlsRevealed ? " is-revealed" : ""}`}
        type="button"
        aria-pressed={autoplay.manualPaused}
        aria-label={autoplay.manualPaused ? "Reprendre l’animation des produits" : "Mettre en pause l’animation des produits"}
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
