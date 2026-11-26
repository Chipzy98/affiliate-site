import Link from "next/link";
import type { ProductCardData } from "@/lib/types";
import { discountPercent } from "@/lib/format";
import { ExternalIcon } from "./Icons";
import Stars from "./Stars";

export default function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const off = discountPercent(product.price, product.original_price);

  return (
    <article className="group flex min-w-0 flex-col">
      <Link
        href={`/p/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-[1.25rem] bg-white p-5 ring-1 ring-line transition group-hover:ring-ink/20 sm:p-7"
      >
        {product.image_url ? (
          // Plain <img> so store images load straight from their fast CDNs
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.title}
            width={400}
            height={400}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            className="h-full w-full object-contain text-transparent transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted">No image</div>
        )}
        {off && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-bold tabular-nums text-tag">
            {off}% off
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-0.5 pt-3">
        <p className="text-xs font-medium text-muted">{product.store}</p>
        <Link
          href={`/p/${product.slug}`}
          className="mt-0.5 line-clamp-2 text-[15px] font-medium leading-snug text-ink decoration-brand-500 decoration-2 underline-offset-4 hover:underline"
        >
          {product.title}
        </Link>
        <div className="mt-1.5 min-h-5">
          <Stars rating={product.rating} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex min-w-0 flex-col">
            {product.price ? (
              <span className="price-tag self-start text-base sm:text-lg">{product.price}</span>
            ) : (
              <span className="text-sm font-medium text-muted">See price</span>
            )}
            {off && <span className="mt-1 truncate text-xs tabular-nums text-muted line-through">{product.original_price}</span>}
          </div>
          <a
            href={`/go/${product.id}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            aria-label={`Get deal on ${product.store} (opens in a new tab)`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 sm:flex sm:h-auto sm:w-auto sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-sm sm:font-semibold"
          >
            <span className="hidden sm:inline">Get deal</span>
            <ExternalIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}
