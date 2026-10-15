import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "3D", "Multiproduit_Product_Pages_Immersives", "Multiproduit_Product_Pages_Immersives", "references", "can-front", "tropicoul-mangue-front.png");
const destination = path.join(root, "public", "media", "mpm", "products", "tropicoul-mangue", "focus-master-v02.webp");

// Preserve the original high-resolution label; the CSS mask supplies only its silhouette.
await mkdir(path.dirname(destination), { recursive: true });
const sourceBytes = await readFile(source);
await writeFile(destination, await sharp(sourceBytes).webp({ quality: 92, effort: 6 }).toBuffer());
console.log(destination);
