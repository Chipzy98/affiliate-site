import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import Stars from "@/components/Stars";
import { CheckIcon, ExternalIcon } from "@/components/Icons";
import { discountPercent } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

// Built on first visit, cached, refreshed every 10 minutes
// (or instantly when you save the product in the admin panel).
export const revalidate = 600;
export async function generateStaticParams() {
  return [];
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const description = product.description.slice(0, 160) || `${product.title} – deal on ${product.store}`;
  return {
    title: product.title,
    description,
    alternates: { canonical: `/p/${product.slug}` },
    openGraph: {
      title: product.title,
      description,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.id, 4);
  const off = discountPercent(product.price, product.original_price);
  const goHref = `/go/${product.id}`;

  return (
    <div className="pb-28 lg:pb-0">
      <div className="container-page pt-6 sm:pt-8">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-ink">
            {product.category}
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white p-8 ring-1 ring-line sm:p-14 lg:sticky lg:top-24 lg:self-start">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.title}
                width={800}
                height={800}
                fetchPriority="high"
                className="h-full w-full object-contain text-transparent"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted">No image</div>
            )}
            {off && (
              <span className="absolute left-5 top-5 rounded-full bg-ink px-3.5 py-1.5 text-sm font-bold tabular-nums text-tag">
                {off}% off
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-brand-600">Sold on {product.store}</p>
            <h1 className="mt-2 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              {product.title}
            </h1>
            <div className="mt-3">
              <Stars rating={product.rating} size="lg" />
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {product.price ? (
                <span className="price-tag text-3xl sm:text-4xl">{product.price}</span>
              ) : (
                <span className="font-display text-2xl font-bold">See price on {product.store}</span>
              )}
              {off && <span className="text-lg tabular-nums text-muted line-through">{product.original_price}</span>}
            </div>
            {product.price && (
              <p className="mt-2 text-sm text-muted">Price when we added it. The store shows today&apos;s price.</p>
            )}

            <a
              href={goHref}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="btn-primary mt-7 hidden w-full py-4 text-base lg:inline-flex"
            >
              Get this deal on {product.store}
              <ExternalIcon className="h-5 w-5" />
            </a>

            <ul className="mt-6 space-y-2.5 text-sm text-ink/80">
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                Opens {product.store} in a new tab, so you can check stock and delivery.
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                You pay the store&apos;s normal price. Nothing extra.
              </li>
              <li className="flex items-start gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                Returns and support are handled by {product.store}.
              </li>
            </ul>

            {product.description && (
              <section className="mt-10 border-t border-line pt-8">
                <h2 className="font-display text-xl font-bold tracking-tight">About this product</h2>
                <div className="mt-3 max-w-prose whitespace-pre-line leading-relaxed text-ink/85">{product.description}</div>
              </section>
            )}

            <p className="mt-10 rounded-2xl bg-white p-4 text-xs leading-relaxed text-muted ring-1 ring-line">
              We may earn a commission if you buy through this link, at no extra cost to you. As an Amazon Associate I
              earn from qualifying purchases.
            </p>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20" aria-labelledby="related">
            <h2 id="related" className="mb-6 font-display text-3xl font-extrabold tracking-[-0.02em]">
              More in {product.category}
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>

      {/* Mobile: the buy button is always in reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="container-page flex items-center gap-3 py-3">
          {product.price ? (
            <span className="price-tag price-tag-on-white shrink-0 text-xl">{product.price}</span>
          ) : null}
          <a href={goHref} target="_blank" rel="nofollow sponsored noopener" className="btn-primary flex-1 py-3.5 text-base">
            Get deal on {product.store}
            <ExternalIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
