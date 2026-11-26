import Link from "next/link";
import { site } from "@/lib/site";
import { TagMark } from "./Icons";

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink text-white/70">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <TagMark className="h-8 w-8" />
            <span className="font-display text-lg font-extrabold tracking-tight">{site.name}</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed">
            We pick products we think are worth buying. When you buy through our links, the store may pay us a small
            commission. Your price stays the same. As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>

        <nav aria-label="Shop" className="text-sm">
          <p className="mb-3 font-semibold text-white">Shop</p>
          <ul className="space-y-2.5">
            <li>
              <Link href="/products" className="hover:text-white">
                All deals
              </Link>
            </li>
            <li>
              <Link href="/products?sort=rating" className="hover:text-white">
                Top rated
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="About" className="text-sm">
          <p className="mb-3 font-semibold text-white">About</p>
          <ul className="space-y-2.5">
            <li>
              <Link href="/disclosure" className="hover:text-white">
                How we earn money
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-xs text-white/50">
          © {new Date().getFullYear()} {site.name}. Prices and stock can change on the store at any time.
        </p>
      </div>
    </footer>
  );
}
