import { prisma } from "@/lib/db";
import { id } from "@/lib/id";

export type ActionRequest = {
  tool: string;
  args: Record<string, unknown>;
  actor?: string;
};

async function pushInbox(input: {
  team: string;
  channel: string;
  message: string;
  href?: string;
  createdAt?: Date;
}) {
  return prisma.notification.create({
    data: {
      id: id("ntf"),
      team: input.team,
      channel: input.channel,
      message: input.message,
      createdAt: input.createdAt ?? new Date(),
      status: "sent",
      href: input.href,
    },
  });
}

export async function executeAction(request: ActionRequest) {
  const actor = request.actor ?? "Ewoma Ozore";
  const now = new Date();

  switch (request.tool) {
    case "create_incident": {
      const regionCode = request.args.regionCode ? String(request.args.regionCode) : undefined;
      const region = regionCode
        ? await prisma.region.findUnique({ where: { code: regionCode.toUpperCase() } })
        : null;
      const title = String(request.args.title ?? "Untitled incident");
      const incident = await prisma.incident.create({
        data: {
          id: id("inc"),
          title,
          severity: String(request.args.severity ?? "sev2"),
          status: "investigating",
          regionId: region?.id,
          summary: String(request.args.summary ?? ""),
          createdAt: now,
          createdBy: actor,
          assignee: actor,
          events: {
            create: {
              id: id("evt"),
              at: now,
              actor,
              kind: "status",
              message: "Incident opened from QuantumSpecs agent.",
            },
          },
        },
      });
      await pushInbox({
        team: "payments",
        channel: "pagerduty",
        message: `${incident.severity.toUpperCase()} opened: ${incident.title}`,
        href: `/incidents/${incident.id}`,
      });
      return { ok: true, type: "incident", id: incident.id, title: incident.title };
    }
    case "send_notification": {
      const notification = await pushInbox({
        team: String(request.args.team ?? "payments"),
        channel: String(request.args.channel ?? "slack"),
        message: String(request.args.message ?? ""),
        href: request.args.href ? String(request.args.href) : "/incidents",
      });
      return {
        ok: true,
        type: "notification",
        id: notification.id,
        team: notification.team,
        channel: notification.channel,
      };
    }
    case "rollback_deployment": {
      const service = String(request.args.service ?? "checkout-api");
      const current = await prisma.deployment.findFirst({
        where: { service, status: "live" },
        orderBy: { deployedAt: "desc" },
      });
      if (!current?.previousVersion) {
        return { ok: false, error: `No live deployment with a previous version for ${service}` };
      }
      await prisma.deployment.update({
        where: { id: current.id },
        data: { status: "rolled_back" },
      });
      const rolled = await prisma.deployment.create({
        data: {
          id: id("dep"),
          service,
          version: current.previousVersion,
          previousVersion: current.version,
          environment: "production",
          status: "live",
          deployedAt: now,
          deployedBy: actor,
          changelog: `Rollback of ${current.version} → ${current.previousVersion} via QuantumSpecs`,
          sha: `rb-${current.sha}`,
        },
      });
      await pushInbox({
        team: "platform",
        channel: "slack",
        message: `${service} rolled back ${current.version} → ${rolled.version} by ${actor}`,
        href: "/",
      });
      return {
        ok: true,
        type: "rollback",
        service,
        from: current.version,
        to: rolled.version,
        id: rolled.id,
      };
    }
    case "disable_payment_route": {
      const providerSlug = String(request.args.providerSlug ?? "");
      const regionCode = String(request.args.regionCode ?? "").toUpperCase();
      const provider = await prisma.paymentProvider.findUnique({ where: { slug: providerSlug } });
      if (!provider) return { ok: false, error: `Unknown provider ${providerSlug}` };
      const route = await prisma.paymentRoute.findFirst({
        where: { providerId: provider.id, regionCode },
      });
      if (!route) return { ok: false, error: `No route ${providerSlug}/${regionCode}` };
      await prisma.paymentRoute.update({
        where: { id: route.id },
        data: {
          enabled: false,
          disabledAt: now,
          disabledReason: String(request.args.reason ?? "Disabled from QuantumSpecs agent"),
        },
      });
      await pushInbox({
        team: "payments",
        channel: "slack",
        message: `${provider.name} ${regionCode} route disabled. ${String(request.args.reason ?? "")}`.trim(),
        href: "/settings",
      });
      return {
        ok: true,
        type: "route",
        provider: provider.name,
        regionCode,
        enabled: false,
      };
    }
    default:
      return { ok: false, error: `Unknown action ${request.tool}` };
  }
}
