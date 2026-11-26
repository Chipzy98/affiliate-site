import "server-only";
import postgres from "postgres";

type Sql = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __affiliateSql: { url: string; client: Sql } | undefined;
}

/**
 * Connection string. On Netlify this comes from Netlify Database (NETLIFY_DB_URL, set automatically).
 * DATABASE_URL still works as an override, e.g. to point at your own Postgres/Neon database.
 */
function connectionString(): string {
  return process.env.DATABASE_URL || process.env.NETLIFY_DB_URL || "";
}

function getClient(): Sql {
  const url = connectionString();
  const cached = globalThis.__affiliateSql;
  if (cached && cached.url === url) return cached.client;
  // Credentials can rotate between invocations – rebuild the pool when the URL changes.
  if (cached) cached.client.end({ timeout: 5 }).catch(() => {});
  const client = postgres(url, {
    max: 5, // small pool – fine for serverless functions
    idle_timeout: 20, // seconds
    connect_timeout: 10,
    prepare: false, // required for pooled (PgBouncer-style) connections
    onnotice: () => {},
  });
  globalThis.__affiliateSql = { url, client };
  return client;
}

/** Shared database client (re-used between requests while the function is warm). */
export const sql: Sql = new Proxy((() => {}) as unknown as Sql, {
  apply: (_t, _this, args) => (getClient() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_t, prop) => {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const hasDatabase = Boolean(connectionString());

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
