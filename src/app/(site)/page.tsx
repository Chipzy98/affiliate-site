import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import { getCategories, getFeaturedProducts, getLatestProducts } from "@/lib/products";
import { site } from "@/lib/site";

// Page is cached and rebuilt in the background at most every 5 minutes (very fast for visitors).
// Saving a product in the admin panel refreshes it immediately.
export const revalidate = 300;

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedProducts(8),
    getLatestProducts(12),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-linear-to-br from-brand-50 via-white to-amber-50">
        <div className="container-page py-12 sm:py-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
            🔥 Updated daily
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {site.tagline}
          </h1>
          <p className="mt-4 max-w-xl text-slate-600">
            We search the big stores so you don&apos;t have to. Tap a deal to see the latest price on the store&apos;s
            website.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary rounded-full px-6 py-3 text-base">
              Browse all deals →
            </Link>
          </div>
        </div>
      </section>

      <div className="container-page space-y-14 py-10">
        {/* Categories */}
        {categories.length > 0 && (
          <section aria-labelledby="cats">
            <h2 id="cats" className="sr-only">
              Categories
            </h2>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {categories.map((c) => (
                <Link
                  key={c.category}
                  href={`/products?category=${encodeURIComponent(c.category)}`}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-brand-600"
                >
                  {c.category} <span className="text-slate-400">({c.count})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section aria-labelledby="featured">
            <SectionTitle id="featured" title="⭐ Top picks" href="/products" />
            <ProductGrid products={featured} priorityCount={4} />
          </section>
        )}

        <section aria-labelledby="latest">
          <SectionTitle id="latest" title="🆕 Latest deals" href="/products" />
          <ProductGrid products={latest} priorityCount={featured.length ? 0 : 4} />
        </section>
      </div>
    </>
  );
}

function SectionTitle({ id, title, href }: { id: string; title: string; href: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 id={id} className="text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h2>
      <Link href={href} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        See all →
      </Link>
    </div>
  );
}
