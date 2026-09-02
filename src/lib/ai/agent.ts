import { prisma } from "@/lib/db";
import { id } from "@/lib/id";
import { runLocalInvestigation } from "@/lib/ai/local-analyst";
import type { AgentEvent, Investigation } from "@/lib/ai/types";

export async function persistRun(query: string, investigation: Investigation) {
  await prisma.agentRun.create({
    data: {
      id: id("run"),
      query,
      summary: investigation.summary,
      evidenceJson: JSON.stringify(investigation.evidence),
      actionsJson: JSON.stringify(investigation.suggestedActions),
      toolCallsJson: JSON.stringify(
        investigation.toolCalls.map((t) => ({
          name: t.name,
          args: t.args,
          durationMs: t.durationMs,
          ok: t.ok,
        })),
      ),
      latencyMs: investigation.latencyMs,
      promptTokens: investigation.promptTokens,
      completionTokens: investigation.completionTokens,
      model: investigation.model,
    },
  });
}

export async function runAgent(query: string, onEvent?: (event: AgentEvent) => void) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const { runLlmAgent } = await import("@/lib/ai/llm-agent");
      return await runLlmAgent(query, onEvent);
    } catch (err) {
      onEvent?.({
        type: "status",
        message: `LLM unavailable (${err instanceof Error ? err.message : "error"}). Falling back to local analyst.`,
      });
    }
  }
  return runLocalInvestigation(query, onEvent);
}
