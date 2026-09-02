"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CaseRow = {
  caseId: string;
  query: string;
  passed: boolean;
  score: number;
  latencyMs: number;
  tokenUsage: number;
  notes: string;
  toolsUsed?: string[];
  failedToolCalls?: number;
};

type EvalPayload = {
  agentName: string;
  model: string;
  averageScore: number;
  cases: CaseRow[];
  latencyMs?: number;
};

export function EvaluationClient() {
  const queryClient = useQueryClient();
  const latest = useQuery({
    queryKey: ["eval"],
    queryFn: async () => {
      const res = await fetch("/api/eval");
      return (await res.json()) as (EvalPayload & { cases: Array<CaseRow & { toolCallsJson?: string }> }) | null;
    },
  });
  const run = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/eval", { method: "POST" });
      return (await res.json()) as EvalPayload;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eval"] }),
  });

  const data = (run.data ?? latest.data) as EvalPayload | null;
  const cases = data?.cases ?? [];

  return (
    <div className="px-6 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-medium">AI evaluation</h1>
          <p className="mt-1 text-[13px] text-qs-muted">
            Agent: Operations Analyst. The suite checks tool selection, evidence grounding, latency and failed calls —
            not vibes.
          </p>
        </div>
        <Button variant="primary" onClick={() => run.mutate()} disabled={run.isPending}>
          {run.isPending ? "Running suite…" : "Run test suite"}
        </Button>
      </div>

      {data ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Card className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Average accuracy</div>
            <div className="mt-1 font-mono text-[22px] text-qs-accent">
              {(data.averageScore * 100).toFixed(1)}%
            </div>
          </Card>
          <Card className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Model</div>
            <div className="mt-1 font-mono text-[13px]">{data.model}</div>
          </Card>
          <Card className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Pass rate</div>
            <div className="mt-1 font-mono text-[22px]">
              {cases.filter((c) => c.passed).length}/{cases.length}
            </div>
          </Card>
          <Card className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Mean latency</div>
            <div className="mt-1 font-mono text-[22px]">
              {cases.length
                ? Math.round(cases.reduce((s, c) => s + c.latencyMs, 0) / cases.length)
                : 0}
              ms
            </div>
          </Card>
        </div>
      ) : (
        <p className="mt-6 text-[13px] text-qs-muted">Run the suite to score the operations analyst against Kora fixtures.</p>
      )}

      {cases.length ? (
        <Card className="mt-4">
          <CardHeader title="Test suite" />
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wide text-qs-faint">
              <tr>
                <th className="px-4 py-2 font-medium">Query</th>
                <th className="px-4 py-2 font-medium">Result</th>
                <th className="px-4 py-2 font-medium">Latency</th>
                <th className="px-4 py-2 font-medium">Tokens</th>
                <th className="px-4 py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-qs-border">
              {cases.map((c) => (
                <tr key={c.caseId}>
                  <td className="px-4 py-2.5">{c.query}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={c.passed ? "success" : "danger"}>
                      {c.passed ? "✓" : "×"} {(c.score * 100).toFixed(0)}%
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 font-mono tabular">{c.latencyMs}ms</td>
                  <td className="px-4 py-2.5 font-mono tabular">{c.tokenUsage}</td>
                  <td className="px-4 py-2.5 text-[12px] text-qs-muted">{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Card className="px-4 py-3">
          <div className="text-[13px] font-medium">Hallucination checks</div>
          <p className="mt-1 text-[12px] leading-5 text-qs-muted">
            Evidence must quote tool output. Empty evidence after a successful tool call fails the case.
          </p>
        </Card>
        <Card className="px-4 py-3">
          <div className="text-[13px] font-medium">Failed tool calls</div>
          <p className="mt-1 text-[12px] leading-5 text-qs-muted">
            A case cannot pass if any tool in the trace errored — even if the prose looks confident.
          </p>
        </Card>
        <Card className="px-4 py-3">
          <div className="text-[13px] font-medium">Model comparison</div>
          <p className="mt-1 text-[12px] leading-5 text-qs-muted">
            Set OPENAI_API_KEY to score gpt-4o against the local analyst. Both share the same Kora tools.
          </p>
        </Card>
      </div>
    </div>
  );
}
