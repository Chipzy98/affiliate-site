import { after, NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { getAffiliateUrl } from "@/lib/products";
import { getVisitorInfo, referrerHost } from "@/lib/visitor";

/**
 * /go/123  ->  records a click, then redirects the visitor to the product's affiliate link.
 * The click is saved *after* the redirect is sent, so the visitor never waits for the database.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  const target = await getAffiliateUrl(productId);
  if (!target) return NextResponse.redirect(new URL("/", req.url), 302);

  const info = getVisitorInfo(req.headers);
  if (!info.isBot) {
    const ref = referrerHost(req.headers.get("referer"), req.headers.get("host"));
    after(async () => {
      try {
        await sql`
          insert into clicks (product_id, country, device, referrer, visitor_hash)
          values (${productId}, ${info.country}, ${info.device}, ${ref}, ${info.visitorHash})
        `;
      } catch (err) {
        console.error("[click]", err instanceof Error ? err.message : err);
      }
    });
  }

  const res = NextResponse.redirect(target, 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
