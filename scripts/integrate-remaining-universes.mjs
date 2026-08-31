import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const workspace = String.raw`C:\Users\B.T.M\Desktop\EKAM Capital\SIMPARA DISTRIBUTION`;
const publicRoot = path.join(workspace, "public", "media", "mpm", "universes");
const manifestPath = path.join(publicRoot, "integration-manifest.json");

const sourceRoots = {
  part1: path.join(
    workspace,
    "3D",
    "Assets",
    "Autres_Saveurs_Assets_Complet_Partie_1",
    "autres-saveurs-assets",
  ),
  part2: path.join(
    workspace,
    "3D",
    "Assets",
    "Autres_Saveurs_Assets_Complet_Partie_2",
    "autres-saveurs-assets",
  ),
};

const backgroundAssets = (prefix) => [
  { id: `${prefix}-background-hero-desktop-v01`, role: "background", depth: "back", usage: ["hero-desktop"] },
  { id: `${prefix}-background-hero-mobile-v01`, role: "background", depth: "back", usage: ["hero-mobile"] },
  { id: `${prefix}-background-product-desktop-v01`, role: "background", depth: "back", usage: ["product-desktop"] },
  { id: `${prefix}-background-product-mobile-v01`, role: "background", depth: "back", usage: ["product-mobile"] },
  { id: `${prefix}-lifestyle-mid-v01`, role: "lifestyle", depth: "mid", usage: ["product-support"] },
];

const products = [
  {
    sourceRoot: sourceRoots.part1,
    sourceProduct: "tropicoul-ananas",
    publicProduct: "tropicoul-ananas",
    assets: [
      ...backgroundAssets("ananas"),
      { id: "ananas-atmosphere-back-v01", role: "atmosphere", depth: "back", usage: ["hero", "product"] },
      { id: "ananas-splash-mid-v01", role: "splash", depth: "mid", usage: ["hero", "product"] },
      { id: "ananas-pieces-set-mid-v01", role: "fruit", depth: "mid", usage: ["hero", "product"] },
      { id: "ananas-fruit-cluster-mid-v01", role: "fruit", depth: "front", usage: ["hero", "product"] },
      { id: "ananas-particle-front-v01", role: "particle", depth: "atmosphere", usage: ["hero", "product"] },
    ],
  },
  {
    sourceRoot: sourceRoots.part1,
    sourceProduct: "tropicoul-mangue",
    publicProduct: "tropicoul-mangue",
    assets: [
      ...backgroundAssets("mangue"),
      { id: "mangue-atmosphere-back-v01", role: "atmosphere", depth: "back", usage: ["hero", "product"] },
      { id: "mangue-branch-background-back-v01", role: "leaf", depth: "back", usage: ["hero", "product"] },
      { id: "mangue-nectar-ribbon-mid-v01", role: "splash", depth: "mid", usage: ["hero", "product"] },
      { id: "mangue-fruit-cluster-mid-v01", role: "fruit", depth: "mid", usage: ["hero", "product"] },
      { id: "mangue-particle-front-v01", role: "particle", depth: "atmosphere", usage: ["hero", "product"] },
    ],
  },
  {
    sourceRoot: sourceRoots.part1,
    sourceProduct: "tropicoul-orange",
    publicProduct: "tropicoul-orange",
    assets: [
      ...backgroundAssets("orange"),
      { id: "orange-atmosphere-back-v01", role: "atmosphere", depth: "back", usage: ["hero", "product"] },
      { id: "orange-botanical-background-back-v01", role: "leaf", depth: "back", usage: ["hero", "product"] },
      { id: "orange-splash-mid-v01", role: "splash", depth: "mid", usage: ["hero", "product"] },
      { id: "orange-rings-set-mid-v01", role: "fruit", depth: "mid", usage: ["hero", "product"] },
      { id: "orange-particle-front-v01", role: "particle", depth: "atmosphere", usage: ["hero", "product"] },
    ],
  },
  {
    sourceRoot: sourceRoots.part2,
    sourceProduct: "tropicoul-cocktail",
    publicProduct: "tropicoul-cocktail",
    assets: [
      ...backgroundAssets("cocktail"),
      { id: "cocktail-atmosphere-back-v01", role: "atmosphere", depth: "back", usage: ["hero", "product"] },
      { id: "cocktail-ribbon-back-v01", role: "splash", depth: "back", usage: ["hero", "product"] },
      { id: "cocktail-fruit-cluster-mid-v01", role: "fruit", depth: "mid", usage: ["hero", "product"] },
      { id: "cocktail-splash-mid-v01", role: "splash", depth: "mid", usage: ["hero", "product"] },
      { id: "cocktail-particle-front-v01", role: "particle", depth: "atmosphere", usage: ["hero", "product"] },
    ],
  },
  {
    sourceRoot: sourceRoots.part2,
    sourceProduct: "tropicoul-tamarin",
    publicProduct: "tropicoul-tamarin",
    assets: [
      ...backgroundAssets("tamarin"),
      { id: "tamarin-atmosphere-back-v01", role: "atmosphere", depth: "back", usage: ["hero", "product"] },
      { id: "tamarin-amber-ribbon-mid-v01", role: "splash", depth: "mid", usage: ["hero", "product"] },
      { id: "tamarin-leaf-branch-mid-v01", role: "leaf", depth: "back", usage: ["hero", "product"] },
      { id: "tamarin-open-pod-mid-v01", role: "fruit", depth: "mid", usage: ["hero", "product"] },
      { id: "tamarin-particle-front-v01", role: "particle", depth: "atmosphere", usage: ["hero", "product"] },
    ],
  },
];

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

