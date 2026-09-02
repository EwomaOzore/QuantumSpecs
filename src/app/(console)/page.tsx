import { OverviewClient } from "@/components/overview/overview-client";
import { OpsFilterBar } from "@/components/ops/filter-bar";
import { PageLoader } from "@/components/ui/page-loader";
import { getOverview } from "@/lib/queries/metrics";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const data = await getOverview();
  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <OpsFilterBar />
        <OverviewClient data={JSON.parse(JSON.stringify(data))} />
      </div>
    </Suspense>
  );
}
