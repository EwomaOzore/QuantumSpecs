"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { formatPercent, formatUsd } from "@/lib/format";
import { PRIMARY_HUBS, hubKpis } from "@/lib/ops-geo";
import { getOpsSites } from "@/lib/ops-network";
import { useOpsFilters } from "@/lib/use-ops-filters";
import { cn } from "@/lib/utils";

const OpsGlobeCanvas = dynamic(
  () => import("@/components/globe/ops-globe-canvas").then((mod) => mod.OpsGlobeCanvas),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-[radial-gradient(circle_at_center,#12202c,transparent_55%)]" />,
  },
);

export function GlobeView() {
  const { hub, selectHub } = useOpsFilters();

  const kpis = hubKpis(hub);
  const siteCount = getOpsSites().filter((s) => s.citySlug === hub.slug).length;

  return (
    <div className="flex h-[calc(100dvh-3rem)] min-h-0">
      <div className="relative min-h-0 min-w-0 flex-1">
        <div className="pointer-events-none absolute left-4 top-4 z-20">
          <div className="rounded-md border border-qs-border bg-qs-bg/80 px-3 py-2 backdrop-blur">
            <h1 className="text-[18px] font-medium tracking-tight">{hub.name}</h1>
            <p className="text-[12px] text-qs-muted">
              {hub.country} · {hub.region}
              {hub.isHub ? " · primary hub" : ""}
            </p>
          </div>
        </div>
        <OpsGlobeCanvas hub={hub} onSelectHub={selectHub} />
      </div>
      <aside className="flex w-[280px] shrink-0 flex-col overflow-auto border-l border-qs-border bg-qs-bg-2 sm:w-[320px]">
        <div className="px-4 py-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Selected hub</div>
          <h2 className="mt-1 text-[18px] font-medium">{hub.name}</h2>
          <p className="mt-1 text-[13px] text-qs-muted">
            {hub.country} · {hub.region}
          </p>
          <div className="mt-4 grid gap-2">
            <Kpi label="Revenue" value={formatUsd(kpis.revenueUsd)} hint="hub catchment" />
            <Kpi label="Uptime" value={formatPercent(kpis.uptimePct)} hint="last 24h" />
            <Kpi label="Open incidents" value={String(kpis.openIncidents)} tone="warning" />
            <Kpi label="Sites" value={String(siteCount)} hint="in this city" />
          </div>
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Jump country</div>
            <div className="mt-2 grid gap-0.5">
              {PRIMARY_HUBS.filter((city, index, hubs) => hubs.findIndex((h) => h.country === city.country) === index).map(
                (city) => (
                <button
                  key={city.slug}
                  type="button"
                  data-testid={`select-country-${city.country.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  onClick={() => selectHub(city)}
                  className={cn(
                    "flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-[13px] hover:bg-qs-hover",
                    city.slug === hub.slug ? "bg-qs-elevated text-qs-text" : "text-qs-muted",
                  )}
                >
                  <span>{city.country}</span>
                  <span className="text-[11px] text-qs-faint">{city.name}</span>
                </button>
                ),
              )}
            </div>
          </div>
          <Card className="mt-4 px-4 py-3">
            <div className="text-[13px] font-medium">Click a country</div>
            <p className="mt-1 text-[12px] leading-5 text-qs-muted">
              Hover for borders, click to select its primary hub. URL updates so Command, Network, and Incidents stay on the same city.
            </p>
          </Card>
        </div>
      </aside>
    </div>
  );
}
