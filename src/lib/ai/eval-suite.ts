import { planTools, runLocalInvestigation } from "@/lib/ai/local-analyst";

export type EvalCase = {
  id: string;
  query: string;
  category: string;
  expectedTools: string[];
  expectEvidence?: string[];
  minConfidence?: number;
};

export const EVAL_CASES: EvalCase[] = [
  {
    id: "rev-drop",
    query: "Why did revenue drop?",
    category: "analytics",
    expectedTools: ["get_transaction_metrics"],
    expectEvidence: ["checkout", "fail"],
  },
  {
    id: "failed-tx",
    query: "Find failed transactions",
    category: "search",
    expectedTools: ["get_transaction_metrics"],
    expectEvidence: ["fail"],
  },
  {
    id: "ng-vs-gh",
    query: "Compare Nigeria vs Ghana",
    category: "regions",
    expectedTools: ["compare_regions"],
    expectEvidence: ["Nigeria vs Ghana"],
    minConfidence: 0.9,
  },
  {
    id: "create-inc",
    query: "Create incident",
    category: "actions",
    expectedTools: ["search_incidents", "get_transaction_metrics"],
    expectEvidence: ["Related incidents"],
  },
  {
    id: "summarize-outage",
    query: "Why did checkout failures increase this morning?",
    category: "investigation",
    expectedTools: ["get_transaction_metrics", "get_deployment", "query_logs"],
    expectEvidence: ["API POST", "Payment provider latency"],
    minConfidence: 0.85,
  },
];

export type CaseScore = {
  caseId: string;
  query: string;
  category: string;
  passed: boolean;
  score: number;
  latencyMs: number;
  tokenUsage: number;
  toolsUsed: string[];
  missingTools: string[];
  notes: string;
  failedToolCalls: number;
};

export async function scoreCase(testCase: EvalCase): Promise<CaseScore> {
  const planned = planTools(testCase.query);
  const investigation = await runLocalInvestigation(testCase.query);
  const used = investigation.toolCalls.map((t) => t.name);
  const missingTools = testCase.expectedTools.filter((t) => !used.includes(t) && !planned.some((p) => p.name === t));
  const toolHit =
    testCase.expectedTools.length === 0
      ? 1
      : testCase.expectedTools.filter((t) => used.includes(t)).length / testCase.expectedTools.length;

  const evidenceText = investigation.evidence.map((e) => `${e.title} ${e.detail}`).join(" ").toLowerCase();
  const evidenceHit =
    !testCase.expectEvidence || testCase.expectEvidence.length === 0
      ? 1
      : testCase.expectEvidence.filter((needle) => evidenceText.includes(needle.toLowerCase())).length /
        testCase.expectEvidence.length;

  const confidenceHit =
    testCase.minConfidence == null ? 1 : investigation.confidence >= testCase.minConfidence ? 1 : 0.6;

  const failedToolCalls = investigation.toolCalls.filter((t) => !t.ok).length;
  const hallucinationPenalty = investigation.evidence.length === 0 ? 0.2 : 0;

  const score = Math.max(0, Math.min(1, toolHit * 0.45 + evidenceHit * 0.4 + confidenceHit * 0.15 - hallucinationPenalty));
  const passed = score >= 0.85 && failedToolCalls === 0;

  const notes = [
    `tools ${Math.round(toolHit * 100)}%`,
    `evidence ${Math.round(evidenceHit * 100)}%`,
    `confidence ${Math.round(investigation.confidence * 100)}%`,
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
    toolsUsed: used,
    missingTools,
    notes,
    failedToolCalls,
  };
}

export async function runEvalSuite() {
  const started = Date.now();
  const cases: CaseScore[] = [];
  for (const testCase of EVAL_CASES) {
    cases.push(await scoreCase(testCase));
  }
  const averageScore = cases.reduce((s, c) => s + c.score, 0) / cases.length;
  return {
    agentName: "Operations Analyst",
    model: "quantumspecs-local-analyst",
    averageScore,
    latencyMs: Date.now() - started,
    cases,
  };
}
