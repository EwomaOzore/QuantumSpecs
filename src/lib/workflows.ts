import { executeAction } from "@/lib/ai/actions";
import { executeTool } from "@/lib/ai/tools";
import type { ToolName } from "@/lib/ai/types";
import { prisma } from "@/lib/db";
import { id } from "@/lib/id";
import { getTransactionMetrics } from "@/lib/queries/metrics";

export type WorkflowStep = {
  type: string;
  tool?: string;
  team?: string;
  channel?: string;
  severity?: string;
};

export type TriggerMatch = {
  matched: boolean;
  reason: string;
};

export type OpsSnapshot = {
  last10mFailureRate: number;
  last10mTotal: number;
  last6hFailureRate: number;
  ngPaystackFailRate: number;
  maxProviderLatencyMs: number;
  highRiskFailCount: number;
  utcHour: number;
  recentFailedDeploy: boolean;
};

const AUTO_SKIP_TOOLS = new Set(["disable_payment_route", "rollback_deployment"]);
const COOLDOWN_MS = 90 * 60 * 1000;

export function matchTrigger(trigger: string, snap: OpsSnapshot): TriggerMatch {
  if (trigger.includes("metric.checkout.failure_rate")) {
    const hot =
      (snap.last10mTotal >= 8 && snap.last10mFailureRate > 0.05) ||
      snap.last6hFailureRate > 0.05 ||
      snap.ngPaystackFailRate > 0.08;
    return {
      matched: hot,
      reason: hot
        ? `Checkout error rate is elevated (10m ${(snap.last10mFailureRate * 100).toFixed(1)}%, 6h ${(snap.last6hFailureRate * 100).toFixed(1)}%, Paystack NG ${(snap.ngPaystackFailRate * 100).toFixed(1)}%).`
        : `Checkout is within bounds (10m ${(snap.last10mFailureRate * 100).toFixed(1)}%).`,
    };
  }

  if (trigger.includes("provider.p95_ms")) {
    const hot = snap.maxProviderLatencyMs > 2000 || snap.ngPaystackFailRate > 0.08;
    return {
      matched: hot,
      reason: hot
        ? `Provider latency/failures crossed the failover line (max ${Math.round(snap.maxProviderLatencyMs)}ms).`
        : `Provider latency is ${Math.round(snap.maxProviderLatencyMs)}ms.`,
    };
  }

  if (trigger.includes("customer.declines")) {
    const hot = snap.highRiskFailCount >= 3;
    return {
      matched: hot,
      reason: hot
        ? `${snap.highRiskFailCount} declines on high-risk merchants in the lookback window.`
        : "No velocity anomaly on high-risk merchants.",
    };
  }

  if (trigger.startsWith("cron")) {
    const due = snap.utcHour === 0 || snap.utcHour === 1;
    return {
      matched: due,
      reason: due ? "Nightly reconciliation window (01:30 WAT)." : "Outside the 01:30 WAT window.",
    };
  }

  if (trigger.includes("fx.drift") || trigger.includes("travel_rule")) {
    return { matched: false, reason: "Compliance sweep is paused until enabled." };
  }

  if (snap.recentFailedDeploy) {
    return { matched: true, reason: "A recent deploy is marked failed or rolled back." };
  }

  return { matched: false, reason: "No matching live condition." };
}

export async function fetchOpsSnapshot(): Promise<OpsSnapshot> {
  const now = new Date();
  const tenMin = new Date(now.getTime() - 10 * 60 * 1000);
  const sixH = new Date(now.getTime() - 6 * 3600 * 1000);

  const [last10m, last6h, ngPaystack, highRiskFails, failedDeploy] = await Promise.all([
    getTransactionMetrics({ from: tenMin, to: now }),
    getTransactionMetrics({ from: sixH, to: now }),
    getTransactionMetrics({ from: sixH, to: now, regionId: "reg_ng", providerId: "prov_paystack" }),
    prisma.transaction.count({
      where: {
        status: "failed",
        createdAt: { gte: sixH },
        customer: { riskScore: { gte: 0.7 } },
      },
    }),
    prisma.deployment.findFirst({
      where: { status: { in: ["failed", "rolled_back"] }, deployedAt: { gte: sixH } },
    }),
  ]);

  return {
    last10mFailureRate: last10m.failureRate,
    last10mTotal: last10m.total,
    last6hFailureRate: last6h.failureRate,
    ngPaystackFailRate: ngPaystack.failureRate,
    maxProviderLatencyMs: Math.max(0, ...last6h.byProvider.map((p) => p.avgLatencyMs)),
    highRiskFailCount: highRiskFails,
    utcHour: now.getUTCHours(),
    recentFailedDeploy: Boolean(failedDeploy),
  };
}

