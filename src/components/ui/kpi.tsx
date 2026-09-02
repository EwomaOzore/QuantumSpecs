import { cn } from "@/lib/utils";

export function Kpi({
  label,
  value,
  delta,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta?: string;
  hint?: string;
  tone?: "neutral" | "danger" | "success" | "warning";
}) {
  const deltaColor =
    tone === "danger"
      ? "text-qs-danger"
      : tone === "success"
        ? "text-qs-success"
        : tone === "warning"
          ? "text-qs-warning"
          : "text-qs-muted";
  return (
    <div className="rounded-lg border border-qs-border bg-qs-surface px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">{label}</div>
      <div className="mt-2 font-mono text-[22px] leading-none tabular text-qs-text">{value}</div>
      <div className="mt-2 flex items-center gap-2 text-[12px]">
        {delta ? <span className={cn("tabular", deltaColor)}>{delta}</span> : null}
        {hint ? <span className="text-qs-faint">{hint}</span> : null}
      </div>
    </div>
  );
}
