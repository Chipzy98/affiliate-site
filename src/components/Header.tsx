import Link from "next/link";
import { site } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-extrabold tracking-tight text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-lg text-white">🛍️</span>
          <span className="hidden text-lg sm:inline">{site.name}</span>
        </Link>

        <form action="/products" method="get" role="search" className="relative flex-1">
          <input
            type="search"
            name="q"
            placeholder="Search deals…"
            aria-label="Search products"
            className="input h-11 rounded-full bg-slate-50 pl-11"
          />
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </form>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <Link href="/" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-ink">
            Home
          </Link>
          <Link href="/products" className="rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-ink">
            All deals
          </Link>
        </nav>
      </div>
    </header>
  );
}
