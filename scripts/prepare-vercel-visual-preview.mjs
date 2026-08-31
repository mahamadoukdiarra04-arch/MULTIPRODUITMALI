import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(process.env.VERCEL_VISUAL_OUTPUT ?? join(root, ".codex-tmp", "vercel-visual-preview"));
const build = join(root, "dist");
const client = join(build, "client");
const server = join(build, "server");

const project = JSON.parse(await readFile(join(root, ".vercel", "project.json"), "utf8"));

const packageJson = {
  name: "simpara-distribution-visual-preview",
  private: true,
  type: "module",
  engines: { node: ">=22.13.0" },
};

const vercelConfig = {
  version: 2,
  framework: null,
  buildCommand: "node -e \"\"",
  outputDirectory: "public",
  routes: [
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/api/site" },
  ],
};

const serverFunction = `import { Readable } from "node:stream";
import worker from "../worker/index.js";

const specialPngAlternatives = {
  "/media/mpm/brand/multiproduit-mali-logo.png": "/media/mpm/brand/multiproduit-mali-logo-512.webp",
  "/media/mpm/hero/triplex/poster.png": "/media/mpm/universes/triplex-original/triplex-background-hero-desktop-v01.webp",
  "/media/mpm/hero/tropicoul-ananas/poster.png": "/media/mpm/universes/tropicoul-ananas/ananas-background-hero-desktop-v01.webp",
  "/media/mpm/hero/tropicoul-cocktail/poster.png": "/media/mpm/universes/tropicoul-cocktail/cocktail-background-hero-desktop-v01.webp",
  "/media/mpm/hero/tropicoul-mangue/poster.png": "/media/mpm/universes/tropicoul-mangue/mangue-background-hero-desktop-v01.webp",
  "/media/mpm/hero/tropicoul-orange/poster.png": "/media/mpm/universes/tropicoul-orange/orange-background-hero-desktop-v01.webp",
  "/media/mpm/hero/tropicoul-tamarin/poster.png": "/media/mpm/universes/tropicoul-tamarin/tamarin-background-hero-desktop-v01.webp",
  "/media/simpara/triplex/triplex-hero.png": "/media/mpm/universes/triplex-original/triplex-background-hero-desktop-v01.webp",
  "/media/simpara/triplex/triplex-work.png": "/media/mpm/universes/triplex-original/triplex-lifestyle-mid-v01.webp",
};

function alternativePaths(pathname) {
  if (!pathname.endsWith(".png")) return [];
  const stem = pathname.slice(0, -4);
  const productFallback = pathname.match(/^\\/media\\/mpm\\/products\\/([^/]+)\\\/(?:product-hero|lifestyle-fallback)\\.png$/);
  const heroFallback = pathname.startsWith("/media/mpm/hero/") ? "/media/mpm/universes/tropicoul-ananas/ananas-background-hero-desktop-v01.webp" : null;
  return [
    stem + ".avif",
    stem + ".webp",
    productFallback ? "/media/mpm/products/" + productFallback[1] + "/packshot.avif" : null,
    specialPngAlternatives[pathname] ?? heroFallback,
  ].filter(Boolean);
}

async function fetchPreviewAsset(request) {
  const original = request instanceof Request ? request : new Request(request);
  const url = new URL(original.url);
  const candidates = alternativePaths(url.pathname);
  if (candidates.length === 0) return fetch(original);

  for (const pathname of candidates) {
    const candidate = new URL(url);
    candidate.pathname = pathname;
    const asset = await fetch(new Request(candidate, { headers: original.headers }));
    if (asset.ok) return asset;
  }
  return new Response("Asset not found", { status: 404 });
}

function incomingHeaders(headers) {
  const result = new Headers();
  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) continue;
    result.set(name, Array.isArray(value) ? value.join(", ") : value);
  }
  return result;
}

function responseHeaders(response, result) {
  response.headers.forEach((value, name) => {
    if (name.toLowerCase() !== "transfer-encoding") result.setHeader(name, value);
  });
}

async function send(response, result, method) {
  response.statusCode = result.status;
  response.statusMessage = result.statusText;
  responseHeaders(result, response);
  if (!result.body || method === "HEAD") {
    response.end();
    return;
  }
  Readable.fromWeb(result.body).pipe(response);
}

export default async function handler(request, response) {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.statusCode = 202;
      response.setHeader("content-type", "application/json; charset=utf-8");
      response.end(JSON.stringify({ preview: true, message: "Cette version Vercel est une démonstration visuelle : aucune donnée n’est enregistrée." }));
      return;
    }

    const protocol = String(request.headers["x-forwarded-proto"] ?? "https").split(",")[0];
    const host = String(request.headers["x-forwarded-host"] ?? request.headers.host ?? "localhost").split(",")[0];
    const url = new URL(request.url ?? "/", protocol + "://" + host);
    if (url.pathname.endsWith(".png")) {
      await send(response, await fetchPreviewAsset(new Request(url, { headers: incomingHeaders(request.headers) })), request.method);
      return;
    }
    const result = await worker.fetch(
      new Request(url, { method: request.method, headers: incomingHeaders(request.headers) }),
      {
        ASSETS: {
          fetch(assetRequest) {
            return fetchPreviewAsset(assetRequest);
          },
        },
      },
    );

    await send(response, result, request.method);
  } catch (error) {
    console.error("visual-preview-worker", error);
    response.statusCode = 500;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end("La démonstration visuelle n’a pas pu charger cette page.");
  }
}
`;

function isInside(parent, candidate) {
  return candidate === parent || candidate.startsWith(`${parent}${sep}`);
}

async function copyBuild() {
  await cp(client, join(output, "public"), { recursive: true });
  await cp(server, join(output, "worker"), { recursive: true });
}

async function removePngFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await removePngFiles(path);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) await rm(path);
  }
}

if (!isInside(root, output)) throw new Error("Le dossier de préparation doit rester sous le répertoire du projet.");
await rm(output, { recursive: true, force: true });
await mkdir(join(output, "api"), { recursive: true });
await mkdir(join(output, ".vercel"), { recursive: true });
await copyBuild();
await removePngFiles(join(output, "public"));
await writeFile(join(output, "api", "site.mjs"), serverFunction, "utf8");
await writeFile(join(output, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
await writeFile(join(output, "vercel.json"), `${JSON.stringify(vercelConfig, null, 2)}\n`, "utf8");
await writeFile(join(output, ".vercel", "project.json"), `${JSON.stringify(project, null, 2)}\n`, "utf8");

console.log(output);
