import { NextResponse } from "next/server";
import { EVAL_CASES } from "@/lib/ai/eval-cases";
import type { CaseScore } from "@/lib/ai/eval-score";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { id } from "@/lib/id";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { error } = await requireUser();
  if (error) return error;

  const body = (await request.json()) as {
    model?: string;
    cases?: CaseScore[];
  };
  if (!body.cases?.length) {
    return NextResponse.json({ error: "cases required" }, { status: 400 });
  }

  const averageScore = body.cases.reduce((s, c) => s + c.score, 0) / body.cases.length;
  const evalRun = await prisma.evalRun.create({
    data: {
      id: id("eval"),
      agentName: "Operations Analyst",
      model: body.model ?? body.cases[0]?.model ?? "unknown",
      averageScore,
      cases: {
        create: body.cases.map((c) => ({
          id: id("ec"),
          caseId: c.caseId,
          query: c.query,
          passed: c.passed,
          score: c.score,
          latencyMs: c.latencyMs,
          tokenUsage: c.tokenUsage,
          toolCallsJson: JSON.stringify(c.toolsUsed ?? []),
          notes: c.notes,
        })),
      },
    },
    include: { cases: true },
  });

  return NextResponse.json({
    id: evalRun.id,
    agentName: evalRun.agentName,
    model: evalRun.model,
    averageScore: evalRun.averageScore,
    cases: body.cases,
  });
}

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const latest = await prisma.evalRun.findFirst({
    orderBy: { createdAt: "desc" },
    include: { cases: true },
  });
  return NextResponse.json(latest);
}

export async function OPTIONS() {
  return NextResponse.json({ cases: EVAL_CASES });
}
