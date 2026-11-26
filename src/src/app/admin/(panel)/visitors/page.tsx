import type { Metadata } from "next";
import Link from "next/link";
import ConfirmButton from "@/components/admin/ConfirmButton";
import VisitsTable from "@/components/admin/VisitsTable";
import { getVisits, VISITS_PAGE_SIZE } from "@/lib/analytics";
import { countryName, flag, formatNumber } from "@/lib/format";
import { cleanupAnalytics } from "../../actions";

export const metadata: Metadata = { title: "Visitors" };
export const dynamic = "force-dynamic";

type SP = Promise<{ country?: string; page?: string; cleaned?: string }>;

export default async function VisitorsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const country = sp.country && (/^[A-Z]{2}$/.test(sp.country) || sp.country === "unknown") ? sp.country : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const { rows, total, countries } = await getVisits({ country, page });
  const pages = Math.max(1, Math.ceil(total / VISITS_PAGE_SIZE));

  const href = (c?: string, p?: number) => {
    const params = new URLSearchParams();
    if (c) params.set("country", c);
    if (p && p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/admin/visitors?${s}` : "/admin/visitors";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Visitors</h1>
        <p className="mt-1 text-sm text-slate-500">
          Every page view on your site, newest first.{" "}
          {country ? (
            <>
              Showing <strong>{countryName(country === "unknown" ? null : country)}</strong> only.
            </>
          ) : null}
        </p>
      </div>

      {sp.cleaned && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Removed {formatNumber(Number(sp.cleaned) || 0)} old records.
        </p>
      )}

      {/* Country filter (last 90 days) */}
      <div className="card p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Filter by country (last 90 days)</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={href()}
            className={`rounded-full px-3 py-1.5 text-sm ${!country ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            All countries
          </Link>
          {countries.map((c) => {
            const code = c.country ?? "unknown";
            return (
              <Link
                key={code}
                href={href(code)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  country === code ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {flag(c.country)} {countryName(c.country)} <span className="opacity-60">{formatNumber(c.n)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <h3 className="font-bold">{formatNumber(total)} page views</h3>
          <span className="text-sm text-slate-500">
            Page {page} of {pages}
          </span>
        </div>
        <VisitsTable rows={rows} />
        {pages > 1 && (
          <div className="flex justify-between border-t border-slate-100 p-4">
            {page > 1 ? (
              <Link className="btn-ghost" href={href(country, page - 1)}>
                ← Newer
              </Link>
            ) : (
              <span />
            )}
            {page < pages && (
              <Link className="btn-ghost" href={href(country, page + 1)}>
                Older →
              </Link>
            )}
          </div>
        )}
      </div>

      <form action={cleanupAnalytics} className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h3 className="font-bold">Keep the database small</h3>
          <p className="mt-1 text-sm text-slate-500">Delete visit and click records older than the selected time.</p>
        </div>
        <div className="flex gap-2">
          <select name="days" defaultValue="180" className="input w-auto">
            <option value="90">90 days</option>
            <option value="180">180 days</option>
            <option value="365">1 year</option>
          </select>
          <ConfirmButton message="Delete old visit and click records? This cannot be undone.">Delete old data</ConfirmButton>
        </div>
      </form>
    </div>
  );
}
