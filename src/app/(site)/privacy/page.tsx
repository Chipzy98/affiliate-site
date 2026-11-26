import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy policy</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-slate-700">
        <p>This page explains what {site.name} collects when you visit.</p>
        <h2 className="pt-2 text-lg font-bold text-ink">Visit statistics</h2>
        <p>
          To understand which pages and products are popular, we record basic, anonymous information about each page
          view: the page address, the website that sent you here, your approximate country and city (worked out by our
          hosting provider), and your device type and browser.
        </p>
        <p>
          We do <strong>not</strong> store your IP address. Instead we keep a one-way, anonymous code that changes
          every day, so we can count unique visitors without knowing who you are. We do not use advertising cookies.
        </p>
        <h2 className="pt-2 text-lg font-bold text-ink">Affiliate links</h2>
        <p>
          When you click a deal, you leave our site and go to the store (for example Amazon). That store may use its
          own cookies to know that you came from us. Please read the store&apos;s privacy policy for details.
        </p>
        <h2 className="pt-2 text-lg font-bold text-ink">Data retention</h2>
        <p>Visit statistics are kept for a limited time and then deleted.</p>
      </div>
    </div>
  );
}
