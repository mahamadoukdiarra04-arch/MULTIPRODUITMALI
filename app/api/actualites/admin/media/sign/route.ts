import { createHash } from "node:crypto";

import { getEditorialUser } from "../../../../../actualites/access";

const uploadFolder = "multiproduit-mali/editorial";

function signParameters(parameters: Record<string, string>, secret: string) {
  const serialized = Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(serialized + secret).digest("hex");
}

export async function POST() {
  if (!await getEditorialUser()) {
    return Response.json({ error: "Accès réservé à l’équipe éditoriale." }, { status: 403 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json({ error: "L’espace médias n’est pas encore configuré." }, { status: 503 });
  }

  const parameters = {
    folder: uploadFolder,
    timestamp: String(Math.floor(Date.now() / 1000)),
    unique_filename: "true",
    use_filename: "true",
  };

  return Response.json({
    cloudName,
    apiKey,
    parameters,
    signature: signParameters(parameters, apiSecret),
  });
}
