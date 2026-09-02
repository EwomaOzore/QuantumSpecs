import Link from "next/link";
import { notFound } from "next/navigation";
import { InvestigationReport } from "@/components/agent/investigation-report";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { formatRelative } from "@/lib/format";
import type { EvidenceItem, Investigation, SuggestedAction, ToolTrace } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

export default async function AgentRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await prisma.agentRun.findUnique({ where: { id } });
  if (!run) notFound();

  const investigation: Investigation = {
    summary: run.summary,
    evidence: parseJson<EvidenceItem[]>(run.evidenceJson, []),
    suggestedActions: parseJson<SuggestedAction[]>(run.actionsJson, []),
    confidence: run.confidence,
    toolCalls: parseJson<ToolTrace[]>(run.toolCallsJson, []).map((t) => ({
      ...t,
      result: t.result ?? {},
    })),
    model: run.model,
    latencyMs: run.latencyMs,
    promptTokens: run.promptTokens,
    completionTokens: run.completionTokens,
  };

  return (
    <div className="px-6 py-5">
      <Link href="/agent/runs" className="text-[13px] text-qs-accent">
        ← All investigations
      </Link>
      <h1 className="mt-3 text-[18px] font-medium">{run.query}</h1>
      <p className="mt-1 text-[12px] text-qs-faint">{formatRelative(run.createdAt)}</p>
      <div className="mt-6 rounded-lg border border-qs-border bg-qs-surface p-5">
        <InvestigationReport investigation={investigation} />
      </div>
    </div>
  );
}
