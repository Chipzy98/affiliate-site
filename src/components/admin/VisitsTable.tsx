import type { RecentVisit } from "@/lib/analytics";
import { countryName, flag, timeAgo } from "@/lib/format";

export default function VisitsTable({ rows }: { rows: RecentVisit[] }) {
  if (rows.length === 0) return <p className="px-5 pb-8 text-center text-sm text-slate-400">No visits yet</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-semibold">When</th>
            <th className="px-5 py-3 font-semibold">Country</th>
            <th className="px-5 py-3 font-semibold">Page</th>
            <th className="px-5 py-3 font-semibold">From</th>
            <th className="px-5 py-3 font-semibold">Device</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((v) => (
            <tr key={v.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-5 py-3 text-slate-500" title={new Date(v.created_at).toISOString()}>
                {timeAgo(v.created_at)}
              </td>
              <td className="whitespace-nowrap px-5 py-3">
                {flag(v.country)} {countryName(v.country)}
                {v.city && <span className="text-slate-400"> · {v.city}</span>}
              </td>
              <td className="max-w-[240px] truncate px-5 py-3 font-medium">{v.path}</td>
              <td className="max-w-[160px] truncate px-5 py-3 text-slate-500">{v.referrer ?? "—"}</td>
              <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                {v.device} · {v.browser} · {v.os}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
