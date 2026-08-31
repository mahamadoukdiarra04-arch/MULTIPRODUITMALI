import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getOptionalD1(): D1Database | null {
  const { DB } = env as unknown as { DB?: D1Database };
  return DB ?? null;
}

export function getDb() {
  const DB = getOptionalD1();

  if (!DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(DB, { schema });
}
