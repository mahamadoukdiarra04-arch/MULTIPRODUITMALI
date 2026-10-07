import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

type SqlValue = string | number | boolean | null;

let poolPromise: Promise<Pool | null> | null = null;

export function isMySqlConfigured() {
  return Boolean(
    process.env.DATABASE_URL
      || (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME),
  );
}

async function createPool(): Promise<Pool | null> {
  if (!isMySqlConfigured()) return null;

  const { createPool: createMySqlPool } = await import("mysql2/promise");
  const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT ?? 8);
  const common = {
    waitForConnections: true,
    connectionLimit: Number.isFinite(connectionLimit) ? Math.max(2, Math.min(connectionLimit, 20)) : 8,
    enableKeepAlive: true,
    charset: "utf8mb4",
    timezone: "Z",
  } as const;

  if (process.env.DATABASE_URL) {
    return createMySqlPool({ uri: process.env.DATABASE_URL, ...common });
  }

  return createMySqlPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ...common,
  });
}

export async function getMySqlPool() {
  poolPromise ??= createPool();
  return poolPromise;
}

export async function queryRows<T extends RowDataPacket>(sql: string, values: SqlValue[] = []) {
  const pool = await getMySqlPool();
  if (!pool) throw new Error("La base MySQL n’est pas configurée.");
  const [rows] = await pool.execute<T[]>(sql, values);
  return rows;
}

export async function queryOne<T extends RowDataPacket>(sql: string, values: SqlValue[] = []) {
  const rows = await queryRows<T>(sql, values);
  return rows[0] ?? null;
}

export async function executeSql(sql: string, values: SqlValue[] = []) {
  const pool = await getMySqlPool();
  if (!pool) throw new Error("La base MySQL n’est pas configurée.");
  const [result] = await pool.execute<ResultSetHeader>(sql, values);
  return result;
}

export async function withTransaction<T>(callback: (connection: PoolConnection) => Promise<T>) {
  const pool = await getMySqlPool();
  if (!pool) throw new Error("La base MySQL n’est pas configurée.");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
