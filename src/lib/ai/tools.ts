import type { ToolName } from "@/lib/ai/types";
import { prisma } from "@/lib/db";
import { getTransactionMetrics } from "@/lib/queries/metrics";
import { spikeWindow } from "@/lib/clock";

export type { ToolName };

export const TOOL_CATALOG: Array<{
  name: ToolName;
  description: string;
  args: Record<string, string>;
}> = [
  {
    name: "get_transaction_metrics",
    description: "Volume, revenue, failure rate and latency for a time window, optionally filtered.",
    args: {
      hours: "lookback hours (default 6)",
      regionCode: "NG|GH|KE|ZA|GB",
      providerSlug: "paystack|flutterwave|mtn-momo|mpesa|stripe|nuban",
      channel: "mobile|web|api",
      status: "succeeded|failed|pending",
    },
  },
  {
    name: "get_customer",
    description: "Fetch a merchant by id or email, plus recent transactions.",
    args: { id: "customer id", email: "customer email", query: "name search" },
  },
  {
    name: "search_customers",
    description: "Search merchants by name, region or risk.",
    args: { query: "text", regionCode: "region", minRisk: "0-1" },
  },
  {
    name: "search_incidents",
    description: "Search incidents by status, severity or text.",
    args: { query: "text", status: "open|investigating|mitigated|resolved", severity: "sev1-4" },
  },
  {
    name: "get_incident",
    description: "Get a single incident with timeline.",
    args: { id: "incident id" },
  },
  {
    name: "get_deployment",
    description: "Recent deployments, optionally for a service or around a timestamp.",
    args: { service: "service name", around: "ISO timestamp" },
  },
  {
    name: "query_logs",
    description: "Search service logs.",
    args: { service: "service", level: "info|warn|error", contains: "text", hours: "lookback" },
  },
  {
    name: "compare_regions",
    description: "Compare regions on revenue, success rate and latency.",
    args: { hours: "lookback hours" },
  },
  {
    name: "get_provider_health",
    description: "Latency and failure rate by payment provider.",
    args: { hours: "lookback", regionCode: "optional region" },
  },
  {
    name: "create_incident",
    description: "Open an incident. Destructive-adjacent; requires operator confirmation.",
    args: { title: "string", severity: "sev1-4", summary: "string", regionCode: "optional" },
  },
  {
    name: "send_notification",
    description: "Notify a team over slack, pagerduty or email.",
    args: { team: "team slug", channel: "slack|pagerduty|email", message: "string" },
  },
  {
    name: "rollback_deployment",
    description: "Roll a service back to its previous version.",
    args: { service: "service name" },
  },
  {
    name: "disable_payment_route",
    description: "Stop sending new traffic to a provider in a region.",
    args: { providerSlug: "slug", regionCode: "NG|GH|KE|ZA|GB", reason: "string" },
  },
];

const WRITE_TOOLS = new Set<ToolName>([
  "create_incident",
  "send_notification",
  "rollback_deployment",
  "disable_payment_route",
]);

export function isWriteTool(name: string) {
  return WRITE_TOOLS.has(name as ToolName);
}

