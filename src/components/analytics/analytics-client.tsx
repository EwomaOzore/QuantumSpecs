"use client";

import { useState } from "react";
import { OpsChart, type SeriesPoint } from "@/components/charts/ops-chart";
import { Card, CardHeader } from "@/components/ui/card";
import { RegionFlag } from "@/components/ui/region-flag";
import { formatInt, formatPercent, formatUsd } from "@/lib/format";

type Metrics = {
  total: number;
  failed: number;
  failureRate: number;
  revenueUsd: number;
  avgLatencyMs: number;
  byRegion: Array<{
    code: string;
    name: string;
    count: number;
    failed: number;
    revenueUsd: number;
    avgLatencyMs: number;
  }>;
  byProvider: Array<{
    name: string;
    count: number;
    failed: number;
    avgLatencyMs: number;
  }>;
  byChannel: Array<{ channel: string; count: number; failed: number }>;
  byError: Array<{ errorCode: string; count: number }>;
};

const RANGES = [
  { label: "6h", hours: 6 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
];

export function AnalyticsClient({
  initial,
  series,
}: {
  initial: Metrics;
  series: SeriesPoint[];
}) {
  const [metric, setMetric] = useState<"volume" | "revenue" | "failureRate" | "avgLatencyMs">("volume");
  const [hours, setHours] = useState(24);

  return (
    <div className="px-6 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-medium">Analytics</h1>
          <p className="mt-1 text-[13px] text-qs-muted">
            Checkout, FX corridors and provider reliability across Kora’s five markets.
          </p>
        </div>
        <div className="flex gap-1 rounded-md border border-qs-border p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.hours}
              type="button"
              onClick={() => setHours(r.hours)}
              className={`rounded px-2 py-1 text-[12px] ${hours === r.hours ? "bg-qs-elevated text-qs-text" : "text-qs-muted"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-qs-border bg-qs-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-qs-border px-4 py-2">
          <div className="text-[13px] text-qs-muted">
            {formatInt(initial.total)} txns · {formatUsd(initial.revenueUsd)} ·{" "}
            {formatPercent(initial.failureRate * 100)} fail · {Math.round(initial.avgLatencyMs)}ms
          </div>
          <div className="flex gap-1">
            {(["volume", "revenue", "failureRate", "avgLatencyMs"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`rounded px-2 py-1 text-[11px] ${metric === m ? "bg-qs-hover text-qs-text" : "text-qs-faint"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="px-2 py-2">
          <OpsChart data={series} metric={metric} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="By region" />
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wide text-qs-faint">
              <tr>
                <th className="px-4 py-2 font-medium">Market</th>
                <th className="px-4 py-2 font-medium">Volume</th>
                <th className="px-4 py-2 font-medium">Revenue</th>
                <th className="px-4 py-2 font-medium">Fail</th>
                <th className="px-4 py-2 font-medium">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-qs-border">
              {initial.byRegion.map((r) => (
                <tr key={r.code}>
                  <td className="px-4 py-2">
                    <RegionFlag code={r.code} /> {r.name}
                  </td>
                  <td className="px-4 py-2 font-mono tabular">{formatInt(r.count)}</td>
                  <td className="px-4 py-2 font-mono tabular">{formatUsd(r.revenueUsd)}</td>
                  <td className="px-4 py-2 font-mono tabular">
                    {formatPercent((r.count ? r.failed / r.count : 0) * 100)}
                  </td>
                  <td className="px-4 py-2 font-mono tabular">{Math.round(r.avgLatencyMs)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <CardHeader title="By provider" />
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wide text-qs-faint">
              <tr>
                <th className="px-4 py-2 font-medium">Provider</th>
                <th className="px-4 py-2 font-medium">Volume</th>
                <th className="px-4 py-2 font-medium">Fail</th>
                <th className="px-4 py-2 font-medium">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-qs-border">
              {initial.byProvider.map((p) => (
                <tr key={p.name}>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2 font-mono tabular">{formatInt(p.count)}</td>
                  <td className="px-4 py-2 font-mono tabular">
                    {formatPercent((p.count ? p.failed / p.count : 0) * 100)}
                  </td>
                  <td className="px-4 py-2 font-mono tabular">{Math.round(p.avgLatencyMs)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Channel mix" />
          <div className="divide-y divide-qs-border">
            {initial.byChannel.map((c) => (
              <div key={c.channel} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                <span className="capitalize">{c.channel}</span>
                <span className="font-mono text-qs-muted tabular">
                  {formatInt(c.count)} · {formatPercent((c.count ? c.failed / c.count : 0) * 100)} fail
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Top error codes" />
          <div className="divide-y divide-qs-border">
            {initial.byError.slice(0, 6).map((e) => (
              <div key={e.errorCode} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
                <span className="font-mono">{e.errorCode}</span>
                <span className="font-mono text-qs-muted tabular">{formatInt(e.count)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
