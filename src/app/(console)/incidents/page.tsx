import { OpsFilterBar } from "@/components/ops/filter-bar";
import { IncidentsBoard } from "@/components/ops/incidents-board";
import { PageLoader } from "@/components/ui/page-loader";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function IncidentsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <OpsFilterBar />
        <IncidentsBoard />
      </div>
    </Suspense>
  );
}
