import Link from "next/link";
import { site } from "@/lib/site";
import { SearchIcon, TagMark } from "./Icons";

function SearchForm({ className = "" }: { className?: string }) {
  return (
    <form action="/products" method="get" role="search" className={`relative ${className}`}>
      <input
        type="search"
        name="q"
        placeholder="Search products, brands, categories"
        aria-label="Search products"
        className="h-11 w-full rounded-full border border-line bg-paper pl-11 pr-4 text-[15px] text-ink outline-none transition placeholder:text-muted/80 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
      />
      <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
    </form>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container-page flex h-16 items-center gap-4 md:gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${site.name} home`}>
          <TagMark />
          <span className="font-display text-xl font-extrabold tracking-tight">{site.name}</span>
        </Link>

        <SearchForm className="hidden flex-1 md:block md:max-w-xl" />

        <nav className="ml-auto flex items-center gap-1 text-sm font-medium">
          <Link href="/products" className="rounded-full px-3 py-2 text-ink/75 transition hover:bg-paper hover:text-ink">
            All deals
          </Link>
          <Link
            href="/products?sort=rating"
            className="hidden rounded-full px-3 py-2 text-ink/75 transition hover:bg-paper hover:text-ink sm:inline-flex"
          >
            Top rated
          </Link>
        </nav>
      </div>

      {/* Mobile: search gets its own full-width row */}
      <div className="container-page pb-3 md:hidden">
        <SearchForm />
      </div>
    </header>
  );
}
