import "server-only";
import { createHash } from "node:crypto";

export type VisitorInfo = {
  country: string | null;
  city: string | null;
  device: string;
  browser: string;
  os: string;
  visitorHash: string;
  isBot: boolean;
};

const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|discord|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|axios|node-fetch|go-http-client|java\//i;

/** Reads the visitor's country/city from the headers your host adds (Netlify, Vercel, Cloudflare). */
export function getGeo(h: Headers): { country: string | null; city: string | null } {
  let country =
    h.get("x-country") ||
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    h.get("x-country-code") ||
    null;
  let city = h.get("x-vercel-ip-city") || h.get("cf-ipcity") || null;

  // Netlify sends JSON (sometimes base64-encoded) in "x-nf-geo"
  const nfGeo = h.get("x-nf-geo");
  if (nfGeo) {
    const parsed = parseNetlifyGeo(nfGeo);
    country = country || parsed?.country?.code || null;
    city = city || parsed?.city || null;
  }

  country = country ? country.trim().toUpperCase() : null;
  if (!country || !/^[A-Z]{2}$/.test(country) || country === "XX" || country === "T1") country = null;

  if (city) {
    try {
      city = decodeURIComponent(city);
    } catch {
      /* keep as is */
    }
    city = city.slice(0, 80);
  }
  return { country, city };
}

type NetlifyGeo = { city?: string; country?: { code?: string } };

function parseNetlifyGeo(value: string): NetlifyGeo | null {
  try {
    return JSON.parse(value) as NetlifyGeo;
  } catch {
    try {
      return JSON.parse(Buffer.from(value, "base64").toString("utf8")) as NetlifyGeo;
    } catch {
      return null;
    }
  }
}

export function getIp(h: Headers): string {
  return (
    h.get("x-nf-client-connection-ip") ||
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "0.0.0.0"
  );
}

export function parseUserAgent(ua: string): { device: string; browser: string; os: string } {
  const device = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)
    ? "Tablet"
    : /mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)
      ? "Mobile"
      : "Desktop";

  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /fbav|fban|instagram/i.test(ua)
          ? "Facebook/Instagram app"
          : /firefox|fxios/i.test(ua)
            ? "Firefox"
            : /chrome|crios/i.test(ua)
              ? "Chrome"
              : /safari/i.test(ua)
                ? "Safari"
                : "Other";

  const os = /windows/i.test(ua)
    ? "Windows"
    : /android/i.test(ua)
      ? "Android"
      : /iphone|ipad|ipod/i.test(ua)
        ? "iOS"
        : /mac os x|macintosh/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";

  return { device, browser, os };
}

/**
 * Anonymous visitor id: a hash of IP + browser + today's date + your secret.
 * The real IP is never stored, and the id changes every day (privacy friendly).
 */
export function visitorHash(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.SESSION_SECRET || "no-secret";
  return createHash("sha256").update(`${day}|${ip}|${ua}|${secret}`).digest("hex").slice(0, 32);
}

export function getVisitorInfo(h: Headers): VisitorInfo {
  const ua = h.get("user-agent") || "";
  const { country, city } = getGeo(h);
  const { device, browser, os } = parseUserAgent(ua);
  return {
    country,
    city,
    device,
    browser,
    os,
    visitorHash: visitorHash(getIp(h), ua),
    isBot: !ua || BOT_RE.test(ua),
  };
}

/** "https://www.facebook.com/abc" -> "facebook.com" (ignores links from your own site). */
export function referrerHost(ref: string | null | undefined, ownHost: string | null): string | null {
  if (!ref) return null;
  try {
    const host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
    const own = ownHost?.replace(/^www\./, "").split(":")[0].toLowerCase();
    if (!host || host === own) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}
