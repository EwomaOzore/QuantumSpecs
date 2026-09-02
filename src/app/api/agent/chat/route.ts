import { NextResponse } from "next/server";
import { persistRun, runAgent } from "@/lib/ai/agent";
import type { AgentEvent } from "@/lib/ai/types";
import { requireUser } from "@/lib/auth-guard";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const limited = rateLimit(clientKey(request, "agent", session.user.id), 20, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited);

  const body = (await request.json()) as { query?: string };
  const query = body.query?.trim();
  if (!query) {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgentEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      try {
        const investigation = await runAgent(query, send);
        await persistRun(query, investigation);
      } catch (err) {
        send({
          type: "error",
          message: err instanceof Error ? err.message : "Agent failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
