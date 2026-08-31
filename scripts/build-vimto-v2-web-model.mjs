import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, simplify, weld } from "@gltf-transform/functions";
import validator from "gltf-validator";
import { MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(
  rootDir,
  "3D",
  "VIMTO",
  "Vimto_Sparkling_Product_Page_Pack",
  "Vimto_Sparkling_Product_Page_Pack",
  "assets",
  "product",
  "vimto-330ml-premium-v002.glb",
);
const outputPath = path.join(rootDir, "public", "models", "mpm", "vimto-sparkling-v2.glb");
const manifestPath = path.join(rootDir, "public", "models", "mpm", "manifest.json");
const TARGET_BYTES = 3.5 * 1024 * 1024;
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_TRIANGLES = 33_000;
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
    scene.listChildren().map((node) => ({ name: node.getName(), rotation: node.getRotation() })),
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
      if (rootNode.getMesh()) throw new Error("La racine Vimto porte directement un mesh et ne peut pas etre normalisee.");

      for (const child of rootNode.listChildren()) {
        child.setRotation(multiplyQuaternions(rotation, child.getRotation()));
        child.setTranslation(rotateVector(rotation, child.getTranslation()));
      }
      rootNode.setRotation([0, 0, 0, 1]);
    }
  }
}

function correctFrontYaw(document) {
  const frontYawDegrees = 30;
  const radians = (frontYawDegrees * Math.PI) / 180;
  const frontYaw = [0, Math.sin(radians / 2), 0, Math.cos(radians / 2)];
  for (const scene of document.getRoot().listScenes()) {
    for (const rootNode of scene.listChildren()) {
      if (rootNode.getMesh()) throw new Error("La racine Vimto porte directement un mesh et ne peut pas etre orientee.");
      for (const child of rootNode.listChildren()) {
        child.setRotation(multiplyQuaternions(frontYaw, child.getRotation()));
        child.setTranslation(rotateVector(frontYaw, child.getTranslation()));
      }
    }
  }
}

function textureRoles(document) {
  const roles = new Map();
  const add = (texture, role) => {
    if (!texture) return;
    const current = roles.get(texture) ?? new Set();
    current.add(role);
    roles.set(texture, current);
  };
  for (const material of document.getRoot().listMaterials()) {
    add(material.getBaseColorTexture(), "baseColor");
    add(material.getEmissiveTexture(), "emissive");
    add(material.getNormalTexture(), "normal");
    add(material.getMetallicRoughnessTexture(), "orm");
    add(material.getOcclusionTexture(), "orm");
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
    const width = isColor ? 4096 : 2048;
    const height = isColor ? 2048 : 1024;
    const output = await sharp(image)
      .resize(width, height, { fit: "fill", kernel: sharp.kernel.lanczos3 })
      .jpeg({ quality: isColor ? 95 : 92, chromaSubsampling: isColor ? "4:4:4" : "4:2:0", mozjpeg: true })
      .toBuffer();
    texture.setImage(output);
    texture.setMimeType("image/jpeg");
    texture.setURI("");
    details.push({ roles: assignedRoles.sort(), width, height, bytes: output.byteLength });
  }
  return details;
}

const sourceBuffer = await readFile(sourcePath);
const document = await io.readBinary(new Uint8Array(sourceBuffer));
const beforeTriangles = triangleCount(document);
const beforeRoots = rootRotations(document);
bakeRootRotation(document);
correctFrontYaw(document);

await MeshoptSimplifier.ready;
await document.transform(
  dedup(),
  weld({ tolerance: 0.00001 }),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.92, error: 0.0001, lockBorder: true }),
  prune(),
);
const textures = await resizeTextures(document);
await io.write(outputPath, document);

const outputBuffer = await readFile(outputPath);
const validation = await validator.validateBytes(new Uint8Array(outputBuffer), {
  uri: "vimto-sparkling-v2.glb",
  maxIssues: 200,
});
const afterTriangles = triangleCount(document);
const afterRoots = rootRotations(document);

if (outputBuffer.byteLength > MAX_BYTES) throw new Error(`GLB Vimto V2 trop lourd: ${outputBuffer.byteLength} octets.`);
if (afterTriangles > MAX_TRIANGLES) throw new Error(`GLB Vimto V2 trop dense: ${afterTriangles} triangles.`);
if (validation.issues.numErrors || validation.issues.numWarnings) {
  throw new Error(`Validation Khronos: ${validation.issues.numErrors} erreur(s), ${validation.issues.numWarnings} avertissement(s).`);
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const entry = {
  id: "vimto",
  source: {
    path: path.relative(rootDir, sourcePath).replaceAll("\\", "/"),
    bytes: sourceBuffer.byteLength,
    sha256: sha256(sourceBuffer),
    triangles: beforeTriangles,
    rootRotations: beforeRoots,
    immutable: true,
  },
  web: {
    path: "/models/mpm/vimto-sparkling-v2.glb",
    bytes: outputBuffer.byteLength,
    mib: Number((outputBuffer.byteLength / 1024 / 1024).toFixed(3)),
    withinTarget: outputBuffer.byteLength <= TARGET_BYTES,
    sha256: sha256(outputBuffer),
    triangles: afterTriangles,
    rootRotations: afterRoots,
    frontYawDegrees: 0,
    sourceFrontCorrectionDegrees: 30,
    textures,
    validation: {
      errors: validation.issues.numErrors,
      warnings: validation.issues.numWarnings,
      infos: validation.issues.numInfos,
      hints: validation.issues.numHints,
    },
  },
};
manifest.generatedAt = new Date().toISOString();
manifest.products = [...manifest.products.filter((product) => product.id !== "vimto"), entry];
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  sourceBytes: sourceBuffer.byteLength,
  webBytes: outputBuffer.byteLength,
  webMiB: entry.web.mib,
  sourceTriangles: beforeTriangles,
  webTriangles: afterTriangles,
  rootRotation: afterRoots,
  validation: entry.web.validation,
  sha256: entry.web.sha256,
}, null, 2));
