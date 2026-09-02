import { OverviewClient } from "@/components/overview/overview-client";
import { OpsFilterBar } from "@/components/ops/filter-bar";
import { getOverview } from "@/lib/queries/metrics";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getOverview();
  return (
    <div>
      <OpsFilterBar />
      <OverviewClient data={JSON.parse(JSON.stringify(data))} />
    </div>
  );
}
