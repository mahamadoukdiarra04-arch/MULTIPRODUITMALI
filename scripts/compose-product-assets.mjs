import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const renderRoot = path.join(rootDir, ".qa", "3d-alpha");
const outputRoot = path.join(rootDir, "public", "media", "mpm", "products");

const products = [
  { id: "tropicoul-ananas", background: "#f7c934", soft: "#fff4bd" },
  { id: "tropicoul-orange", background: "#f47a22", soft: "#ffe2bb" },
  { id: "tropicoul-mangue", background: "#f2ad2f", soft: "#ffe4b0" },
  { id: "tropicoul-goyave", background: "#e95d7e", soft: "#ffd8e1" },
  { id: "tropicoul-cocktail", background: "#9eb54a", soft: "#eef2c5" },
  { id: "tropicoul-tamarin", background: "#6c7d45", soft: "#e4dfc4" },
  { id: "triplex", background: "#080808", soft: "#0b0b0b" },
  { id: "vimto", background: "#7b0b2c", soft: "#3a0716" },
];

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function compositeOnBackground(source, output, width, height, background, canWidth) {
  const can = await sharp(source).resize({ width: canWidth, height: canWidth, fit: "contain" }).png().toBuffer();
  await sharp({ create: { width, height, channels: 4, background } })
    .composite([{ input: can, gravity: "center" }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
}

async function encodePoster(source, output, format, maximumBytes) {
  const qualities = format === "avif"
    ? [68, 64, 60, 56, 52, 48, 44, 40]
    : [84, 80, 76, 72, 68, 64, 60, 56];

  for (const quality of qualities) {
    const pipeline = sharp(source);
    const buffer = format === "avif"
      ? await pipeline.avif({ quality, effort: 1, chromaSubsampling: "4:4:4" }).toBuffer()
      : await pipeline.webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    if (buffer.byteLength <= maximumBytes) {
      await writeFile(output, buffer);
      return { bytes: buffer.byteLength, quality };
    }
  }

  throw new Error(`${path.basename(output)} depasse encore ${maximumBytes} octets a la qualite minimale autorisee.`);
}

async function encodeTransparentPackshot(source, output, format, maximumBytes) {
  const qualities = format === "avif"
    ? [74, 70, 66, 62, 58, 54, 50, 46]
    : [86, 82, 78, 74, 70, 66, 62, 58];

  for (const quality of qualities) {
    const pipeline = sharp(source).resize(1600, 1600, { fit: "contain", kernel: sharp.kernel.lanczos3 });
    const buffer = format === "avif"
      ? await pipeline.avif({ quality, effort: 4, chromaSubsampling: "4:4:4" }).toBuffer()
      : await pipeline.webp({ quality, effort: 6, smartSubsample: true }).toBuffer();
    if (buffer.byteLength <= maximumBytes) {
      await writeFile(output, buffer);
      return { bytes: buffer.byteLength, quality };
    }
  }

  throw new Error(`${path.basename(output)} depasse encore ${maximumBytes} octets.`);
}

async function describe(file, publicRoot) {
  const [buffer, metadata, stats] = await Promise.all([
    readFile(file),
    sharp(file).metadata(),
    sharp(file).stats(),
  ]);
  const alpha = stats.channels[3];
  return {
    path: `/${path.relative(publicRoot, file).replaceAll("\\", "/")}`,
    bytes: buffer.byteLength,
    sha256: sha256(buffer),
    width: metadata.width,
    height: metadata.height,
    alpha: alpha ? { min: alpha.min, max: alpha.max } : null,
  };
}

await mkdir(outputRoot, { recursive: true });
const manifest = {
  schemaVersion: 3,
  generatedAt: new Date().toISOString(),
  posterPolicy: {
    desktop: { avifMaximumBytes: 250_000, webpMaximumBytes: 400_000 },
    mobile: { avifMaximumBytes: 180_000, webpMaximumBytes: 300_000 },
  },
  packshotPolicy: {
    width: 1600,
    avifMaximumBytes: 250_000,
    webpMaximumBytes: 400_000,
    alphaRequired: true,
  },
  products: [],
};
const publicRoot = path.join(rootDir, "public");

for (const product of products) {
  const sourceDir = path.join(renderRoot, product.id);
  const outputDir = path.join(outputRoot, product.id);
  const qaDir = path.join(outputDir, "qa");
  await mkdir(qaDir, { recursive: true });

  for (const view of ["front", "left", "back", "right"]) {
    await compositeOnBackground(
      path.join(sourceDir, `${view}.png`),
      path.join(qaDir, `${view}.png`),
      2048,
      2048,
      "#f1f2ef",
      2048,
    );
  }

  const transparentFront = path.join(sourceDir, "front.png");
  const packshot = path.join(outputDir, "packshot.png");
  await sharp(transparentFront)
    .resize(2048, 2048, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(packshot);
  const packshotEncoding = {
    avif: await encodeTransparentPackshot(packshot, path.join(outputDir, "packshot.avif"), "avif", 250_000),
    webp: await encodeTransparentPackshot(packshot, path.join(outputDir, "packshot.webp"), "webp", 400_000),
  };
  await compositeOnBackground(transparentFront, path.join(outputDir, "poster.png"), 1600, 1600, product.background, 1600);
  await compositeOnBackground(transparentFront, path.join(outputDir, "poster-mobile.png"), 1080, 1440, product.background, 1080);
  const posterEncoding = {
    avif: await encodePoster(path.join(outputDir, "poster.png"), path.join(outputDir, "poster.avif"), "avif", 250_000),
    webp: await encodePoster(path.join(outputDir, "poster.png"), path.join(outputDir, "poster.webp"), "webp", 400_000),
    mobileAvif: await encodePoster(path.join(outputDir, "poster-mobile.png"), path.join(outputDir, "poster-mobile.avif"), "avif", 180_000),
    mobileWebp: await encodePoster(path.join(outputDir, "poster-mobile.png"), path.join(outputDir, "poster-mobile.webp"), "webp", 300_000),
  };
  await compositeOnBackground(transparentFront, path.join(outputDir, "product-hero.png"), 1600, 1800, product.soft, 1560);
  await compositeOnBackground(transparentFront, path.join(outputDir, "lifestyle-fallback.png"), 1600, 1000, "#e8e9e5", 940);

  const roles = {};
  for (const [role, relativeFile] of Object.entries({
    packshot: "packshot.png",
    packshotAvif: "packshot.avif",
    packshotWebp: "packshot.webp",
    poster: "poster.png",
    posterAvif: "poster.avif",
    posterWebp: "poster.webp",
    posterMobile: "poster-mobile.png",
    posterMobileAvif: "poster-mobile.avif",
    posterMobileWebp: "poster-mobile.webp",
    productHero: "product-hero.png",
    lifestyleFallback: "lifestyle-fallback.png",
    qaFront: "qa/front.png",
    qaLeft: "qa/left.png",
    qaBack: "qa/back.png",
    qaRight: "qa/right.png",
  })) {
    roles[role] = await describe(path.join(outputDir, relativeFile), publicRoot);
  }

  for (const role of ["packshot", "packshotAvif", "packshotWebp"]) {
    if (!roles[role].alpha || roles[role].alpha.min !== 0 || roles[role].alpha.max !== 255) {
      throw new Error(`${product.id}: ${role} ne possede pas un canal alpha reel.`);
    }
  }

  manifest.products.push({ id: product.id, roles, posterEncoding, packshotEncoding });
  console.log(`${product.id}: packshot alpha ${roles.packshot.alpha.min}-${roles.packshot.alpha.max}; posters modernes conformes`);
}

await writeFile(path.join(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
