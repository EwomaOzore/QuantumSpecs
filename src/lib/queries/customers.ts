import { prisma } from "@/lib/db";

export async function listCustomers(opts?: {
  q?: string;
  region?: string;
  kyc?: string;
  segment?: string;
}) {
  const region = opts?.region
    ? await prisma.region.findUnique({ where: { code: opts.region } })
    : null;

  return prisma.customer.findMany({
    where: {
      ...(region ? { regionId: region.id } : {}),
      ...(opts?.kyc ? { kycStatus: opts.kyc } : {}),
      ...(opts?.segment ? { segment: opts.segment } : {}),
      ...(opts?.q
        ? {
            OR: [
              { name: { contains: opts.q } },
              { company: { contains: opts.q } },
              { email: { contains: opts.q } },
            ],
          }
        : {}),
    },
    include: { region: true },
    orderBy: { monthlyVolumeUsd: "desc" },
  });
}

export async function getCustomer(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { region: true },
  });
  if (!customer) return null;
  const [transactions, failed] = await Promise.all([
    prisma.transaction.findMany({
      where: { customerId: id },
      include: { provider: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.transaction.count({ where: { customerId: id, status: "failed" } }),
  ]);
  const total = await prisma.transaction.count({ where: { customerId: id } });
  return { customer, transactions, failed, total };
}
