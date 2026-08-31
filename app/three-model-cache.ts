type ThreeRuntime = {
  THREE: typeof import("three");
  GLTFLoader: typeof import("three/addons/loaders/GLTFLoader.js").GLTFLoader;
  RoomEnvironment: typeof import("three/addons/environments/RoomEnvironment.js").RoomEnvironment;
};

type CachedModel = {
  scene: import("three").Group;
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
