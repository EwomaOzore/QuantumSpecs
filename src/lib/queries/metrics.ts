import { prisma } from "@/lib/db";
import { spikeWindow } from "@/lib/clock";
import { ensureFreshTraffic } from "@/lib/traffic";

export type MetricFilters = {
  from: Date;
  to: Date;
  regionId?: string;
  providerId?: string;
  status?: string;
  channel?: string;
  customerId?: string;
};

function whereFrom(filters: MetricFilters) {
  return {
    createdAt: { gte: filters.from, lte: filters.to },
    ...(filters.regionId ? { regionId: filters.regionId } : {}),
    ...(filters.providerId ? { providerId: filters.providerId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.channel ? { channel: filters.channel } : {}),
    ...(filters.customerId ? { customerId: filters.customerId } : {}),
  };
}

export async function getTransactionMetrics(filters: MetricFilters) {
  const where = whereFrom(filters);
  const [total, succeeded, failed, pending, aggregates, byRegion, byProvider, byChannel, byError] =
    await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.count({ where: { ...where, status: "succeeded" } }),
      prisma.transaction.count({ where: { ...where, status: "failed" } }),
      prisma.transaction.count({ where: { ...where, status: "pending" } }),
      prisma.transaction.aggregate({
        where,
        _sum: { amountUsd: true },
        _avg: { latencyMs: true },
      }),
      prisma.transaction.groupBy({
        by: ["regionId"],
        where,
        _count: { _all: true },
        _sum: { amountUsd: true },
        _avg: { latencyMs: true },
      }),
      prisma.transaction.groupBy({
        by: ["providerId"],
        where,
        _count: { _all: true },
        _avg: { latencyMs: true },
      }),
      prisma.transaction.groupBy({
        by: ["channel"],
        where,
        _count: { _all: true },
      }),
      prisma.transaction.groupBy({
        by: ["errorCode"],
        where: { ...where, status: "failed" },
        _count: { _all: true },
      }),
    ]);

  const failedByRegion = await prisma.transaction.groupBy({
    by: ["regionId"],
    where: { ...where, status: "failed" },
    _count: { _all: true },
  });
  const failedByProvider = await prisma.transaction.groupBy({
    by: ["providerId"],
    where: { ...where, status: "failed" },
    _count: { _all: true },
  });
  const failedByChannel = await prisma.transaction.groupBy({
    by: ["channel"],
    where: { ...where, status: "failed" },
    _count: { _all: true },
  });

  const [regions, providers] = await Promise.all([
    prisma.region.findMany(),
    prisma.paymentProvider.findMany(),
  ]);
  const regionName = Object.fromEntries(regions.map((r) => [r.id, r]));
  const providerName = Object.fromEntries(providers.map((p) => [p.id, p]));

  const failMap = (rows: { _count: { _all: number } }[], key: string) =>
    Object.fromEntries(rows.map((r) => [(r as Record<string, unknown>)[key] as string, r._count._all]));

  const failedRegionMap = failMap(failedByRegion, "regionId");
  const failedProviderMap = failMap(failedByProvider, "providerId");
  const failedChannelMap = failMap(failedByChannel, "channel");

  const revenueUsd = aggregates._sum.amountUsd ?? 0;
  const failureRate = total === 0 ? 0 : failed / total;

  return {
    from: filters.from.toISOString(),
    to: filters.to.toISOString(),
    total,
    succeeded,
    failed,
    pending,
    revenueUsd,
    failureRate,
    avgLatencyMs: aggregates._avg.latencyMs ?? 0,
    byRegion: byRegion.map((row) => ({
      regionId: row.regionId,
      code: regionName[row.regionId]?.code ?? row.regionId,
      name: regionName[row.regionId]?.name ?? row.regionId,
      count: row._count._all,
      failed: failedRegionMap[row.regionId] ?? 0,
      revenueUsd: row._sum.amountUsd ?? 0,
      avgLatencyMs: row._avg.latencyMs ?? 0,
    })),
    byProvider: byProvider.map((row) => ({
      providerId: row.providerId,
      name: providerName[row.providerId]?.name ?? row.providerId,
      slug: providerName[row.providerId]?.slug ?? row.providerId,
      count: row._count._all,
      failed: failedProviderMap[row.providerId] ?? 0,
      avgLatencyMs: row._avg.latencyMs ?? 0,
    })),
    byChannel: byChannel.map((row) => ({
      channel: row.channel,
      count: row._count._all,
      failed: failedChannelMap[row.channel] ?? 0,
    })),
    byError: byError
      .filter((row) => row.errorCode)
      .map((row) => ({ errorCode: row.errorCode!, count: row._count._all }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getTimeSeries(filters: MetricFilters, bucketMinutes = 15) {
  const txns = await prisma.transaction.findMany({
    where: whereFrom(filters),
    select: {
      createdAt: true,
      amountUsd: true,
      status: true,
      latencyMs: true,
      regionId: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const bucketMs = bucketMinutes * 60 * 1000;
  const start = Math.floor(filters.from.getTime() / bucketMs) * bucketMs;
  const end = filters.to.getTime();
  const buckets: Record<
    number,
    { ts: number; volume: number; revenue: number; failed: number; latencySum: number }
  > = {};

  for (let t = start; t <= end; t += bucketMs) {
    buckets[t] = { ts: t, volume: 0, revenue: 0, failed: 0, latencySum: 0 };
  }

  for (const txn of txns) {
    const key = Math.floor(txn.createdAt.getTime() / bucketMs) * bucketMs;
    const bucket = buckets[key];
    if (!bucket) continue;
    bucket.volume += 1;
    bucket.revenue += txn.amountUsd;
    bucket.latencySum += txn.latencyMs;
    if (txn.status === "failed") bucket.failed += 1;
  }

  return Object.values(buckets)
    .sort((a, b) => a.ts - b.ts)
    .map((b) => ({
      t: new Date(b.ts).toISOString(),
      volume: b.volume,
      revenue: b.revenue,
      failed: b.failed,
      failureRate: b.volume === 0 ? 0 : b.failed / b.volume,
      avgLatencyMs: b.volume === 0 ? 0 : b.latencySum / b.volume,
    }));
}

export async function getOverview() {
  try {
    await ensureFreshTraffic();
  } catch {
    /* keep serving even if ingest is down */
  }
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 3600 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 48 * 3600 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const { start, end, deployAt } = spikeWindow(now);

  const [today, yesterday, week, series, incidents, deployments, routes, alertMetrics] =
    await Promise.all([
      getTransactionMetrics({ from: dayAgo, to: now }),
      getTransactionMetrics({ from: twoDaysAgo, to: dayAgo }),
      getTransactionMetrics({ from: weekAgo, to: now }),
      getTimeSeries({ from: dayAgo, to: now }, 20),
      prisma.incident.findMany({
        include: { region: true, events: { orderBy: { at: "desc" }, take: 3 } },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.deployment.findMany({ orderBy: { deployedAt: "desc" }, take: 6 }),
      prisma.paymentRoute.findMany(),
      getTransactionMetrics({ from: start, to: end, regionId: "reg_ng" }),
    ]);

  const baselineStart = new Date(start.getTime() - 32 * 60 * 1000);
  const baseline = await getTransactionMetrics({
    from: baselineStart,
    to: start,
    regionId: "reg_ng",
  });

  const failureDelta =
    baseline.failureRate === 0
      ? 0
      : ((alertMetrics.failureRate - baseline.failureRate) / baseline.failureRate) * 100;

  return {
    now: now.toISOString(),
    today,
    yesterday,
    week,
    series,
    incidents,
    deployments,
    routes,
    alert: {
      start: start.toISOString(),
      end: end.toISOString(),
      deployAt: deployAt.toISOString(),
      failureDelta,
      spike: alertMetrics,
      baseline,
    },
  };
}
