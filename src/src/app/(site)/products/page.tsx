import type { Metadata } from "next";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { SearchIcon } from "@/components/Icons";
import { getCategories, getStores, PAGE_SIZE, searchProducts } from "@/lib/products";

type SearchParams = Promise<{ q?: string; category?: string; store?: string; sort?: string; page?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q, category } = await searchParams;
  const title = q ? `Search: ${q}` : category ? `${category} deals` : "All deals";
  return { title, alternates: { canonical: "/products" } };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const q = sp.q?.slice(0, 100);

  const [{ items, total }, categories, stores] = await Promise.all([
    searchProducts({ q, category: sp.category, store: sp.store, sort: sp.sort, page }),
    getCategories(),
    getStores(),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const link = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q, category: sp.category, store: sp.store, sort: sp.sort, page: undefined, ...changes };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const s = params.toString();
    return s ? `/products?${s}` : "/products";
  };

  const heading = q ? `Results for “${q}”` : sp.category ? sp.category : sp.sort === "rating" ? "Top rated" : "All deals";

  return (
    <div>
      {/* Page header band */}
      <div className="border-b border-line bg-white">
        <div className="container-page py-8 sm:py-10">
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] sm:text-5xl">{heading}</h1>
          <p className="mt-2 text-muted">
            {total} {total === 1 ? "product" : "products"}
            {sp.store ? ` from ${sp.store}` : ""}
          </p>

          <form action="/products" method="get" role="search" className="relative mt-6 max-w-xl">
            {sp.category && <input type="hidden" name="category" value={sp.category} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search in these deals"
              aria-label="Search products"
              className="h-12 w-full rounded-full border border-line bg-paper pl-12 pr-28 text-[15px] outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
            <button className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2">Search</button>
          </form>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Filters */}
        <div className="space-y-3">
          <FilterRow
            label="Category"
            items={categories.map((c) => c.category)}
            active={sp.category}
            href={(v) => link({ category: v })}
          />
          {stores.length > 1 && <FilterRow label="Store" items={stores} active={sp.store} href={(v) => link({ store: v })} />}
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-6">
          <p className="text-sm text-muted">
            {pages > 1 ? `Page ${page} of ${pages}` : `Showing ${items.length}`}
          </p>
          <div className="flex rounded-full bg-white p-1 text-sm ring-1 ring-line" role="group" aria-label="Sort">
            <SortLink href={link({ sort: undefined })} on={!sp.sort}>
              Newest
            </SortLink>
            <SortLink href={link({ sort: "rating" })} on={sp.sort === "rating"}>
              Top rated
            </SortLink>
          </div>
        </div>

        <div className="mt-6">
          <ProductGrid products={items} priorityCount={4} />
        </div>

        {pages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Pagination">
            {page > 1 ? (
              <Link className="btn-ghost" href={link({ page: String(page - 1) })}>
                Previous
              </Link>
            ) : (
              <span className="btn-ghost pointer-events-none opacity-40">Previous</span>
            )}
            <span className="px-2 text-sm tabular-nums text-muted">
              {page} / {pages}
            </span>
            {page < pages ? (
              <Link className="btn-ghost" href={link({ page: String(page + 1) })}>
                Next
              </Link>
            ) : (
              <span className="btn-ghost pointer-events-none opacity-40">Next</span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}

function SortLink({ href, on, children }: { href: string; on: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={on ? "true" : undefined}
      className={`rounded-full px-3.5 py-1.5 font-medium transition ${on ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}

function FilterRow({
  label,
  items,
  active,
  href,
}: {
  label: string;
  items: string[];
  active?: string;
  href: (value?: string) => string;
}) {
  if (items.length === 0) return null;
  const chip = (on: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
      on ? "bg-brand-500 text-white" : "bg-white text-ink/80 ring-1 ring-line hover:ring-ink/30"
    }`;
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-sm text-muted">{label}</span>
      <div className="no-scrollbar -mr-4 flex gap-2 overflow-x-auto pr-4 sm:mr-0 sm:flex-wrap sm:pr-0">
        <Link href={href(undefined)} className={chip(!active)}>
          All
        </Link>
        {items.map((item) => (
          <Link key={item} href={href(item)} className={chip(active === item)}>
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}
