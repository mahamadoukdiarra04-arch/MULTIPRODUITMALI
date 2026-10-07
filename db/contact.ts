import * as mysqlContact from "./contact-mysql";
import { isMySqlConfigured } from "./mysql";

export type ContactKind = "partnership" | "general";
export type ContactChannel = "email" | "whatsapp";
export type ContactDelivery = "sent" | "pending" | "failed";

export type ContactRequestInput = {
  kind: ContactKind;
  name: string;
  company: string;
  role: string;
  country: string;
  city: string;
  brands: string[];
  flavours: string[];
  collaborationType: string;
  preferredChannel: ContactChannel;
  email: string;
  phone: string;
  message: string;
  source: string;
};

export type StoredContactRequest = ContactRequestInput & {
  id: string;
  createdAt: string;
};

type ContactRuntime = {
  RESEND_API_KEY?: string;
  CONTACT_RECIPIENT_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_WHATSAPP_NUMBER?: string;
};

let contactSchemaReady: Promise<void> | null = null;

const contactSchemaStatements = [
  "CREATE TABLE IF NOT EXISTS contact_requests (id TEXT PRIMARY KEY, kind TEXT NOT NULL, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', role TEXT NOT NULL DEFAULT '', country TEXT NOT NULL DEFAULT '', city TEXT NOT NULL DEFAULT '', brands TEXT NOT NULL DEFAULT '[]', flavours TEXT NOT NULL DEFAULT '[]', collaboration_type TEXT NOT NULL DEFAULT '', preferred_channel TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', message TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT '', email_delivery TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL)",
  "CREATE INDEX IF NOT EXISTS idx_contact_requests_kind_created ON contact_requests(kind, created_at)",
  "CREATE INDEX IF NOT EXISTS idx_contact_requests_delivery_created ON contact_requests(email_delivery, created_at)",
];

async function getRuntimeD1(): Promise<D1Database | null> {
  try {
    const { getOptionalD1 } = await import("./index");
    return getOptionalD1();
  } catch {
    return null;
  }
}

async function getContactRuntime(): Promise<ContactRuntime> {
  try {
    const { env } = await import("cloudflare:workers");
    return env as unknown as ContactRuntime;
  } catch {
    return {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      CONTACT_RECIPIENT_EMAIL: process.env.CONTACT_RECIPIENT_EMAIL,
      CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
      CONTACT_WHATSAPP_NUMBER: process.env.CONTACT_WHATSAPP_NUMBER,
    };
  }
}

async function getContactDatabase() {
  const db = await getRuntimeD1();
  if (!db) return null;

  if (!contactSchemaReady) {
    contactSchemaReady = (async () => {
      await db.batch(contactSchemaStatements.map((statement) => db.prepare(statement)));
      await db.prepare("PRAGMA optimize").run();
    })();
  }

  await contactSchemaReady;
  return db;
}

export async function saveContactRequest(input: ContactRequestInput): Promise<StoredContactRequest> {
  if (isMySqlConfigured()) return mysqlContact.saveContactRequest(input);
  const db = await getContactDatabase();
  if (!db) throw new Error("Le service de contact est indisponible pour le moment.");

  const request: StoredContactRequest = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await db.prepare("INSERT INTO contact_requests (id, kind, name, company, role, country, city, brands, flavours, collaboration_type, preferred_channel, email, phone, message, source, email_delivery, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)")
    .bind(
      request.id,
      request.kind,
      request.name,
      request.company,
      request.role,
      request.country,
      request.city,
      JSON.stringify(request.brands),
      JSON.stringify(request.flavours),
      request.collaborationType,
      request.preferredChannel,
      request.email,
      request.phone,
      request.message,
      request.source,
      request.createdAt,
    )
    .run();

  return request;
}

function contactFields(request: StoredContactRequest) {
  return [
    ["Date et heure", new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" }).format(new Date(request.createdAt))],
    ["Nom", request.name],
    ["Entreprise", request.company || "—"],
    ["Fonction", request.role || "—"],
    ["Pays", request.country || "—"],
    ["Ville", request.city || "—"],
    ["Produits", request.brands.length ? request.brands.join(", ") : "—"],
    ["Saveurs", request.flavours.length ? request.flavours.join(", ") : "—"],
    ["Type de partenariat", request.collaborationType || "—"],
    ["Canal préféré", request.preferredChannel === "whatsapp" ? "WhatsApp" : "E-mail"],
    ["E-mail", request.email || "—"],
    ["Téléphone", request.phone || "—"],
    ["Message", request.message || "—"],
    ["Page d’origine", request.source || "—"],
  ];

}

function emailText(request: StoredContactRequest) {
  return contactFields(request).map(([label, value]) => label + " : " + value).join("\n");
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function emailHtml(request: StoredContactRequest) {
  const rows = contactFields(request)
    .map(([label, value]) => "<tr><th style=\"padding:10px 14px;border:1px solid #d7d7d1;text-align:left;background:#f5f3ed\">" + escapeHtml(label) + "</th><td style=\"padding:10px 14px;border:1px solid #d7d7d1\">" + escapeHtml(value) + "</td></tr>")
    .join("");
  return "<table style=\"border-collapse:collapse;font-family:Arial,sans-serif;color:#131412\"><tbody>" + rows + "</tbody></table>";
}

function emailSubject(request: StoredContactRequest) {
  if (request.kind === "general") return "[CONTACT SITE] " + request.name;
  return "[PARTENARIAT] " + request.country + " — " + request.company + " — " + request.brands.join(", ");
}

export async function deliverContactEmail(request: StoredContactRequest): Promise<ContactDelivery> {
  const runtime = await getContactRuntime();
  if (!runtime.RESEND_API_KEY || !runtime.CONTACT_RECIPIENT_EMAIL || !runtime.CONTACT_FROM_EMAIL) {
    return "pending";
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: "Bearer " + runtime.RESEND_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: runtime.CONTACT_FROM_EMAIL,
        to: [runtime.CONTACT_RECIPIENT_EMAIL],
        subject: emailSubject(request),
        text: emailText(request),
        html: emailHtml(request),
        reply_to: request.email || undefined,
      }),
    });

    return response.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

export async function setContactEmailDelivery(id: string, delivery: ContactDelivery) {
  if (isMySqlConfigured()) return mysqlContact.setContactEmailDelivery(id, delivery);
  const db = await getContactDatabase();
  if (!db) return;
  await db.prepare("UPDATE contact_requests SET email_delivery = ? WHERE id = ?").bind(delivery, id).run();
}

export async function getConfiguredWhatsAppUrl(message: string) {
  const runtime = await getContactRuntime();
  const number = runtime.CONTACT_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return number ? "https://wa.me/" + number + "?text=" + encodeURIComponent(message) : null;
}
