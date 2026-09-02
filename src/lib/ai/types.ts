export type ToolName =
  | "get_transaction_metrics"
  | "get_customer"
  | "search_customers"
  | "search_incidents"
  | "get_incident"
  | "get_deployment"
  | "query_logs"
  | "compare_regions"
  | "get_provider_health"
  | "create_incident"
  | "send_notification"
  | "rollback_deployment"
  | "disable_payment_route";

export type EvidenceItem = {
  title: string;
  detail: string;
  metric?: string;
};

export type SuggestedAction = {
  id: string;
  label: string;
  tool: string;
  args: Record<string, unknown>;
  risk: "low" | "medium" | "high";
  description: string;
};

export type ToolTrace = {
  name: string;
  args: Record<string, unknown>;
  durationMs: number;
  ok: boolean;
  result: unknown;
};

export type Investigation = {
  summary: string;
  evidence: EvidenceItem[];
  suggestedActions: SuggestedAction[];
  confidence: number;
  toolCalls: ToolTrace[];
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
};

export type AgentEvent =
  | { type: "status"; message: string }
  | { type: "tool_start"; name: string; args: Record<string, unknown> }
  | { type: "tool_end"; name: string; durationMs: number; ok: boolean }
  | { type: "result"; investigation: Investigation }
  | { type: "error"; message: string };
