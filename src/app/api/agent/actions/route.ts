import { NextResponse } from "next/server";
import { executeAction } from "@/lib/ai/actions";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    actor: "Ewoma Ozore",
  });
  return NextResponse.json(result);
}
