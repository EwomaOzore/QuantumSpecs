import Link from "next/link";
import { AgentWorkbench } from "@/components/agent/workbench";
import { PageSource } from "@/components/seo/page-source";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/agent");

export default async function AgentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <div>
      <PageSource path="/agent" className="border-b border-qs-border px-6 pt-4 pb-0" />
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-qs-border px-6 py-4">
        <div>
          <h1 className="text-[18px] font-medium">Operations analyst</h1>
          <p className="mt-1 text-[13px] text-qs-muted">
            The analyst queries Kora telemetry, then shows evidence and actions you can run.
          </p>
        </div>
        <Link href="/agent/runs" className="text-[13px] text-qs-accent">
          Past investigations
        </Link>
      </div>
      <AgentWorkbench initialQuery={q} />
    </div>
  );
}
