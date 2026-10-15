import { access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const products = [
  "tropicoul-ananas",
  "tropicoul-goyave",
  "tropicoul-cocktail",
  "tropicoul-tamarin",
  "triplex",
];

async function metadata(relativePath) {
  return sharp(path.join(root, "public", relativePath)).metadata();
}

for (const product of products) {
  const file = `media/mpm/products/${product}/packshot.webp`;
  const image = await metadata(file);
  if (!image.hasAlpha || image.width < 800 || image.height < 1400) {
    throw new Error(`${product}: détourage trop petit ou non transparent (${image.width}×${image.height}).`);
  }
}

const orange = await metadata("media/mpm/products/tropicoul-orange/packshot-v02.webp");
if (!orange.hasAlpha || orange.width < 900 || orange.height < 1500) {
  throw new Error("Tropicoul Orange : le packshot haute définition manque.");
}

const mangueMaster = await metadata("media/mpm/products/tropicoul-mangue/focus-master-v02.webp");
const mangueMask = await metadata("media/mpm/products/tropicoul-mangue/packshot.webp");
if (mangueMaster.width < 2000 || mangueMaster.height < 2000 || !mangueMask.hasAlpha) {
  throw new Error("Tropicoul Mangue : le master haute définition ou son masque manque.");
}

await access(path.join(root, "public", "favicon.ico"));
console.log("Packshots de fiche produit et favicon : dimensions, transparence et fichiers vérifiés.");
