import { GlobeView } from "@/components/globe/globe-view";
import { PageLoader } from "@/components/ui/page-loader";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function GlobePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <GlobeView />
    </Suspense>
  );
}
