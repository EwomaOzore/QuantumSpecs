"use client";

import { useOpsFilters } from "@/lib/use-ops-filters";
import { OPS_HUBS } from "@/lib/ops-geo";
import { SITE_STATUSES, SITE_TYPES } from "@/lib/ops-network";
import { cn } from "@/lib/utils";

const PERIODS = ["1h", "24h", "7d"];
const METRICS = ["uptime", "revenue", "incidents"];

export function OpsFilterBar() {
  const { filters, hub, replace, selectHub } = useOpsFilters();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-qs-border bg-qs-bg-2 px-4 py-2">
      <select
        value={filters.region || hub.regionSlug}
        onChange={(e) => {
          const region = e.target.value;
          const next = OPS_HUBS.find((h) => h.regionSlug === region && h.isPrimary) ?? OPS_HUBS.find((h) => h.regionSlug === region);
          if (next) selectHub(next);
          else replace({ region });
        }}
        className="h-7 rounded border border-qs-border bg-qs-bg px-2 text-[12px]"
      >
        {[...new Set(OPS_HUBS.map((h) => h.regionSlug))].map((slug) => (
          <option key={slug} value={slug}>
            {OPS_HUBS.find((h) => h.regionSlug === slug)?.region}
          </option>
        ))}
      </select>
      <select
        value={filters.city || hub.slug}
        onChange={(e) => {
          const next = OPS_HUBS.find((h) => h.slug === e.target.value);
          if (next) selectHub(next);
        }}
        className="h-7 rounded border border-qs-border bg-qs-bg px-2 text-[12px]"
      >
        {OPS_HUBS.filter((h) => h.regionSlug === (filters.region || hub.regionSlug)).map((city) => (
          <option key={city.slug} value={city.slug}>
            {city.name}
          </option>
        ))}
      </select>
      <select
        value={filters.metric}
        onChange={(e) => replace({ metric: e.target.value })}
        className="h-7 rounded border border-qs-border bg-qs-bg px-2 text-[12px]"
      >
        {METRICS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={filters.period}
        onChange={(e) => replace({ period: e.target.value })}
        className="h-7 rounded border border-qs-border bg-qs-bg px-2 text-[12px]"
      >
        {PERIODS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <select
        value={filters.type}
        onChange={(e) => replace({ type: e.target.value })}
        className="h-7 rounded border border-qs-border bg-qs-bg px-2 text-[12px]"
      >
        <option value="">all types</option>
        {SITE_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(e) => replace({ status: e.target.value })}
        className="h-7 rounded border border-qs-border bg-qs-bg px-2 text-[12px]"
      >
        <option value="">all status</option>
        {SITE_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        value={filters.q}
        onChange={(e) => replace({ q: e.target.value })}
        placeholder="Search sites…"
        className="h-7 min-w-[160px] flex-1 rounded border border-qs-border bg-qs-bg px-2 text-[12px] outline-none"
      />
      <span className={cn("font-mono text-[11px] text-qs-faint")}>{hub.name}</span>
    </div>
  );
}
