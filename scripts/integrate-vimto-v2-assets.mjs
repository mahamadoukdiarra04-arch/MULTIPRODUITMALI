import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packRoot = path.join(
  rootDir,
  "3D",
  "VIMTO",
  "Vimto_Sparkling_Product_Page_Pack",
  "Vimto_Sparkling_Product_Page_Pack",
);
const publicDir = path.join(rootDir, "public");
const universeRoot = "/media/mpm/universes/vimto-sparkling";
const productPageRoot = "/media/mpm/product-pages/vimto-sparkling/v2";
const manifestPath = path.join(publicDir, "media", "mpm", "universes", "integration-manifest.json");

const groups = [
  {
    id: "vimto-hero-flattened-desktop-v02",
    role: "hero-poster",
    depth: "back",
    usage: ["product-page-hero-desktop"],
    variants: [
      ["avif", "assets/hero-flattened/hero-desktop.avif", `${productPageRoot}/hero-desktop.avif`],
      ["webp", "assets/hero-flattened/hero-desktop.webp", `${productPageRoot}/hero-desktop.webp`],
    ],
  },
  {
    id: "vimto-hero-flattened-mobile-v02",
    role: "hero-poster",
    depth: "back",
    usage: ["product-page-hero-mobile"],
    variants: [
      ["avif", "assets/hero-flattened/hero-mobile.avif", `${productPageRoot}/hero-mobile.avif`],
      ["webp", "assets/hero-flattened/hero-mobile.webp", `${productPageRoot}/hero-mobile.webp`],
    ],
  },
  ...[
    ["vimto-background-hero-desktop-v02", "hero-desktop"],
    ["vimto-background-hero-mobile-v02", "hero-mobile"],
    ["vimto-background-product-desktop-v02", "product-desktop"],
    ["vimto-background-product-mobile-v02", "product-mobile"],
  ].map(([id, usage]) => ({
    id,
    role: "background",
    depth: "back",
    usage: [usage],
    variants: ["avif", "webp"].map((format) => [
      format,
      `assets/layers-web/${id}.${format}`,
      `${universeRoot}/${id}.${format}`,
    ]),
  })),
  {
    id: "vimto-can-cutout-approved-v002",
    role: "product-cutout",
    depth: "mid",
    usage: ["homepage-packshot", "product-focus", "fallback"],
    variants: ["avif", "webp", "png"].map((format) => [
      format,
      `assets/product/vimto-can-cutout-approved-v002.${format}`,
      `${universeRoot}/vimto-can-cutout-approved-v002.${format}`,
    ]),
  },
  {
    id: "vimto-white-panel-back-v02",
    role: "texture",
    depth: "back",
    usage: ["product-focus"],
    variants: [["svg", "assets/layers-web/vimto-white-panel-back-v02.svg", `${universeRoot}/vimto-white-panel-back-v02.svg`]],
  },
  {
    id: "vimto-lemon-line-mid-v02",
    role: "foreground",
    depth: "mid",
    usage: ["product-focus"],
    variants: [["svg", "assets/layers-web/vimto-lemon-line-mid-v02.svg", `${universeRoot}/vimto-lemon-line-mid-v02.svg`]],
  },
  ...[
    ["vimto-red-liquid-ribbon-mid-v02", "splash", "mid", ["homepage-hero", "product-page-hero", "product-focus"]],
    ["vimto-bubble-particle-front-v02", "particle", "atmosphere", ["homepage-hero", "product-page-hero", "product-focus"]],
  ].map(([id, role, depth, usage]) => ({
    id,
    role,
    depth,
    usage,
    variants: ["avif", "webp"].map((format) => [
      format,
      `assets/layers-web/${id}.${format}`,
      `${universeRoot}/${id}.${format}`,
    ]),
  })),
  ...[
    ["vimto-editorial-macro-v02", "macro"],
    ["vimto-editorial-lifestyle-v02", "lifestyle"],
  ].map(([id, sourceName]) => ({
    id,
    role: sourceName,
    depth: "mid",
    usage: [`product-page-${sourceName}`],
    variants: ["avif", "webp"].map((format) => [
      format,
      `assets/editorial/${sourceName}.${format}`,
      `${universeRoot}/${id}.${format}`,
    ]),
  })),
];

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function copyVariant([format, sourceRelative, destinationPublic]) {
  const source = path.join(packRoot, ...sourceRelative.split("/"));
  const destination = path.join(publicDir, ...destinationPublic.slice(1).split("/"));
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);

  const buffer = await readFile(destination);
  const variant = {
    format,
    source,
    destination: destinationPublic,
    bytes: buffer.byteLength,
    sha256: sha256(buffer),
  };

  if (format !== "svg") {
    const metadata = await sharp(buffer).metadata();
    variant.dimensions = { width: metadata.width, height: metadata.height };
  }

  return variant;
}

