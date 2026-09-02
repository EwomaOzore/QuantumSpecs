import { prisma } from "@/lib/db";

export async function listIncidents() {
  return prisma.incident.findMany({
    include: {
      region: true,
      events: { orderBy: { at: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIncident(id: string) {
  return prisma.incident.findUnique({
    where: { id },
    include: { region: true, events: { orderBy: { at: "asc" } } },
  });
}

export async function listWorkflows() {
  return prisma.workflow.findMany({
    include: { runs: { orderBy: { startedAt: "desc" }, take: 5 } },
    orderBy: { name: "asc" },
  });
}

export async function listDeployments() {
  return prisma.deployment.findMany({ orderBy: { deployedAt: "desc" } });
}

export async function listRoutes() {
  const [routes, providers] = await Promise.all([
    prisma.paymentRoute.findMany(),
    prisma.paymentProvider.findMany(),
  ]);
  const byId = Object.fromEntries(providers.map((p) => [p.id, p]));
  return routes.map((r) => ({ ...r, provider: byId[r.providerId] }));
}

export async function listTeam() {
  return prisma.teamMember.findMany({ orderBy: { name: "asc" } });
}

export async function listNotifications(take = 12) {
  return prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take });
}

export async function listAgentRuns(take = 12) {
  return prisma.agentRun.findMany({ orderBy: { createdAt: "desc" }, take });
}
