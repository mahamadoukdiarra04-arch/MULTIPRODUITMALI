"use client";

import { useEffect, useRef, useState } from "react";

import {
  createPbrEnvironment,
  getThreeRuntime,
  loadModelClone,
  preloadModels,
} from "./three-model-cache";

type TurntableStatus = "waiting" | "loading" | "ready" | "fallback";
type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

type TurntableModel = {
  outer: import("three").Group;
  spinner: import("three").Group;
};

type TurntableItem = {
  element: HTMLElement;
  interactiveElement: Element | null;
  modelSrc: string;
  tiltRadians: number;
  phaseOffset: number;
};

export function CatalogueTurntable() {
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
      { rootMargin: "480px 0px", threshold: 0 },
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

    const items: TurntableItem[] = Array.from(
      viewport.querySelectorAll<HTMLElement>("[data-turntable-model]"),
      (element) => ({
        element,
        interactiveElement: element.closest(".product-loop__item"),
        modelSrc: element.dataset.turntableModel ?? "",
        tiltRadians: (Number(element.dataset.turntableTilt ?? 0) * Math.PI) / 180,
        phaseOffset: Number(element.dataset.turntablePhase ?? 0) * 0.21,
      }),
    ).filter((item) => item.modelSrc);
    const modelSources = [...new Set(items.map((item) => item.modelSrc))];
    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;
    let environmentTarget: import("three").WebGLRenderTarget | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let frameId = 0;
    let running = false;
    let inView = false;
    let pageVisible = !document.hidden;
    let lastRenderAt = 0;
    const models = new Map<string, TurntableModel>();

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      canvas.dataset.frameState = "paused";
    };

    const renderFrame = (now: number) => {
      const activeRenderer = renderer;
      const activeScene = scene;
      const activeCamera = camera;
      if (!running || !activeRenderer || !activeScene || !activeCamera) return;
      const lowPowerDevice = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth <= 720;
      const frameIntervalMs = lowPowerDevice ? 1000 / 24 : 1000 / 30;
      if (lastRenderAt && now - lastRenderAt < frameIntervalMs) {
        frameId = window.requestAnimationFrame(renderFrame);
        return;
      }
      lastRenderAt = now;
      const canvasRect = canvas.getBoundingClientRect();
      activeRenderer.setScissorTest(false);
      activeRenderer.clear();
      activeRenderer.setScissorTest(true);

      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        const model = models.get(item.modelSrc);
        if (!model) continue;

        const rect = item.element.getBoundingClientRect();
        if (
          rect.right <= canvasRect.left
          || rect.left >= canvasRect.right
          || rect.bottom <= canvasRect.top
          || rect.top >= canvasRect.bottom
        ) continue;

        const overscanX = Math.min(34, rect.width * 0.22);
        const overscanY = Math.min(22, rect.height * 0.1);
        const viewportLeft = rect.left - canvasRect.left - overscanX;
        const viewportTop = rect.top - canvasRect.top - overscanY;
        const viewportWidth = rect.width + (overscanX * 2);
        const viewportHeight = rect.height + (overscanY * 2);
        const viewportRight = viewportLeft + viewportWidth;
        const viewportBottomFromTop = viewportTop + viewportHeight;
        const scissorLeft = Math.max(0, viewportLeft);
        const scissorRight = Math.min(canvasRect.width, viewportRight);
        const scissorTop = Math.max(0, viewportTop);
        const scissorBottomFromTop = Math.min(canvasRect.height, viewportBottomFromTop);
        const scissorWidth = Math.max(1, scissorRight - scissorLeft);
        const scissorHeight = Math.max(1, scissorBottomFromTop - scissorTop);
        const popped = item.interactiveElement?.matches(":hover, :focus-visible") === true;

        model.outer.rotation.z = item.tiltRadians;
        model.outer.scale.setScalar(popped ? 1.09 : 1);
        model.spinner.rotation.y = ((now / 1000) * Math.PI * 2) / 15.5 + item.phaseOffset;
        activeScene.add(model.outer);

        activeRenderer.setViewport(
          viewportLeft,
          canvasRect.height - viewportBottomFromTop,
          viewportWidth,
          viewportHeight,
        );
        activeRenderer.setScissor(
          scissorLeft,
          canvasRect.height - scissorBottomFromTop,
          scissorWidth,
          scissorHeight,
        );
        const aspect = viewportWidth / viewportHeight;
        if (Math.abs(activeCamera.aspect - aspect) > 0.0001) {
          activeCamera.aspect = aspect;
          activeCamera.updateProjectionMatrix();
        }
        activeRenderer.render(activeScene, activeCamera);
        activeScene.remove(model.outer);
      }

      activeRenderer.setScissorTest(false);
      canvas.dataset.rotationStarted = "true";
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (running || !inView || !pageVisible || !renderer || models.size === 0) return;
      running = true;
      lastRenderAt = 0;
      canvas.dataset.frameState = "running";
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const handleVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      },
      { rootMargin: "280px 0px", threshold: 0 },
    );
    visibilityObserver.observe(viewport);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const initialise = async () => {
      try {
        const { THREE, RoomEnvironment } = await getThreeRuntime();
        if (cancelled) return;
        const lowPowerDevice = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth <= 720;
        const pixelRatioCap = lowPowerDevice ? 1 : 1.1;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: !lowPowerDevice,
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
        camera.position.set(0, 0.06, 6.2);
        camera.lookAt(0, 0, 0);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x63534b, 1.35));
        const key = new THREE.DirectionalLight(0xffffff, 2.25);
        key.position.set(3.5, 4.5, 5.5);
        scene.add(key);

        // Loading and decoding all GLB files together produces a short but visible
        // main-thread spike. Build the cache and clone them one by one instead.
        await preloadModels(modelSources, 1);
        if (cancelled) return;
        for (const src of modelSources) {
          const root = await loadModelClone(src);
          if (cancelled) return;
          const bounds = new THREE.Box3().setFromObject(root);
          const size = bounds.getSize(new THREE.Vector3());
          const center = bounds.getCenter(new THREE.Vector3());
          const maxDimension = Math.max(size.x, size.y, size.z) || 1;
          const fittedScale = (3.05 / maxDimension) * 0.82;
          root.scale.setScalar(fittedScale);
          root.position.copy(center).multiplyScalar(-fittedScale);
          const spinner = new THREE.Group();
          spinner.add(root);
          const outer = new THREE.Group();
          outer.add(spinner);
          models.set(src, { outer, spinner });
        }

        if (cancelled || !renderer) return;
        const resize = () => {
          if (!renderer) return;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
          renderer.setSize(Math.max(viewport.clientWidth, 1), Math.max(viewport.clientHeight, 1), false);
        };
        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(viewport);
        viewport.classList.add("has-3d-turntables");
        setStatus("ready");
        start();
      } catch {
        if (!cancelled) setStatus("fallback");
      }
    };

    void initialise();

    return () => {
      cancelled = true;
      stop();
      visibilityObserver.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      viewport.classList.remove("has-3d-turntables");
      environmentTarget?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [activated]);

  return (
    <>
      <span
        ref={triggerRef}
        className="product-marquee__turntable-trigger"
        data-status={status}
        aria-hidden="true"
      />
      {activated ? (
        <canvas
          ref={canvasRef}
          className={`product-marquee__turntable is-${status}`}
          data-status={status}
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}
