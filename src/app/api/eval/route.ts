import { NextResponse } from "next/server";
import { runEvalSuite } from "@/lib/ai/eval-suite";
import { prisma } from "@/lib/db";
import { id } from "@/lib/id";

export const runtime = "nodejs";

export async function POST() {
  const result = await runEvalSuite();
  const evalRun = await prisma.evalRun.create({
    data: {
      id: id("eval"),
      agentName: result.agentName,
      model: result.model,
      averageScore: result.averageScore,
      cases: {
        create: result.cases.map((c) => ({
          id: id("ec"),
          caseId: c.caseId,
          query: c.query,
          passed: c.passed,
          score: c.score,
          latencyMs: c.latencyMs,
          tokenUsage: c.tokenUsage,
          toolCallsJson: JSON.stringify(c.toolsUsed),
          notes: c.notes,
        })),
      },
    },
    include: { cases: true },
  });
  return NextResponse.json({ ...result, id: evalRun.id });
}

export async function GET() {
  const latest = await prisma.evalRun.findFirst({
    orderBy: { createdAt: "desc" },
    include: { cases: true },
  });
  return NextResponse.json(latest);
}