const existingManifest = JSON.parse(await readFile(manifestPath, "utf8"));
const replacedProducts = new Set(products.map(({ publicProduct }) => publicProduct));
const retainedAssets = existingManifest.assets.filter(({ product }) => !replacedProducts.has(product));
const importedAssets = [];

for (const product of products) {
  const qaManifestPath = path.join(product.sourceRoot, product.sourceProduct, "qa", "manifest.json");
  const qaManifest = JSON.parse(await readFile(qaManifestPath, "utf8"));
  const destinationDirectory = path.join(publicRoot, product.publicProduct);
  await mkdir(destinationDirectory, { recursive: true });

  for (const asset of product.assets) {
    const variants = {};

    for (const format of ["avif", "webp"]) {
      const fileName = `${asset.id}.${format}`;
      const source = path.join(product.sourceRoot, product.sourceProduct, "web", fileName);
      const destination = path.join(destinationDirectory, fileName);
      const record = qaManifest.records.find(({ output, format: recordFormat }) => (
        path.basename(output) === fileName && recordFormat === format
      ));

      if (!record) throw new Error(`Missing QA record for ${source}`);

      const sourceBuffer = await readFile(source);
      const sourceHash = sha256(sourceBuffer);
      if (sourceHash !== record.sha256) throw new Error(`SHA-256 mismatch for ${source}`);

      await copyFile(source, destination);
      const destinationBuffer = await readFile(destination);
      const destinationHash = sha256(destinationBuffer);
      if (destinationHash !== sourceHash) throw new Error(`Copy verification failed for ${destination}`);

      const fileStat = await stat(destination);
      variants[format] = {
        source,
        destination: `/media/mpm/universes/${product.publicProduct}/${fileName}`,
        format,
        bytes: fileStat.size,
        width: record.width,
        height: record.height,
        sha256: destinationHash,
      };
    }

    importedAssets.push({
      product: product.publicProduct,
      sourceProduct: product.sourceProduct,
      id: asset.id,
      role: asset.role,
      depth: asset.depth,
      usage: asset.usage,
      variants,
    });
  }
}

const manifest = {
  ...existingManifest,
  schemaVersion: 2,
  sourcePolicy: "Immutable validated web exports only; masters, sources and qa are never copied or modified.",
  sourceRoots: [
    path.join(workspace, "3D", "Assets", "Pilotes_Goyave_Triplex_Assets_Complet", "pilot-assets"),
    sourceRoots.part1,
    sourceRoots.part2,
  ],
  assets: [...retainedAssets, ...importedAssets],
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const addedBytes = importedAssets.reduce((total, asset) => (
  total + Object.values(asset.variants).reduce((sum, variant) => sum + variant.bytes, 0)
), 0);

console.log(JSON.stringify({
  products: products.length,
  assets: importedAssets.length,
  files: importedAssets.length * 2,
  addedBytes,
  manifest: manifestPath,
}, null, 2));
