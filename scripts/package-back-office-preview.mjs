import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const deliverables = join(root, "Livrables");
const packageName = "MULTIPRODUIT_MALI_BACK_OFFICE_FIDELE";
const packageDirectory = join(deliverables, packageName);
const clientRoot = join(root, "dist", "client");
const serverRoot = join(root, "dist", "server");
const portableNode = "C:\\Program Files\\nodejs\\node.exe";

const assetPaths = [
  "media/mpm/brand/multiproduit-mali-logo-512.webp",
  "media/mpm/brand/multiproduit-mali-logo.png",
  "media/mpm/universes/tropicoul-goyave/goyave-lifestyle-mid-v01.webp",
  "media/mpm/universes/tropicoul-ananas/ananas-lifestyle-mid-v01.webp",
  "media/mpm/product-pages/triplex-original/images/triplex-original__hero-desktop__1280w.webp",
  "media/mpm/product-pages/vimto-sparkling/v2/hero-desktop.webp",
  "media/mpm/product-pages/tropicoul-ananas/images/tropicoul-ananas__hero-desktop__1280w.webp",
];

const readme = [
  "MULTIPRODUIT MALI — BACK-OFFICE, APERÇU FIDÈLE",
  "",
  "1. Extrayez entièrement ce dossier.",
  "2. Double-cliquez sur « OUVRIR_LE_BACK_OFFICE.bat ».",
  "3. Le navigateur ouvre le vrai écran de gestion éditoriale en lecture seule.",
  "",
  "Cet aperçu contient l’éditeur, la programmation, l’aperçu en direct et la modération actuellement validés.",
  "Aucune publication, aucun commentaire et aucune donnée réelle ne sont modifiés depuis ce paquet local.",
  "",
  "Pour l’arrêter, fermez la petite fenêtre « Multiproduit Mali back-office » ouverte en arrière-plan.",
].join("\r\n");

const launcher = [
  "@echo off",
  "setlocal",
  "cd /d \"%~dp0\"",
  "start \"Multiproduit Mali back-office\" /min \"%~dp0runtime\\node.exe\" \"--experimental-loader=./cloudflare-workers-local-loader.mjs\" \"%~dp0serveur.mjs\" \"%~dp0site\"",
  "timeout /t 2 /nobreak >nul",
  "start \"\" \"http://127.0.0.1:4173/actualites/back-office\"",
  "endlocal",
].join("\r\n");

async function copyAsset(relativePath) {
  const source = join(clientRoot, relativePath);
  const target = join(packageDirectory, "site", "client", relativePath);
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target);
}

await rm(packageDirectory, { recursive: true, force: true });
await mkdir(join(packageDirectory, "runtime"), { recursive: true });
await cp(serverRoot, join(packageDirectory, "site", "server"), { recursive: true });
await cp(join(clientRoot, "_next"), join(packageDirectory, "site", "client", "_next"), { recursive: true });
await cp(join(clientRoot, ".vite"), join(packageDirectory, "site", "client", ".vite"), { recursive: true });
await cp(join(clientRoot, "favicon.svg"), join(packageDirectory, "site", "client", "favicon.svg"));
await Promise.all(assetPaths.map(copyAsset));
await cp(portableNode, join(packageDirectory, "runtime", basename(portableNode)));
await writeFile(join(packageDirectory, "serveur.mjs"), await readFile(join(root, "scripts", "serve-standalone-build.mjs"), "utf8"), "utf8");
await writeFile(join(packageDirectory, "cloudflare-workers-local-loader.mjs"), await readFile(join(root, "scripts", "cloudflare-workers-local-loader.mjs"), "utf8"), "utf8");
await writeFile(join(packageDirectory, "cloudflare-workers-local-stub.mjs"), await readFile(join(root, "scripts", "cloudflare-workers-local-stub.mjs"), "utf8"), "utf8");
await writeFile(join(packageDirectory, "OUVRIR_LE_BACK_OFFICE.bat"), launcher, "utf8");
await writeFile(join(packageDirectory, "LISEZ_MOI.txt"), readme, "utf8");

console.log(packageDirectory);
