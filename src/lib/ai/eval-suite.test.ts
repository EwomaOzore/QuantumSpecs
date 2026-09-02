import { describe, expect, it } from "vitest";
import { scoreInvestigation } from "./eval-score";
import { EVAL_CASES } from "./eval-cases";
import type { Investigation } from "./types";

function investigation(partial: Partial<Investigation>): Investigation {
  return {
    summary: "Checkout failures increased on Paystack Nigeria mobile.",
    evidence: [
      { title: "API POST /v1/checkout", detail: "Failures concentrated in checkout" },
      { title: "Payment provider latency", detail: "Paystack slower than baseline" },
    ],
    suggestedActions: [],
    confidence: 0.93,
    toolCalls: [
      { name: "get_transaction_metrics", args: {}, durationMs: 8, ok: true, result: {} },
      { name: "get_deployment", args: {}, durationMs: 5, ok: true, result: {} },
      { name: "query_logs", args: {}, durationMs: 6, ok: true, result: {} },
    ],
    model: "gpt-4o",
    latencyMs: 1200,
    promptTokens: 800,
    completionTokens: 220,
    ...partial,
  };
}

describe("scoreInvestigation", () => {
  it("passes the outage case when tools and evidence match", () => {
    const testCase = EVAL_CASES.find((c) => c.id === "summarize-outage")!;
    const scored = scoreInvestigation(testCase, investigation({}));
    expect(scored.passed).toBe(true);
    expect(scored.tokenUsage).toBe(1020);
    expect(scored.model).toBe("gpt-4o");
  });

  it("fails when expected tools are missing", () => {
    const testCase = EVAL_CASES.find((c) => c.id === "ng-vs-gh")!;
    const scored = scoreInvestigation(
      testCase,
      investigation({
        toolCalls: [{ name: "get_transaction_metrics", args: {}, durationMs: 4, ok: true, result: {} }],
        evidence: [{ title: "Transaction volume", detail: "quiet" }],
        summary: "No regional comparison",
        confidence: 0.4,
      }),
    );
    expect(scored.missingTools).toContain("compare_regions");
    expect(scored.passed).toBe(false);
  });
});
