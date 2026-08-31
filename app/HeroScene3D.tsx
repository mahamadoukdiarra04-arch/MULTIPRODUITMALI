"use client";

import { useEffect, useRef, useState } from "react";

import type { HeroUniverse } from "./hero-universes";
import { createPbrEnvironment, getThreeRuntime, loadModelClone } from "./three-model-cache";

type HeroScene3DProps = {
  universe: HeroUniverse;
  onReady: () => void;
};

type SceneStatus = "loading" | "ready" | "fallback";
type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };
type ModelTransition = {
  incoming: import("three").Group;
  outgoing: import("three").Group;
  startedAt: number;
  durationMs: number;
};

const MODEL_TRANSITION_MS = 820;
const MODEL_TRAVEL_DISTANCE = 2.9;

function announceFallback(universeId: string, reason: string) {
  window.dispatchEvent(
    new CustomEvent("hero_3d_fallback", {
      detail: { universeId, reason },
    }),
  );
}

export function HeroScene3D({ universe, onReady }: HeroScene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<import("three").WebGLRenderer | null>(null);
  const sceneRef = useRef<import("three").Scene | null>(null);
  const cameraRef = useRef<import("three").PerspectiveCamera | null>(null);
  const modelRootRef = useRef<import("three").Group | null>(null);
  const modelTransitionRef = useRef<ModelTransition | null>(null);
  const startRef = useRef<() => void>(() => undefined);
  const onReadyRef = useRef(onReady);
  const firstUniverseIdRef = useRef(universe.id);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const [status, setStatus] = useState<SceneStatus>("loading");

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
    let cancelled = false;

    if (reducedMotion || saveData) {
      const reason = reducedMotion ? "reduced-motion" : "save-data";
      window.queueMicrotask(() => {
        if (cancelled) return;
        setStatus("fallback");
        announceFallback(firstUniverseIdRef.current, reason);
      });
      return () => {
        cancelled = true;
      };
    }

    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;
    let environmentTarget: import("three").WebGLRenderTarget | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let inView = true;
    let pageVisible = !document.hidden;
    let running = false;
    let frameId = 0;
    let lastFrame = 0;

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frameId);
      canvas.dataset.renderState = "paused";
    };

    const renderFrame = (now: number) => {
      const modelRoot = modelRootRef.current;
      if (!running || !renderer || !scene || !camera || !modelRoot) {
        running = false;
        return;
      }
      const lowPowerDevice = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth <= 720;
      const frameIntervalMs = lowPowerDevice ? 1000 / 24 : 1000 / 30;
      if (lastFrame && now - lastFrame < frameIntervalMs) {
        frameId = window.requestAnimationFrame(renderFrame);
        return;
      }
      const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.06) : 0;
      lastFrame = now;
      const transition = modelTransitionRef.current;
      const rotationStep = (Math.PI * 2 * delta) / 16;

      modelRoot.rotation.y += rotationStep;
      if (transition) {
        transition.outgoing.rotation.y += rotationStep;
        const progress = Math.min(1, (now - transition.startedAt) / transition.durationMs);
        const eased = progress * progress * (3 - (2 * progress));

        transition.incoming.position.x = MODEL_TRAVEL_DISTANCE * (1 - eased);
        transition.incoming.position.y = 0.08 * (1 - eased);
        transition.incoming.rotation.z = 0.075 * (1 - eased);
        transition.incoming.scale.setScalar(0.94 + (0.06 * eased));

        transition.outgoing.position.x = -MODEL_TRAVEL_DISTANCE * eased;
        transition.outgoing.position.y = -0.05 * eased;
        transition.outgoing.rotation.z = -0.075 * eased;
        transition.outgoing.scale.setScalar(1 - (0.06 * eased));

        if (progress >= 1) {
          scene.remove(transition.outgoing);
          transition.incoming.position.set(0, 0, 0);
          transition.incoming.rotation.z = 0;
          transition.incoming.scale.setScalar(1);
          modelTransitionRef.current = null;
          canvas.dataset.transitionState = "settled";
        }
      }
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (running || !inView || !pageVisible || !renderer || !modelRootRef.current) return;
      running = true;
      lastFrame = 0;
      canvas.dataset.renderState = "running";
      frameId = window.requestAnimationFrame(renderFrame);
    };
    startRef.current = start;

    const handleVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible) start();
      else stop();
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio > 0.08;
        if (inView) start();
        else stop();
      },
      { threshold: [0, 0.08] },
    );
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const initialiseScene = async () => {
      try {
        const { THREE, RoomEnvironment } = await getThreeRuntime();
        if (cancelled) return;
        const lowPowerDevice = (navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth <= 720;
        const pixelRatioCap = lowPowerDevice ? 1 : 1.25;

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
        camera.position.set(0, 0.08, 6.2);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x71333f, 1.6));
        const keyLight = new THREE.DirectionalLight(0xffffff, 2.7);
        keyLight.position.set(3.5, 4.5, 5.5);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0xffd9df, 1.45);
        rimLight.position.set(-4, 1.5, -2.5);
        scene.add(rimLight);

        rendererRef.current = renderer;
        sceneRef.current = scene;
        cameraRef.current = camera;

        const resize = () => {
          if (!renderer || !camera) return;
          const width = Math.max(canvas.clientWidth, 1);
          const height = Math.max(canvas.clientHeight, 1);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
          renderer.setSize(width, height, false);
          const aspect = width / height;
          if (Math.abs(camera.aspect - aspect) > 0.0001) {
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
          }
        };
        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        setRuntimeReady(true);
      } catch {
        if (cancelled) return;
        setStatus("fallback");
        announceFallback(firstUniverseIdRef.current, "unsupported-webgl");
      }
    };

    void initialiseScene();

    return () => {
      cancelled = true;
      stop();
      startRef.current = () => undefined;
      intersectionObserver.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      modelRootRef.current = null;
      modelTransitionRef.current = null;
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      environmentTarget?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const modelSrc = universe.modelSrc;
    if (!runtimeReady || !canvas || !renderer || !scene || !camera || !modelSrc || !universe.model.enabled) return;

    let cancelled = false;
    let timedOut = false;
    const hasDisplayedModel = modelRootRef.current !== null;
    if (!hasDisplayedModel) {
      window.queueMicrotask(() => {
        if (!cancelled) setStatus("loading");
      });
    }

    const loadingTimeout = window.setTimeout(() => {
      if (cancelled) return;
      timedOut = true;
      setStatus(modelRootRef.current ? "ready" : "fallback");
      announceFallback(universe.id, "load-timeout");
    }, 12_000);

    const loadUniverse = async () => {
      try {
        const { THREE } = await getThreeRuntime();
        const modelRoot = await loadModelClone(modelSrc);
        if (cancelled || timedOut) return;

        const bounds = new THREE.Box3().setFromObject(modelRoot);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        const responsiveScale = window.innerWidth <= 720 ? universe.model.mobileScale : 1;
        const fittedScale = (3.05 / maxDimension) * universe.model.scale * responsiveScale;

        modelRoot.scale.setScalar(fittedScale);
        modelRoot.position.copy(center).multiplyScalar(-fittedScale);
        const presentationRoot = new THREE.Group();
        presentationRoot.rotation.y = universe.model.rotationOffset;
        presentationRoot.add(modelRoot);

        const previousModel = modelRootRef.current;
        const interruptedTransition = modelTransitionRef.current;
        if (interruptedTransition) {
          scene.remove(interruptedTransition.outgoing);
          modelTransitionRef.current = null;
        }

        scene.add(presentationRoot);
        modelRootRef.current = presentationRoot;
        if (previousModel) {
          presentationRoot.position.set(MODEL_TRAVEL_DISTANCE, 0.08, 0);
          presentationRoot.rotation.z = 0.075;
          presentationRoot.scale.setScalar(0.94);
          modelTransitionRef.current = {
            incoming: presentationRoot,
            outgoing: previousModel,
            startedAt: performance.now(),
            durationMs: MODEL_TRANSITION_MS,
          };
          canvas.dataset.transitionState = "crossing";
        } else {
          canvas.dataset.transitionState = "settled";
        }
        renderer.render(scene, camera);

        window.clearTimeout(loadingTimeout);
        setStatus("ready");
        canvas.dataset.activeUniverse = universe.id;
        document.documentElement.dataset.mpmHeroReady = universe.id;
        window.dispatchEvent(new CustomEvent("mpm:hero-3d-ready", { detail: { universeId: universe.id } }));
        onReadyRef.current();
        startRef.current();
      } catch {
        if (cancelled || timedOut) return;
        window.clearTimeout(loadingTimeout);
        setStatus(modelRootRef.current ? "ready" : "fallback");
        announceFallback(universe.id, "load-error");
      }
    };

    void loadUniverse();

    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimeout);
    };
  }, [runtimeReady, universe]);

  return (
    <canvas
      ref={canvasRef}
      className={`hero-stage__canvas${status === "ready" ? " is-ready" : status === "fallback" ? " is-fallback" : " is-loading"}`}
      data-status={status}
      aria-hidden="true"
    />
  );
}
