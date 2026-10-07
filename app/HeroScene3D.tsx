"use client";

import { useEffect, useRef, useState } from "react";

import { HERO_DISPLAY_MS, type HeroUniverse } from "./hero-universes";
import {
  createPbrEnvironment,
  getThreeRuntime,
  loadModelClone,
  prepareModelForPresentation,
  resolvePresentationModelSource,
} from "./three-model-cache";

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
  incomingFaceRotation: number;
  outgoingFaceFrom: number;
  outgoingFaceTo: number;
};

const MODEL_TRAVEL_DISTANCE = 2.9;
// The handoff deliberately takes a little longer than a single frame burst.
// A short smoothstep made the can accelerate visibly as it approached the
// printed face, especially when the next model finished loading near the end
// of the display window.  A longer settle with an ease-out lets the design
// decelerate naturally into the logo before the next can enters.
const MODEL_FACE_SETTLE_MS = 560;
const MODEL_FACE_HOLD_MS = 240;
const MODEL_SLIDE_MS = 420;
function nearestPrintedFaceRotation(from: number, front: number, interval: number) {
  // Printed faces repeat at the interval declared by each model. Rounding is
  // important here: a tiny
  // frame overshoot must settle back a fraction of a degree, not continue for
  // almost another turn to reach the same artwork.
  const faceIndex = Math.round((from - front) / interval);
  return front + (faceIndex * interval);
}

function interpolateAngle(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function easeOutSine(progress: number) {
  return Math.sin((Math.min(1, Math.max(0, progress)) * Math.PI) / 2);
}

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
      const rotationSpan = Number(modelRoot.userData.mpmRotationSpan ?? Math.PI);
      const rotationStep = (rotationSpan / (HERO_DISPLAY_MS / 1000)) * delta;

      if (!transition) {
        modelRoot.rotation.y += rotationStep;
      }
      if (transition) {
        const elapsed = Math.max(0, now - transition.startedAt);
        const settleEnd = MODEL_FACE_SETTLE_MS;
        const holdEnd = settleEnd + MODEL_FACE_HOLD_MS;
        transition.incoming.rotation.y = transition.incomingFaceRotation;

        // First finish the outgoing can on its printed face while it is still
        // centered. The next can stays off to the right during this short
        // settle so the logo is actually visible before the handoff.
        if (elapsed < settleEnd) {
          const progress = Math.min(1, elapsed / MODEL_FACE_SETTLE_MS);
          const eased = easeOutSine(progress);
          transition.outgoing.rotation.y = interpolateAngle(
            transition.outgoingFaceFrom,
            transition.outgoingFaceTo,
            eased,
          );
          transition.incoming.position.set(MODEL_TRAVEL_DISTANCE, 0.08, 0);
          transition.incoming.rotation.z = 0.075;
          transition.incoming.scale.setScalar(0.94);
        } else if (elapsed < holdEnd) {
          // Hold the logo face long enough to read it before anything moves;
          // this is the printed front or back, never a side panel.
          transition.outgoing.rotation.y = transition.outgoingFaceTo;
          transition.incoming.position.set(MODEL_TRAVEL_DISTANCE, 0.08, 0);
          transition.incoming.rotation.z = 0.075;
          transition.incoming.scale.setScalar(0.94);
          canvas.dataset.transitionState = "settling";
        } else {
          const progress = Math.min(1, (elapsed - holdEnd) / MODEL_SLIDE_MS);
          const eased = progress * progress * (3 - (2 * progress));
          transition.outgoing.rotation.y = transition.outgoingFaceTo;
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
        const mobileViewport = window.innerWidth <= 720;
        const constrainedHardware = (navigator.hardwareConcurrency ?? 8) <= 2;
        const pixelRatioCap = mobileViewport ? 1.35 : constrainedHardware ? 1.5 : 2;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        // Neutral tone mapping keeps packaging colours closer to the supplied
        // packshots than a cinematic curve while still protecting highlights.
        renderer.toneMapping = THREE.NeutralToneMapping;
        renderer.toneMappingExposure = 0.88;
        renderer.setClearColor(0x000000, 0);

        scene = new THREE.Scene();
        environmentTarget = createPbrEnvironment(THREE, RoomEnvironment, renderer);
        scene.environment = environmentTarget.texture;
        camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
        camera.position.set(0, 0.08, 6.2);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x26282b, 0.32));
        const keyLight = new THREE.DirectionalLight(0xffffff, 0.92);
        keyLight.position.set(3.5, 4.5, 5.5);
        scene.add(keyLight);
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.32);
        fillLight.position.set(-3.2, 1.2, 4.2);
        scene.add(fillLight);
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.22);
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
    const modelSrc = resolvePresentationModelSource(universe.modelSrc, universe.modelHdSrc);
    if (!runtimeReady || !canvas || !renderer || !scene || !camera || !modelSrc || !universe.model.enabled) return;

    let cancelled = false;
    let timedOut = false;
    // The active universe changed. Hide the previous canvas while the next
    // model loads; HeroProductStage keeps the next packshot visible as the
    // seamless visual bridge.
    window.queueMicrotask(() => {
      if (!cancelled) setStatus("loading");
    });

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
        prepareModelForPresentation(modelRoot, renderer);

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
        presentationRoot.userData.mpmFaceBaseRotation = universe.model.rotationOffset;
        presentationRoot.userData.mpmRotationSpan = universe.model.rotationSpan;
        presentationRoot.userData.mpmPrintedFaceInterval = universe.model.printedFaceInterval;
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
            incomingFaceRotation: universe.model.rotationOffset,
            outgoingFaceFrom: previousModel.rotation.y,
            // Settle on the closest printed face (front or back). The normal
            // rotation is timed to arrive here already, so this only absorbs
            // sub-frame drift and never creates a visible acceleration.
            outgoingFaceTo: nearestPrintedFaceRotation(
              previousModel.rotation.y,
              Number(previousModel.userData.mpmFaceBaseRotation ?? universe.model.rotationOffset),
              Number(previousModel.userData.mpmPrintedFaceInterval ?? Math.PI),
            ),
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
