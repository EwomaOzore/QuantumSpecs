import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { clientKey, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { ingestTraffic } from "@/lib/traffic";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { session, error } = await requireUser();
  if (error) return error;

  const limited = rateLimit(clientKey(request, "ingest", session.user.id), 10, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited);

  const body = (await request.json().catch(() => ({}))) as { count?: number; elevatedFail?: boolean };
  const result = await ingestTraffic({
    count: body.count,
    elevatedFail: body.elevatedFail,
  });
  return NextResponse.json(result);
}
