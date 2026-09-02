"use client";

import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SeriesPoint = {
  t: string;
  volume: number;
  revenue: number;
  failed: number;
  failureRate: number;
  avgLatencyMs: number;
};

export function OpsChart({
  data,
  metric = "volume",
}: {
  data: SeriesPoint[];
  metric?: "volume" | "revenue" | "failureRate" | "avgLatencyMs";
}) {
  const color =
    metric === "failureRate" ? "#f07178" : metric === "avgLatencyMs" ? "#e8b84a" : "#2ee6d6";
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#243042" vertical={false} />
          <XAxis
            dataKey="t"
            tickFormatter={(v) => format(new Date(v), "HH:mm")}
            tick={{ fill: "#5d6b7c", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: "#5d6b7c", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={42}
            tickFormatter={(v) =>
              metric === "failureRate" ? `${Math.round(Number(v) * 100)}%` : String(Math.round(Number(v)))
            }
          />
          <Tooltip
            contentStyle={{
              background: "#161d27",
              border: "1px solid #243042",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelFormatter={(v) => format(new Date(String(v)), "dd MMM HH:mm")}
            formatter={(value) => {
              const n = Number(value);
              if (metric === "failureRate") return [`${(n * 100).toFixed(2)}%`, "Failure rate"];
              if (metric === "revenue") return [`$${Math.round(n).toLocaleString()}`, "Revenue"];
              if (metric === "avgLatencyMs") return [`${Math.round(n)}ms`, "Latency"];
              return [Math.round(n), "Volume"];
            }}
          />
          <Area
            type="monotone"
            dataKey={metric}
            stroke={color}
            fill={`url(#fill-${metric})`}
            strokeWidth={1.6}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
