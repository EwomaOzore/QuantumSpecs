import { NextResponse } from "next/server";
import { ingestTraffic } from "@/lib/traffic";
import { tickWorkflows } from "@/lib/workflows";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (secret && header === `Bearer ${secret}`) return true;
  if (request.headers.get("x-vercel-cron") === "1") return true;
  if (process.env.NODE_ENV !== "production" && !secret) return true;
  return false;
}

async function tick() {
  const ingest = await ingestTraffic({ count: 36 });
  const workflows = await tickWorkflows();
  return { ingest, workflows };
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await tick();
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  return GET(request);
}
