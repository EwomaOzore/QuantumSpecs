import type { ToolName } from "@/lib/ai/types";

export type PlannedCall = { name: ToolName; args: Record<string, unknown> };

export function planTools(query: string): PlannedCall[] {
  const text = query.toLowerCase();
  const calls: PlannedCall[] = [];
  const add = (name: ToolName, args: Record<string, unknown> = {}) => {
    if (!calls.some((c) => c.name === name && JSON.stringify(c.args) === JSON.stringify(args))) {
      calls.push({ name, args });
    }
  };

  const regionMatch = text.match(/\b(nigeria|ghana|kenya|south africa|uk|united kingdom|ng|gh|ke|za|gb)\b/);
  const regionMap: Record<string, string> = {
    nigeria: "NG",
    ng: "NG",
    ghana: "GH",
    gh: "GH",
    kenya: "KE",
    ke: "KE",
    "south africa": "ZA",
    za: "ZA",
    uk: "GB",
    gb: "GB",
    "united kingdom": "GB",
  };
  const regionCode = regionMatch ? regionMap[regionMatch[1]] : undefined;

  if (
    /checkout|fail|timeout|error|spike|increase|outage|latency|revenue|drop|transaction/.test(text)
  ) {
    add("get_transaction_metrics", { hours: 6, ...(regionCode ? { regionCode } : {}) });
    add("get_transaction_metrics", { hours: 6, regionCode: "NG", providerSlug: "paystack" });
    add("get_provider_health", { hours: 6 });
  }

  if (/checkout|timeout|deploy|rollback|version|release/.test(text)) {
    add("get_deployment", { service: "checkout-api" });
    add("query_logs", { service: "checkout-api", level: "error", hours: 6, contains: "timeout" });
  }

  if (/compare|vs|versus|region/.test(text) || (regionCode && /ghana|kenya|nigeria/.test(text))) {
    add("compare_regions", { hours: 24 });
  }

  if (/customer|merchant|kyc|fraud|shadowlane|risk/.test(text)) {
    const name = text.match(/shadowlane|harmattan|naijaride|eko electric|london remit/i);
    add("search_customers", name ? { query: name[0] } : { minRisk: 0.6 });
    if (name) add("get_customer", { query: name[0] });
  }

  if (/incident|outage|sev/.test(text)) {
    add("search_incidents", /open|active/.test(text) ? { status: "open" } : {});
    add("get_transaction_metrics", { hours: 6 });
  }

  if (/log/.test(text)) {
    add("query_logs", { hours: 6, level: "error" });
  }

  if (calls.length === 0) {
    add("get_transaction_metrics", { hours: 24 });
    add("compare_regions", { hours: 24 });
    add("search_incidents", {});
  }

  return calls.slice(0, 6);
}
