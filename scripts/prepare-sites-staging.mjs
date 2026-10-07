import { cp, copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";

const projectRoot = resolve(process.cwd());
const sourceDist = join(projectRoot, "dist");
const stagingRoot = join(tmpdir(), "simpara-sites-deployment-stage");

function isDisposableClientAsset(relativePath) {
  const path = relativePath.replaceAll(sep, "/");

  if (path.startsWith("client/media/mpm/product-pages/") && path.includes("/source/")) return true;
  if (path.startsWith("client/media/mpm/products/") && path.includes("/qa/")) return true;
  if (path.startsWith("client/media/mpm/hero/")) return true;

  if (path.startsWith("client/media/simpara/") && path !== "client/media/simpara/triplex/triplex-hero.png") {
    return true;
  }

  if (path.startsWith("client/media/mpm/") && path.endsWith(".png")) {
    const isPackshot = /^client\/media\/mpm\/products\/[^/]+\/packshot\.png$/.test(path);
    const isRequiredBrandMark = path === "client/media/mpm/brand/multiproduit-mali-logo.png";
    const isRequiredVimtoCutout = path === "client/media/mpm/universes/vimto-sparkling/vimto-can-cutout-approved-v002.png";
    return !isPackshot && !isRequiredBrandMark && !isRequiredVimtoCutout;
  }

  return false;
}

async function copyDirectory(sourceDirectory, relativeDirectory = "") {
  const entries = await readdir(sourceDirectory, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = join(sourceDirectory, entry.name);
    const relativePath = relativeDirectory ? join(relativeDirectory, entry.name) : entry.name;
    const destinationPath = join(stagingRoot, "dist", relativePath);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, relativePath);
      continue;
    }

    if (!entry.isFile() || isDisposableClientAsset(relativePath)) continue;
    await mkdir(dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
  }
}

if (!sourceDist.startsWith(projectRoot + sep)) throw new Error("Build directory is outside the project.");
if (!stagingRoot.startsWith(tmpdir())) throw new Error("Staging directory is outside the system temporary directory.");

await rm(stagingRoot, { recursive: true, force: true });
await mkdir(join(stagingRoot, "dist"), { recursive: true });
await copyDirectory(sourceDist);
await mkdir(join(stagingRoot, ".openai"), { recursive: true });
await copyFile(join(projectRoot, ".openai", "hosting.json"), join(stagingRoot, ".openai", "hosting.json"));

try {
  await stat(join(projectRoot, "drizzle"));
  await cp(join(projectRoot, "drizzle"), join(stagingRoot, "drizzle"), { recursive: true });
} catch {
  // Migrations are optional for a static-only build.
}

process.stdout.write(`${stagingRoot}\n`);
