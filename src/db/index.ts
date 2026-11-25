import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDb?: ReturnType<typeof drizzle>;
};

/** True once a Postgres connection string is present in the environment. */
export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function connection() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured. Add a Postgres connection string (Neon, Supabase or Vercel Postgres) to enable accounts, applications and live tracking.",
    );
  }
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({ connectionString: databaseUrl });
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

/**
 * Lazily created so the app builds and the marketing pages render without a
 * database. The connection is only opened the first time a query actually runs,
 * which also keeps serverless cold starts light.
 */
export function getDb() {
  if (!globalForDb.__arenaNextJsDb) {
    globalForDb.__arenaNextJsDb = drizzle(connection());
  }
  return globalForDb.__arenaNextJsDb;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export const pool = {
  query: (...args: Parameters<Pool["query"]>) => connection().query(...args),
};
