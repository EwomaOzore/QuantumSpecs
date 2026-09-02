import { OpsFilterBar } from "@/components/ops/filter-bar";
import { NetworkTable } from "@/components/ops/network-table";
import { PageLoader } from "@/components/ui/page-loader";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function NetworkPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <OpsFilterBar />
        <NetworkTable />
      </div>
    </Suspense>
  );
}
