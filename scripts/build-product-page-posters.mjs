import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const sourceRoot = path.join(
  root,
  "3D",
  "Multiproduit_Product_Pages_Immersives",
  "Multiproduit_Product_Pages_Immersives",
  "assets",
);
const publicRoot = path.join(root, "public", "media", "mpm", "product-pages");

const products = [
  "tropicoul-ananas",
  "tropicoul-mangue",
  "tropicoul-orange",
  "tropicoul-goyave",
  "tropicoul-cocktail",
  "tropicoul-tamarin",
  "triplex-original",
];

const variants = {
  desktop: {
    source: "hero-desktop.png",
    widths: [640, 960, 1280, 1600, 1920],
    targetBytes: { avif: 340_000, webp: 440_000 },
    quality: { avif: 55, webp: 82 },
    minimumQuality: { avif: 44, webp: 72 },
  },
  mobile: {
    source: "hero-mobile.png",
    widths: [360, 480, 720, 1000, 1440],
    targetBytes: { avif: 180_000, webp: 230_000 },
    quality: { avif: 54, webp: 80 },
    minimumQuality: { avif: 44, webp: 70 },
  },
};

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function encode(input, output, width, format, config) {
  let quality = config.quality[format];
  let buffer;

  while (quality >= config.minimumQuality[format]) {
    const pipeline = sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 });

    buffer = format === "avif"
      ? await pipeline.avif({ quality, effort: 7, chromaSubsampling: "4:4:4" }).toBuffer()
      : await pipeline.webp({ quality, effort: 6, smartSubsample: false }).toBuffer();

    if (buffer.length <= config.targetBytes[format]) break;
    quality -= 2;
  }

  await writeFile(output, buffer);
  const metadata = await sharp(buffer).metadata();
  return {
    path: `/${path.relative(path.join(root, "public"), output).split(path.sep).join("/")}`,
    format,
    mime: `image/${format}`,
    width: metadata.width,
    height: metadata.height,
    bytes: buffer.length,
    quality,
    targetBytes: config.targetBytes[format],
    withinTarget: buffer.length <= config.targetBytes[format],
    sha256: createHash("sha256").update(buffer).digest("hex"),
  };
}

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  generator: "scripts/build-product-page-posters.mjs",
  sourceRoot,
  products: [],
};

for (const product of products) {
  const productRoot = path.join(publicRoot, product);
  const sourceOutputRoot = path.join(productRoot, "source");
  const imageOutputRoot = path.join(productRoot, "images");
  await mkdir(sourceOutputRoot, { recursive: true });
  await mkdir(imageOutputRoot, { recursive: true });

  const entry = { product, sourceDirectory: path.join(sourceRoot, product), variants: {} };

  for (const [role, config] of Object.entries(variants)) {
    const source = path.join(sourceRoot, product, "hero-flattened", config.source);
    const copiedSource = path.join(sourceOutputRoot, config.source);
    await copyFile(source, copiedSource);

    const sourceMetadata = await sharp(source).metadata();
    const sourceStat = await stat(source);
    const renditions = [];

    for (const width of config.widths.filter((candidate) => candidate <= sourceMetadata.width)) {
      for (const format of ["avif", "webp"]) {
        const output = path.join(
          imageOutputRoot,
          `${product}__hero-${role}__${width}w.${format}`,
        );
        renditions.push(await encode(source, output, width, format, config));
      }
    }

    entry.variants[role] = {
      source,
      publicSource: `/${path.relative(path.join(root, "public"), copiedSource).split(path.sep).join("/")}`,
      sourceWidth: sourceMetadata.width,
      sourceHeight: sourceMetadata.height,
      sourceBytes: sourceStat.size,
      sourceSha256: await sha256(source),
      renditions,
    };
  }

  await writeFile(
    path.join(productRoot, "manifest.json"),
    `${JSON.stringify(entry, null, 2)}\n`,
  );
  manifest.products.push(entry);
}

await mkdir(publicRoot, { recursive: true });
await writeFile(
  path.join(publicRoot, "integration-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

const renditions = manifest.products.flatMap((product) =>
  Object.values(product.variants).flatMap((variant) => variant.renditions),
);
const totalBytes = renditions.reduce((sum, rendition) => sum + rendition.bytes, 0);
const exceptions = renditions.filter((rendition) => !rendition.withinTarget);

console.log(`Generated ${renditions.length} poster renditions (${totalBytes} bytes).`);
console.log(`Budget exceptions: ${exceptions.length}.`);
for (const exception of exceptions) {
  console.log(`- ${exception.path}: ${exception.bytes} bytes at quality ${exception.quality}`);
}
