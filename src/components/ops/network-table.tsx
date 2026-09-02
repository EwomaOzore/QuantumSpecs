"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Badge } from "@/components/ui/badge";
import { formatPercent, formatUsd } from "@/lib/format";
import { sitesForFilters } from "@/lib/ops-network";
import { useOpsFilters } from "@/lib/use-ops-filters";

export function NetworkTable() {
  const { filters, hub } = useOpsFilters();
  const parentRef = useRef<HTMLDivElement>(null);
  const rows = useMemo(
    () =>
      sitesForFilters({
        city: filters.city,
        region: filters.region,
        type: filters.type,
        status: filters.status,
        q: filters.q,
      }),
    [filters],
  );

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 16,
  });

  return (
    <div className="flex h-[calc(100dvh-3rem-41px)] min-h-0 flex-col">
      <div className="flex items-end justify-between px-6 py-4">
        <div>
          <h1 className="text-[18px] font-medium">Network</h1>
          <p className="mt-1 text-[13px] text-qs-muted">
            {rows.length.toLocaleString()} sites · {hub.name}, {hub.country}
          </p>
        </div>
      </div>
      <div className="mx-6 mb-4 min-h-0 flex-1 overflow-hidden rounded-lg border border-qs-border">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.6fr_0.6fr_0.7fr] border-b border-qs-border bg-qs-bg-2 px-4 py-2 text-[11px] uppercase tracking-wide text-qs-faint">
          <div>Site</div>
          <div>City</div>
          <div>Type</div>
          <div>Status</div>
          <div>Uptime</div>
          <div>Revenue</div>
        </div>
        <div ref={parentRef} className="qs-scroll h-[calc(100%-33px)] overflow-auto">
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((item) => {
              const site = rows[item.index]!;
              return (
                <div
                  key={site.id}
                  className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.6fr_0.6fr_0.7fr] items-center border-b border-qs-border px-4 text-[13px]"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: item.size,
                    transform: `translateY(${item.start}px)`,
                  }}
                >
                  <div className="truncate font-mono text-[12px]">{site.id}</div>
                  <div>{site.city}</div>
                  <div className="text-qs-muted">{site.type}</div>
                  <Badge
                    tone={site.status === "down" ? "danger" : site.status === "degraded" ? "warning" : "success"}
                  >
                    {site.status}
                  </Badge>
                  <div className="font-mono tabular">{formatPercent(site.uptimePct)}</div>
                  <div className="font-mono tabular">{formatUsd(site.revenueUsd)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
