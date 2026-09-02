import { FX_TO_USD, PROVIDERS, REGIONS } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { id } from "@/lib/id";
import { mulberry32, pick } from "@/lib/utils";

function toUsd(amount: number, currency: string) {
  return amount * (FX_TO_USD[currency] ?? 1);
}

function localAmount(usd: number, currency: string) {
  const rate = FX_TO_USD[currency] ?? 1;
  return usd / rate;
}

function methodFor(providerType: string, rng: () => number) {
  if (providerType === "mobile_money") return "momo";
  if (providerType === "bank") return "bank";
  return rng() < 0.08 ? "ussd" : "card";
}

export async function ingestTraffic(opts?: { count?: number; elevatedFail?: boolean }) {
  const count = Math.max(8, Math.min(opts?.count ?? 28, 80));
  const elevatedFail = opts?.elevatedFail ?? false;
  const rng = mulberry32(Date.now() % 2_147_483_647);

  const [customers, regions, providers, routes] = await Promise.all([
    prisma.customer.findMany(),
    prisma.region.findMany(),
    prisma.paymentProvider.findMany(),
    prisma.paymentRoute.findMany(),
  ]);

  if (!customers.length || !regions.length || !providers.length) {
    return { inserted: 0, skipped: true as const, reason: "workspace is empty" };
  }

  const disabled = new Set(routes.filter((r) => !r.enabled).map((r) => `${r.providerId}:${r.regionCode}`));
  const now = Date.now();
  const rows = [];

  for (let i = 0; i < count; i++) {
    const region = pick(rng, regions);
    const merchants = customers.filter((c) => c.regionId === region.id);
    const customer = pick(rng, merchants.length ? merchants : customers);
    const regionDef = REGIONS.find((r) => r.id === region.id);
    const allowed = PROVIDERS.filter((p) => (p.regions as readonly string[]).includes(region.code));
    const providerMeta = pick(rng, allowed.length ? [...allowed] : [...PROVIDERS]);
    const provider = providers.find((p) => p.id === providerMeta.id) ?? pick(rng, providers);

    if (disabled.has(`${provider.id}:${region.code}`)) continue;

    const channelRng = rng();
    const channel = channelRng < 0.52 ? "mobile" : channelRng < 0.82 ? "web" : "api";
    const currency = regionDef?.currency ?? region.currency;
    const usd = 8 + rng() * (customer.segment === "enterprise" ? 420 : 90);
    const amount = localAmount(usd, currency);

    let failP = region.code === "NG" ? 0.021 : 0.018;
    if (channel === "mobile") failP += 0.004;
    if (elevatedFail && region.code === "NG" && provider.slug === "paystack") {
      failP = channel === "mobile" ? 0.28 : 0.12;
    }

    let latency = 90 + Math.floor(rng() * 190);
    if (provider.slug === "paystack") latency += 40;
    if (provider.slug === "mpesa") latency += 70;
    if (elevatedFail && provider.slug === "paystack") latency = Math.round(latency * 1.8);

    let status = "succeeded";
    let errorCode: string | null = null;
    let errorMessage: string | null = null;
    if (customer.riskScore > 0.7 && rng() < 0.12) {
      status = "failed";
      errorCode = "risk_blocked";
      errorMessage = "Velocity + device fingerprint mismatch";
    } else if (rng() < failP) {
      status = "failed";
      if (elevatedFail && provider.slug === "paystack") {
        errorCode = "provider_timeout";
        errorMessage = "Paystack checkout timeout after 12s";
        latency = 11000 + Math.floor(rng() * 1500);
      } else if (rng() < 0.4) {
        errorCode = "insufficient_funds";
        errorMessage = "Issuer declined — insufficient funds";
      } else if (rng() < 0.5) {
        errorCode = "issuer_declined";
        errorMessage = "Issuer declined";
      } else {
        errorCode = "network_error";
        errorMessage = "Upstream network error";
      }
    } else if (rng() < 0.012) {
      status = "pending";
    }

    rows.push({
      id: id("txn"),
      customerId: customer.id,
      regionId: region.id,
      providerId: provider.id,
      amount: Math.round(amount * 100) / 100,
      currency,
      amountUsd: toUsd(amount, currency),
      status,
      method: methodFor(provider.type, rng),
      channel,
      errorCode,
      errorMessage,
      latencyMs: latency,
      endpoint: "/v1/checkout",
      createdAt: new Date(now - Math.floor(rng() * 90_000)),
    });
  }

  if (rows.length) {
    await prisma.transaction.createMany({ data: rows });
  }

  return { inserted: rows.length, skipped: false as const, elevatedFail };
}

export async function ensureFreshTraffic(maxAgeMs = 90_000) {
  const latest = await prisma.transaction.findFirst({ orderBy: { createdAt: "desc" } });
  if (latest && Date.now() - latest.createdAt.getTime() < maxAgeMs) {
    return { inserted: 0, skipped: true as const };
  }
  return ingestTraffic({ count: 24 });
}
