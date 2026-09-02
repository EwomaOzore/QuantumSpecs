import { OverviewClient } from "@/components/overview/overview-client";
import { getOverview } from "@/lib/queries/metrics";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getOverview();
  return <OverviewClient data={JSON.parse(JSON.stringify(data))} />;
}
