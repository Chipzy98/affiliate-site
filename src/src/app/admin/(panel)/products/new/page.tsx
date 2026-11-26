import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import { getAllCategoryNames } from "@/lib/products";

export const metadata: Metadata = { title: "Add product" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getAllCategoryNames();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Add product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
