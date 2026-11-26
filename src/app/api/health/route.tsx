// TEMPORARY: shows only whether settings exist (never their values). Delete after fixing.
import { sql, hasDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const check = (name: string) => {
    const v = process.env[name];
    return v ? `set (${v.length} characters)` : "MISSING";
  };

  let database = "not tested";
  if (hasDatabase) {
    try {
      const rows = await sql<{ n: number }[]>`select count(*)::int as n from products`;
      database = `connected – ${rows[0].n} products`;
    } catch (err) {
      database = `ERROR – ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return Response.json(
    {
      ADMIN_PASSWORD: check("ADMIN_PASSWORD"),
      SESSION_SECRET: check("SESSION_SECRET"),
      DATABASE_URL: check("DATABASE_URL"),
      NEXT_PUBLIC_SITE_URL: check("NEXT_PUBLIC_SITE_URL"),
      database,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}