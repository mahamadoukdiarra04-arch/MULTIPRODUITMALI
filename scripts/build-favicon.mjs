import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const png = await readFile(path.join(root, "public", "favicon-32x32.png"));
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); // ICO type
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6);
header.writeUInt8(32, 7);
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(header.length, 18);
const destination = path.join(root, "public", "favicon.ico");
await writeFile(destination, Buffer.concat([header, png]));
console.log(destination);
