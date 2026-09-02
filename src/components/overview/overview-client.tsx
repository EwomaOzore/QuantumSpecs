"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OpsChart, type SeriesPoint } from "@/components/charts/ops-chart";
import { Badge, severityTone, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Kpi } from "@/components/ui/kpi";
import { RegionFlag } from "@/components/ui/region-flag";
import { formatCompact, formatPercent, formatRelative, formatUsd, greeting } from "@/lib/format";
import { OPERATOR } from "@/lib/constants";

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
  const query = "Why did checkout failures increase this morning?";

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
            {greeting(new Date(data.now))}, {OPERATOR.name}
          </h1>
          <p className="mt-1 text-[13px] text-qs-muted">
            Kora production · Nigeria · Ghana · Kenya · South Africa · UK
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => void simulateTraffic()} disabled={ingesting}>
            {ingesting ? "Writing traffic…" : "Simulate traffic"}
          </Button>
          <Button variant="primary" onClick={() => router.push(`/agent?q=${encodeURIComponent(query)}`)}>
            Ask the analyst
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
          <CardHeader title="Regional health" description="Last 24 hours" />
          <div className="divide-y divide-qs-border">
            {data.today.byRegion.map((r) => (
              <div key={r.code} className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <RegionFlag code={r.code} />
                  <span className="text-[13px]">{r.name}</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[12px] tabular text-qs-muted">
                  <span>{formatUsd(r.revenueUsd)}</span>
                  <span className={r.count && r.failed / r.count > 0.05 ? "text-qs-danger" : ""}>
                    {formatPercent((r.count ? r.failed / r.count : 0) * 100)}
                  </span>
                  <span>{Math.round(r.avgLatencyMs)}ms</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Incidents"
            action={
              <Link href="/incidents" className="text-[12px] text-qs-accent">
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
          <CardHeader title="Deployments" />
          <div className="divide-y divide-qs-border">
            {data.deployments.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <div className="font-mono text-[13px]">
                    {d.service}
                    <span className="text-qs-muted">@{d.version}</span>
                  </div>
                  <div className="text-[11px] text-qs-faint">
                    {d.deployedBy} · {formatRelative(d.deployedAt)}
                  </div>
                </div>
                <Badge tone={statusTone(d.status)}>{d.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
