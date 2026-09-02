import { OverviewClient } from "@/components/overview/overview-client";
import { OpsFilterBar } from "@/components/ops/filter-bar";
import { PageSource } from "@/components/seo/page-source";
import { PageLoader } from "@/components/ui/page-loader";
import { getOverview } from "@/lib/queries/metrics";
import { pageMetadata } from "@/lib/site";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/");

export default async function OverviewPage() {
  const data = await getOverview();
  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <PageSource path="/" />
        <OpsFilterBar />
        <OverviewClient data={JSON.parse(JSON.stringify(data))} />
      </div>
    </Suspense>
  );
}
