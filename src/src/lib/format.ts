/** Turns "Wireless Earbuds Pro!" into "wireless-earbuds-pro". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Reads the number out of a price string like "$1,299.99" or "Rs. 4500". */
export function priceNumber(price: string): number | null {
  const n = parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Discount percent from price + original price, or null. */
export function discountPercent(price: string, original: string): number | null {
  const p = priceNumber(price);
  const o = priceNumber(original);
  if (!p || !o || o <= p) return null;
  const pct = Math.round(((o - p) / o) * 100);
  return pct >= 1 ? pct : null;
}

/** "LK" -> 🇱🇰 */
export function flag(code: string | null | undefined): string {
  if (!code || !/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** "LK" -> "Sri Lanka" */
export function countryName(code: string | null | undefined): string {
  if (!code || !/^[A-Z]{2}$/.test(code)) return "Unknown";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en").format(n);
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${Math.max(s, 0)}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}
