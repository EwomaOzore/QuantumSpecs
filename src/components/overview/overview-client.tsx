"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OpsChart, type SeriesPoint } from "@/components/charts/ops-chart";
import { Badge, severityTone, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { formatCompact, formatPercent, formatRelative, formatUsd, greeting } from "@/lib/format";
import { OPERATOR } from "@/lib/constants";
import { DEFAULT_HUB, OPS_HUBS, hubKpis } from "@/lib/ops-geo";
import { getOpsEvents, regionalRollup } from "@/lib/ops-network";
import { useOpsFilters } from "@/lib/use-ops-filters";

type Overview = {
  now: string;
  today: {
    revenueUsd: number;
    total: number;
    failed: number;
    failureRate: number;
    avgLatencyMs: number;
    byRegion: Array<{
      code: string;
      name: string;
      count: number;
      failed: number;
      revenueUsd: number;
      avgLatencyMs: number;
    }>;
  };
  yesterday: { revenueUsd: number; failureRate: number; total: number; avgLatencyMs: number };
  series: SeriesPoint[];
  incidents: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
    region: { code: string } | null;
  }>;
  deployments: Array<{
    id: string;
    service: string;
    version: string;
    status: string;
    deployedAt: string;
    deployedBy: string;
  }>;
  alert: {
    start: string;
    end: string;
    deployAt: string;
    failureDelta: number;
    spike: { failureRate: number };
  };
};

function delta(current: number, prev: number) {
  if (prev === 0) return "n/a";
  const d = ((current - prev) / prev) * 100;
  const sign = d >= 0 ? "+" : "";
  return `${sign}${d.toFixed(1)}% vs 24h`;
}

export function OverviewClient({ data }: { data: Overview }) {
  const router = useRouter();
  const [ingesting, setIngesting] = useState(false);
  const start = data.alert.start.slice(11, 16);
  const end = data.alert.end.slice(11, 16);
  const { filters, hub, hrefFor, selectHub } = useOpsFilters();
  const kpis = hubKpis(hub);
  const events = getOpsEvents().filter((e) => e.citySlug === hub.slug).slice(0, 8);
  const rollup = regionalRollup();
  const query = "Why did checkout failures increase this morning?";

  useEffect(() => {
    if (!filters.city) selectHub(DEFAULT_HUB);
  }, [filters.city, selectHub]);

  async function simulateTraffic() {
    setIngesting(true);
    try {
      await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 40 }),
      });
      router.refresh();
    } finally {
      setIngesting(false);
    }
  }

  return (
    <div className="px-6 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight">
            {hub.name}
          </h1>
          <p className="mt-1 text-[13px] text-qs-muted">
            {greeting(new Date(data.now))}, {OPERATOR.name} · {hub.country} · {hub.region}
            {hub.isHub ? " · primary hub" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => void simulateTraffic()} disabled={ingesting}>
            {ingesting ? "Writing traffic…" : "Simulate traffic"}
          </Button>
          <Button variant="primary" onClick={() => router.push(hrefFor("/globe"))}>
            Open globe
          </Button>
          <Button onClick={() => router.push(`/agent?q=${encodeURIComponent(query)}`)}>
            Ask the analyst
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Hub revenue" value={formatUsd(kpis.revenueUsd)} hint={hub.name} />
        <Kpi
          label="Uptime"
          value={formatPercent(kpis.uptimePct)}
          hint="network SLO"
          tone={kpis.uptimePct < 99.5 ? "warning" : "success"}
        />
        <Kpi
          label="Revenue"
          value={formatUsd(data.today.revenueUsd)}
          delta={delta(data.today.revenueUsd, data.yesterday.revenueUsd)}
          hint="last 24h"
          tone={data.today.revenueUsd >= data.yesterday.revenueUsd ? "success" : "danger"}
        />
        <Kpi
          label="Users / txns"
          value={formatCompact(data.today.total)}
          delta={delta(data.today.total, data.yesterday.total)}
          hint="checkouts"
        />
        <Kpi
          label="Errors"
          value={formatPercent(data.today.failureRate * 100)}
          delta={delta(data.today.failureRate, data.yesterday.failureRate)}
          hint={`${data.today.failed} failed`}
          tone={data.today.failureRate > data.yesterday.failureRate ? "danger" : "success"}
        />
        <Kpi
          label="p95-ish latency"
          value={`${Math.round(data.today.avgLatencyMs)}ms`}
          delta={delta(data.today.avgLatencyMs, data.yesterday.avgLatencyMs)}
          hint="avg across routes"
          tone={data.today.avgLatencyMs > 400 ? "warning" : "neutral"}
        />
        <Kpi
          label="Open incidents"
          value={String(data.incidents.filter((i) => i.status !== "resolved").length)}
          hint="active + mitigated"
          tone="warning"
        />
      </div>

      <div className="mt-4 rounded-lg border border-[rgba(232,184,74,0.35)] bg-[rgba(232,184,74,0.08)] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[12px] font-medium text-qs-warning">AI detected unusual activity</div>
            <p className="mt-1 max-w-2xl text-[13px] text-qs-text">
              Checkout failures increased {data.alert.failureDelta.toFixed(1)}% between {start}–{end} UTC.
              Paystack Nigeria mobile is in the blast radius. checkout-api@2.14.3 shipped just before the
              first timeout.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push(`/agent?q=${encodeURIComponent(query)}`)}
            >
              Investigate
            </Button>
            <Button
              size="sm"
              onClick={() =>
                router.push(`/agent?q=${encodeURIComponent("Create incident")}`)
              }
            >
              Create incident
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader title="Revenue / traffic" description="24h checkout volume and failures" />
          <div className="px-2 pb-2 pt-1">
            <OpsChart data={data.series} metric="volume" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Regional rollup" description="Sites by corridor" />
          <div className="divide-y divide-qs-border">
            {rollup.map((r) => (
              <button
                key={r.regionSlug}
                type="button"
                className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-qs-hover"
                onClick={() => {
                  const next = OPS_HUBS.find((h) => h.regionSlug === r.regionSlug && h.isPrimary);
                  if (next) selectHub(next, "/network");
                }}
              >
                <span className="text-[13px]">{r.region}</span>
                <div className="flex items-center gap-4 font-mono text-[12px] tabular text-qs-muted">
                  <span>{r.count.toLocaleString()}</span>
                  <span className={r.down ? "text-qs-danger" : ""}>{r.down} down</span>
                  <span>{formatUsd(r.revenue)}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Incidents"
            action={
              <Link href={hrefFor("/incidents")} className="text-[12px] text-qs-accent">
                View all
              </Link>
            }
          />
          <div className="divide-y divide-qs-border">
            {data.incidents.slice(0, 5).map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-qs-hover"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px]">{inc.title}</div>
                  <div className="mt-0.5 text-[11px] text-qs-faint">
                    {inc.region ? `${inc.region.code} · ` : ""}
                    {formatRelative(inc.createdAt)}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Badge tone={severityTone(inc.severity)}>{inc.severity}</Badge>
                  <Badge tone={statusTone(inc.status)}>{inc.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Live event feed" description={hub.name} />
          <div className="divide-y divide-qs-border">
            {events.map((event) => (
              <div key={event.id} className="px-4 py-2.5">
                <div className="text-[13px]">{event.message}</div>
                <div className="mt-0.5 text-[11px] text-qs-faint">
                  {event.type} · {event.status} · {formatRelative(event.at)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
