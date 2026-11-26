import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-6 py-10 text-sm text-slate-500 md:grid-cols-[2fr_1fr]">
        <div>
          <p className="font-bold text-ink">{site.name}</p>
          <p className="mt-2 max-w-xl leading-relaxed">
            We independently pick the products shown here. When you buy through links on our site we may earn a
            commission, at no extra cost to you. As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <Link href="/products" className="hover:text-ink">
            All deals
          </Link>
          <Link href="/disclosure" className="hover:text-ink">
            Affiliate disclosure
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy policy
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {site.name}. Prices and availability may change.
      </div>
    </footer>
  );
}
