import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Readable } from "node:stream";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const previewRoot = resolve(process.argv[2] ?? join(scriptDirectory, "..", "dist"));
const clientDirectory = join(previewRoot, "client");
const workerPath = join(previewRoot, "server", "index.js");
const backOfficePreviewPath = join(previewRoot, "back-office.html");
const port = Number(process.env.MULTIPRODUIT_PREVIEW_PORT ?? 4173);
const host = "127.0.0.1";

// The standalone preview has no authenticated user or Cloudflare bindings.
// Development mode intentionally exposes the existing read-only local preview.
process.env.NODE_ENV = "development";
process.env.MULTIPRODUIT_STANDALONE_PREVIEW = "1";

const mimeTypes = {
  ".avif": "image/avif", ".css": "text/css; charset=utf-8", ".glb": "model/gltf-binary",
  ".html": "text/html; charset=utf-8", ".ico": "image/x-icon", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".png": "image/png",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".woff": "font/woff", ".woff2": "font/woff2",
};

function localAssetPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const relative = normalize(decoded.replace(/^[/\\]+/, ""));
  const candidate = resolve(clientDirectory, relative);
  return candidate === clientDirectory || candidate.startsWith(`${clientDirectory}${sep}`) ? candidate : null;
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function assetResponse(request) {
  const url = new URL(request.url);
  const filePath = localAssetPath(url.pathname);
  if (!filePath || !(await isFile(filePath))) return new Response("Not found", { status: 404 });
  const extension = extname(filePath).toLowerCase();
  const headers = new Headers({
    "content-type": mimeTypes[extension] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  if (request.method === "HEAD") return new Response(null, { headers });
  return new Response(Readable.toWeb(createReadStream(filePath)), { headers });
}

async function standaloneHtmlResponse(path) {
  if (!(await isFile(path))) return null;
  return new Response(Readable.toWeb(createReadStream(path)), {
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

await access(clientDirectory);
await access(workerPath);
const workerModule = await import(pathToFileURL(workerPath).href);
const worker = workerModule.default;

const assets = { fetch: assetResponse };
const server = createServer(async (request, response) => {
  try {
    const origin = `http://${host}:${port}`;
    const url = new URL(request.url ?? "/", origin);
    const staticCandidate = localAssetPath(url.pathname);
    const staticExists = staticCandidate ? await isFile(staticCandidate) : false;

    let result;
    if (url.pathname === "/actualites/back-office") {
      result = await standaloneHtmlResponse(backOfficePreviewPath);
      if (!result) result = await worker.fetch(new Request(url, { method: request.method, headers: request.headers }), { ASSETS: assets });
    } else if (staticExists) {
      result = await assetResponse(new Request(url, { method: request.method, headers: request.headers }));
    } else {
      const body = request.method === "GET" || request.method === "HEAD" ? undefined : request;
      const appRequest = new Request(url, {
        method: request.method,
        headers: request.headers,
        body,
        duplex: body ? "half" : undefined,
      });
      result = await worker.fetch(appRequest, { ASSETS: assets });
    }

    response.statusCode = result.status;
    result.headers.forEach((value, name) => response.setHeader(name, value));
    if (!result.body || request.method === "HEAD") {
      response.end();
      return;
    }
    Readable.fromWeb(result.body).pipe(response);
  } catch (error) {
    console.error(error);
    response.statusCode = 500;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end("Le serveur local n’a pas pu démarrer cette page.");
  }
});

server.listen(port, host, () => {
  console.log(`Aperçu Multiproduit Mali disponible sur http://${host}:${port}`);
});
