import { NextResponse } from "next/server";
import { EVAL_CASES } from "@/lib/ai/eval-cases";
import { scoreCase } from "@/lib/ai/eval-suite";
import { requireUser } from "@/lib/auth-guard";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const limited = rateLimit(clientKey(request, "eval", session.user.id), 20, 15 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited);

  const body = (await request.json()) as { caseId?: string };
  const testCase = EVAL_CASES.find((c) => c.id === body.caseId);
  if (!testCase) {
    return NextResponse.json({ error: "unknown case" }, { status: 400 });
  }

  const scored = await scoreCase(testCase);
  return NextResponse.json(scored);
}
