const stubUrl = new URL("./cloudflare-workers-local-stub.mjs", import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") {
    return { url: stubUrl, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
