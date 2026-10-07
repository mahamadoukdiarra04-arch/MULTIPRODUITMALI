import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, weld } from "@gltf-transform/functions";
import validator from "gltf-validator";
import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const masterDir = path.join(rootDir, "3D", "Collection_Canettes_330ml_GLBS_Premium");
const outputDir = path.join(rootDir, "public", "models", "mpm");
const manifestPath = path.join(outputDir, "hq-manifest.json");

const labelSources = {
  "tropicoul-ananas": path.join("3D", "ANANAS", "Tropicoul_Pineapple_360_Reconstructed_Pack", "Tropicoul_Pineapple_360_BaseColor_4096x2048.png"),
  "tropicoul-cocktail": path.join("3D", "Tropicoul_Flat_360_5_References_Complet", "Tropicoul_Cocktail_Flat_360", "Tropicoul_Cocktail_360_BaseColor_4096x2048.png"),
  "tropicoul-goyave": path.join("3D", "Vimto_Guava_Flat_360_Complet_8K_TIFF", "Vimto_Guava_Flat_360_Pack", "Tropicoul_Guava_Flat_360", "Tropicoul_Guava_360_BaseColor_4096x2048.png"),
  "tropicoul-mangue": path.join("3D", "Tropicoul_Flat_360_5_References_Complet", "Tropicoul_Mango_Flat_360", "Tropicoul_Mango_360_BaseColor_4096x2048.png"),
  "tropicoul-orange": path.join("3D", "Tropicoul_Flat_360_5_References_Complet", "Tropicoul_Orange_Flat_360", "Tropicoul_Orange_360_BaseColor_4096x2048.png"),
  "tropicoul-tamarin": path.join("3D", "Tropicoul_Flat_360_5_References_Complet", "Tropicoul_Tamarind_Flat_360", "Tropicoul_Tamarind_360_BaseColor_4096x2048.png"),
  triplex: path.join("3D", "Tropicoul_Flat_360_5_References_Complet", "Triplex_Flat_360", "Triplex_360_BaseColor_4096x2048.png"),
  vimto: path.join("3D", "Vimto_Guava_Flat_360_Complet_8K_TIFF", "Vimto_Guava_Flat_360_Pack", "Vimto_Flat_360", "Vimto_360_BaseColor_4096x2048.png"),
};

const products = [
  { id: "tropicoul-ananas", source: "Tropicoul_Pineapple_330ml_Premium.glb", output: "tropicoul-ananas-hq.glb" },
  { id: "tropicoul-orange", source: "Tropicoul_Orange_330ml_Premium.glb", output: "tropicoul-orange-hq.glb" },
  { id: "tropicoul-mangue", source: "Tropicoul_Mango_330ml_Premium.glb", output: "tropicoul-mangue-hq.glb" },
  {
    id: "tropicoul-goyave",
    source: path.join("..", "GOYAVE", "Tropicoul_Guava_330ml_Premium.glb"),
    output: "tropicoul-goyave-hq.glb",
    normaliseRoot: true,
  },
  { id: "tropicoul-cocktail", source: "Tropicoul_Cocktail_330ml_Premium.glb", output: "tropicoul-cocktail-hq.glb" },
  { id: "tropicoul-tamarin", source: "Tropicoul_Tamarind_330ml_Premium.glb", output: "tropicoul-tamarin-hq.glb" },
  { id: "triplex", source: "Triplex_Energy_Drink_330ml_Premium.glb", output: "triplex-energy-drink-hq.glb" },
  {
    id: "vimto",
    absoluteSource: path.join(
      rootDir,
      "3D",
      "VIMTO",
      "Vimto_Sparkling_Product_Page_Pack",
      "Vimto_Sparkling_Product_Page_Pack",
      "assets",
      "product",
      "vimto-330ml-premium-v002.glb",
    ),
    output: "vimto-sparkling-v2-hq.glb",
    normaliseRoot: true,
    frontYawDegrees: 30,
  },
];

