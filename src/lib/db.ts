import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __affiliateSql: Sql | undefined;
}

function createClient(): Sql {
  return postgres(process.env.DATABASE_URL ?? "", {
    max: 5, // small pool – fine for serverless functions
    idle_timeout: 20, // seconds
    connect_timeout: 10,
    prepare: false, // required for Neon / Supabase pooled connections
    onnotice: () => {},
  });
}

/** Shared database client (re-used between requests while the function is warm). */
export const sql: Sql = globalThis.__affiliateSql ?? createClient();
globalThis.__affiliateSql = sql;

export const hasDatabase = Boolean(process.env.DATABASE_URL);

/** Runs a query and returns `fallback` instead of crashing the page if the DB is unavailable. */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasDatabase) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.error("[db]", err instanceof Error ? err.message : err);
    return fallback;
  }
}
