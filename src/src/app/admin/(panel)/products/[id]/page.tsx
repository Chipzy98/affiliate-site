import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { adminGetProduct, getAllCategoryNames } from "@/lib/products";

export const metadata: Metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product, categories] = await Promise.all([adminGetProduct(productId), getAllCategoryNames()]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Edit product</h1>
        <Link href={`/p/${product.slug}`} target="_blank" className="btn-ghost">
          View on site ↗
        </Link>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
