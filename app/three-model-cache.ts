type ThreeRuntime = {
  THREE: typeof import("three");
  GLTFLoader: typeof import("three/addons/loaders/GLTFLoader.js").GLTFLoader;
  RoomEnvironment: typeof import("three/addons/environments/RoomEnvironment.js").RoomEnvironment;
};

type CachedModel = {
  scene: import("three").Group;
};

type PresentationMaterial = import("three").Material & {
  aoMap?: import("three").Texture | null;
  clearcoat?: number;
  clearcoatMap?: import("three").Texture | null;
  clearcoatRoughness?: number;
  clearcoatRoughnessMap?: import("three").Texture | null;
  dithering?: boolean;
  emissive?: import("three").Color;
  emissiveIntensity?: number;
  emissiveMap?: import("three").Texture | null;
  envMapIntensity?: number;
  map?: import("three").Texture | null;
  metalnessMap?: import("three").Texture | null;
  metalness?: number;
  normalMap?: import("three").Texture | null;
  normalScale?: import("three").Vector2;
  roughnessMap?: import("three").Texture | null;
  roughness?: number;
};

type NavigatorWithHardwareProfile = Navigator & {
  connection?: { effectiveType?: string; saveData?: boolean };
  deviceMemory?: number;
};

let runtimePromise: Promise<ThreeRuntime> | null = null;
const modelCache = new Map<string, Promise<CachedModel>>();

export function getThreeRuntime() {
  runtimePromise ??= Promise.all([
    import("three"),
    import("three/addons/loaders/GLTFLoader.js"),
    import("three/addons/environments/RoomEnvironment.js"),
  ]).then(([THREE, { GLTFLoader }, { RoomEnvironment }]) => ({
    THREE,
    GLTFLoader,
    RoomEnvironment,
  }));

  return runtimePromise;
}

function getCachedModel(src: string) {
  const existing = modelCache.get(src);
  if (existing) return existing;

  const pending = getThreeRuntime()
    .then(async ({ GLTFLoader }) => {
      const gltf = await new GLTFLoader().loadAsync(src);
      return { scene: gltf.scene };
    })
    .catch((error) => {
      modelCache.delete(src);
      throw error;
    });

  modelCache.set(src, pending);
  return pending;
}

export async function loadModelClone(src: string) {
  const cached = await getCachedModel(src);
  return cached.scene.clone(true);
}

/**
 * Select the native 4K model only when the viewport and device can absorb its
 * extra download and GPU memory. Compact 2K assets remain the deliberate
 * mobile, tablet, data-saver and low-memory fallback.
 */
export function resolvePresentationModelSource(modelSrc?: string, modelHdSrc?: string) {
  if (!modelSrc || !modelHdSrc || typeof window === "undefined") return modelSrc;

  const profile = navigator as NavigatorWithHardwareProfile;
  const effectiveType = profile.connection?.effectiveType ?? "";
  const constrainedConnection = profile.connection?.saveData === true
    || effectiveType === "slow-2g"
    || effectiveType === "2g";
  const constrainedHardware = (profile.deviceMemory ?? 8) < 4
    || (navigator.hardwareConcurrency ?? 8) <= 2;
  const compactViewport = window.innerWidth <= 900;

  return constrainedConnection || constrainedHardware || compactViewport ? modelSrc : modelHdSrc;
}

/**
 * Calibrate imported can materials for a consistent, restrained product-shot
 * finish across the hero, range selectors and brand cards. The print behaves
 * like ink protected by a thin matte lacquer while the lid and rims retain
 * their metallic response. Native mipmaps plus maximum anisotropy keep small
 * label text crisp without sharpening artefacts in the source artwork.
 */
export function prepareModelForPresentation(
  root: import("three").Object3D,
  renderer: import("three").WebGLRenderer,
) {
  const maxAnisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 16);

  root.traverse((object) => {
    const mesh = object as import("three").Mesh;
    if (!mesh.isMesh) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      const presentationMaterial = material as PresentationMaterial;
      const materialName = presentationMaterial.name.toLowerCase();
      const isPrintedCanBody = /printed|lacquer|can body/.test(materialName);

      if (presentationMaterial.roughness !== undefined) {
        presentationMaterial.roughness = isPrintedCanBody
          ? 0.48
          : Math.min(0.36, Math.max(presentationMaterial.roughness, 0.14));
      }
      if (presentationMaterial.metalness !== undefined && isPrintedCanBody) {
        // Printed lacquer is mostly dielectric; treating it like bare chrome
        // desaturates the fruit artwork and produces the pale look reported by
        // the client.
        presentationMaterial.metalness = 0.02;
      }
      if (presentationMaterial.envMapIntensity !== undefined) {
        presentationMaterial.envMapIntensity = isPrintedCanBody ? 0.35 : 0.86;
      }
      if (presentationMaterial.clearcoat !== undefined) {
        presentationMaterial.clearcoat = isPrintedCanBody
          ? 0.1
          : Math.min(presentationMaterial.clearcoat, 0.4);
      }
      if (presentationMaterial.clearcoatRoughness !== undefined) {
        presentationMaterial.clearcoatRoughness = isPrintedCanBody
          ? 0.48
          : Math.max(presentationMaterial.clearcoatRoughness, 0.18);
      }
      if (presentationMaterial.normalScale && isPrintedCanBody) {
        // The source normal map exaggerates horizontal manufacturing bands.
        // Keep just enough micro-relief for aluminium without embossing the
        // printed fruit artwork or softening its contours.
        presentationMaterial.normalScale.setScalar(0.12);
      }
      if (isPrintedCanBody && presentationMaterial.map && presentationMaterial.emissive) {
        // A very low self-illumination component mimics the broad frontal
        // softbox used for the supplied packshots. It protects ink density in
        // shadow without making the can appear luminous.
        presentationMaterial.emissiveMap = presentationMaterial.map;
        presentationMaterial.emissive.setRGB(1, 1, 1);
        presentationMaterial.emissiveIntensity = 0.06;
      }
      presentationMaterial.dithering = true;

      [
        presentationMaterial.map,
        presentationMaterial.normalMap,
        presentationMaterial.roughnessMap,
        presentationMaterial.metalnessMap,
        presentationMaterial.aoMap,
        presentationMaterial.clearcoatMap,
        presentationMaterial.clearcoatRoughnessMap,
        presentationMaterial.emissiveMap,
      ].forEach((texture) => {
        if (!texture) return;
        texture.anisotropy = maxAnisotropy;
        texture.generateMipmaps = true;
        texture.needsUpdate = true;
      });
      presentationMaterial.needsUpdate = true;
    });
  });
}

export function preloadModel(src?: string) {
  if (!src) return Promise.resolve();
  return getCachedModel(src).then(() => undefined);
}

export async function preloadModels(
  sources: readonly (string | undefined)[],
  concurrency = 3,
) {
  const queue = [...new Set(sources.filter((src): src is string => Boolean(src)))];
  let cursor = 0;

  const worker = async () => {
    while (cursor < queue.length) {
      const index = cursor;
      cursor += 1;
      await preloadModel(queue[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(Math.max(concurrency, 1), queue.length) }, worker),
  );
}

export function createPbrEnvironment(
  THREE: typeof import("three"),
  RoomEnvironment: ThreeRuntime["RoomEnvironment"],
  renderer: import("three").WebGLRenderer,
) {
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const target = pmrem.fromScene(room, 0.04);
  room.dispose();
  pmrem.dispose();
  return target;
}