const logoSource = path.join(rootDir, "Questionnaire séance 1", "LOGO MULTI PRODUIT MALI.png");
const logoDestination = path.join(publicDir, "media", "mpm", "brand", "multiproduit-mali-logo.png");
const logoWebDestination = path.join(publicDir, "media", "mpm", "brand", "multiproduit-mali-logo-512.webp");
await mkdir(path.dirname(logoDestination), { recursive: true });
await copyFile(logoSource, logoDestination);
const logoBuffer = await readFile(logoDestination);
const logoMetadata = await sharp(logoBuffer).metadata();
const logoWebBuffer = await sharp(logoBuffer)
  .resize(512, 512, { fit: "fill", kernel: sharp.kernel.lanczos3 })
  .webp({ lossless: true, effort: 6 })
  .toBuffer();
await writeFile(logoWebDestination, logoWebBuffer);
await writeFile(
  path.join(path.dirname(logoDestination), "integration-manifest.json"),
  `${JSON.stringify({
    schemaVersion: 1,
    sourcePolicy: "Exact source copy. Exterior checkerboard is masked only by CSS.",
    assets: [
      {
        id: "multiproduit-mali-logo-master",
        source: logoSource,
        destination: "/media/mpm/brand/multiproduit-mali-logo.png",
        format: "png",
        bytes: logoBuffer.byteLength,
        dimensions: { width: logoMetadata.width, height: logoMetadata.height },
        sha256: sha256(logoBuffer),
        immutable: true,
      },
      {
        id: "multiproduit-mali-logo-web-512",
        derivedFrom: "/media/mpm/brand/multiproduit-mali-logo.png",
        destination: "/media/mpm/brand/multiproduit-mali-logo-512.webp",
        format: "webp",
        encoding: "lossless",
        resize: "512x512 Lanczos3",
        bytes: logoWebBuffer.byteLength,
        dimensions: { width: 512, height: 512 },
        sha256: sha256(logoWebBuffer),
      },
    ],
  }, null, 2)}\n`,
  "utf8",
);

const integratedAssets = [];
for (const group of groups) {
  const variants = {};
  for (const variantSpec of group.variants) {
    const variant = await copyVariant(variantSpec);
    variants[variant.format] = variant;
  }
  integratedAssets.push({
    product: "vimto-sparkling",
    sourceProduct: "vimto-sparkling-v2-retro-red",
    id: group.id,
    role: group.role,
    depth: group.depth,
    usage: group.usage,
    variants,
  });
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.formats = [...new Set([...(manifest.formats ?? []), "png", "svg"])];
manifest.sourceRoots = [...new Set([
  ...(manifest.sourceRoots ?? [manifest.sourceRoot].filter(Boolean)).filter(
    (sourceRoot) => !sourceRoot.includes(`${path.sep}3D${path.sep}Assets${path.sep}Vimto_Sparkling_Product_Page_Pack${path.sep}`),
  ),
  packRoot,
])];
manifest.assets = [
  ...manifest.assets.filter((asset) => asset.product !== "vimto" && asset.product !== "vimto-sparkling" && asset.sourceProduct !== "vimto-sparkling"),
  ...integratedAssets,
];
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const totalBytes = integratedAssets.reduce(
  (sum, asset) => sum + Object.values(asset.variants).reduce((assetSum, variant) => assetSum + variant.bytes, 0),
  0,
);
console.log(`Logo exact copie: ${logoBuffer.byteLength} octets; derive web lossless: ${logoWebBuffer.byteLength} octets`);
console.log(`Vimto V2: ${integratedAssets.length} roles, ${totalBytes} octets copies`);
console.log(`Manifest: ${path.relative(rootDir, manifestPath)}`);
