import path from "node:path";

import sharp from "sharp";

const [sourceDir, outputFile] = process.argv.slice(2);
if (!sourceDir || !outputFile) {
  throw new Error("Usage: node scripts/create-qa-contact-sheet.mjs <source-dir> <output-file>");
}

const views = ["front", "left", "back", "right"];
const tileSize = 512;
const labelHeight = 52;
const checker = Buffer.from(`
  <svg width="${tileSize}" height="${tileSize}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="checker" width="32" height="32" patternUnits="userSpaceOnUse">
        <rect width="32" height="32" fill="#f4f4f2"/>
        <rect width="16" height="16" fill="#ddddda"/>
        <rect x="16" y="16" width="16" height="16" fill="#ddddda"/>
      </pattern>
    </defs>
    <rect width="${tileSize}" height="${tileSize}" fill="url(#checker)"/>
  </svg>
`);

const tiles = [];
for (const view of views) {
  const source = path.join(sourceDir, `${view}.png`);
  const stats = await sharp(source).stats();
  const alpha = stats.channels[3];
  console.log(`${view}: alpha ${alpha?.min ?? "absent"}-${alpha?.max ?? "absent"}`);

  const resizedSource = await sharp(source)
    .resize(tileSize, tileSize, { fit: "fill", kernel: sharp.kernel.lanczos3 })
    .png()
    .toBuffer();
  const body = await sharp(checker)
    .composite([{ input: resizedSource }])
    .png()
    .toBuffer();
  const label = Buffer.from(`
    <svg width="${tileSize}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${tileSize}" height="${labelHeight}" fill="#171816"/>
      <text x="256" y="34" text-anchor="middle" fill="white" font-size="22" font-family="Arial" font-weight="700">${view.toUpperCase()}</text>
    </svg>
  `);
  tiles.push(
    await sharp({
      create: {
        width: tileSize,
        height: tileSize + labelHeight,
        channels: 4,
        background: "#171816",
      },
    })
      .composite([
        { input: label, left: 0, top: 0 },
        { input: body, left: 0, top: labelHeight },
      ])
      .png()
      .toBuffer(),
  );
}

await sharp({
  create: {
    width: tileSize * 2,
    height: (tileSize + labelHeight) * 2,
    channels: 4,
    background: "#171816",
  },
})
  .composite(
    tiles.map((input, index) => ({
      input,
      left: (index % 2) * tileSize,
      top: Math.floor(index / 2) * (tileSize + labelHeight),
    })),
  )
  .png()
  .toFile(outputFile);

console.log(path.resolve(outputFile));
