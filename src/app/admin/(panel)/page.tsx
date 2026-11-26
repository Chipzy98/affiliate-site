import Link from "next/link";
import { BarList, DailyChart, StatCard } from "@/components/admin/Charts";
import { getDashboard } from "@/lib/analytics";
import VisitsTable from "@/components/admin/VisitsTable";
import { countryName, flag, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

const RANGES = [
  { days: 1, label: "24 hours" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range } = await searchParams;
  const days = RANGES.some((r) => String(r.days) === range) ? Number(range) : 7;
  const d = await getDashboard(days);
  const ctr = d.visitors ? ((d.clicks / d.visitors) * 100).toFixed(1) + "%" : "–";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            {d.liveNow} visitor{d.liveNow === 1 ? "" : "s"} online now · {formatNumber(d.todayVisitors)} today
          </p>
        </div>
        <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
          {RANGES.map((r) => (
            <Link
              key={r.days}
              href={`/admin?range=${r.days}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                r.days === days ? "bg-slate-900 text-white" : "text-slate-600 hover:text-ink"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Unique visitors" value={d.visitors} hint={`Last ${days === 1 ? "24 hours" : `${days} days`}`} />
        <StatCard label="Page views" value={d.views} />
        <StatCard label="Affiliate clicks" value={d.clicks} hint="Clicks on “View deal”" />
        <StatCard label="Click rate" value={ctr} hint="Clicks ÷ visitors" />
      </div>

      {days > 1 && <DailyChart data={d.daily} />}

      <div className="grid gap-6 xl:grid-cols-2">
        <BarList
          title="🌍 Countries"
          valueLabel="Visitors · clicks"
          rows={d.countries.map((c) => ({
            key: c.country ?? "unknown",
            label: (
              <Link href={`/admin/visitors?country=${c.country ?? "unknown"}`} className="hover:underline">
                {flag(c.country)} {countryName(c.country)}
              </Link>
            ),
            value: c.visitors,
            extra: <span className="text-xs font-normal text-slate-500">{c.clicks} click{c.clicks === 1 ? "" : "s"} ·</span>,
          }))}
        />
        <BarList
          title="🔥 Most clicked products"
          valueLabel="Clicks"
          rows={d.topProducts.map((p) => ({
            key: String(p.id ?? "deleted"),
            label: p.title ? (
              <Link href={`/admin/products/${p.id}`} className="hover:underline">
                {p.title}
              </Link>
            ) : (
              <span className="text-slate-400">(deleted product)</span>
            ),
            value: p.clicks,
          }))}
          empty="No clicks yet"
        />
        <BarList
          title="📄 Top pages"
          valueLabel="Views"
          rows={d.pages.map((p) => ({ key: p.label, label: p.label, value: p.value }))}
        />
        <BarList
          title="🔗 Traffic sources"
          rows={d.referrers.map((r) => ({ key: r.label, label: r.label, value: r.value }))}
        />
        <BarList title="📱 Devices" rows={d.devices.map((r) => ({ key: r.label, label: r.label, value: r.value }))} />
        <BarList title="🧭 Browsers" rows={d.browsers.map((r) => ({ key: r.label, label: r.label, value: r.value }))} />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <h3 className="font-bold">Latest visits</h3>
          <Link href="/admin/visitors" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            See all →
          </Link>
        </div>
        <VisitsTable rows={d.recent} />
      </div>
    </div>
  );
}
