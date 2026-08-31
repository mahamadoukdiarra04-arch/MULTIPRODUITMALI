import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, simplify, weld } from "@gltf-transform/functions";
import validator from "gltf-validator";
import { MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const masterDir = path.join(rootDir, "3D", "Collection_Canettes_330ml_GLBS_Premium");
const outputDir = path.join(rootDir, "public", "models", "mpm");
const manifestPath = path.join(outputDir, "manifest.json");

const products = [
  { id: "tropicoul-ananas", source: "Tropicoul_Pineapple_330ml_Premium.glb", output: "tropicoul-ananas.glb" },
  { id: "tropicoul-orange", source: "Tropicoul_Orange_330ml_Premium.glb", output: "tropicoul-orange.glb" },
  { id: "tropicoul-mangue", source: "Tropicoul_Mango_330ml_Premium.glb", output: "tropicoul-mangue.glb" },
  { id: "tropicoul-goyave", source: "../GOYAVE/Tropicoul_Guava_330ml_Premium.glb", output: "tropicoul-goyave.glb", normaliseRoot: true },
  { id: "tropicoul-cocktail", source: "Tropicoul_Cocktail_330ml_Premium.glb", output: "tropicoul-cocktail.glb" },
  { id: "tropicoul-tamarin", source: "Tropicoul_Tamarind_330ml_Premium.glb", output: "tropicoul-tamarin.glb" },
  { id: "triplex", source: "Triplex_Energy_Drink_330ml_Premium.glb", output: "triplex-energy-drink.glb" },
  { id: "vimto", source: "Vimto_330ml_Premium.glb", output: "vimto.glb", normaliseRoot: true, frontYawDegrees: 30 },
];

const TARGET_BYTES = 2.5 * 1024 * 1024;
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_TRIANGLES = 35_000;
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

function rootRotations(document) {
  return document.getRoot().listScenes().flatMap((scene) =>
    scene.listChildren().map((node) => ({
      name: node.getName(),
      rotation: node.getRotation().map((value) => Number(value.toFixed(8))),
    })),
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
      if (rootNode.getMesh()) throw new Error(`${rootNode.getName()}: impossible de normaliser une racine portant directement un mesh.`);

      for (const child of rootNode.listChildren()) {
        child.setRotation(multiplyQuaternions(rotation, child.getRotation()));
        child.setTranslation(rotateVector(rotation, child.getTranslation()));
      }
      rootNode.setRotation([0, 0, 0, 1]);
    }
  }
}

function bakeFrontYaw(document, degrees) {
  if (!degrees) return;
  const radians = (degrees * Math.PI) / 180;
  const yaw = [0, Math.sin(radians / 2), 0, Math.cos(radians / 2)];

  for (const scene of document.getRoot().listScenes()) {
    for (const rootNode of scene.listChildren()) {
      if (rootNode.getMesh()) throw new Error(`${rootNode.getName()}: impossible de corriger le front sur une racine portant directement un mesh.`);
      for (const child of rootNode.listChildren()) {
        child.setRotation(multiplyQuaternions(yaw, child.getRotation()));
        child.setTranslation(rotateVector(yaw, child.getTranslation()));
      }
    }
  }
}

function textureRoles(document) {
  const roles = new Map();
  const add = (texture, role) => {
    if (!texture) return;
    const existing = roles.get(texture) ?? new Set();
    existing.add(role);
    roles.set(texture, existing);
  };

  for (const material of document.getRoot().listMaterials()) {
    add(material.getBaseColorTexture(), "baseColor");
    add(material.getNormalTexture(), "normal");
    add(material.getMetallicRoughnessTexture(), "orm");
    add(material.getOcclusionTexture(), "orm");
    add(material.getEmissiveTexture(), "emissive");
  }
  return roles;
}

