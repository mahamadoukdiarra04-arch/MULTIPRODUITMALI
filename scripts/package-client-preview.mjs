import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const deliverables = join(root, "Livrables");
const packageName = "MULTIPRODUIT_MALI_APERCU_3D_FIDELE";
const packageDirectory = join(deliverables, packageName);
const sourceBuild = join(root, "dist");
const sourceServer = join(root, "scripts", "serve-standalone-build.mjs");
const sourceLoader = join(root, "scripts", "cloudflare-workers-local-loader.mjs");
const sourceStub = join(root, "scripts", "cloudflare-workers-local-stub.mjs");
const portableNode = "C:\\Program Files\\nodejs\\node.exe";

const readme = [
  "MULTIPRODUIT MALI — APERÇU CLIENT 3D",
  "",
  "1. Extrayez entièrement ce dossier avant de l’ouvrir.",
  "2. Double-cliquez sur « OUVRIR_L_APERCU_3D.bat ».",
  "3. Le navigateur s’ouvre automatiquement sur le site.",
  "",
  "Cet aperçu reprend le build actuel : animations, scènes 3D, canettes et pages validées.",
  "Il ne demande ni installation, ni connexion Internet.",
  "",
  "Les formulaires restent volontairement en mode démonstration : aucun message n’est envoyé depuis cet aperçu.",
  "",
  "Le back-office actuel peut être consulté en allant sur /actualites/back-office.",
  "",
  "Pour arrêter l’aperçu, fermez la petite fenêtre « Multiproduit Mali local » ouverte en arrière-plan.",
].join("\r\n");

const launcher = [
  "@echo off",
  "setlocal",
  "cd /d \"%~dp0\"",
  "start \"Multiproduit Mali local\" /min \"%~dp0runtime\\node.exe\" \"--experimental-loader=./cloudflare-workers-local-loader.mjs\" \"%~dp0serveur.mjs\" \"%~dp0site\"",
  "timeout /t 2 /nobreak >nul",
  "start \"\" \"http://127.0.0.1:4173/\"",
  "endlocal",
].join("\r\n");

await rm(packageDirectory, { recursive: true, force: true });
await mkdir(join(packageDirectory, "runtime"), { recursive: true });
await cp(sourceBuild, join(packageDirectory, "site"), { recursive: true });
await cp(portableNode, join(packageDirectory, "runtime", basename(portableNode)));
await writeFile(join(packageDirectory, "serveur.mjs"), await readFile(sourceServer, "utf8"), "utf8");
await writeFile(join(packageDirectory, "cloudflare-workers-local-loader.mjs"), await readFile(sourceLoader, "utf8"), "utf8");
await writeFile(join(packageDirectory, "cloudflare-workers-local-stub.mjs"), await readFile(sourceStub, "utf8"), "utf8");
await writeFile(join(packageDirectory, "OUVRIR_L_APERCU_3D.bat"), launcher, "utf8");
await writeFile(join(packageDirectory, "LISEZ_MOI.txt"), readme, "utf8");

console.log(packageDirectory);
