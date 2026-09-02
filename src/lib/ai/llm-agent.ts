import { openai } from "@ai-sdk/openai";
import { generateText, jsonSchema, tool } from "ai";
import { executeTool, TOOL_CATALOG, isWriteTool } from "@/lib/ai/tools";
import { synthesize } from "@/lib/ai/local-analyst";
import type { AgentEvent, Investigation, ToolTrace } from "@/lib/ai/types";

const SYSTEM = `You are the QuantumSpecs operations analyst for Kora, a pan-African payments company operating in Nigeria, Ghana, Kenya, South Africa and the UK.

You do not invent metrics. You call tools, then explain what the tools returned.
Prefer get_transaction_metrics, get_provider_health, get_deployment, query_logs and compare_regions.
Never execute write tools yourself; they require a human confirmation in the product.
Be specific: times in UTC, percentages, provider names, regions, versions.
If the user asks why checkout failed this morning, investigate Paystack NG + checkout-api deploys.`;

export async function runLlmAgent(query: string, onEvent?: (event: AgentEvent) => void): Promise<Investigation> {
  const started = Date.now();
  const modelId = process.env.AI_MODEL || "gpt-4o";
  onEvent?.({ type: "status", message: `Routing through ${modelId} with Kora tools…` });

  const traces: ToolTrace[] = [];

  const tools = Object.fromEntries(
    TOOL_CATALOG.filter((t) => !isWriteTool(t.name)).map((spec) => [
      spec.name,
      tool({
        description: spec.description,
        inputSchema: jsonSchema<{ [k: string]: unknown }>({
          type: "object",
          additionalProperties: true,
        }),
        execute: async (args) => {
          const parsed = (args ?? {}) as Record<string, unknown>;
          onEvent?.({ type: "tool_start", name: spec.name, args: parsed });
          const t0 = Date.now();
          try {
            const result = await executeTool(spec.name, parsed);
            const durationMs = Date.now() - t0;
            traces.push({ name: spec.name, args: parsed, durationMs, ok: true, result });
            onEvent?.({ type: "tool_end", name: spec.name, durationMs, ok: true });
            return result;
          } catch (err) {
            const durationMs = Date.now() - t0;
            const payload = { error: err instanceof Error ? err.message : "failed" };
            traces.push({ name: spec.name, args: parsed, durationMs, ok: false, result: payload });
            onEvent?.({ type: "tool_end", name: spec.name, durationMs, ok: false });
            return payload;
          }
        },
      }),
    ]),
  );

  const result = await generateText({
    model: openai(modelId),
    system: SYSTEM,
    prompt: query,
    tools,
  });

  const synthesized = synthesize(query, traces);
  if (result.text?.trim()) {
    synthesized.summary = result.text.trim();
  }

  const investigation: Investigation = {
    ...synthesized,
    model: modelId,
    latencyMs: Date.now() - started,
    promptTokens: result.usage?.inputTokens ?? 0,
    completionTokens: result.usage?.outputTokens ?? 0,
  };
  onEvent?.({ type: "result", investigation });
  return investigation;
}
