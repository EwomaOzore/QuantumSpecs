import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { PageSource } from "@/components/seo/page-source";
import { getTimeSeries, getTransactionMetrics } from "@/lib/queries/metrics";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/analytics");

export default async function AnalyticsPage() {
  const now = new Date();
  const from = new Date(now.getTime() - 24 * 3600 * 1000);
  const [metrics, series] = await Promise.all([
    getTransactionMetrics({ from, to: now }),
    getTimeSeries({ from, to: now }, 20),
  ]);
  return (
    <>
      <PageSource path="/analytics" />
      <AnalyticsClient
        initial={JSON.parse(JSON.stringify(metrics))}
        series={JSON.parse(JSON.stringify(series))}
      />
    </>
  );
}
