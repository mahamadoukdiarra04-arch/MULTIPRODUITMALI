"use client";

import { useEffect, useRef, useState } from "react";

import {
  createPbrEnvironment,
  getThreeRuntime,
  loadModelClone,
  prepareModelForPresentation,
} from "./three-model-cache";

type TriplexBrandCan3DProps = {
  onReady: () => void;
};

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

const MODEL_SRC = "/models/mpm/triplex-energy-drink.glb";

/** A light, self-contained 3D can used only once the landing triptych nears the viewport. */
export function TriplexBrandCan3D({ onReady }: TriplexBrandCan3DProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  const [activated, setActivated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as NavigatorWithConnection).connection?.saveData === true;
    if (reducedMotion || saveData) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setActivated(true);
      },
      { rootMargin: "260px 0px", threshold: 0.02 },
    );
    observer.observe(trigger);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!activated) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let environmentTarget: import("three").WebGLRenderTarget | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let scene: import("three").Scene | null = null;
    let camera: import("three").PerspectiveCamera | null = null;

    const initialise = async () => {
      try {
        const { THREE, RoomEnvironment } = await getThreeRuntime();
        const modelRoot = await loadModelClone(MODEL_SRC);
        if (cancelled) return;

        const mobileViewport = window.innerWidth <= 720;
        const constrainedHardware = (navigator.hardwareConcurrency ?? 8) <= 2;
        const pixelRatioCap = mobileViewport ? 1.35 : constrainedHardware ? 1.4 : 1.75;
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NeutralToneMapping;
        renderer.toneMappingExposure = 0.88;
        renderer.setClearColor(0x000000, 0);
        prepareModelForPresentation(modelRoot, renderer);

        scene = new THREE.Scene();
        environmentTarget = createPbrEnvironment(THREE, RoomEnvironment, renderer);
        scene.environment = environmentTarget.texture;
        camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
        camera.position.set(0, 0.05, 6.2);
        camera.lookAt(0, 0, 0);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x202225, 0.32));
        const key = new THREE.DirectionalLight(0xffffff, 0.9);
        key.position.set(3.5, 4.4, 5.5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xffffff, 0.3);
        fill.position.set(-3.2, 1.1, 4.2);
        scene.add(fill);
        const rim = new THREE.DirectionalLight(0xffffff, 0.2);
        rim.position.set(-3.8, 2, -2.8);
        scene.add(rim);

        const bounds = new THREE.Box3().setFromObject(modelRoot);
        const size = bounds.getSize(new THREE.Vector3());
        const center = bounds.getCenter(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        const fittedScale = (3.05 / maxDimension) * 0.6;
        modelRoot.scale.setScalar(fittedScale);
        modelRoot.position.copy(center).multiplyScalar(-fittedScale);

        const presentationRoot = new THREE.Group();
        // The source GLB opens on its information panel; turn it to the Triplex face first.
        presentationRoot.rotation.y = Math.PI * 0.57;
        presentationRoot.rotation.z = -0.085;
        presentationRoot.add(modelRoot);
        scene.add(presentationRoot);

        const resize = () => {
          if (!renderer || !camera) return;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
          renderer.setSize(Math.max(canvas.clientWidth, 1), Math.max(canvas.clientHeight, 1), false);
          const aspect = canvas.clientWidth / Math.max(canvas.clientHeight, 1);
          if (Math.abs(camera.aspect - aspect) > 0.0001) {
            camera.aspect = aspect;
            camera.updateProjectionMatrix();
          }
        };
        resize();
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);

        renderer.render(scene, camera);
        setReady(true);
        onReadyRef.current();
      } catch {
        // The lightweight packshot remains visible if WebGL or the GLB is unavailable.
      }
    };

    void initialise();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      environmentTarget?.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [activated]);

  return (
    <span ref={triggerRef} className={`brand-triptych__triplex-can${ready ? " is-ready" : ""}`} aria-hidden="true">
      {activated ? <canvas ref={canvasRef} className="brand-triptych__triplex-canvas" /> : null}
    </span>
  );
}
