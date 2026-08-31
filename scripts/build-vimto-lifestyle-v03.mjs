import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");

const background = path.join(
  projectRoot,
  "3D",
  "VIMTO",
  "Vimto_Sparkling_Product_Page_Pack",
  "Vimto_Sparkling_Product_Page_Pack",
  "assets",
  "lifestyle",
  "vimto-editorial-lifestyle-background-v03.png",
);
const packshot = path.join(
  projectRoot,
  "public",
  "media",
  "mpm",
  "universes",
  "vimto-sparkling",
  "vimto-can-cutout-approved-v002.png",
);
const outputBase = path.join(
  projectRoot,
  "public",
  "media",
  "mpm",
  "universes",
  "vimto-sparkling",
  "vimto-editorial-lifestyle-v03",
);

const width = 2560;
const height = 1440;
const canHeight = 650;
const canTop = 700;

const can = await sharp(packshot)
  .resize({ height: canHeight, fit: "inside", withoutEnlargement: false })
  .modulate({ brightness: 0.98, saturation: 1.04 })
  .png()
  .toBuffer();
const { width: canWidth } = await sharp(can).metadata();
if (!canWidth) throw new Error("Impossible de déterminer la largeur de la canette Vimto.");

const canLeft = Math.round((width - canWidth) / 2);
const shadowWidth = Math.round(canWidth * 1.2);
const shadowHeight = 62;
const shadowLeft = Math.round(canLeft + (canWidth - shadowWidth) / 2 + 24);
const shadowTop = canTop + canHeight - 36;
const shadow = Buffer.from(`
  <svg width="${shadowWidth}" height="${shadowHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="blur" x="-50%" y="-150%" width="200%" height="400%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
    <ellipse cx="${Math.round(shadowWidth / 2)}" cy="${Math.round(shadowHeight / 2)}" rx="${Math.round(shadowWidth * 0.37)}" ry="13" fill="#3a160d" opacity="0.34" filter="url(#blur)" />
  </svg>
`);

const master = sharp(background)
  .resize(width, height, { fit: "cover", kernel: sharp.kernel.lanczos3 })
  .composite([
    { input: shadow, left: shadowLeft, top: shadowTop },
    { input: can, left: canLeft, top: canTop },
  ]);

await master.png({ compressionLevel: 9 }).toFile(`${outputBase}.png`);
await master.webp({ quality: 92, effort: 6 }).toFile(`${outputBase}.webp`);
await master.avif({ quality: 60, effort: 8 }).toFile(`${outputBase}.avif`);

console.log(`Lifestyle Vimto v03 créé : ${path.relative(projectRoot, outputBase)}`);
