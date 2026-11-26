import type { Metadata } from "next";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
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

  const heading = q ? `Results for “${q}”` : sp.category ? sp.category : "All deals";

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{heading}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} product{total === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href={link({ sort: undefined })}
            className={`rounded-full px-3 py-1.5 ${!sp.sort ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
          >
            Newest
          </Link>
          <Link
            href={link({ sort: "rating" })}
            className={`rounded-full px-3 py-1.5 ${sp.sort === "rating" ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}
          >
            Top rated
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 space-y-3">
        <FilterRow
          label="Category"
          items={categories.map((c) => c.category)}
          active={sp.category}
          href={(v) => link({ category: v })}
        />
        {stores.length > 1 && (
          <FilterRow label="Store" items={stores} active={sp.store} href={(v) => link({ store: v })} />
        )}
      </div>

      <div className="mt-8">
        <ProductGrid products={items} priorityCount={4} />
      </div>

      {pages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 && (
            <Link className="btn-ghost" href={link({ page: String(page - 1) })}>
              ← Previous
            </Link>
          )}
          <span className="px-3 text-sm text-slate-500">
            Page {page} of {pages}
          </span>
          {page < pages && (
            <Link className="btn-ghost" href={link({ page: String(page + 1) })}>
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
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
    `shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
      on ? "bg-brand-500 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-500"
    }`;
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <Link href={href(undefined)} className={chip(!active)}>
        All
      </Link>
      {items.map((item) => (
        <Link key={item} href={href(item)} className={chip(active === item)}>
          {item}
        </Link>
      ))}
    </div>
  );
}
