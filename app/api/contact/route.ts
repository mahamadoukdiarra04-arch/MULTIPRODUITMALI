import {
  deliverContactEmail,
  getConfiguredWhatsAppUrl,
  saveContactRequest,
  setContactEmailDelivery,
  type ContactChannel,
  type ContactKind,
  type ContactRequestInput,
} from "../../../db/contact";

const MAX_LENGTHS = {
  name: 120,
  company: 140,
  role: 120,
  country: 90,
  city: 90,
  message: 2_000,
  source: 180,
} as const;

const allowedBrands = new Set(["Tropicoul", "Triplex"]);
const allowedFlavours = new Set(["Ananas", "Mangue", "Orange", "Goyave", "Cocktail", "Tamarin", "Toute la gamme"]);
const allowedCollaborationTypes = new Set(["Distribution", "Point de vente", "Événement", "Autre"]);

function stringValue(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function stringList(value: unknown, allowed: Set<string>) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && allowed.has(item)))];
}

function contactError(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

function parseContactRequest(value: unknown): ContactRequestInput | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const kind = input.kind === "partnership" || input.kind === "general" ? input.kind as ContactKind : null;
  const preferredChannel = input.preferredChannel === "whatsapp" || input.preferredChannel === "email"
    ? input.preferredChannel as ContactChannel
    : null;
  if (!kind || !preferredChannel) return null;

  const name = stringValue(input.name, MAX_LENGTHS.name);
  const company = stringValue(input.company, MAX_LENGTHS.company);
  const role = stringValue(input.role, MAX_LENGTHS.role);
  const country = stringValue(input.country, MAX_LENGTHS.country);
  const city = stringValue(input.city, MAX_LENGTHS.city);
  const message = stringValue(input.message, MAX_LENGTHS.message);
  const email = stringValue(input.email, 254).toLocaleLowerCase("fr-FR");
  const phone = stringValue(input.phone, 40);
  const source = stringValue(input.source, MAX_LENGTHS.source);
  const brands = stringList(input.brands, allowedBrands);
  const flavours = stringList(input.flavours, allowedFlavours);
  const collaborationType = stringValue(input.collaborationType, 80);

  if (!name) throw new Error("Indiquez votre nom.");
  if (kind === "partnership" && (!company || !country || !brands.length)) {
    throw new Error("Complétez votre entreprise, votre pays et les marques qui vous intéressent.");
  }
  if (kind === "partnership" && collaborationType && !allowedCollaborationTypes.has(collaborationType)) {
    throw new Error("Le type de collaboration choisi n’est pas valide.");
  }
  if (preferredChannel === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Indiquez une adresse e-mail valide.");
  }
  if (preferredChannel === "whatsapp" && phone.replace(/\D/g, "").length < 7) {
    throw new Error("Indiquez un numéro WhatsApp valide.");
  }

  return {
    kind,
    name,
    company,
    role,
    country,
    city,
    brands,
    flavours,
    collaborationType,
    preferredChannel,
    email,
    phone,
    message,
    source,
  };
}

function createWhatsAppMessage(request: ContactRequestInput) {
  if (request.kind === "general") {
    return "Bonjour, je souhaite échanger avec Multiproduit Mali.\nNom : " + request.name + "\nMessage : " + (request.message || "—");
  }

  return [
    "Bonjour, je souhaite échanger au sujet d’un partenariat avec Multiproduit Mali.",
    "Entreprise : " + request.company,
    "Pays : " + request.country,
    "Produits : " + request.brands.join(", "),
    "Type de partenariat : " + (request.collaborationType || "À préciser"),
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const input = parseContactRequest(await request.json());
    if (!input) return contactError("Les informations envoyées sont incomplètes.");

    const stored = await saveContactRequest(input);
    const delivery = await deliverContactEmail(stored);
    await setContactEmailDelivery(stored.id, delivery);
    const whatsappUrl = input.preferredChannel === "whatsapp"
      ? await getConfiguredWhatsAppUrl(createWhatsAppMessage(input))
      : null;

    return Response.json({
      id: stored.id,
      delivery,
      whatsappUrl,
    }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Votre demande n’a pas pu être transmise." },
      { status: 400 },
    );
  }
}
