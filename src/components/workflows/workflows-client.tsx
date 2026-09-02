"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatRelative } from "@/lib/format";

type Step = { type: string; tool?: string; team?: string };
type Run = { id: string; status: string; startedAt: string; logJson: string };

type WorkflowRow = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  enabled: boolean;
  lastStatus: string | null;
  lastRunAt: string | null;
  runCount: number;
  steps: Step[];
  triggerState: { matched: boolean; reason: string };
  runs: Run[];
};

export function WorkflowsClient() {
  const queryClient = useQueryClient();
  const list = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => {
      const res = await fetch("/api/workflows");
      return (await res.json()) as { workflows: WorkflowRow[] };
    },
  });
  const run = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/workflows/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      return res.json() as Promise<{ ok?: boolean; error?: string; status?: string }>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflows"] }),
  });

  const workflows = list.data?.workflows ?? [];

  return (
    <div className="px-6 py-5">
      <h1 className="text-[18px] font-medium">Workflows</h1>
      <p className="mt-1 text-[13px] text-qs-muted">
        Playbooks that watch checkout health and deploys, then call the same tools as the analyst.
        Routing changes still need an explicit run.
      </p>
      <div className="mt-4 grid gap-3">
        {workflows.map((wf) => (
          <Card key={wf.id} className="px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[14px] font-medium">{wf.name}</h2>
                  <Badge tone={wf.enabled ? "success" : "neutral"}>{wf.enabled ? "enabled" : "paused"}</Badge>
                  {wf.lastStatus ? <Badge tone={statusTone(wf.lastStatus)}>{wf.lastStatus}</Badge> : null}
                  <Badge tone={wf.triggerState.matched ? "warning" : "neutral"}>
                    {wf.triggerState.matched ? "trigger matched" : "quiet"}
                  </Badge>
                </div>
                <p className="mt-1 max-w-3xl text-[13px] text-qs-muted">{wf.description}</p>
                <div className="mt-2 font-mono text-[11px] text-qs-faint">{wf.trigger}</div>
                <p className="mt-1 max-w-3xl text-[12px] text-qs-muted">{wf.triggerState.reason}</p>
              </div>
              <div className="text-right text-[12px] text-qs-muted">
                <div>{wf.runCount} runs</div>
                <div>{wf.lastRunAt ? formatRelative(wf.lastRunAt) : "never"}</div>
                <Button
                  className="mt-2"
                  size="sm"
                  variant="primary"
                  disabled={run.isPending}
                  onClick={() => run.mutate(wf.id)}
                >
                  {run.isPending && run.variables === wf.id ? "Running…" : "Run playbook"}
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {wf.steps.map((step, i) => (
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
            {wf.runs[0] ? (
              <div className="mt-3 text-[12px] text-qs-faint">
                Last run {formatRelative(wf.runs[0].startedAt)} · {wf.runs[0].status}
              </div>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
