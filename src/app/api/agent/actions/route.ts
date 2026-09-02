import { NextResponse } from "next/server";
import { executeAction } from "@/lib/ai/actions";
import { requireUser } from "@/lib/auth-guard";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const limited = rateLimit(clientKey(request, "action", session.user.id), 30, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited);

  const body = (await request.json()) as {
    tool?: string;
    args?: Record<string, unknown>;
  };
  if (!body.tool) {
    return NextResponse.json({ error: "tool required" }, { status: 400 });
  }
  const result = await executeAction({
    tool: body.tool,
    args: body.args ?? {},
    actor: session.user.name ?? session.user.email ?? "operator",
  });
  return NextResponse.json(result);
}
