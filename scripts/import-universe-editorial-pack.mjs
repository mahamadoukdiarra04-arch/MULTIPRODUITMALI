import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

sharp.concurrency(4);

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(workspace, "Direction", "PACK_COMPLET_V4");
const publicRoot = path.join(workspace, "public", "media", "mpm", "editorial");
const modulePath = path.join(workspace, "app", "product-universe-gallery.ts");

const productDirectories = (await readdir(sourceRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name !== "images-jpg")
  .map((entry) => entry.name)
  .filter((slug) => slug.startsWith("tropicoul-") || slug.startsWith("triplex-") || slug.startsWith("vimto-"))
  .sort();

const recordsByProduct = {};
const supportingVimtoSources = [
  {
    id: "vimto-bottle-lantern",
    eyebrow: "L’original",
    title: "Le goût historique en bouteille",
    body: "La bouteille en verre prolonge la signature Vimto autour des tables et des moments de partage.",
    alt: "Bouteilles Vimto encadrant une lanterne marocaine sur fond rouge.",
    source: path.join(workspace, "Direction", "gtfy_jpeg", "20-8.jpg"),
  },
  {
    id: "vimto-bottle-serve",
    eyebrow: "Le service",
    title: "Servir très frais",
    body: "Une bouteille, un verre rempli de glaçons et le rituel de service Vimto.",
    alt: "Bouteille Vimto, pichet et verres remplis d’une boisson rouge avec glaçons.",
    source: path.join(workspace, "Direction", "gtfy_jpeg", "9618c76123cf8e98553959a1f9875c64.jpg"),
  },
  {
    id: "vimto-bottle-original",
    eyebrow: "L’iconique",
    title: "Une présence reconnaissable",
    body: "La bouteille originale installe Vimto dans un décor profond, entre héritage et fraîcheur.",
    alt: "Bouteille Vimto originale accompagnée d’un verre servi et de fruits rouges.",
    source: path.join(workspace, "Direction", "gtfy_jpeg", "2b1a4682e43f323a0500d2f67c20db09.jpg"),
  },
  {
    id: "vimto-bottle-signature",
    eyebrow: "La signature",
    title: "Une histoire qui se partage",
    body: "Une expression de la gamme Vimto pensée pour les instants calmes comme les grandes tablées.",
    alt: "Bouteille Vimto inclinée, fruits rouges et verre servi sur fond rouge.",
    source: path.join(workspace, "Direction", "gtfy_jpeg", "37cf39161623945.Y3JvcCwxMzgwLDEwODAsMjcwLDA.jpg"),
  },
];

for (const slug of productDirectories) {
  const productRoot = path.join(sourceRoot, slug);
  const content = JSON.parse(await readFile(path.join(productRoot, "content.json"), "utf8"));
  const outputRoot = path.join(publicRoot, slug);
  await mkdir(outputRoot, { recursive: true });
  const records = [];

  for (const visual of content.visuals.sort((a, b) => a.order - b.order)) {
    const source = path.join(productRoot, visual.image.replace(/^\.\//, ""));
    const baseName = `${slug}-univers-${String(visual.order).padStart(2, "0")}-${path.basename(source, path.extname(source))}`;
    const webpPath = path.join(outputRoot, `${baseName}.webp`);
    const avifPath = path.join(outputRoot, `${baseName}.avif`);
    const pipeline = sharp(source).resize({ width: 1440, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 });
    await Promise.all([
      pipeline.clone().webp({ quality: 84, effort: 4, smartSubsample: true }).toFile(webpPath),
      pipeline.clone().avif({ quality: 62, effort: 3, chromaSubsampling: "4:4:4" }).toFile(avifPath),
    ]);
    const metadata = await sharp(webpPath).metadata();

    records.push({
      id: visual.id,
      order: visual.order,
      eyebrow: visual.eyebrow,
      title: visual.title,
      body: visual.body,
      alt: visual.alt,
      layout: visual.layout,
      animation: visual.animation,
      src: `/media/mpm/editorial/${slug}/${baseName}.webp`,
      avif: `/media/mpm/editorial/${slug}/${baseName}.avif`,
      width: metadata.width ?? 1440,
      height: metadata.height ?? 941,
    });
  }

  recordsByProduct[slug] = records;
}

const supportingRecordsByProduct = { "vimto-sparkling": [] };
const supportingOutputRoot = path.join(publicRoot, "vimto-sparkling");
await mkdir(supportingOutputRoot, { recursive: true });
for (const visual of supportingVimtoSources) {
  const { source, ...story } = visual;
  const baseName = visual.id;
  const webpPath = path.join(supportingOutputRoot, `${baseName}.webp`);
  const avifPath = path.join(supportingOutputRoot, `${baseName}.avif`);
  const pipeline = sharp(visual.source).resize({ width: 1440, withoutEnlargement: true, kernel: sharp.kernel.lanczos3 });
  await Promise.all([
    pipeline.clone().webp({ quality: 84, effort: 4, smartSubsample: true }).toFile(webpPath),
    pipeline.clone().avif({ quality: 62, effort: 3, chromaSubsampling: "4:4:4" }).toFile(avifPath),
  ]);
  const metadata = await sharp(webpPath).metadata();
  supportingRecordsByProduct["vimto-sparkling"].push({
    ...story,
    src: `/media/mpm/editorial/vimto-sparkling/${baseName}.webp`,
    avif: `/media/mpm/editorial/vimto-sparkling/${baseName}.avif`,
    width: metadata.width ?? 1440,
    height: metadata.height ?? 941,
  });
}

const generatedModule = `export type ProductUniverseStory = {
  id: string;
  order: number;
  eyebrow: string;
  title: string;
  body: string;
  alt: string;
  layout: string;
  animation: string;
  src: string;
  avif: string;
  width: number;
  height: number;
};

export const PRODUCT_UNIVERSE_STORIES = ${JSON.stringify(recordsByProduct, null, 2)} as const satisfies Record<string, readonly ProductUniverseStory[]>;

export const PRODUCT_UNIVERSE_SUPPORTING_STORIES = ${JSON.stringify(supportingRecordsByProduct, null, 2)} as const satisfies Record<string, readonly Omit<ProductUniverseStory, "order" | "layout" | "animation">[]>;

export function getProductUniverseStories(slug: string) {
  return PRODUCT_UNIVERSE_STORIES[slug as keyof typeof PRODUCT_UNIVERSE_STORIES] ?? [];
}

export function getProductUniverseSupportingStories(slug: string) {
  return PRODUCT_UNIVERSE_SUPPORTING_STORIES[slug as keyof typeof PRODUCT_UNIVERSE_SUPPORTING_STORIES] ?? [];
}
`;

await writeFile(modulePath, generatedModule, "utf8");
await writeFile(path.join(publicRoot, "editorial-manifest.json"), `${JSON.stringify(recordsByProduct, null, 2)}\n`, "utf8");

console.log(JSON.stringify({ products: productDirectories.length, stories: Object.values(recordsByProduct).flat().length, output: publicRoot }, null, 2));
