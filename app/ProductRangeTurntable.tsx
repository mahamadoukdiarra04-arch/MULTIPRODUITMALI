"use client";

import { useEffect, useRef, useState } from "react";

import { createPbrEnvironment, getThreeRuntime, loadModelClone } from "./three-model-cache";

type TurntableStatus = "waiting" | "loading" | "ready" | "fallback";
type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

type RangeModel = {
  outer: import("three").Group;
  spinner: import("three").Group;
};

type RangeItem = {
  element: HTMLElement;
  link: HTMLElement | null;
  modelSrc: string;
  rotation: number;
  fromRotation: number;
  targetRotation: number;
  transitionStart: number;
  transitionDuration: number;
  transitioning: boolean;
};

const HALF_TURN = Math.PI;
const TURN_DURATION = 900;
const ENTRY_STAGGER = 75;

function easeOutCubic(progress: number) {
  return 1 - ((1 - progress) ** 3);
}

export function ProductRangeTurntable() {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activated, setActivated] = useState(false);
  const [status, setStatus] = useState<TurntableStatus>("waiting");

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
    let cancelled = false;

    if (reducedMotion || saveData) {
      window.queueMicrotask(() => {
        if (!cancelled) setStatus("fallback");
      });
      return () => {
        cancelled = true;
      };
    }

    const activationObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        activationObserver.disconnect();
        setActivated(true);
      },
      { rootMargin: "500px 0px", threshold: 0 },
    );
    activationObserver.observe(trigger);

    return () => activationObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!activated) return;

    const canvas = canvasRef.current;
    const viewport = canvas?.parentElement;
    if (!canvas || !viewport) return;

    let cancelled = false;
    window.queueMicrotask(() => {
      if (!cancelled) setStatus("loading");
    });

    const items: RangeItem[] = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-turntable-model]"),
      (element) => ({
        element,
        link: element.closest<HTMLElement>("a"),
        modelSrc: element.dataset.turntableModel ?? "",
        rotation: HALF_TURN,
        fromRotation: HALF_TURN,
        targetRotation: 0,
        transitionStart: 0,
        transitionDuration: TURN_DURATION,
        transitioning: false,
      }),
    ).filter((item) => item.modelSrc);
    const modelSources = [...new Set(items.map((item) => item.modelSrc))];
    const models = new Map<string, RangeModel>();
    const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    canvas.dataset.expectedModels = String(modelSources.length);
    canvas.dataset.loadedModels = "0";
    canvas.dataset.frameState = "idle";

    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;
    let environmentTarget: import("three").WebGLRenderTarget | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    let frameId = 0;
    let framePending = false;
    let inView = false;
    let pageVisible = !document.hidden;
    let modelsReady = false;
    let entryStarted = false;
    let canvasRevealed = false;
    let lastInputWasKeyboard = false;

    const renderModels = () => {
      const activeRenderer = renderer;
      const activeScene = scene;
      const activeCamera = camera;
      if (!activeRenderer || !activeScene || !activeCamera) return;

      const canvasRect = canvas.getBoundingClientRect();
      activeRenderer.setScissorTest(false);
      activeRenderer.clear();
      activeRenderer.setScissorTest(true);

      for (const item of items) {
        const model = models.get(item.modelSrc);
        if (!model) continue;

        const rect = item.element.getBoundingClientRect();
        if (
          rect.right <= canvasRect.left
          || rect.left >= canvasRect.right
          || rect.bottom <= canvasRect.top
          || rect.top >= canvasRect.bottom
        ) continue;

        const left = Math.max(0, rect.left - canvasRect.left);
        const right = Math.min(canvasRect.width, rect.right - canvasRect.left);
        const top = Math.max(0, rect.top - canvasRect.top);
        const bottom = Math.min(canvasRect.height, rect.bottom - canvasRect.top);
        const width = Math.max(1, right - left);
        const height = Math.max(1, bottom - top);

        model.spinner.rotation.y = item.rotation;
        activeScene.add(model.outer);
        activeRenderer.setViewport(left, canvasRect.height - bottom, width, height);
        activeRenderer.setScissor(left, canvasRect.height - bottom, width, height);
        const aspect = width / height;
        if (Math.abs(activeCamera.aspect - aspect) > 0.0001) {
          activeCamera.aspect = aspect;
          activeCamera.updateProjectionMatrix();
        }
        activeRenderer.render(activeScene, activeCamera);
        activeScene.remove(model.outer);
      }

      activeRenderer.setScissorTest(false);
    };

    const updateTransitions = (now: number) => {
      let hasActiveTransition = false;

      for (const item of items) {
        if (!item.transitioning) continue;
        hasActiveTransition = true;
        if (now < item.transitionStart) continue;

        const elapsed = now - item.transitionStart;
        const progress = Math.min(1, elapsed / item.transitionDuration);
        item.rotation = item.fromRotation
          + ((item.targetRotation - item.fromRotation) * easeOutCubic(progress));

        if (progress >= 1) {
          item.rotation = item.targetRotation;
          item.transitioning = false;
          item.element.dataset.turntableRotation = item.targetRotation === 0 ? "0" : "180";
          item.element.dataset.turntableState = item.targetRotation === 0 ? "front" : "back";
        }
      }

      return hasActiveTransition;
    };

    const requestFrame = () => {
      if (framePending || !inView || !pageVisible || !modelsReady || !renderer) return;
      framePending = true;
      canvas.dataset.frameState = "scheduled";
      frameId = window.requestAnimationFrame((now) => {
        framePending = false;
        const hasActiveTransition = updateTransitions(now);
        renderModels();

        if (!canvasRevealed) {
          canvasRevealed = true;
          viewport.classList.add("has-3d-turntables");
          setStatus("ready");
        }
        if (hasActiveTransition) requestFrame();
        else canvas.dataset.frameState = "idle";
      });
    };

    const stop = () => {
      window.cancelAnimationFrame(frameId);
      framePending = false;
      canvas.dataset.frameState = "idle";
    };

    const startTransition = (item: RangeItem, target: number, delay = 0) => {
      if (!modelsReady || !entryStarted) return;
      if (!item.transitioning && item.rotation === target) return;

      item.fromRotation = item.rotation;
      item.targetRotation = target;
      item.transitionStart = performance.now() + delay;
      item.transitionDuration = TURN_DURATION;
      item.transitioning = true;
      item.element.dataset.turntableTarget = target === 0 ? "0" : "180";
      item.element.dataset.turntableState = target === 0 ? "returning" : "turning-back";
      requestFrame();
    };

    const startEntry = () => {
      if (entryStarted || !modelsReady || !inView || !pageVisible) return;
      entryStarted = true;
      items.forEach((item, index) => {
        item.fromRotation = HALF_TURN;
        item.rotation = HALF_TURN;
        item.targetRotation = 0;
        item.transitionStart = performance.now() + (index * ENTRY_STAGGER);
        item.transitionDuration = TURN_DURATION;
        item.transitioning = true;
        item.element.dataset.turntableTarget = "0";
        item.element.dataset.turntableState = "entering";
      });
      requestFrame();
    };

    const updateInteraction = (item: RangeItem) => {
      const pointerActive = fineHover && item.link?.matches(":hover") === true;
      const keyboardActive = lastInputWasKeyboard && item.link?.matches(":focus-visible") === true;
      startTransition(item, pointerActive || keyboardActive ? HALF_TURN : 0);
    };

    const interactionCleanups: Array<() => void> = [];
    for (const item of items) {
      if (!item.link) continue;
      const handleInteraction = () => updateInteraction(item);
      item.link.addEventListener("pointerenter", handleInteraction);
      item.link.addEventListener("pointerleave", handleInteraction);
      item.link.addEventListener("focusin", handleInteraction);
      item.link.addEventListener("focusout", handleInteraction);
      interactionCleanups.push(() => {
        item.link?.removeEventListener("pointerenter", handleInteraction);
        item.link?.removeEventListener("pointerleave", handleInteraction);
        item.link?.removeEventListener("focusin", handleInteraction);
        item.link?.removeEventListener("focusout", handleInteraction);
      });
    }

    const handleKeyDown = () => {
      lastInputWasKeyboard = true;
    };
    const handlePointerDown = () => {
      lastInputWasKeyboard = false;
    };
    const syncInteractions = () => {
      // A horizontal scroll can move a card out from under a stationary
      // pointer without emitting pointerleave. Re-evaluate every card so a
      // can that is no longer active finishes its return to the front instead
      // of leaving a stale half-rotation in the viewport.
      for (const item of items) updateInteraction(item);
    };
    const handleScroll = () => {
      canvas.style.transform = `translate3d(${viewport.scrollLeft}px, 0, 0)`;
      syncInteractions();
      requestFrame();
    };
    const handleVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible) {
        startEntry();
        requestFrame();
      } else {
        stop();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    viewport.addEventListener("scroll", handleScroll, { passive: true });

    visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio > 0.02;
        if (inView) {
          startEntry();
          requestFrame();
        } else {
          stop();
        }
      },
      { threshold: [0, 0.02] },
    );
    visibilityObserver.observe(viewport);

    const initialise = async () => {
      try {
        const { THREE, RoomEnvironment } = await getThreeRuntime();
        if (cancelled) return;
        const lowPowerDevice = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth <= 720;
        const mobileViewport = window.innerWidth <= 720;
        const pixelRatioCap = mobileViewport ? 1 : lowPowerDevice ? 1 : 1.1;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: mobileViewport || !lowPowerDevice,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.setClearColor(0x000000, 0);

        scene = new THREE.Scene();
        environmentTarget = createPbrEnvironment(THREE, RoomEnvironment, renderer);
        scene.environment = environmentTarget.texture;
        camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
        camera.position.set(0, 0.04, 6.2);
        camera.lookAt(0, 0, 0);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x63534b, 1.35));
        const key = new THREE.DirectionalLight(0xffffff, 2.25);
        key.position.set(3.5, 4.5, 5.5);
        scene.add(key);

        const resize = () => {
          if (!renderer) return;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
          renderer.setSize(Math.max(viewport.clientWidth, 1), Math.max(viewport.clientHeight, 1), false);
          canvas.style.transform = `translate3d(${viewport.scrollLeft}px, 0, 0)`;
          requestFrame();
        };
        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(viewport);

        // Decode models one at a time to avoid a mobile main-thread spike, but
        // reveal each can as soon as its model is ready.
        for (const src of modelSources) {
          const root = await loadModelClone(src);
          if (cancelled) return;
          const bounds = new THREE.Box3().setFromObject(root);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());
          const maxDimension = Math.max(size.x, size.y, size.z) || 1;
          const fittedScale = (3.05 / maxDimension) * 0.94;
          root.scale.setScalar(fittedScale);
          root.position.copy(center).multiplyScalar(-fittedScale);
          const spinner = new THREE.Group();
          spinner.rotation.y = HALF_TURN;
          spinner.add(root);
          const outer = new THREE.Group();
          outer.add(spinner);
          models.set(src, { outer, spinner });
          items.forEach((item) => {
            if (item.modelSrc === src) item.element.dataset.turntableReady = "true";
          });
          canvas.dataset.loadedModels = String(models.size);
          if (!modelsReady) {
            modelsReady = true;
            viewport.classList.add("has-3d-turntables");
            setStatus("ready");
            startEntry();
          }
          requestFrame();
        }
      } catch {
        if (!cancelled && models.size === 0) setStatus("fallback");
      }
    };

    void initialise();

    return () => {
      cancelled = true;
      stop();
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      interactionCleanups.forEach((cleanup) => cleanup());
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      viewport.removeEventListener("scroll", handleScroll);
      viewport.classList.remove("has-3d-turntables");
      items.forEach((item) => delete item.element.dataset.turntableReady);
      environmentTarget?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [activated]);

  return (
    <>
      <span
        ref={triggerRef}
        className="product-range__turntable-trigger"
        data-status={status}
        aria-hidden="true"
      />
      {activated ? (
        <canvas
          ref={canvasRef}
          className={`product-range__turntable is-${status}`}
          data-status={status}
          data-renderer-count="1"
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}
