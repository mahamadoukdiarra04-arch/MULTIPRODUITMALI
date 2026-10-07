import type { ContactDelivery, ContactRequestInput, StoredContactRequest } from "./contact";
import { executeSql } from "./mysql";

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  schemaReady ??= executeSql(`CREATE TABLE IF NOT EXISTS contact_requests (
    id VARCHAR(100) PRIMARY KEY,
    kind VARCHAR(32) NOT NULL,
    name VARCHAR(120) NOT NULL,
    company VARCHAR(140) NOT NULL DEFAULT '',
    role VARCHAR(120) NOT NULL DEFAULT '',
    country VARCHAR(90) NOT NULL DEFAULT '',
    city VARCHAR(90) NOT NULL DEFAULT '',
    brands TEXT NOT NULL,
    flavours TEXT NOT NULL,
    collaboration_type VARCHAR(100) NOT NULL DEFAULT '',
    preferred_channel VARCHAR(32) NOT NULL,
    email VARCHAR(254) NOT NULL DEFAULT '',
    phone VARCHAR(40) NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    source VARCHAR(180) NOT NULL DEFAULT '',
    email_delivery VARCHAR(32) NOT NULL DEFAULT 'pending',
    created_at VARCHAR(40) NOT NULL,
    INDEX idx_contact_requests_kind_created (kind, created_at),
    INDEX idx_contact_requests_delivery_created (email_delivery, created_at)
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`).then(() => undefined);
  await schemaReady;
}

export async function saveContactRequest(input: ContactRequestInput): Promise<StoredContactRequest> {
  await ensureSchema();
  const request: StoredContactRequest = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  await executeSql(`INSERT INTO contact_requests (
    id, kind, name, company, role, country, city, brands, flavours,
    collaboration_type, preferred_channel, email, phone, message, source,
    email_delivery, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`, [
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
  ]);
  return request;
}

export async function setContactEmailDelivery(id: string, delivery: ContactDelivery) {
  await ensureSchema();
  await executeSql("UPDATE contact_requests SET email_delivery = ? WHERE id = ?", [delivery, id]);
}
