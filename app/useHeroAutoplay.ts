"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import {
  HERO_DISPLAY_MS,
  HERO_MIN_VISIBLE_RATIO,
  HERO_RESUME_DELAY_MS,
  HERO_TOUCH_PAUSE_MS,
  HERO_TRANSITION_MS,
} from "./hero-universes";

export type HeroPlaybackState =
  | "playing"
  | "transitioning"
  | "paused-hover"
  | "paused-focus"
  | "paused-touch"
  | "paused-hidden"
  | "paused-offscreen"
  | "paused-manual"
  | "paused-resume"
  | "reduced-motion";

export function useHeroAutoplay(rootRef: RefObject<HTMLElement | null>, universeCount: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [heroVisible, setHeroVisible] = useState(true);
  const [manualPaused, setManualPaused] = useState(false);
  const [resumeBlocked, setResumeBlocked] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [controlsRevealed, setControlsRevealed] = useState(false);
  const previouslyPaused = useRef(false);
  const touchPauseTimer = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setDocumentVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.intersectionRatio >= HERO_MIN_VISIBLE_RATIO),
      { threshold: [0, HERO_MIN_VISIBLE_RATIO, 1] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootRef]);

  useEffect(() => () => {
    if (touchPauseTimer.current !== null) window.clearTimeout(touchPauseTimer.current);
  }, []);

  const paused = reducedMotion || hovered || focused || touchPaused || !documentVisible || !heroVisible || manualPaused;

  useEffect(() => {
    if (previouslyPaused.current && !paused && !reducedMotion) {
      setResumeBlocked(true);
      const timeout = window.setTimeout(() => setResumeBlocked(false), HERO_RESUME_DELAY_MS);
      previouslyPaused.current = paused;
      return () => window.clearTimeout(timeout);
    }
    previouslyPaused.current = paused;
  }, [paused, reducedMotion]);

  const playbackState = useMemo<HeroPlaybackState>(() => {
    if (reducedMotion) return "reduced-motion";
    if (!documentVisible) return "paused-hidden";
    if (!heroVisible) return "paused-offscreen";
    if (manualPaused) return "paused-manual";
    if (touchPaused) return "paused-touch";
    if (focused) return "paused-focus";
    if (hovered) return "paused-hover";
    if (resumeBlocked) return "paused-resume";
    if (transitioning) return "transitioning";
    return "playing";
  }, [documentVisible, focused, heroVisible, hovered, manualPaused, reducedMotion, resumeBlocked, touchPaused, transitioning]);

  const advance = useCallback(() => {
    if (universeCount < 2) return;
    setActiveIndex((current) => {
      setPreviousIndex(current);
      return (current + 1) % universeCount;
    });
    setTransitioning(true);
  }, [universeCount]);

  useEffect(() => {
    if (playbackState !== "playing") return;
    const timeout = window.setTimeout(advance, HERO_DISPLAY_MS);
    return () => window.clearTimeout(timeout);
  }, [advance, playbackState]);

  useEffect(() => {
    if (!transitioning) return;
    const timeout = window.setTimeout(() => {
      setPreviousIndex(null);
      setTransitioning(false);
    }, HERO_TRANSITION_MS);
    return () => window.clearTimeout(timeout);
  }, [transitioning]);

  const pauseForTouch = useCallback(() => {
    setTouchPaused(true);
    if (touchPauseTimer.current !== null) window.clearTimeout(touchPauseTimer.current);
    touchPauseTimer.current = window.setTimeout(() => setTouchPaused(false), HERO_TOUCH_PAUSE_MS);
    setControlsRevealed(true);
  }, []);

  return {
    activeIndex,
    previousIndex,
    transitioning,
    playbackState,
    controlsRevealed,
    manualPaused,
    setHovered,
    setFocused,
    pauseForTouch,
    toggleManualPause: () => setManualPaused((current) => !current),
  };
}
