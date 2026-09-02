import type { EvalCase } from "@/lib/ai/eval-cases";
import type { Investigation } from "@/lib/ai/types";

export type CaseScore = {
  caseId: string;
  query: string;
  category: string;
  passed: boolean;
  score: number;
  latencyMs: number;
  tokenUsage: number;
  promptTokens: number;
  completionTokens: number;
  model: string;
  toolsUsed: string[];
  missingTools: string[];
  notes: string;
  failedToolCalls: number;
};

export function scoreInvestigation(testCase: EvalCase, investigation: Investigation): CaseScore {
  const used = investigation.toolCalls.map((t) => t.name);
  const missingTools = testCase.expectedTools.filter((t) => !used.includes(t));
  const toolHit =
    testCase.expectedTools.length === 0
      ? 1
      : testCase.expectedTools.filter((t) => used.includes(t)).length / testCase.expectedTools.length;

  const evidenceText = [
    investigation.summary,
    ...investigation.evidence.map((e) => `${e.title} ${e.detail}`),
  ]
    .join(" ")
    .toLowerCase();
  const evidenceHit =
    !testCase.expectEvidence || testCase.expectEvidence.length === 0
      ? 1
      : testCase.expectEvidence.filter((needle) => evidenceText.includes(needle.toLowerCase())).length /
        testCase.expectEvidence.length;

  const confidenceHit =
    testCase.minConfidence == null ? 1 : investigation.confidence >= testCase.minConfidence ? 1 : 0.6;

  const failedToolCalls = investigation.toolCalls.filter((t) => !t.ok).length;
  const hallucinationPenalty = investigation.evidence.length === 0 ? 0.2 : 0;

  const score = Math.max(
    0,
    Math.min(1, toolHit * 0.45 + evidenceHit * 0.4 + confidenceHit * 0.15 - hallucinationPenalty),
  );
  const passed = score >= 0.85 && failedToolCalls === 0;

  const notes = [
    `tools ${Math.round(toolHit * 100)}%`,
    `evidence ${Math.round(evidenceHit * 100)}%`,
    `confidence ${Math.round(investigation.confidence * 100)}%`,
    `${investigation.promptTokens + investigation.completionTokens} tokens`,
    failedToolCalls ? `${failedToolCalls} failed tool calls` : "no failed tools",
  ].join(" · ");

  return {
    caseId: testCase.id,
    query: testCase.query,
    category: testCase.category,
    passed,
    score,
    latencyMs: investigation.latencyMs,
    tokenUsage: investigation.promptTokens + investigation.completionTokens,
    promptTokens: investigation.promptTokens,
    completionTokens: investigation.completionTokens,
    model: investigation.model,
    toolsUsed: used,
    missingTools,
    notes,
    failedToolCalls,
  };
}
