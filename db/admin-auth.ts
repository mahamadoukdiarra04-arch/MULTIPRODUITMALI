import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2/promise";

import { executeSql, isMySqlConfigured, queryOne } from "./mysql";

export type EditorialAdminUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

type AdminRow = RowDataPacket & {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  isActive: number;
};

type SessionRow = RowDataPacket & {
  id: string;
  email: string;
  displayName: string;
  expiresAt: string;
  isActive: number;
};

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 6;

let schemaReady: Promise<void> | null = null;

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sessionToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(value: string) {
  return value.trim().toLocaleLowerCase("fr-FR");
}

async function ensureSchema() {
  if (!isMySqlConfigured()) return;
  schemaReady ??= (async () => {
    await executeSql(`CREATE TABLE IF NOT EXISTS editorial_admins (
      id VARCHAR(100) PRIMARY KEY,
      email VARCHAR(254) NOT NULL UNIQUE,
      display_name VARCHAR(120) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at VARCHAR(40) NOT NULL,
      updated_at VARCHAR(40) NOT NULL
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await executeSql(`CREATE TABLE IF NOT EXISTS editorial_sessions (
      token_hash CHAR(64) PRIMARY KEY,
      admin_id VARCHAR(100) NOT NULL,
      expires_at VARCHAR(40) NOT NULL,
      created_at VARCHAR(40) NOT NULL,
      INDEX idx_editorial_sessions_admin (admin_id),
      INDEX idx_editorial_sessions_expires (expires_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await executeSql(`CREATE TABLE IF NOT EXISTS editorial_login_attempts (
      id VARCHAR(100) PRIMARY KEY,
      email VARCHAR(254) NOT NULL,
      successful TINYINT(1) NOT NULL DEFAULT 0,
      attempted_at VARCHAR(40) NOT NULL,
      INDEX idx_editorial_login_attempts_email_time (email, attempted_at)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);

    const bootstrapEmail = normalizeEmail(process.env.MULTIPRODUIT_BOOTSTRAP_ADMIN_EMAIL ?? "");
    const bootstrapPassword = process.env.MULTIPRODUIT_BOOTSTRAP_ADMIN_PASSWORD ?? "";
    if (bootstrapEmail && bootstrapPassword.length >= 12) {
      const existing = await queryOne<RowDataPacket & { id: string }>("SELECT id FROM editorial_admins WHERE email = ?", [bootstrapEmail]);
      if (!existing) {
        const now = new Date().toISOString();
        const passwordHash = await bcrypt.hash(bootstrapPassword, 12);
        await executeSql(`INSERT INTO editorial_admins (
          id, email, display_name, password_hash, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 1, ?, ?)`, [
          crypto.randomUUID(),
          bootstrapEmail,
          process.env.MULTIPRODUIT_BOOTSTRAP_ADMIN_NAME?.trim() || "Équipe Multiproduit Mali",
          passwordHash,
          now,
          now,
        ]);
      }
    }
  })();
  await schemaReady;
}

function toUser(row: { id: string; email: string; displayName: string }): EditorialAdminUser {
  return { userId: row.id, email: row.email, displayName: row.displayName, fullName: row.displayName };
}

export async function authenticateEditorialAdmin(emailValue: string, password: string) {
  if (!isMySqlConfigured()) return null;
  await ensureSchema();
  const email = normalizeEmail(emailValue);
  const since = new Date(Date.now() - ATTEMPT_WINDOW_MS).toISOString();
  const attempts = await queryOne<RowDataPacket & { count: number | string }>(
    "SELECT COUNT(*) AS count FROM editorial_login_attempts WHERE email = ? AND successful = 0 AND attempted_at >= ?",
    [email, since],
  );
  if (Number(attempts?.count ?? 0) >= MAX_FAILED_ATTEMPTS) {
    throw new Error("Trop de tentatives. Patientez quinze minutes avant de réessayer.");
  }

  const admin = await queryOne<AdminRow>(`SELECT id, email, display_name AS displayName,
    password_hash AS passwordHash, is_active AS isActive
    FROM editorial_admins WHERE email = ? LIMIT 1`, [email]);
  const valid = Boolean(admin?.isActive) && Boolean(admin && await bcrypt.compare(password, admin.passwordHash));
  await executeSql("INSERT INTO editorial_login_attempts (id, email, successful, attempted_at) VALUES (?, ?, ?, ?)", [
    crypto.randomUUID(), email, Number(valid), new Date().toISOString(),
  ]);
  if (!valid || !admin) return null;

  const token = sessionToken();
  const tokenHash = await sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  await executeSql("DELETE FROM editorial_sessions WHERE expires_at <= ?", [new Date().toISOString()]);
  await executeSql("INSERT INTO editorial_sessions (token_hash, admin_id, expires_at, created_at) VALUES (?, ?, ?, ?)", [
    tokenHash, admin.id, expiresAt, new Date().toISOString(),
  ]);
  return { user: toUser(admin), token, expiresAt };
}

export async function getEditorialAdminSession(token: string) {
  if (!isMySqlConfigured() || !token) return null;
  await ensureSchema();
  const tokenHash = await sha256(token);
  const session = await queryOne<SessionRow>(`SELECT a.id, a.email, a.display_name AS displayName,
    a.is_active AS isActive, s.expires_at AS expiresAt
    FROM editorial_sessions s
    INNER JOIN editorial_admins a ON a.id = s.admin_id
    WHERE s.token_hash = ? LIMIT 1`, [tokenHash]);
  if (!session || !session.isActive || session.expiresAt <= new Date().toISOString()) {
    if (session) await executeSql("DELETE FROM editorial_sessions WHERE token_hash = ?", [tokenHash]);
    return null;
  }
  return toUser(session);
}

export async function invalidateEditorialSession(token: string) {
  if (!isMySqlConfigured() || !token) return;
  await ensureSchema();
  await executeSql("DELETE FROM editorial_sessions WHERE token_hash = ?", [await sha256(token)]);
}
