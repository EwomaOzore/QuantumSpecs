import { executeTool, isWriteTool } from "@/lib/ai/tools";
import { planTools } from "@/lib/ai/plan";
import type { AgentEvent, EvidenceItem, Investigation, SuggestedAction, ToolTrace } from "@/lib/ai/types";
import { spikeWindow } from "@/lib/clock";

export { planTools } from "@/lib/ai/plan";

function q(text: string) {
  return text.toLowerCase();
}

function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`;
}

function deltaPct(current: number, baseline: number) {
  if (baseline === 0) return current * 100;
  return ((current - baseline) / baseline) * 100;
}

type Metrics = Awaited<ReturnType<typeof executeTool>> & Record<string, unknown>;

function asMetrics(result: unknown): Metrics | null {
  if (!result || typeof result !== "object") return null;
  const r = result as Record<string, unknown>;
  if (typeof r.failureRate !== "number") return null;
  return r as Metrics;
}

export function synthesize(query: string, traces: ToolTrace[]): Omit<Investigation, "latencyMs" | "promptTokens" | "completionTokens" | "model"> {
  const evidence: EvidenceItem[] = [];
  const actions: SuggestedAction[] = [];
  const metricsCalls = traces.filter((t) => t.name === "get_transaction_metrics" && t.ok);
  const overall = metricsCalls[0] ? asMetrics(metricsCalls[0].result) : null;
  const ngPaystack = metricsCalls.find((t) => {
    const slug = t.args.providerSlug;
    return slug === "paystack";
  });
  const ngPaystackMetrics = ngPaystack ? asMetrics(ngPaystack.result) : null;

  const deploy = traces.find((t) => t.name === "get_deployment");
  const logs = traces.find((t) => t.name === "query_logs");
  const providers = traces.find((t) => t.name === "get_provider_health");
  const regions = traces.find((t) => t.name === "compare_regions");
  const customers = traces.find((t) => t.name === "search_customers" || t.name === "get_customer");
  const incidents = traces.find((t) => t.name === "search_incidents");

  const { start, end, deployAt } = spikeWindow();
  const startLabel = start.toISOString().slice(11, 16);
  const endLabel = end.toISOString().slice(11, 16);

  let summary = "I queried live Kora telemetry. Here is what the tools returned.";
  let confidence = 0.72;

  if (overall && ngPaystackMetrics) {
    const fail = ngPaystackMetrics.failureRate as number;
    const byChannel = (ngPaystackMetrics.byChannel as Array<{ channel: string; count: number; failed: number }>) ?? [];
    const mobile = byChannel.find((c) => c.channel === "mobile");
    const paystackLatency = ngPaystackMetrics.avgLatencyMs as number;
    const overallLatency = overall.avgLatencyMs as number;
    const latencyFactor = overallLatency > 0 ? paystackLatency / overallLatency : 1;
    const failDelta = deltaPct(fail, 0.021);

    summary = `Checkout failures increased ${failDelta.toFixed(1)}% in the ${startLabel}–${endLabel} UTC window, concentrated on Paystack Nigeria mobile checkout.`;
    confidence = 0.93;

    evidence.push({
      title: "API POST /v1/checkout",
      detail: `${pct(fail)} of Paystack NG checkouts failed in the last 6 hours versus a ~2.1% baseline outside the spike.`,
      metric: pct(fail),
    });

    if (mobile) {
      evidence.push({
        title: "Channel concentration",
        detail: `Failures concentrated among mobile users (${mobile.failed} of ${mobile.count} mobile Paystack attempts failed).`,
        metric: pct(mobile.count ? mobile.failed / mobile.count : 0),
      });
    }

    evidence.push({
      title: "Payment provider latency",
      detail: `Paystack average latency ${Math.round(paystackLatency)}ms versus ${Math.round(overallLatency)}ms overall (${latencyFactor.toFixed(1)}×).`,
      metric: `${latencyFactor.toFixed(1)}×`,
    });
  } else if (overall) {
    summary = `Across the last window Kora processed ${overall.total as number} checkouts with a ${pct(overall.failureRate as number)} failure rate and ${Math.round(overall.avgLatencyMs as number)}ms average latency.`;
    evidence.push({
      title: "Transaction volume",
      detail: `${overall.total} transactions, $${Math.round(overall.revenueUsd as number).toLocaleString()} USD revenue.`,
      metric: String(overall.total),
    });
    evidence.push({
      title: "Failure rate",
      detail: `${overall.failed} failed of ${overall.total} (${pct(overall.failureRate as number)}).`,
      metric: pct(overall.failureRate as number),
    });
  }

  if (deploy?.ok && deploy.result && typeof deploy.result === "object") {
    const nearest = (deploy.result as { nearest?: { service: string; version: string; deployedAt: string; changelog: string } }).nearest;
    if (nearest) {
      evidence.push({
        title: "First occurrence / deploy correlation",
        detail: `${nearest.service}@${nearest.version} went live at ${new Date(nearest.deployedAt).toISOString().slice(11, 16)} UTC — ${Math.round((start.getTime() - new Date(nearest.deployedAt).getTime()) / 60000)} minutes before the spike. Changelog: ${nearest.changelog}`,
        metric: nearest.version,
      });
    }
  }

  if (logs?.ok && logs.result && typeof logs.result === "object") {
    const count = (logs.result as { count: number }).count;
    evidence.push({
      title: "Error logs",
      detail: `${count} checkout-api error lines matching timeout in the lookback window, first around ${startLabel} UTC.`,
      metric: String(count),
    });
  }

  if (providers?.ok && providers.result && typeof providers.result === "object") {
    const list = (providers.result as { providers: Array<{ name: string; failureRate: number; avgLatencyMs: number; count: number }> }).providers ?? [];
    const worst = [...list].sort((a, b) => b.failureRate - a.failureRate)[0];
    if (worst) {
      evidence.push({
        title: "Provider health",
        detail: `${worst.name} is the weakest route (${pct(worst.failureRate)} fail, ${Math.round(worst.avgLatencyMs)}ms).`,
        metric: worst.name,
      });
    }
  }

  if (regions?.ok && regions.result && typeof regions.result === "object") {
    const list = (regions.result as { regions: Array<{ name: string; code: string; revenueUsd: number; count: number; failed: number; avgLatencyMs: number }> }).regions ?? [];
    const ranked = [...list].sort((a, b) => b.revenueUsd - a.revenueUsd);
    const ng = list.find((r) => r.code === "NG");
    const gh = list.find((r) => r.code === "GH");
    if (ng && gh) {
      evidence.push({
        title: "Nigeria vs Ghana",
        detail: `Nigeria $${Math.round(ng.revenueUsd).toLocaleString()} / ${pct(ng.count ? ng.failed / ng.count : 0)} fail / ${Math.round(ng.avgLatencyMs)}ms. Ghana $${Math.round(gh.revenueUsd).toLocaleString()} / ${pct(gh.count ? gh.failed / gh.count : 0)} fail / ${Math.round(gh.avgLatencyMs)}ms.`,
      });
    }
    if (ranked.length >= 2) {
      if (/compare|vs|nigeria|ghana/.test(q(query)) && ng && gh) {
        summary = `Nigeria leads Ghana on 24h volume: $${Math.round(ng.revenueUsd).toLocaleString()} vs $${Math.round(gh.revenueUsd).toLocaleString()}. Failure rates ${pct(ng.count ? ng.failed / ng.count : 0)} vs ${pct(gh.count ? gh.failed / gh.count : 0)}.`;
        confidence = 0.96;
      } else if (ranked.length >= 2 && /compare|vs/.test(q(query))) {
        summary = `${ranked[0].name} leads volume at $${Math.round(ranked[0].revenueUsd).toLocaleString()} USD vs ${ranked[1].name} at $${Math.round(ranked[1].revenueUsd).toLocaleString()} over 24h.`;
        confidence = 0.96;
      }
    }
  }

  if (customers?.ok && customers.result && typeof customers.result === "object") {
    const payload = customers.result as {
      customers?: Array<{ name: string; riskScore: number; kycStatus: string; monthlyVolumeUsd: number }>;
      customer?: { name: string; riskScore: number; kycStatus: string; monthlyVolumeUsd: number };
      found?: boolean;
    };
    const list = payload.customers ?? (payload.customer ? [payload.customer] : []);
    if (list.length) {
      const top = list[0];
      evidence.push({
        title: "Merchant",
        detail: `${top.name} — KYC ${top.kycStatus}, risk ${(top.riskScore * 100).toFixed(0)}, ~$${Math.round(top.monthlyVolumeUsd).toLocaleString()}/mo.`,
        metric: top.name,
      });
      if (/customer|merchant|fraud|failed transaction/.test(q(query))) {
        summary = `Highest-signal merchant in this query: ${top.name} (risk ${(top.riskScore * 100).toFixed(0)}, KYC ${top.kycStatus}).`;
        confidence = 0.9;
      }
    }
  }

  if (incidents?.ok && incidents.result && typeof incidents.result === "object") {
    const list = (incidents.result as { incidents: Array<{ title: string; status: string; severity: string }> }).incidents ?? [];
    if (list.length) {
      evidence.push({
        title: "Related incidents",
        detail: list.slice(0, 3).map((i) => `${i.severity.toUpperCase()} ${i.status}: ${i.title}`).join(" · "),
      });
    }
  }

  const wantsCreate = /create incident|open incident|page payments/.test(q(query));
  const checkoutIssue = /checkout|timeout|fail|spike|outage/.test(q(query));

  if (checkoutIssue || wantsCreate) {
    actions.push({
      id: "act_incident",
      label: "Create incident",
      tool: "create_incident",
      risk: "low",
      description: "Open a sev2 for Paystack NG checkout timeouts.",
      args: {
        title: "Paystack NG checkout timeouts",
        severity: "sev2",
        regionCode: "NG",
        summary: `Failure spike ${startLabel}–${endLabel} UTC on POST /v1/checkout. Paystack NG mobile concentrated. checkout-api@2.14.3 deployed ${deployAt.toISOString().slice(11, 16)} UTC.`,
      },
    });
    actions.push({
      id: "act_notify",
      label: "Notify payments team",
      tool: "send_notification",
      risk: "low",
      description: "Page #payments on Slack / PagerDuty.",
      args: {
        team: "payments",
        channel: "pagerduty",
        message: `QuantumSpecs: checkout failures up during ${startLabel}–${endLabel} UTC. Paystack NG mobile timeouts. checkout-api 2.14.3 in the blast radius.`,
        href: "/incidents",
      },
    });
    actions.push({
      id: "act_rollback",
      label: "Roll back deployment",
      tool: "rollback_deployment",
      risk: "high",
      description: "Revert checkout-api 2.14.3 → 2.14.2.",
      args: { service: "checkout-api" },
    });
    actions.push({
      id: "act_route",
      label: "Disable affected payment route",
      tool: "disable_payment_route",
      risk: "high",
      description: "Stop new traffic to Paystack in Nigeria.",
      args: {
        providerSlug: "paystack",
        regionCode: "NG",
        reason: "Checkout timeout spike; shifting volume to Flutterwave/NUBAN",
      },
    });
  }

  if (/create incident/.test(q(query)) && actions.length) {
    summary = "I can open a sev2 incident for the Paystack NG checkout spike. Confirm below to write it into the incident stream.";
    confidence = 1;
  }

  if (evidence.length === 0) {
    evidence.push({
      title: "No strong anomaly",
      detail: "Tools returned data but no single spike crossed the investigation threshold.",
    });
  }

  return {
    summary,
    evidence,
    suggestedActions: actions,
    confidence,
    toolCalls: traces,
  };
}

export async function runLocalInvestigation(
  query: string,
  onEvent?: (event: AgentEvent) => void,
): Promise<Investigation> {
  const started = Date.now();
  onEvent?.({ type: "status", message: "Planning tool calls against Kora telemetry…" });
  const plan = planTools(query);
  const traces: ToolTrace[] = [];

  for (const call of plan) {
    if (isWriteTool(call.name)) continue;
    onEvent?.({ type: "tool_start", name: call.name, args: call.args });
    const t0 = Date.now();
    try {
      const result = await executeTool(call.name, call.args);
      const durationMs = Date.now() - t0;
      traces.push({ name: call.name, args: call.args, durationMs, ok: true, result });
      onEvent?.({ type: "tool_end", name: call.name, durationMs, ok: true });
    } catch (err) {
      const durationMs = Date.now() - t0;
      traces.push({
        name: call.name,
        args: call.args,
        durationMs,
        ok: false,
        result: { error: err instanceof Error ? err.message : "tool failed" },
      });
      onEvent?.({ type: "tool_end", name: call.name, durationMs, ok: false });
    }
  }

  onEvent?.({ type: "status", message: "Synthesizing evidence from tool results…" });
  const synthesized = synthesize(query, traces);
  const investigation: Investigation = {
    ...synthesized,
    model: "quantumspecs-local-analyst",
    latencyMs: Date.now() - started,
    promptTokens: 0,
    completionTokens: Math.round(synthesized.summary.length / 4),
  };
  onEvent?.({ type: "result", investigation });
  return investigation;
}
