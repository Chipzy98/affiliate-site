import type { ProductCardData } from "@/lib/types";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products, priorityCount = 0 }: { products: ProductCardData[]; priorityCount?: number }) {
  if (products.length === 0) {
    return (
      <div className="card grid place-items-center px-6 py-16 text-center">
        <p className="text-4xl">🔍</p>
        <p className="mt-3 font-semibold">No products found</p>
        <p className="mt-1 text-sm text-slate-500">Try a different search or category.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
