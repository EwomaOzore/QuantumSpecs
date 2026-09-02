import { NextResponse } from "next/server";
import { getOverview, getTimeSeries, getTransactionMetrics } from "@/lib/queries/metrics";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "overview";
  const hours = Number(url.searchParams.get("hours") ?? 24);
  const regionId = url.searchParams.get("regionId") ?? undefined;
  const now = new Date();
  const from = new Date(now.getTime() - hours * 3600 * 1000);

  if (view === "series") {
    const series = await getTimeSeries({ from, to: now, regionId }, hours <= 24 ? 20 : 60);
    return NextResponse.json({ series });
  }
  if (view === "metrics") {
    const metrics = await getTransactionMetrics({ from, to: now, regionId });
    return NextResponse.json(metrics);
  }
  const overview = await getOverview();
  return NextResponse.json(overview);
}