type RunMode = "auto" | "manual";

function argsForStep(step: WorkflowStep, workflowName: string): Record<string, unknown> {
  if (step.tool === "create_incident") {
    return {
      title: workflowName,
      severity: step.severity ?? "sev2",
      regionCode: "NG",
      summary: `${workflowName} fired from a QuantumSpecs playbook.`,
    };
  }
  if (step.tool === "disable_payment_route") {
    return {
      providerSlug: "paystack",
      regionCode: "NG",
      reason: `${workflowName} failover`,
    };
  }
  if (step.tool === "rollback_deployment") {
    return { service: "checkout-api" };
  }
  if (step.type === "notify" || step.tool === "send_notification") {
    return {
      team: step.team ?? "payments",
      channel: step.channel ?? "slack",
      message: `${workflowName}: playbook ${step.type}`,
      href: "/workflows",
    };
  }
  return {};
}

type StepLog = { step: number; type: string; tool?: string; ok: boolean; detail: string };

async function executeWorkflowStep(
  step: WorkflowStep,
  index: number,
  workflowName: string,
  actor: string,
  mode: RunMode,
): Promise<StepLog> {
  if (step.type === "query" && step.tool) {
    await executeTool(step.tool as ToolName, { hours: 6, regionCode: "NG" });
    return {
      step: index + 1,
      type: step.type,
      tool: step.tool,
      ok: true,
      detail: "queried live telemetry",
    };
  }

  const tool = step.tool ?? (step.type === "notify" ? "send_notification" : undefined);
  if (!tool) {
    return { step: index + 1, type: step.type, ok: false, detail: "missing tool" };
  }

  if (mode === "auto" && AUTO_SKIP_TOOLS.has(tool)) {
    return {
      step: index + 1,
      type: step.type,
      tool,
      ok: true,
      detail: "skipped — confirm in the console to mutate routing",
    };
  }

  const result = (await executeAction({
    tool,
    args: argsForStep(step, workflowName),
    actor,
  })) as { ok?: boolean; type?: string; error?: string };
  return {
    step: index + 1,
    type: step.type,
    tool,
    ok: Boolean(result.ok),
    detail: result.ok ? (result.type ?? "done") : String(result.error ?? "failed"),
  };
}

export async function runWorkflow(
  workflowId: string,
  opts: { mode: RunMode; actor: string; force?: boolean },
) {
  const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) return { ok: false as const, error: "Workflow not found" };
  if (!workflow.enabled && !opts.force) {
    return { ok: false as const, error: "Workflow is paused" };
  }

  const snap = await fetchOpsSnapshot();
  const trigger = matchTrigger(workflow.trigger, snap);
  if (opts.mode === "auto" && !trigger.matched) {
    return { ok: true as const, skipped: true as const, reason: trigger.reason };
  }
  if (
    opts.mode === "auto" &&
    workflow.lastRunAt &&
    Date.now() - workflow.lastRunAt.getTime() < COOLDOWN_MS
  ) {
    return { ok: true as const, skipped: true as const, reason: "Cooldown — already ran in the last 90 minutes." };
  }

  const steps = JSON.parse(workflow.stepsJson) as WorkflowStep[];
  const log: StepLog[] = [];
  const startedAt = new Date();

  for (let i = 0; i < steps.length; i++) {
    try {
      log.push(await executeWorkflowStep(steps[i]!, i, workflow.name, opts.actor, opts.mode));
    } catch (err) {
      log.push({
        step: i + 1,
        type: steps[i]!.type,
        tool: steps[i]!.tool,
        ok: false,
        detail: err instanceof Error ? err.message : "failed",
      });
    }
  }

  const failed = log.some((entry) => !entry.ok);
  let status = "ok";
  if (failed) status = "error";
  else if (opts.mode === "auto") status = "fired";
  const finishedAt = new Date();

  const run = await prisma.workflowRun.create({
    data: {
      id: id("wfr"),
      workflowId: workflow.id,
      startedAt,
      finishedAt,
      status,
      logJson: JSON.stringify({ mode: opts.mode, trigger, log }),
    },
  });

  await prisma.workflow.update({
    where: { id: workflow.id },
    data: {
      lastRunAt: finishedAt,
      lastStatus: status,
      runCount: { increment: 1 },
    },
  });

  return { ok: true as const, skipped: false as const, status, runId: run.id, trigger, log };
}

export async function tickWorkflows(actor = "QuantumSpecs runner") {
  const workflows = await prisma.workflow.findMany({ where: { enabled: true } });
  const results = [];
  for (const workflow of workflows) {
    results.push(await runWorkflow(workflow.id, { mode: "auto", actor }));
  }
  return results;
}
