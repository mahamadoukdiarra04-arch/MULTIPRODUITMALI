import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const candidates = [
  process.env.BLENDER_BIN,
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe",
  "blender",
].filter(Boolean);

let blender = null;
for (const candidate of candidates) {
  if (candidate === "blender") {
    blender = candidate;
    break;
  }
  try {
    await access(candidate);
    blender = candidate;
    break;
  } catch {
    // Try the next known installation path.
  }
}

if (!blender) throw new Error("Blender est introuvable. Definissez BLENDER_BIN avant de relancer.");

const render = spawnSync(
  blender,
  [
    "--background",
    "--python",
    path.join(rootDir, "scripts", "render-product-assets.py"),
    "--",
    "--models",
    path.join(rootDir, "public", "models", "mpm"),
    "--output",
    path.join(rootDir, ".qa", "3d-alpha"),
    "--resolution",
    "1024",
  ],
  { cwd: rootDir, encoding: "utf8", stdio: "inherit" },
);

if (render.status !== 0) process.exit(render.status ?? 1);

const compose = spawnSync(process.execPath, [path.join(rootDir, "scripts", "compose-product-assets.mjs")], {
  cwd: rootDir,
  encoding: "utf8",
  stdio: "inherit",
});

if (compose.status !== 0) process.exit(compose.status ?? 1);
