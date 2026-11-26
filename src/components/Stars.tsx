export default function Stars({ rating, size = "sm" }: { rating: number | null; size?: "sm" | "lg" }) {
  if (rating === null || rating === undefined) return null;
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const text = size === "lg" ? "text-lg" : "text-sm";
  return (
    <span className="inline-flex items-center gap-1.5" title={`${rating} out of 5`}>
      <span className={`relative inline-block leading-none tracking-tight ${text}`} aria-hidden>
        <span className="text-slate-300">★★★★★</span>
        <span className="absolute inset-0 overflow-hidden text-amber-400" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      <span className="text-xs font-medium text-slate-500">{rating.toFixed(1)}</span>
      <span className="sr-only">{rating} out of 5 stars</span>
    </span>
  );
}
