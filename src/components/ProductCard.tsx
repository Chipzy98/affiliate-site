import Link from "next/link";
import type { ProductCardData } from "@/lib/types";
import { discountPercent } from "@/lib/format";
import Stars from "./Stars";

export default function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const off = discountPercent(product.price, product.original_price);

  return (
    <article className="group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/p/${product.slug}`} className="relative block aspect-square bg-white p-4">
        {product.image_url ? (
          // Plain <img> so external store images load directly from their fast CDNs
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.title}
            width={400}
            height={400}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            className="h-full w-full object-contain text-transparent transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-5xl">🛍️</div>
        )}
        {off && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
            -{off}%
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white">
          {product.store}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 border-t border-slate-100 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{product.category}</p>
        <Link href={`/p/${product.slug}`} className="line-clamp-2 font-semibold leading-snug text-ink hover:text-brand-600">
          {product.title}
        </Link>
        <Stars rating={product.rating} />
        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {product.price && <p className="truncate text-lg font-extrabold text-ink">{product.price}</p>}
            {off && <p className="truncate text-xs text-slate-400 line-through">{product.original_price}</p>}
          </div>
          <a
            href={`/go/${product.id}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="btn-primary w-full shrink-0 rounded-full px-4 py-2 sm:w-auto"
          >
            View deal
          </a>
        </div>
      </div>
    </article>
  );
}
