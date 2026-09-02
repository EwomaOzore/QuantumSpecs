import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { runWorkflow } from "@/lib/workflows";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireUser();
  if (error) return error;

  const limited = rateLimit(clientKey(request, "workflow", session.user.id), 20, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited);

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { force?: boolean };
  const result = await runWorkflow(id, {
    mode: "manual",
    actor: session.user.name ?? session.user.email ?? "operator",
    force: body.force,
  });
  return NextResponse.json(result);
}
