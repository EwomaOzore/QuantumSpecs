import { GlobeView } from "@/components/globe/globe-view";
import { PageSource } from "@/components/seo/page-source";
import { PageLoader } from "@/components/ui/page-loader";
import { pageMetadata } from "@/lib/site";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/globe");

export default function GlobePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <div className="flex h-[calc(100dvh-3rem)] min-h-0 flex-col">
        <PageSource path="/globe" className="border-b border-qs-border px-4 py-2" />
        <div className="min-h-0 flex-1">
          <GlobeView />
        </div>
      </div>
    </Suspense>
  );
}
