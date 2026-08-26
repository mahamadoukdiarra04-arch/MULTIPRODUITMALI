"use client";

import { useEffect, useRef, useState } from "react";

import type { HeroUniverse } from "./hero-universes";

type HeroScene3DProps = {
  universe: HeroUniverse;
  onReady: () => void;
};

type SceneStatus = "loading" | "ready" | "fallback";
type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

function announceFallback(universeId: string, reason: string) {
  window.dispatchEvent(
    new CustomEvent("hero_3d_fallback", {
      detail: { universeId, reason },
    }),
  );
}

export function HeroScene3D({ universe, onReady }: HeroScene3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<SceneStatus>("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    const modelSrc = universe.modelSrc;

    if (!canvas || !modelSrc || !universe.model.enabled) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;

    if (reducedMotion || saveData) {
      const reason = reducedMotion ? "reduced-motion" : "save-data";
      announceFallback(universe.id, reason);
      return;
    }

    let cancelled = false;
    let inView = true;
    let pageVisible = !document.hidden;
    let running = false;
    let frameId = 0;
    let lastFrame = performance.now();
    let renderer: import("three").WebGLRenderer | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;
    let modelRoot: import("three").Group | null = null;
    let threeModule: typeof import("three") | null = null;

    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frameId);
    };

    const renderFrame = (now: number) => {
      if (!running || !renderer || !scene || !camera || !modelRoot) return;
      const delta = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      modelRoot.rotation.y += (Math.PI * 2 * delta) / 16;
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(renderFrame);
    };

    const start = () => {
      if (running || !inView || !pageVisible || !renderer || !modelRoot) return;
      running = true;
      lastFrame = performance.now();
      frameId = window.requestAnimationFrame(renderFrame);
    };

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

    let resizeObserver: ResizeObserver | null = null;

    const initialiseScene = async () => {
      try {
        const [THREE, { GLTFLoader }] = await Promise.all([
          import("three"),
          import("three/addons/loaders/GLTFLoader.js"),
        ]);

        if (cancelled) return;
        threeModule = THREE;

        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 720 ? 1.35 : 1.8));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
        camera.position.set(0, 0.08, 6.2);
        camera.lookAt(0, 0, 0);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x71333f, 2.35));
        const keyLight = new THREE.DirectionalLight(0xffffff, 3.8);
        keyLight.position.set(3.5, 4.5, 5.5);
        scene.add(keyLight);
        const rimLight = new THREE.DirectionalLight(0xffb8c8, 2.2);
        rimLight.position.set(-4, 1.5, -2.5);
        scene.add(rimLight);

        const gltf = await new GLTFLoader().loadAsync(modelSrc);
        if (cancelled) return;

        modelRoot = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(modelRoot);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        const responsiveScale = window.innerWidth <= 720 ? universe.model.mobileScale : 1;
        const fittedScale = (3.05 / maxDimension) * universe.model.scale * responsiveScale;

        modelRoot.scale.setScalar(fittedScale);
        modelRoot.position.copy(center).multiplyScalar(-fittedScale);
        modelRoot.rotation.y = universe.model.rotationOffset;
        scene.add(modelRoot);

        const resize = () => {
          if (!renderer || !camera) return;
          const width = Math.max(canvas.clientWidth, 1);
          const height = Math.max(canvas.clientHeight, 1);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };

        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        renderer.render(scene, camera);

        setStatus("ready");
        onReady();
        start();
      } catch (error) {
        if (cancelled) return;
        setStatus("fallback");
        announceFallback(universe.id, error instanceof Error ? "load-error" : "unsupported-webgl");
      }
    };

    void initialiseScene();

    return () => {
      cancelled = true;
      stop();
      intersectionObserver.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      const cleanupThree = threeModule;
      if (scene && cleanupThree) {
        scene.traverse((object) => {
          if (!(object instanceof cleanupThree.Mesh)) return;
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            Object.values(material).forEach((value) => {
              if (value instanceof cleanupThree.Texture) value.dispose();
            });
            material.dispose();
          });
        });
      }
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [onReady, universe]);

  return (
    <canvas
      ref={canvasRef}
      className={`hero-stage__canvas${status === "ready" ? " is-ready" : ""}`}
      aria-hidden="true"
    />
  );
}
