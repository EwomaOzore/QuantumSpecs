import { Badge, statusTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatRelative } from "@/lib/format";
import { listWorkflows } from "@/lib/queries/ops";

export const dynamic = "force-dynamic";

export default async function WorkflowsPage() {
  const workflows = await listWorkflows();

  return (
    <div className="px-6 py-5">
      <h1 className="text-[18px] font-medium">Workflows</h1>
      <p className="mt-1 text-[13px] text-qs-muted">
        Automated playbooks that call the same tools as the analyst — page, failover, freeze, reconcile.
      </p>
      <div className="mt-4 grid gap-3">
        {workflows.map((wf) => {
          const steps = JSON.parse(wf.stepsJson) as Array<{ type: string; tool?: string; team?: string }>;
          return (
            <Card key={wf.id} className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[14px] font-medium">{wf.name}</h2>
                    <Badge tone={wf.enabled ? "success" : "neutral"}>{wf.enabled ? "enabled" : "paused"}</Badge>
                    {wf.lastStatus ? <Badge tone={statusTone(wf.lastStatus)}>{wf.lastStatus}</Badge> : null}
                  </div>
                  <p className="mt-1 max-w-3xl text-[13px] text-qs-muted">{wf.description}</p>
                  <div className="mt-2 font-mono text-[11px] text-qs-faint">{wf.trigger}</div>
                </div>
                <div className="text-right text-[12px] text-qs-muted">
                  <div>{wf.runCount} runs</div>
                  <div>{wf.lastRunAt ? formatRelative(wf.lastRunAt) : "never"}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {steps.map((step, i) => (
                  <span
                    key={`${wf.id}-${i}`}
                    className="rounded border border-qs-border bg-qs-bg px-2 py-0.5 font-mono text-[11px] text-qs-muted"
                  >
                    {i + 1}. {step.type}
                    {step.tool ? `:${step.tool}` : ""}
                    {step.team ? ` → ${step.team}` : ""}
                  </span>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