function parseHours(args: Record<string, unknown>, fallback = 6) {
  const n = Number(args.hours ?? fallback);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function regionIdFromCode(code?: string) {
  if (!code) return undefined;
  const region = await prisma.region.findUnique({ where: { code: String(code).toUpperCase() } });
  return region?.id;
}

export async function executeTool(name: string, args: Record<string, unknown>) {
  const now = new Date();
  switch (name as ToolName) {
    case "get_transaction_metrics": {
      const hours = parseHours(args);
      const from = new Date(now.getTime() - hours * 3600 * 1000);
      const regionId = await regionIdFromCode(args.regionCode as string | undefined);
      const provider = args.providerSlug
        ? await prisma.paymentProvider.findUnique({ where: { slug: String(args.providerSlug) } })
        : null;
      return getTransactionMetrics({
        from,
        to: now,
        regionId,
        providerId: provider?.id,
        channel: args.channel as string | undefined,
        status: args.status as string | undefined,
      });
    }
    case "get_customer": {
      const email = args.email ? String(args.email) : undefined;
      const id = args.id ? String(args.id) : undefined;
      const query = args.query ? String(args.query) : undefined;
      const customer = await prisma.customer.findFirst({
        where: {
          OR: [
            id ? { id } : undefined,
            email ? { email } : undefined,
            query ? { name: { contains: query } } : undefined,
            query ? { company: { contains: query } } : undefined,
          ].filter(Boolean) as object[],
        },
        include: { region: true },
      });
      if (!customer) return { found: false };
      const recent = await prisma.transaction.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { provider: true },
      });
      return { found: true, customer, recent };
    }
    case "search_customers": {
      const query = args.query ? String(args.query) : undefined;
      const regionId = await regionIdFromCode(args.regionCode as string | undefined);
      const minRisk = args.minRisk != null ? Number(args.minRisk) : undefined;
      const rows = await prisma.customer.findMany({
        where: {
          ...(regionId ? { regionId } : {}),
          ...(minRisk != null ? { riskScore: { gte: minRisk } } : {}),
          ...(query
            ? {
                OR: [
                  { name: { contains: query } },
                  { company: { contains: query } },
                  { email: { contains: query } },
                ],
              }
            : {}),
        },
        include: { region: true },
        orderBy: { monthlyVolumeUsd: "desc" },
        take: 20,
      });
      return { count: rows.length, customers: rows };
    }
    case "search_incidents": {
      const query = args.query ? String(args.query) : undefined;
      const rows = await prisma.incident.findMany({
        where: {
          ...(args.status ? { status: String(args.status) } : {}),
          ...(args.severity ? { severity: String(args.severity) } : {}),
          ...(query
            ? {
                OR: [{ title: { contains: query } }, { summary: { contains: query } }],
              }
            : {}),
        },
        include: { region: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return { count: rows.length, incidents: rows };
    }
    case "get_incident": {
      const incident = await prisma.incident.findUnique({
        where: { id: String(args.id) },
        include: { region: true, events: { orderBy: { at: "asc" } } },
      });
      return incident ?? { found: false };
    }
    case "get_deployment": {
      const around = args.around ? new Date(String(args.around)) : spikeWindow().deployAt;
      const rows = await prisma.deployment.findMany({
        where: args.service ? { service: String(args.service) } : undefined,
        orderBy: { deployedAt: "desc" },
        take: 8,
      });
      const nearest = rows
        .slice()
        .sort(
          (a, b) =>
            Math.abs(a.deployedAt.getTime() - around.getTime()) -
            Math.abs(b.deployedAt.getTime() - around.getTime()),
        )[0];
      return { around: around.toISOString(), nearest, deployments: rows };
    }
    case "query_logs": {
      const hours = parseHours(args, 6);
      const from = new Date(now.getTime() - hours * 3600 * 1000);
      const contains = args.contains ? String(args.contains) : undefined;
      const rows = await prisma.serviceLog.findMany({
        where: {
          createdAt: { gte: from },
          ...(args.service ? { service: String(args.service) } : {}),
          ...(args.level ? { level: String(args.level) } : {}),
          ...(contains ? { message: { contains } } : {}),
        },
        orderBy: { createdAt: "asc" },
        take: 40,
      });
      return { count: rows.length, logs: rows };
    }
    case "compare_regions": {
      const hours = parseHours(args, 24);
      const from = new Date(now.getTime() - hours * 3600 * 1000);
      const metrics = await getTransactionMetrics({ from, to: now });
      return { hours, regions: metrics.byRegion, overall: metrics };
    }
    case "get_provider_health": {
      const hours = parseHours(args, 6);
      const from = new Date(now.getTime() - hours * 3600 * 1000);
      const regionId = await regionIdFromCode(args.regionCode as string | undefined);
      const metrics = await getTransactionMetrics({ from, to: now, regionId });
      const routes = await prisma.paymentRoute.findMany();
      return {
        hours,
        providers: metrics.byProvider.map((p) => ({
          ...p,
          failureRate: p.count === 0 ? 0 : p.failed / p.count,
          routes: routes.filter((r) => r.providerId === p.providerId),
        })),
      };
    }
    case "create_incident":
    case "send_notification":
    case "rollback_deployment":
    case "disable_payment_route":
      return {
        requiresConfirmation: true,
        tool: name,
        args,
        message: "This action mutates production. Confirm in the UI to execute.",
      };
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
