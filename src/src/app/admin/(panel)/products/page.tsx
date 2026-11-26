import type { Metadata } from "next";
import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { adminListProducts } from "@/lib/products";
import { deleteProduct, toggleProduct } from "../../actions";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string; saved?: string; deleted?: string }>;

export default async function AdminProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const products = await adminListProducts(sp.q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-slate-500">{products.length} items</p>
        </div>
        <div className="flex gap-2">
          <form className="relative">
            <input name="q" defaultValue={sp.q} placeholder="Search products…" className="input w-56" />
          </form>
          <Link href="/admin/products/new" className="btn-primary">
            + Add product
          </Link>
        </div>
      </div>

      {sp.saved && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✅ Saved “{sp.saved}”. The public site is updated.
        </p>
      )}
      {sp.deleted && <p className="rounded-xl bg-slate-200 px-4 py-3 text-sm text-slate-700">Product deleted.</p>}

      {products.length === 0 ? (
        <div className="card grid place-items-center px-6 py-16 text-center">
          <p className="text-4xl">📦</p>
          <p className="mt-3 font-semibold">No products yet</p>
          <Link href="/admin/products/new" className="btn-primary mt-4">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Store / Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 text-center font-semibold">Clicks (30d)</th>
                <th className="px-4 py-3 text-center font-semibold">Featured</th>
                <th className="px-4 py-3 text-center font-semibold">Visible</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className={p.active ? "" : "bg-slate-50 opacity-60"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">
                        {p.image_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-contain" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/admin/products/${p.id}`} className="line-clamp-2 font-semibold hover:text-brand-600">
                          {p.title}
                        </Link>
                        <p className="truncate text-xs text-slate-400">/p/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {p.store}
                    <br />
                    <span className="text-xs text-slate-400">{p.category}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold">{p.price || "—"}</td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">{p.clicks_30d}</td>
                  <td className="px-4 py-3 text-center">
                    <ToggleForm id={p.id} field="featured" on={p.featured} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <ToggleForm id={p.id} field="active" on={p.active} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/p/${p.slug}`} target="_blank" className="btn-ghost px-3 py-1.5 text-xs">
                        View
                      </Link>
                      <Link href={`/admin/products/${p.id}`} className="btn-ghost px-3 py-1.5 text-xs">
                        Edit
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmButton message={`Delete "${p.title}"? This cannot be undone.`} className="btn-danger px-3 py-1.5 text-xs">
                          Delete
                        </ConfirmButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ToggleForm({ id, field, on }: { id: number; field: "featured" | "active"; on: boolean }) {
  return (
    <form action={toggleProduct}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <button
        type="submit"
        aria-label={`Toggle ${field}`}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${on ? "bg-emerald-500" : "bg-slate-300"}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${on ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </form>
  );
}
