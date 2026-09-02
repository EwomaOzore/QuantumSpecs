import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { fetchOpsSnapshot, matchTrigger } from "@/lib/workflows";
import { listWorkflows } from "@/lib/queries/ops";
import { parseJson } from "@/lib/json";
import type { WorkflowStep } from "@/lib/workflows";

export const runtime = "nodejs";

export async function GET() {
  const { error } = await requireUser();
  if (error) return error;

  const [workflows, snap] = await Promise.all([listWorkflows(), fetchOpsSnapshot()]);
  return NextResponse.json({
    snapshot: snap,
    workflows: workflows.map((wf) => {
      const trigger = matchTrigger(wf.trigger, snap);
      return {
        ...wf,
        steps: parseJson<WorkflowStep[]>(wf.stepsJson, []),
        triggerState: trigger,
      };
    }),
  });
}
