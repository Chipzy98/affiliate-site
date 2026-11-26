import type { Metadata, Viewport } from "next";
import { site } from "@/lib/site";
// Self-hosted fonts (no request to Google = faster and works everywhere)
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/onest";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} – ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.tagline,
  openGraph: { siteName: site.name, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#2f3beb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
