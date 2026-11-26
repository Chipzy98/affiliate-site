import type { Metadata } from "next";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { site } from "@/lib/site";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s · ${site.name} Admin` },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-5 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2 font-extrabold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">🛍️</span>
            <span>{site.name}</span>
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/" target="_blank" className="btn-ghost px-3 py-1.5 text-xs">
              View site
            </Link>
            <form action={logout}>
              <button className="btn-ghost px-3 py-1.5 text-xs">Log out</button>
            </form>
          </div>
        </div>
        <div className="px-3 pb-3 lg:px-4">
          <AdminNav />
        </div>
        <div className="hidden space-y-2 px-4 pt-6 lg:block">
          <Link href="/" target="_blank" className="btn-ghost w-full">
            View site ↗
          </Link>
          <form action={logout}>
            <button className="btn-ghost w-full">Log out</button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 p-4 sm:p-6 lg:p-8">
        {!hasDatabase && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>DATABASE_URL is not set.</strong> Add your Neon connection string to the environment variables, then
            run <code>npm run db:setup</code>.
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