async function resizeTextures(document) {
  const roles = textureRoles(document);
  const details = [];

  for (const texture of document.getRoot().listTextures()) {
    const image = texture.getImage();
    if (!image) continue;

    const assignedRoles = [...(roles.get(texture) ?? new Set(["auxiliary"]))];
    const isColor = assignedRoles.includes("baseColor") || assignedRoles.includes("emissive");
    const width = isColor ? 2048 : 1024;
    const height = isColor ? 1024 : 512;
    const quality = isColor ? 91 : 88;
    const output = await sharp(image)
      .resize(width, height, { fit: "fill", kernel: sharp.kernel.lanczos3 })
      .jpeg({ quality, chromaSubsampling: isColor ? "4:4:4" : "4:2:0", mozjpeg: true })
      .toBuffer();

    texture.setImage(output);
    texture.setMimeType("image/jpeg");
    texture.setURI("");
    details.push({ roles: assignedRoles.sort(), width, height, bytes: output.byteLength });
  }

  return details;
}

async function buildProduct(product) {
  const sourcePath = path.join(masterDir, product.source);
  const outputPath = path.join(outputDir, product.output);
  const sourceBuffer = await readFile(sourcePath);
  const document = await io.readBinary(new Uint8Array(sourceBuffer));
  const beforeTriangles = triangleCount(document);
  const beforeRoots = rootRotations(document);

  if (product.normaliseRoot) bakeRootRotation(document);
  bakeFrontYaw(document, product.frontYawDegrees ?? 0);

  await document.transform(
    dedup(),
    weld({ tolerance: 0.00001 }),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.84, error: 0.0001, lockBorder: true }),
    prune(),
  );
  const textures = await resizeTextures(document);
  await io.write(outputPath, document);

  const outputBuffer = await readFile(outputPath);
  const validation = await validator.validateBytes(new Uint8Array(outputBuffer), {
    uri: product.output,
    maxIssues: 200,
  });
  const afterTriangles = triangleCount(document);
  const afterRoots = rootRotations(document);

  if (outputBuffer.byteLength > MAX_BYTES) {
    throw new Error(`${product.output} depasse le plafond de 3 Mio (${outputBuffer.byteLength} octets).`);
  }
  if (afterTriangles > MAX_TRIANGLES) {
    throw new Error(`${product.output} depasse 35 000 triangles (${afterTriangles}).`);
  }
  if (validation.issues.numErrors > 0 || validation.issues.numWarnings > 0) {
    throw new Error(`${product.output} echoue Khronos: ${validation.issues.numErrors} erreur(s), ${validation.issues.numWarnings} avertissement(s).`);
  }

  return {
    id: product.id,
    source: {
      path: path.relative(rootDir, sourcePath).replaceAll("\\", "/"),
      bytes: sourceBuffer.byteLength,
      sha256: sha256(sourceBuffer),
      triangles: beforeTriangles,
      rootRotations: beforeRoots,
    },
    web: {
      path: `/${path.relative(path.join(rootDir, "public"), outputPath).replaceAll("\\", "/")}`,
      bytes: outputBuffer.byteLength,
      mib: Number((outputBuffer.byteLength / 1024 / 1024).toFixed(3)),
      withinTarget: outputBuffer.byteLength <= TARGET_BYTES,
      sha256: sha256(outputBuffer),
      triangles: afterTriangles,
      rootRotations: afterRoots,
      frontYawDegrees: product.frontYawDegrees ?? 0,
      textures,
      validation: {
        errors: validation.issues.numErrors,
        warnings: validation.issues.numWarnings,
        infos: validation.issues.numInfos,
        hints: validation.issues.numHints,
      },
    },
  };
}

await mkdir(outputDir, { recursive: true });
await MeshoptSimplifier.ready;

const entries = [];
for (const product of products) {
  const entry = await buildProduct(product);
  entries.push(entry);
  console.log(`${product.id}: ${(entry.source.bytes / 1024 / 1024).toFixed(2)} -> ${entry.web.mib.toFixed(2)} Mio, ${entry.web.triangles} triangles`);
}

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  policy: {
    targetBytes: TARGET_BYTES,
    maximumBytes: MAX_BYTES,
    maximumTriangles: MAX_TRIANGLES,
    compressionExtensions: [],
    sourceMastersModified: false,
  },
  products: entries,
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Manifest: ${path.relative(rootDir, manifestPath)}`);
