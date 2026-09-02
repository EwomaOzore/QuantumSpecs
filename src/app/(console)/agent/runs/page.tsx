import Link from "next/link";
import { PageSource } from "@/components/seo/page-source";
import { Card } from "@/components/ui/card";
import { formatRelative } from "@/lib/format";
import { listAgentRuns } from "@/lib/queries/ops";
import { pageMetadata } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("/agent/runs");

export default async function AgentRunsPage() {
  const runs = await listAgentRuns(40);

  return (
    <div className="px-6 py-5">
      <PageSource path="/agent/runs" className="mb-3 px-0 pt-0" />
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-medium">Past investigations</h1>
          <p className="mt-1 text-[13px] text-qs-muted">
            Every analyst run is stored with tools, latency, and token usage.
          </p>
        </div>
        <Link href="/agent" className="text-[13px] text-qs-accent">
          New investigation
        </Link>
      </div>
      <Card className="mt-4">
        {runs.length === 0 ? (
          <p className="px-4 py-8 text-[13px] text-qs-muted">No investigations yet. Ask the analyst from Overview or ⌘K.</p>
        ) : (
          <div className="divide-y divide-qs-border">
            {runs.map((run) => (
              <Link
                key={run.id}
                href={`/agent/runs/${run.id}`}
                className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-qs-hover"
              >
                <div className="min-w-0">
                  <div className="truncate text-[14px]">{run.query}</div>
                  <p className="mt-1 line-clamp-2 text-[12px] text-qs-muted">{run.summary}</p>
                </div>
                <div className="shrink-0 text-right font-mono text-[11px] text-qs-faint">
                  <div>{run.model}</div>
                  <div>{run.latencyMs}ms · {run.promptTokens + run.completionTokens} tok</div>
                  <div>{formatRelative(run.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
