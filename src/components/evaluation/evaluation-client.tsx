"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EVAL_CASES } from "@/lib/ai/eval-cases";

type CaseRow = {
  caseId: string;
  query: string;
  passed: boolean;
  score: number;
  latencyMs: number;
  tokenUsage: number;
  notes: string;
  model?: string;
  toolsUsed?: string[];
  promptTokens?: number;
  completionTokens?: number;
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
  const [live, setLive] = useState<CaseRow[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const latest = useQuery({
    queryKey: ["eval"],
    queryFn: async () => {
      const res = await fetch("/api/eval");
      const payload = (await res.json()) as {
        agentName?: string;
        model?: string;
        averageScore?: number;
        cases?: Array<CaseRow & { toolCallsJson?: string }>;
      } | null;
      if (!payload?.cases) return payload as EvalPayload | null;
      return {
        ...payload,
        cases: payload.cases.map((c) => ({
          ...c,
          toolsUsed: c.toolsUsed ?? (c.toolCallsJson ? JSON.parse(c.toolCallsJson) : []),
        })),
      } as EvalPayload;
    },
  });
  const persist = useMutation({
    mutationFn: async (payload: EvalPayload) => {
      const res = await fetch("/api/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["eval"] }),
  });

  const [running, setRunning] = useState(false);

  async function runSuite() {
    setRunning(true);
    setLive([]);
    const cases: CaseRow[] = [];
    try {
      for (const testCase of EVAL_CASES) {
        setStatus(`Scoring “${testCase.query}”…`);
        const res = await fetch("/api/eval/case", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId: testCase.id }),
        });
        if (!res.ok) {
          throw new Error(res.status === 429 ? "Rate limited — wait and retry." : "Case failed to run");
        }
        const scored = (await res.json()) as CaseRow;
        cases.push(scored);
        setLive([...cases]);
      }
      const payload: EvalPayload = {
        agentName: "Operations Analyst",
        model: cases[0]?.model ?? "unknown",
        averageScore: cases.reduce((s, c) => s + c.score, 0) / cases.length,
        cases,
      };
      await persist.mutateAsync(payload);
      setStatus(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Eval failed");
    } finally {
      setRunning(false);
    }
  }

  const data = (
    live && live.length
      ? {
          agentName: "Operations Analyst",
          model: live[0]?.model ?? "unknown",
          averageScore: live.reduce((s, c) => s + c.score, 0) / live.length,
          cases: live,
        }
      : latest.data
  ) as EvalPayload | null;
  const cases = data?.cases ?? [];
  const tokenTotal = cases.reduce((s, c) => s + (c.tokenUsage ?? 0), 0);

  return (
    <div className="px-6 py-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-medium">AI evaluation</h1>
          <p className="mt-1 text-[13px] text-qs-muted">
            Scores the live analyst — gpt-4o when a key is set, otherwise the built-in planner — on tool choice, evidence, latency, and tokens.
          </p>
        </div>
        <Button variant="primary" onClick={() => void runSuite()} disabled={running}>
          {running ? "Running suite…" : "Run test suite"}
        </Button>
      </div>
      {status ? <p className="mt-3 text-[13px] text-qs-accent">{status}</p> : null}

      {data && cases.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-5">
          <Card className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Average accuracy</div>
            <div className="mt-1 font-mono text-[22px] text-qs-accent">
              {((data.averageScore ?? 0) * 100).toFixed(1)}%
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
              {cases.length ? Math.round(cases.reduce((s, c) => s + c.latencyMs, 0) / cases.length) : 0}
              ms
            </div>
          </Card>
          <Card className="px-4 py-3">
            <div className="text-[11px] uppercase tracking-[0.14em] text-qs-faint">Tokens</div>
            <div className="mt-1 font-mono text-[22px]">{tokenTotal}</div>
          </Card>
        </div>
      ) : (
        <p className="mt-6 text-[13px] text-qs-muted">
          Run the suite to score the operations analyst against Kora fixtures. Each case calls the live agent.
        </p>
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
            A case cannot pass if any tool in the trace errored.
          </p>
        </Card>
        <Card className="px-4 py-3">
          <div className="text-[13px] font-medium">Live model</div>
          <p className="mt-1 text-[12px] leading-5 text-qs-muted">
            The suite calls the same agent as the console. gpt-4o is scored when OPENAI_API_KEY is set.
          </p>
        </Card>
      </div>
    </div>
  );
}
