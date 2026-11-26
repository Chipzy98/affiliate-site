import { after, type NextRequest } from "next/server";
import { sql, hasDatabase } from "@/lib/db";
import { getVisitorInfo, referrerHost } from "@/lib/visitor";

/** Receives one page view from <Tracker /> and stores it. Always answers fast with 204. */
export async function POST(req: NextRequest) {
  const done = new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  if (!hasDatabase) return done;

  let body: { path?: unknown; ref?: unknown; utm?: unknown };
  try {
    const text = await req.text();
    if (text.length > 2000) return done;
    body = JSON.parse(text);
  } catch {
    return done;
  }

  const path = typeof body.path === "string" ? body.path.slice(0, 300) : "";
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return done;

  const info = getVisitorInfo(req.headers);
  if (info.isBot) return done;

  const utm = typeof body.utm === "string" ? body.utm.trim().toLowerCase().slice(0, 60) : "";
  const ref = utm || referrerHost(typeof body.ref === "string" ? body.ref : null, req.headers.get("host"));

  after(async () => {
    try {
      await sql`
        insert into page_views (path, referrer, country, city, device, browser, os, visitor_hash)
        values (${path}, ${ref || null}, ${info.country}, ${info.city}, ${info.device},
                ${info.browser}, ${info.os}, ${info.visitorHash})
      `;
    } catch (err) {
      console.error("[track]", err instanceof Error ? err.message : err);
    }
  });

  return done;
}
