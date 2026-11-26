"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveProduct, type ProductFormState } from "@/app/admin/actions";
import { discountPercent } from "@/lib/format";
import { STORES } from "@/lib/site";
import type { Product } from "@/lib/types";

export default function ProductForm({ product, categories }: { product?: Product | null; categories: string[] }) {
  const [state, action, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const [image, setImage] = useState(product?.image_url ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [original, setOriginal] = useState(product?.original_price ?? "");
  const off = discountPercent(price, original);
  const err = state.fieldErrors ?? {};

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_320px]">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-6">
        <section className="card space-y-5 p-6">
          <h2 className="font-bold">Product details</h2>

          <Field label="Title *" error={err.title}>
            <input name="title" defaultValue={product?.title} required maxLength={200} className="input" placeholder="e.g. Sony WH-1000XM5 Wireless Headphones" />
          </Field>

          <Field
            label="Affiliate link *"
            error={err.affiliate_url}
            help="Paste your tracking link from Amazon SiteStripe / AliExpress Portals / eBay Partner Network etc."
          >
            <input name="affiliate_url" type="url" defaultValue={product?.affiliate_url} required className="input" placeholder="https://amzn.to/xxxxx" />
          </Field>

          <Field label="Image link" error={err.image_url} help="Right-click the product image on the store's affiliate tool → copy image address.">
            <input
              name="image_url"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="input"
              placeholder="https://m.media-amazon.com/images/I/xxxx.jpg"
            />
          </Field>

          <Field label="Description" help="Why is this a good deal? Short bullet points work well. New lines are kept.">
            <textarea name="description" defaultValue={product?.description} rows={7} maxLength={5000} className="input" />
          </Field>
        </section>

        <section className="card grid gap-5 p-6 sm:grid-cols-2">
          <h2 className="font-bold sm:col-span-2">Price & rating</h2>
          <Field label="Price" help="Exactly as you want it shown, e.g. $29.99 or Rs. 4,500. Leave empty to hide.">
            <input name="price" value={price} onChange={(e) => setPrice(e.target.value)} maxLength={40} className="input" placeholder="$29.99" />
          </Field>
          <Field label="Original price (optional)" help={off ? `Shows a -${off}% badge` : "Shows a discount badge if higher than price."}>
            <input
              name="original_price"
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              maxLength={40}
              className="input"
              placeholder="$49.99"
            />
          </Field>
          <Field label="Rating (0–5, optional)" error={err.rating}>
            <input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={product?.rating ?? ""} className="input" placeholder="4.5" />
          </Field>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="card space-y-5 p-6">
          <h2 className="font-bold">Organise</h2>
          <Field label="Store">
            <input name="store" list="stores" defaultValue={product?.store ?? "Amazon"} className="input" />
            <datalist id="stores">
              {STORES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Category" help="Pick one or type a new category.">
            <input name="category" list="categories" defaultValue={product?.category ?? ""} className="input" placeholder="Electronics" />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="URL slug (optional)" help="Made from the title if empty.">
            <input name="slug" defaultValue={product?.slug} className="input" placeholder="sony-wh-1000xm5" />
          </Field>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="h-4 w-4 accent-orange-500" />
            ⭐ Show in “Top picks”
          </label>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="h-4 w-4 accent-orange-500" />
            Visible on the website
          </label>
        </section>

        <section className="card p-6">
          <h2 className="mb-3 font-bold">Image preview</h2>
          <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl border border-slate-100 bg-white p-3">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Preview" className="h-full w-full object-contain" />
            ) : (
              <span className="text-sm text-slate-400">Paste an image link</span>
            )}
            {off && <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">-{off}%</span>}
          </div>
        </section>

        {state.error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>}
        {Object.keys(err).length > 0 && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">Please fix the highlighted fields.</p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn-primary flex-1">
            {pending ? "Saving…" : product ? "Save changes" : "Add product"}
          </button>
          <Link href="/admin/products" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </aside>
    </form>
  );
}

function Field({ label, help, error, children }: { label: string; help?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label">{label}</span>
      <label className="block">{children}</label>
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : help && <p className="mt-1.5 text-xs text-slate-400">{help}</p>}
    </div>
  );
}
