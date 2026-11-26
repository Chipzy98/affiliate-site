import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import Stars from "@/components/Stars";
import { ExternalIcon } from "@/components/Icons";
import { getCategories, getFeaturedProducts, getLatestProducts } from "@/lib/products";
import { discountPercent } from "@/lib/format";
import { site } from "@/lib/site";
import type { ProductCardData } from "@/lib/types";

// Cached and rebuilt in the background at most every 5 minutes (fast for visitors).
// Saving a product in the admin panel refreshes it immediately.
export const revalidate = 300;

export default async function HomePage() {
  const [featured, latest, categories] = await Promise.all([
    getFeaturedProducts(5),
    getLatestProducts(12),
    getCategories(),
  ]);

  const spotlight = featured[0] ?? latest[0] ?? null;
  const topPicks = featured.filter((p) => p.id !== spotlight?.id).slice(0, 4);

  return (
    <>
      {/* ---------- Hero: the sale sign ---------- */}
      <section className="relative overflow-hidden bg-brand-500 text-white">
        <div className="container-page grid grid-cols-[minmax(0,1fr)] items-center gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:py-20">
          <div className="min-w-0">
            <h1 className="max-w-xl font-display text-[2.6rem] font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              {site.tagline}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
              We go through the big stores and keep only products worth buying. Tap any deal to see today&apos;s price
              on the store.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/products" className="btn-tag px-6 py-3 text-base">
                Browse all deals
              </Link>
              <Link href="/products?sort=rating" className="btn px-5 py-3 text-base text-white ring-1 ring-white/40 hover:bg-white/10">
                Top rated
              </Link>
            </div>

            {categories.length > 0 && (
              <nav aria-label="Categories" className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                {categories.map((c) => (
                  <Link
                    key={c.category}
                    href={`/products?category=${encodeURIComponent(c.category)}`}
                    className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-brand-600"
                  >
                    {c.category}
                    <span className="ml-1.5 tabular-nums opacity-60">{c.count}</span>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {spotlight && <Spotlight product={spotlight} />}
        </div>
      </section>

      <div className="container-page space-y-16 pt-12 sm:pt-16">
        {topPicks.length > 0 && (
          <section aria-labelledby="top-picks">
            <SectionTitle id="top-picks" title="Top picks" text="Products we'd recommend to a friend." href="/products" />
            <ProductGrid products={topPicks} priorityCount={2} />
          </section>
        )}

        <section aria-labelledby="latest">
          <SectionTitle id="latest" title="Just added" text="The newest deals on the site." href="/products" />
          <ProductGrid products={latest} />
        </section>

        <HowItWorks />
      </div>
    </>
  );
}

/** The featured product, shown big in the hero with a swinging price tag. */
function Spotlight({ product }: { product: ProductCardData }) {
  const off = discountPercent(product.price, product.original_price);
  return (
    <article className="relative mx-auto w-full min-w-0 max-w-md lg:max-w-none">
      <div className="rounded-[2rem] bg-white p-4 text-ink shadow-[0_30px_60px_-20px_rgb(10_14_80/0.55)] sm:p-5">
        <Link href={`/p/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-paper p-6">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              width={640}
              height={480}
              fetchPriority="high"
              className="h-full w-full object-contain text-transparent"
            />
          )}
          {off && (
            <span className="absolute right-4 top-4 rounded-full bg-ink px-3 py-1.5 text-sm font-bold tabular-nums text-tag">
              {off}% off
            </span>
          )}
        </Link>

        <div className="px-1 pb-1 pt-4">
          <p className="text-sm font-medium text-brand-600">Today&apos;s top pick from {product.store}</p>
          <Link href={`/p/${product.slug}`} className="mt-1 block font-display text-xl font-bold leading-tight tracking-tight hover:underline sm:text-2xl">
            {product.title}
          </Link>
          <div className="mt-2">
            <Stars rating={product.rating} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              {product.price && <span className="price-tag price-tag-on-white text-2xl sm:hidden">{product.price}</span>}
              {off && (
                <span className="text-sm text-muted">
                  Was <span className="tabular-nums line-through">{product.original_price}</span>
                </span>
              )}
            </div>
            <a href={`/go/${product.id}`} target="_blank" rel="nofollow sponsored noopener" className="btn-primary px-5 py-3">
              Get deal on {product.store}
              <ExternalIcon />
            </a>
          </div>
        </div>
      </div>

      {/* The signature moment: a big tag hanging off the card */}
      {product.price && (
        <span
          aria-hidden
          className="price-tag animate-tag-swing absolute -left-3 -top-4 hidden text-3xl shadow-lg sm:inline-flex lg:-left-8 lg:-top-6 lg:text-4xl"
          style={{ ["--color-paper" as string]: "#2f3beb" }}
        >
          {product.price}
        </span>
      )}
    </article>
  );
}

function SectionTitle({ id, title, text, href }: { id: string; title: string; text: string; href: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 id={id} className="font-display text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted sm:text-base">{text}</p>
      </div>
      <Link href={href} className="shrink-0 rounded-full px-3 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50">
        See all
      </Link>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Pick a deal", text: "Browse or search. Every product here was chosen by hand." },
    { title: "Check it on the store", text: "The button opens the store, like Amazon, in a new tab with the live price." },
    { title: "Buy as usual", text: "You pay the store's normal price. They may pay us a small thank-you." },
  ];
  return (
    <section aria-labelledby="how" className="rounded-[2rem] bg-white p-6 ring-1 ring-line sm:p-10">
      <h2 id="how" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
        How buying works
      </h2>
      <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-8">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tag font-display text-lg font-extrabold">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">
        <Link href="/disclosure" className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
          Read how we earn money
        </Link>
      </p>
    </section>
  );
}
