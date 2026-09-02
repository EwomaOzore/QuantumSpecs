import { notFound } from "next/navigation";
import { InvestigationReport } from "@/components/agent/investigation-report";
import { PageSource } from "@/components/seo/page-source";
import type { EvidenceItem, Investigation, SuggestedAction, ToolTrace } from "@/lib/ai/types";
import { prisma } from "@/lib/db";
import { parseJson } from "@/lib/json";
import { formatRelative } from "@/lib/format";
import { pageMetadata } from "@/lib/site";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const run = await prisma.agentRun.findUnique({ where: { id }, select: { query: true, summary: true } });
  if (!run) return pageMetadata("/agent/runs", { title: "Investigation not found" });
  return pageMetadata("/agent/runs", {
    title: run.query.slice(0, 70),
    description: run.summary.slice(0, 160),
    path: `/agent/runs/${id}`,
  });
}

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
      <PageSource path="/agent/runs" extra={{ label: run.query }} className="mb-3 px-0 pt-0" />
      <h1 className="text-[18px] font-medium">{run.query}</h1>
      <p className="mt-1 text-[12px] text-qs-faint">{formatRelative(run.createdAt)}</p>
      <div className="mt-6 rounded-lg border border-qs-border bg-qs-surface p-5">
        <InvestigationReport investigation={investigation} />
      </div>
    </div>
  );
}
