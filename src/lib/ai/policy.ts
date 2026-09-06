/** Paid OpenAI calls stay off unless AI_BILLING=1 is set on purpose. */
export function paidAiEnabled() {
  return process.env.AI_BILLING === "1" && Boolean(process.env.OPENAI_API_KEY);
}

export function analystModelLabel() {
  if (paidAiEnabled()) return process.env.AI_MODEL || "gpt-4o";
  return "local-analyst";
}

export const MAX_AGENT_QUERY_CHARS = 2_000;
