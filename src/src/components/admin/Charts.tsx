import { formatNumber } from "@/lib/format";

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight">{typeof value === "number" ? formatNumber(value) : value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/** Horizontal bar list, e.g. top countries, pages, referrers. */
export function BarList({
  title,
  rows,
  valueLabel = "Visitors",
  empty = "No data yet",
}: {
  title: string;
  rows: { key: string; label: React.ReactNode; value: number; extra?: React.ReactNode }[];
  valueLabel?: string;
  empty?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">{title}</h3>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{valueLabel}</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.key} className="relative flex items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-2 text-sm">
              <span
                className="absolute inset-y-0 left-0 rounded-lg bg-brand-100"
                style={{ width: `${(r.value / max) * 100}%` }}
                aria-hidden
              />
              <span className="relative min-w-0 truncate">{r.label}</span>
              <span className="relative flex shrink-0 items-center gap-3 font-semibold tabular-nums">
                {r.extra}
                {formatNumber(r.value)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Simple, dependency-free SVG chart: bars = visitors, line = affiliate clicks. */
export function DailyChart({ data }: { data: { day: string; views: number; visitors: number; clicks: number }[] }) {
  const W = 800;
  const H = 220;
  const pad = { t: 10, r: 10, b: 28, l: 36 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const max = Math.max(4, ...data.map((d) => Math.max(d.visitors, d.clicks)));
  const step = innerW / Math.max(data.length, 1);
  const barW = Math.max(2, Math.min(36, step * 0.6));
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const labelEvery = Math.ceil(data.length / 10);

  const linePoints = data.map((d, i) => `${pad.l + i * step + step / 2},${y(d.clicks)}`).join(" ");
  const ticks = [0, Math.round(max / 2), max];

  return (
    <div className="card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">Visitors & clicks per day</h3>
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" /> Visitors
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-slate-900" /> Clicks
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Daily visitors and clicks chart">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray="3 3" />
            <text x={pad.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
              {t}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * step + (step - barW) / 2;
          return (
            <g key={d.day}>
              <rect x={x} y={y(d.visitors)} width={barW} height={pad.t + innerH - y(d.visitors)} rx={3} fill="#2f3beb">
                <title>{`${d.day}: ${d.visitors} visitors, ${d.views} page views, ${d.clicks} clicks`}</title>
              </rect>
              {i % labelEvery === 0 && (
                <text x={pad.l + i * step + step / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="#94a3b8">
                  {d.day.slice(5)}
                </text>
              )}
            </g>
          );
        })}
        {data.length > 1 && <polyline points={linePoints} fill="none" stroke="#0f172a" strokeWidth="2" />}
        {data.map((d, i) => (
          <circle key={d.day} cx={pad.l + i * step + step / 2} cy={y(d.clicks)} r={2.5} fill="#0f172a" />
        ))}
      </svg>
    </div>
  );
}
