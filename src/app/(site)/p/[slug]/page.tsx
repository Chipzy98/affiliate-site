import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";
import Stars from "@/components/Stars";
import { discountPercent } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

// Product pages are built on first visit, cached, and refreshed every 10 minutes
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

  return (
    <div className="container-page py-6 sm:py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <Link href={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-ink">
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="card relative aspect-square overflow-hidden bg-white p-6 sm:p-10">
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
            <div className="grid h-full place-items-center text-7xl">🛍️</div>
          )}
          {off && (
            <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white">
              -{off}%
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            {product.category} · {product.store}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{product.title}</h1>
          <div className="mt-3">
            <Stars rating={product.rating} size="lg" />
          </div>

          {product.price && (
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold">{product.price}</span>
              {off && <span className="text-lg text-slate-400 line-through">{product.original_price}</span>}
            </div>
          )}
          <p className="mt-1 text-xs text-slate-400">Price at the time we added it – check the store for today&apos;s price.</p>

          <a
            href={`/go/${product.id}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="btn-primary mt-6 w-full rounded-2xl py-4 text-base sm:w-auto sm:px-10"
          >
            View on {product.store} →
          </a>

          {product.description && (
            <div className="mt-8 whitespace-pre-line leading-relaxed text-slate-700">{product.description}</div>
          )}

          <p className="mt-8 rounded-xl bg-slate-100 p-4 text-xs leading-relaxed text-slate-500">
            We may earn a commission if you buy through this link, at no extra cost to you. As an Amazon Associate I
            earn from qualifying purchases.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-xl font-bold tracking-tight">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