const MAX_BYTES = 7 * 1024 * 1024;
const MAX_TRIANGLES = 45_000;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function triangleCount(document) {
  return document.getRoot().listMeshes().reduce(
    (total, mesh) => total + mesh.listPrimitives().reduce((meshTotal, primitive) => {
      const accessor = primitive.getIndices() ?? primitive.getAttribute("POSITION");
      return meshTotal + (accessor ? accessor.getCount() / 3 : 0);
    }, 0),
    0,
  );
}

function multiplyQuaternions(a, b) {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

function rotateVector(quaternion, vector) {
  const vectorQuaternion = [vector[0], vector[1], vector[2], 0];
  const inverse = [-quaternion[0], -quaternion[1], -quaternion[2], quaternion[3]];
  return multiplyQuaternions(multiplyQuaternions(quaternion, vectorQuaternion), inverse).slice(0, 3);
}

function bakeRootRotation(document) {
  for (const scene of document.getRoot().listScenes()) {
    for (const rootNode of scene.listChildren()) {
      const rotation = rootNode.getRotation();
      const hasRotation = rotation.some((value, index) => Math.abs(value - [0, 0, 0, 1][index]) > 1e-8);
      if (!hasRotation) continue;
      if (rootNode.getMesh()) throw new Error(`${rootNode.getName()}: racine non normalisable.`);

      for (const child of rootNode.listChildren()) {
        child.setRotation(multiplyQuaternions(rotation, child.getRotation()));
        child.setTranslation(rotateVector(rotation, child.getTranslation()));
      }
      rootNode.setRotation([0, 0, 0, 1]);
    }
  }
}

function bakeFrontYaw(document, degrees = 0) {
  if (!degrees) return;
  const radians = (degrees * Math.PI) / 180;
  const yaw = [0, Math.sin(radians / 2), 0, Math.cos(radians / 2)];

  for (const scene of document.getRoot().listScenes()) {
    for (const rootNode of scene.listChildren()) {
      if (rootNode.getMesh()) throw new Error(`${rootNode.getName()}: correction frontale impossible.`);
      for (const child of rootNode.listChildren()) {
        child.setRotation(multiplyQuaternions(yaw, child.getRotation()));
        child.setTranslation(rotateVector(yaw, child.getTranslation()));
      }
    }
  }
}

function textureDetails(document) {
  return document.getRoot().listTextures().map((texture) => {
    const size = texture.getSize();
    return {
      name: texture.getName(),
      mimeType: texture.getMimeType(),
      width: size?.[0] ?? null,
      height: size?.[1] ?? null,
      bytes: texture.getImage()?.byteLength ?? 0,
    };
  });
}

async function replaceBaseColor(document, labelPath) {
  const labelBuffer = await readFile(labelPath);
  const metadata = await sharp(labelBuffer).metadata();
  if (metadata.width !== 4096 || metadata.height !== 2048) {
    throw new Error(`${labelPath}: le developpe 360 doit mesurer 4096 x 2048 px.`);
  }
  // A 4:4:4 master keeps coloured letter edges and fine regulatory text much
  // cleaner than the chroma-subsampled JPEGs embedded in the source models.
  const optimized = await sharp(labelBuffer)
    .jpeg({ quality: 97, chromaSubsampling: "4:4:4", mozjpeg: true })
    .toBuffer();

  const textures = new Set();
  for (const material of document.getRoot().listMaterials()) {
    const texture = material.getBaseColorTexture();
    if (texture) textures.add(texture);
  }
  if (textures.size !== 1) {
    throw new Error(`${labelPath}: une texture Base Color unique etait attendue, ${textures.size} trouvee(s).`);
  }

  for (const texture of textures) {
    texture.setImage(optimized);
    texture.setMimeType("image/jpeg");
    texture.setURI("");
    texture.setName(`${path.basename(labelPath, path.extname(labelPath))} HQ`);
  }

  return {
    path: path.relative(rootDir, labelPath).replaceAll("\\", "/"),
    sourceBytes: labelBuffer.byteLength,
    embeddedBytes: optimized.byteLength,
    width: metadata.width,
    height: metadata.height,
    sha256: sha256(labelBuffer),
  };
}

function calibratePrintedMaterial(document) {
  let calibrated = 0;
  for (const material of document.getRoot().listMaterials()) {
    if (!/printed|lacquer|can body/i.test(material.getName())) continue;
    material.setMetallicFactor(0.02);
    material.setRoughnessFactor(0.48);
    material.setNormalScale(0.12);
    material.setEmissiveTexture(material.getBaseColorTexture());
    material.setEmissiveFactor([0.06, 0.06, 0.06]);
    const clearcoat = material.getExtension("KHR_materials_clearcoat");
    clearcoat?.setClearcoatFactor(0.1);
    clearcoat?.setClearcoatRoughnessFactor(0.48);
    calibrated += 1;
  }
  if (calibrated === 0) throw new Error("Aucun materiau imprime n'a ete trouve dans le GLB.");
}

async function buildProduct(product) {
  const sourcePath = product.absoluteSource ?? path.join(masterDir, product.source);
  const outputPath = path.join(outputDir, product.output);
  const sourceBuffer = await readFile(sourcePath);
  const document = await io.readBinary(new Uint8Array(sourceBuffer));
  const label = await replaceBaseColor(document, path.join(rootDir, labelSources[product.id]));
  calibratePrintedMaterial(document);

  if (product.normaliseRoot) bakeRootRotation(document);
  bakeFrontYaw(document, product.frontYawDegrees);

  // Preserve native 4K label textures and the full premium mesh. These files
  // are selected only on capable desktop devices; mobile keeps the compact
  // 2K models generated by build-web-models.mjs.
  await document.transform(
    dedup(),
    weld({ tolerance: 0.00001 }),
    prune(),
  );
  await io.write(outputPath, document);

  const outputBuffer = await readFile(outputPath);
  const validation = await validator.validateBytes(new Uint8Array(outputBuffer), {
    uri: product.output,
    maxIssues: 200,
  });
  const triangles = triangleCount(document);

  if (outputBuffer.byteLength > MAX_BYTES) throw new Error(`${product.output}: fichier superieur a 5.5 Mio.`);
  if (triangles > MAX_TRIANGLES) throw new Error(`${product.output}: maillage superieur a 45 000 triangles.`);
  if (validation.issues.numErrors || validation.issues.numWarnings) {
    throw new Error(`${product.output}: ${validation.issues.numErrors} erreur(s), ${validation.issues.numWarnings} avertissement(s) Khronos.`);
  }

  return {
    id: product.id,
    source: path.relative(rootDir, sourcePath).replaceAll("\\", "/"),
    label,
    path: `/models/mpm/${product.output}`,
    bytes: outputBuffer.byteLength,
    mib: Number((outputBuffer.byteLength / 1024 / 1024).toFixed(3)),
    sha256: sha256(outputBuffer),
    triangles,
    frontYawDegrees: product.frontYawDegrees ?? 0,
    textures: textureDetails(document),
    validation: {
      errors: validation.issues.numErrors,
      warnings: validation.issues.numWarnings,
      infos: validation.issues.numInfos,
      hints: validation.issues.numHints,
    },
  };
}

await mkdir(outputDir, { recursive: true });
const entries = [];
for (const product of products) {
  const entry = await buildProduct(product);
  entries.push(entry);
  console.log(`${entry.id}: ${entry.mib.toFixed(2)} Mio, ${entry.triangles} triangles`);
}

await writeFile(manifestPath, `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  policy: {
    maximumBytes: MAX_BYTES,
    maximumTriangles: MAX_TRIANGLES,
    nativeTexturesPreserved: true,
    compactMobileFallbacks: true,
  },
  products: entries,
}, null, 2)}\n`, "utf8");

console.log(`Manifest: ${path.relative(rootDir, manifestPath)}`);
