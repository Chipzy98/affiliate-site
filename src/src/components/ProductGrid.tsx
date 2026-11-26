import Link from "next/link";
import type { ProductCardData } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, priorityCount = 0 }: { products: ProductCardData[]; priorityCount?: number }) {
  if (products.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-line bg-white px-6 py-14 text-center">
        <p className="font-display text-xl font-bold">Nothing matches that yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Try a shorter search word, or look through every deal.</p>
        <Link href="/products" className="btn-primary mt-6">
          See all deals
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
