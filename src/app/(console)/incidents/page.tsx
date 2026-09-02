import { OpsFilterBar } from "@/components/ops/filter-bar";
import { IncidentsBoard } from "@/components/ops/incidents-board";
import { PageSource } from "@/components/seo/page-source";
import { PageLoader } from "@/components/ui/page-loader";
import { pageMetadata } from "@/lib/site";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/incidents");

export default function IncidentsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div>
        <PageSource path="/incidents" />
        <OpsFilterBar />
        <IncidentsBoard />
      </div>
    </Suspense>
  );
}
