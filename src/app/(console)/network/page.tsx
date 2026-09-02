import { OpsFilterBar } from "@/components/ops/filter-bar";
import { NetworkTable } from "@/components/ops/network-table";
import { PageSource } from "@/components/seo/page-source";
import { PageLoader } from "@/components/ui/page-loader";
import { pageMetadata } from "@/lib/site";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/network");

export default function NetworkPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <PageSource path="/network" />
        <OpsFilterBar />
        <NetworkTable />
      </div>
    </Suspense>
  );
}
