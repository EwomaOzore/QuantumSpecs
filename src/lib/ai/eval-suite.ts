import { runAgent } from "@/lib/ai/agent";
import { EVAL_CASES, type EvalCase } from "@/lib/ai/eval-cases";
import { scoreInvestigation, type CaseScore } from "@/lib/ai/eval-score";

export type { EvalCase, CaseScore };
export { EVAL_CASES, scoreInvestigation };

export async function scoreCase(testCase: EvalCase): Promise<CaseScore> {
  const investigation = await runAgent(testCase.query);
  return scoreInvestigation(testCase, investigation);
}

export async function runEvalSuite() {
  const started = Date.now();
  const cases: CaseScore[] = [];
  for (const testCase of EVAL_CASES) {
    cases.push(await scoreCase(testCase));
  }
  const averageScore = cases.reduce((s, c) => s + c.score, 0) / cases.length;
  const model = cases[0]?.model ?? (process.env.AI_MODEL || "gpt-4o");
  return {
    agentName: "Operations Analyst",
    model,
    averageScore,
    latencyMs: Date.now() - started,
    promptTokens: cases.reduce((s, c) => s + c.promptTokens, 0),
    completionTokens: cases.reduce((s, c) => s + c.completionTokens, 0),
    cases,
  };
}
