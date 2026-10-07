import { cp, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const profile = process.env.HOSTINGER_PACKAGE_PROFILE === "code" ? "code" : "complete";
const destination = resolve(root, ".codex-tmp", `hostinger-upload-${profile}-${stamp}`);
const publicRoot = resolve(root, "public");

const sourceDirectories = ["app", "build", "db", ".openai"];
const rootFiles = [
  ".gitignore",
  "next-env.d.ts",
  "next.config.ts",
  "package.json",
  "package-lock.json",
  "postcss.config.mjs",
  "tsconfig.json",
  "vite.config.ts",
];
const productionExtensions = new Set([".webp", ".json", ".svg", ".jpg", ".jpeg"]);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

async function copyPreservingPath(source, relativePath = relative(root, source)) {
  const target = join(destination, relativePath);
  await mkdir(resolve(target, ".."), { recursive: true });
  await cp(source, target, { recursive: true });
}

function requiredPngs() {
  // Keep only PNGs that do not have a WebP equivalent in the production UI.
  // The other PNG references are legacy fallbacks or source artwork and would
  // add roughly 49 MiB to the Hostinger upload without changing the rendering.
  return new Set([
    "og.png",
    "media/mpm/universes/vimto-sparkling/vimto-wordmark-header-v03.png",
    "media/mpm/delivery/fleet-triplex-front-alt.png",
    "media/mpm/delivery/fleet-triplex-front.png",
    "media/mpm/delivery/fleet-triplex-rear.png",
  ]);
}

function isProductionModel(publicPath) {
  return publicPath.startsWith("models/")
    && publicPath.endsWith(".glb")
    && !publicPath.endsWith("-hq.glb")
    && publicPath !== "models/mpm/vimto.glb";
}

await mkdir(destination, { recursive: true });
for (const directory of sourceDirectories) await copyPreservingPath(resolve(root, directory), directory);
for (const file of rootFiles) await copyPreservingPath(resolve(root, file), file);

const pngReferences = requiredPngs();
for (const source of await walk(publicRoot)) {
  const publicPath = relative(publicRoot, source).replaceAll("\\", "/");
  const extension = extname(source).toLocaleLowerCase();
  if (profile === "complete" && (productionExtensions.has(extension) || isProductionModel(publicPath) || pngReferences.has(publicPath))) {
    await copyPreservingPath(source, join("public", publicPath));
  }
}

const includedFiles = await walk(destination);
const includedBytes = (await Promise.all(includedFiles.map(async (file) => (await stat(file)).size))).reduce((sum, size) => sum + size, 0);
await writeFile(join(destination, "DEPLOYMENT_PACKAGE.txt"), [
  "Multiproduit Mali — paquet Hostinger",
  `Préparé le ${new Date().toISOString()}`,
  "Build: npm run build:hostinger",
  "Start: npm run start:hostinger",
  `Profil: ${profile}`,
  "Les secrets .env.local sont volontairement exclus.",
  "Les PNG de production non référencés, les doublons AVIF et les modèles 3D HQ sont exclus.",
  "Les images WebP et les modèles 3D standards sont conservés pour un déploiement léger.",
].join("\n"));

console.log(JSON.stringify({
  destination,
  profile,
  files: includedFiles.length + 1,
  sizeMiB: Math.round((includedBytes / 1024 / 1024) * 100) / 100,
  pngFiles: pngReferences.size,
}, null, 2));
