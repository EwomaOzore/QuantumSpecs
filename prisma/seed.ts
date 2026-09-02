import { PrismaClient } from "../src/generated/prisma";
import { FX_TO_USD, PROVIDERS, REGIONS, SERVICES } from "../src/lib/constants";
import { spikeWindow } from "../src/lib/clock";
import { id } from "../src/lib/id";
import { mulberry32, pick } from "../src/lib/utils";

const prisma = new PrismaClient();
const rng = mulberry32(20260902);

function between(min: number, max: number) {
  return min + rng() * (max - min);
}

function int(min: number, max: number) {
  return Math.floor(between(min, max + 1));
}

const MERCHANTS = [
  { name: "Harmattan Coffee Co", company: "Harmattan Coffee Co", region: "NG", segment: "growth", volume: 182_400, risk: 0.12 },
  { name: "Lagos Island Provisions", company: "LIP Markets Ltd", region: "NG", segment: "enterprise", volume: 940_200, risk: 0.08 },
  { name: "NaijaRide", company: "NaijaRide Mobility", region: "NG", segment: "enterprise", volume: 1_240_000, risk: 0.21 },
  { name: "Wuse Market Collective", company: "Wuse Collective", region: "NG", segment: "growth", volume: 88_300, risk: 0.34 },
  { name: "Eko Electric", company: "Eko Electric Billing", region: "NG", segment: "enterprise", volume: 2_110_000, risk: 0.05 },
  { name: "Yaba Tech Hub", company: "Yaba Tech Hub", region: "NG", segment: "startup", volume: 41_200, risk: 0.18 },
  { name: "Port Harcourt Energy", company: "PH Energy Pay", region: "NG", segment: "enterprise", volume: 670_000, risk: 0.11 },
  { name: "Ibadan MedSupply", company: "Ibadan MedSupply", region: "NG", segment: "growth", volume: 156_000, risk: 0.16 },
  { name: "Abuja Civic Pay", company: "FCT Civic Collections", region: "NG", segment: "enterprise", volume: 510_000, risk: 0.04 },
  { name: "Enugu Grain Exchange", company: "Enugu Grain Exchange", region: "NG", segment: "growth", volume: 73_400, risk: 0.29 },
  { name: "Lekki Sunset Retail", company: "Lekki Sunset Retail", region: "NG", segment: "startup", volume: 22_800, risk: 0.41 },
  { name: "Kano Textiles Direct", company: "Kano Textiles Direct", region: "NG", segment: "growth", volume: 119_000, risk: 0.22 },
  { name: "Accra Solar Grid", company: "Accra Solar Grid", region: "GH", segment: "enterprise", volume: 420_000, risk: 0.09 },
  { name: "Kumasi Cocoa Direct", company: "Kumasi Cocoa Direct", region: "GH", segment: "enterprise", volume: 610_000, risk: 0.07 },
  { name: "Tamale Logistics", company: "Tamale Logistics", region: "GH", segment: "growth", volume: 94_000, risk: 0.19 },
  { name: "Cape Coast Fisheries", company: "Cape Coast Fisheries", region: "GH", segment: "growth", volume: 61_500, risk: 0.27 },
  { name: "Labone Retail", company: "Labone Retail Group", region: "GH", segment: "startup", volume: 28_400, risk: 0.33 },
  { name: "Nairobi Last Mile", company: "Nairobi Last Mile", region: "KE", segment: "enterprise", volume: 780_000, risk: 0.14 },
  { name: "Mombasa Port Trade", company: "Mombasa Port Trade", region: "KE", segment: "enterprise", volume: 530_000, risk: 0.1 },
  { name: "Kisumu AgriPay", company: "Kisumu AgriPay", region: "KE", segment: "growth", volume: 112_000, risk: 0.24 },
  { name: "Westlands Clinic", company: "Westlands Clinic", region: "KE", segment: "growth", volume: 86_000, risk: 0.13 },
  { name: "Nakuru Fuels", company: "Nakuru Fuels", region: "KE", segment: "growth", volume: 143_000, risk: 0.17 },
  { name: "Cape Vineyards Direct", company: "Cape Vineyards Direct", region: "ZA", segment: "enterprise", volume: 390_000, risk: 0.06 },
  { name: "Joburg Transit Pay", company: "Joburg Transit Pay", region: "ZA", segment: "enterprise", volume: 860_000, risk: 0.08 },
  { name: "Durban Port Agents", company: "Durban Port Agents", region: "ZA", segment: "growth", volume: 174_000, risk: 0.15 },
  { name: "Pretoria Civic", company: "Pretoria Civic Collections", region: "ZA", segment: "enterprise", volume: 240_000, risk: 0.05 },
  { name: "Stellenbosch Cellars", company: "Stellenbosch Cellars", region: "ZA", segment: "startup", volume: 47_000, risk: 0.2 },
  { name: "Peckham Diaspora Market", company: "Peckham Diaspora Market", region: "GB", segment: "growth", volume: 210_000, risk: 0.11 },
  { name: "Manchester AfroGrocers", company: "Manchester AfroGrocers", region: "GB", segment: "growth", volume: 96_000, risk: 0.18 },
  { name: "London Remit Hub", company: "London Remit Hub", region: "GB", segment: "enterprise", volume: 1_450_000, risk: 0.23 },
  { name: "Birmingham Traders", company: "Birmingham Traders Co-op", region: "GB", segment: "startup", volume: 38_000, risk: 0.31 },
  { name: "Canary FX Desk", company: "Canary FX Desk", region: "GB", segment: "enterprise", volume: 2_040_000, risk: 0.09 },
  { name: "Shadowlane Imports", company: "Shadowlane Imports", region: "NG", segment: "startup", volume: 64_000, risk: 0.78 },
  { name: "Red Harmattan Ltd", company: "Red Harmattan Ltd", region: "GH", segment: "startup", volume: 19_000, risk: 0.81 },
] as const;

const TEAM = [
  { name: "Ewoma Ozore", email: "ewoma@kora.pay", role: "Head of Operations", team: "platform", region: "NG" },
  { name: "Adaeze Okonkwo", email: "adaeze@kora.pay", role: "Payments Lead", team: "payments", region: "NG" },
  { name: "Kwame Mensah", email: "kwame@kora.pay", role: "Ghana Regional Lead", team: "regional-gh", region: "GH" },
  { name: "Amina Yusuf", email: "amina@kora.pay", role: "Risk Engineer", team: "risk", region: "NG" },
  { name: "Daniel Kipchoge", email: "daniel@kora.pay", role: "Kenya Regional Lead", team: "regional-ke", region: "KE" },
  { name: "Thandiwe Nkosi", email: "thandiwe@kora.pay", role: "ZA Regional Lead", team: "platform", region: "ZA" },
  { name: "James Adeyemi", email: "james@kora.pay", role: "SRE", team: "platform", region: "NG" },
  { name: "Sofia Rahman", email: "sofia@kora.pay", role: "UK Compliance", team: "compliance", region: "GB" },
];

function toUsd(amount: number, currency: string) {
  return amount * (FX_TO_USD[currency] ?? 1);
}

function localAmount(usd: number, currency: string) {
  const rate = FX_TO_USD[currency] ?? 1;
  return usd / rate;
}

function providersFor(regionCode: string) {
  return PROVIDERS.filter((p) => (p.regions as readonly string[]).includes(regionCode));
}

function methodFor(providerType: string) {
  if (providerType === "mobile_money") return "momo";
  if (providerType === "bank") return "bank";
  return rng() < 0.08 ? "ussd" : "card";
}

async function main() {
  console.log("Seeding QuantumSpecs / Kora…");
  const now = new Date();
  const { start: spikeStart, end: spikeEnd, deployAt } = spikeWindow(now);

  await prisma.evalCaseRun.deleteMany();
  await prisma.evalRun.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.workflowRun.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.incidentEvent.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.serviceLog.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.paymentRoute.deleteMany();
  await prisma.paymentProvider.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.region.deleteMany();

  await prisma.region.createMany({
    data: REGIONS.map((r) => ({ ...r })),
  });

  await prisma.paymentProvider.createMany({
    data: PROVIDERS.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      type: p.type,
      regionsJson: JSON.stringify(p.regions),
    })),
  });

  await prisma.paymentRoute.createMany({
    data: PROVIDERS.flatMap((p) =>
      p.regions.map((code) => ({
        id: id("route"),
        providerId: p.id,
        regionCode: code,
        enabled: true,
      })),
    ),
  });

  const customers = MERCHANTS.map((m) => {
    const region = REGIONS.find((r) => r.code === m.region)!;
    const slug = m.company.toLowerCase().replace(/[^a-z0-9]+/g, ".");
    return {
      id: id("cus"),
      name: m.name,
      email: `ops@${slug.replace(/\.$/, "")}.pay`,
      company: m.company,
      segment: m.segment,
      regionId: region.id,
      kycStatus: m.risk > 0.7 ? "review" : m.risk > 0.35 ? "pending" : "verified",
      riskScore: m.risk,
      createdAt: new Date(now.getTime() - int(20, 420) * 24 * 3600 * 1000),
      monthlyVolumeUsd: m.volume,
    };
  });

  await prisma.customer.createMany({ data: customers });

  await prisma.teamMember.createMany({
    data: TEAM.map((m) => ({
      id: id("tm"),
      ...m,
      status: "active",
    })),
  });

  const regionByCode = Object.fromEntries(REGIONS.map((r) => [r.code, r]));
  const customersByRegion = new Map<string, typeof customers>();
  for (const c of customers) {
    const region = REGIONS.find((r) => r.id === c.regionId)!;
    const list = customersByRegion.get(region.code) ?? [];
    list.push(c);
    customersByRegion.set(region.code, list);
  }

  const txns: Array<{
    id: string;
    customerId: string;
    regionId: string;
    providerId: string;
    amount: number;
    currency: string;
    amountUsd: number;
    status: string;
    method: string;
    channel: string;
    errorCode: string | null;
    errorMessage: string | null;
    latencyMs: number;
    endpoint: string;
    createdAt: Date;
  }> = [];

  const days = 7;
  const minutesPerBucket = 15;
  const buckets = (days * 24 * 60) / minutesPerBucket;

  for (let b = 0; b < buckets; b++) {
    const t = new Date(now.getTime() - (buckets - b) * minutesPerBucket * 60 * 1000);
    const hour = t.getUTCHours();
    const inSpike = t >= spikeStart && t <= spikeEnd;
    const diurnal = hour >= 7 && hour <= 21 ? 1.35 : 0.55;

    for (const region of REGIONS) {
      const merchants = customersByRegion.get(region.code) ?? [];
      const provs = providersFor(region.code);
      const weight = region.code === "NG" ? 2.4 : region.code === "GB" ? 1.4 : 1;
      const count = Math.max(1, Math.round(between(1, 3) * weight * diurnal));

      for (let i = 0; i < count; i++) {
        const customer = pick(rng, merchants);
        const provider = pick(rng, [...provs]);
        const channelRng = rng();
        const channel =
          channelRng < 0.52 ? "mobile" : channelRng < 0.82 ? "web" : "api";
        const currency = region.currency;
        const usd = between(8, customer.segment === "enterprise" ? 420 : 90);
        const amount = localAmount(usd, currency);

        let failP = 0.018;
        if (region.code === "NG") failP = 0.021;
        if (channel === "mobile") failP += 0.004;

        let latency = int(90, 280);
        if (provider.slug === "paystack") latency += 40;
        if (provider.slug === "mpesa") latency += 70;

        let status = "succeeded";
        let errorCode: string | null = null;
        let errorMessage: string | null = null;

        if (inSpike && region.code === "NG" && provider.slug === "paystack") {
          latency = Math.round(latency * 2.1);
          if (channel === "mobile") failP = 0.42;
          else failP = 0.18;
        } else if (inSpike && region.code === "NG") {
          failP += 0.06;
          latency = Math.round(latency * 1.25);
        } else if (inSpike) {
          failP += 0.015;
        }

        if (customer.riskScore > 0.7 && rng() < 0.12) {
          status = "failed";
          errorCode = "risk_blocked";
          errorMessage = "Velocity + device fingerprint mismatch";
        } else if (rng() < failP) {
          status = "failed";
          if (inSpike && provider.slug === "paystack") {
            errorCode = "provider_timeout";
            errorMessage = "Paystack checkout timeout after 12s";
            latency = int(11000, 12500);
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

        txns.push({
          id: id("txn"),
          customerId: customer.id,
          regionId: region.id,
          providerId: provider.id,
          amount: Math.round(amount * 100) / 100,
          currency,
          amountUsd: toUsd(amount, currency),
          status,
          method: methodFor(provider.type),
          channel,
          errorCode,
          errorMessage,
          latencyMs: latency,
          endpoint: "/v1/checkout",
          createdAt: new Date(t.getTime() + int(0, minutesPerBucket * 60 - 1) * 1000),
        });
      }
    }
  }

  const batchSize = 400;
  for (let i = 0; i < txns.length; i += batchSize) {
    await prisma.transaction.createMany({ data: txns.slice(i, i + batchSize) });
  }

  const deployments = [
    {
      service: "checkout-api",
      version: "2.14.3",
      previousVersion: "2.14.2",
      deployedAt: deployAt,
      deployedBy: "james@kora.pay",
      changelog: "Retry budget change for Paystack NG + connection pool bump",
      status: "live",
      sha: "c8f21a9",
    },
    {
      service: "checkout-api",
      version: "2.14.2",
      previousVersion: "2.14.1",
      deployedAt: new Date(deployAt.getTime() - 26 * 3600 * 1000),
      deployedBy: "adaeze@kora.pay",
      changelog: "Idempotency key TTL to 24h",
      status: "superseded",
      sha: "9ab33e1",
    },
    {
      service: "risk-engine",
      version: "1.8.0",
      previousVersion: "1.7.4",
      deployedAt: new Date(now.getTime() - 3 * 3600 * 1000),
      deployedBy: "amina@kora.pay",
      changelog: "New velocity rules for Shadowlane-class merchants",
      status: "live",
      sha: "b10ce44",
    },
    {
      service: "fx-engine",
      version: "3.2.1",
      previousVersion: "3.2.0",
      deployedAt: new Date(now.getTime() - 18 * 3600 * 1000),
      deployedBy: "sofia@kora.pay",
      changelog: "GBP/NGN mid-market window tightened to 30s",
      status: "live",
      sha: "e77a012",
    },
    {
      service: "payout-worker",
      version: "4.1.0",
      previousVersion: "4.0.6",
      deployedAt: new Date(now.getTime() - 52 * 3600 * 1000),
      deployedBy: "thandiwe@kora.pay",
      changelog: "M-Pesa payout batching",
      status: "live",
      sha: "11d90c2",
    },
  ];

  await prisma.deployment.createMany({
    data: deployments.map((d) => ({
      id: id("dep"),
      environment: "production",
      ...d,
    })),
  });

  const logs: Array<{
    id: string;
    service: string;
    level: string;
    message: string;
    regionCode: string | null;
    latencyMs: number | null;
    createdAt: Date;
    metaJson: string;
  }> = [];

  for (const svc of SERVICES) {
    for (let i = 0; i < 18; i++) {
      logs.push({
        id: id("log"),
        service: svc,
        level: "info",
        message: `${svc} heartbeat ok`,
        regionCode: pick(rng, ["NG", "GH", "KE", "ZA", "GB"]),
        latencyMs: int(12, 80),
        createdAt: new Date(now.getTime() - int(10, 400) * 60 * 1000),
        metaJson: "{}",
      });
    }
  }

  logs.push(
    {
      id: id("log"),
      service: "checkout-api",
      level: "info",
      message: "Deployment checkout-api@2.14.3 marked live",
      regionCode: "NG",
      latencyMs: null,
      createdAt: deployAt,
      metaJson: JSON.stringify({ version: "2.14.3", sha: "c8f21a9" }),
    },
    {
      id: id("log"),
      service: "checkout-api",
      level: "warn",
      message: "Paystack NG p95 latency 410ms → 890ms",
      regionCode: "NG",
      latencyMs: 890,
      createdAt: new Date(spikeStart.getTime() - 60 * 1000),
      metaJson: JSON.stringify({ provider: "paystack" }),
    },
  );

  let cursor = new Date(spikeStart);
  while (cursor <= spikeEnd) {
    logs.push({
      id: id("log"),
      service: "checkout-api",
      level: "error",
      message: "POST /v1/checkout timeout waiting for Paystack",
      regionCode: "NG",
      latencyMs: int(11000, 12500),
      createdAt: new Date(cursor),
      metaJson: JSON.stringify({
        provider: "paystack",
        channel: "mobile",
        error: "provider_timeout",
      }),
    });
    cursor = new Date(cursor.getTime() + int(35, 70) * 1000);
  }

  await prisma.serviceLog.createMany({ data: logs });

  const mpessaBlipStart = new Date(now.getTime() - 47 * 3600 * 1000);
  const mpesaIncidentId = id("inc");
  await prisma.incident.create({
    data: {
      id: mpesaIncidentId,
      title: "M-Pesa payout delays in Kenya",
      severity: "sev2",
      status: "resolved",
      regionId: "reg_ke",
      summary:
        "Safaricom callback latency caused payouts to sit in pending for 14–22 minutes. Batching rollback restored SLA.",
      createdAt: mpessaBlipStart,
      resolvedAt: new Date(mpessaBlipStart.getTime() + 3.2 * 3600 * 1000),
      createdBy: "daniel@kora.pay",
      assignee: "Daniel Kipchoge",
      events: {
        create: [
          {
            id: id("evt"),
            at: mpessaBlipStart,
            actor: "quantumspecs-agent",
            kind: "alert",
            message: "Payout p95 exceeded 8 minutes for M-Pesa",
          },
          {
            id: id("evt"),
            at: new Date(mpessaBlipStart.getTime() + 12 * 60 * 1000),
            actor: "Daniel Kipchoge",
            kind: "status",
            message: "Acknowledged. Checking Safaricom status page + our callback workers.",
          },
          {
            id: id("evt"),
            at: new Date(mpessaBlipStart.getTime() + 48 * 60 * 1000),
            actor: "James Adeyemi",
            kind: "action",
            message: "Rolled payout-worker 4.1.0 → 4.0.6",
          },
          {
            id: id("evt"),
            at: new Date(mpessaBlipStart.getTime() + 3.2 * 3600 * 1000),
            actor: "Daniel Kipchoge",
            kind: "status",
            message: "Resolved. Backlog drained. Postmortem scheduled.",
          },
        ],
      },
    },
  });

  const fxIncidentId = id("inc");
  await prisma.incident.create({
    data: {
      id: fxIncidentId,
      title: "GBP/NGN spread widened during London open",
      severity: "sev3",
      status: "mitigated",
      regionId: "reg_gb",
      summary:
        "Mid-market window missed two liquidity pulses. UK remit quotes were 38bps off. Manual spread cap applied.",
      createdAt: new Date(now.getTime() - 11 * 3600 * 1000),
      resolvedAt: null,
      createdBy: "sofia@kora.pay",
      assignee: "Sofia Rahman",
      events: {
        create: [
          {
            id: id("evt"),
            at: new Date(now.getTime() - 11 * 3600 * 1000),
            actor: "quantumspecs-agent",
            kind: "alert",
            message: "FX quote drift > 25bps on GBP/NGN for 9 minutes",
          },
          {
            id: id("evt"),
            at: new Date(now.getTime() - 10.4 * 3600 * 1000),
            actor: "Sofia Rahman",
            kind: "action",
            message: "Applied temporary 20bps spread cap on UK remit corridor",
          },
        ],
      },
    },
  });

  const fraudIncidentId = id("inc");
  await prisma.incident.create({
    data: {
      id: fraudIncidentId,
      title: "Review queue: Shadowlane Imports velocity",
      severity: "sev3",
      status: "open",
      regionId: "reg_ng",
      summary:
        "Merchant triggered device-fingerprint mismatch and 12 failed card attempts in 8 minutes. KYC moved to review.",
      createdAt: new Date(now.getTime() - 6 * 3600 * 1000),
      resolvedAt: null,
      createdBy: "amina@kora.pay",
      assignee: "Amina Yusuf",
      events: {
        create: [
          {
            id: id("evt"),
            at: new Date(now.getTime() - 6 * 3600 * 1000),
            actor: "risk-engine",
            kind: "alert",
            message: "Velocity rule v1.8.0 fired for cus Shadowlane Imports",
          },
        ],
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        id: id("ntf"),
        team: "payments",
        channel: "pagerduty",
        message: `Checkout error-rate page fired. Paystack NG mobile timeouts ${spikeStart.toISOString().slice(11, 16)}–${spikeEnd.toISOString().slice(11, 16)} UTC.`,
        createdAt: spikeEnd,
        status: "sent",
        href: `/agent?q=${encodeURIComponent("Why did checkout failures increase this morning?")}`,
      },
      {
        id: id("ntf"),
        team: "payments",
        channel: "slack",
        message: "Paystack NG p95 crossed 2s. Failover workflow suggested disabling the route.",
        createdAt: new Date(spikeStart.getTime() + 8 * 60 * 1000),
        status: "sent",
        href: "/settings",
      },
      {
        id: id("ntf"),
        team: "risk",
        channel: "slack",
        message: "Shadowlane Imports velocity rule fired. KYC moved to review.",
        createdAt: new Date(now.getTime() - 6 * 3600 * 1000),
        status: "sent",
        href: "/customers",
      },
      {
        id: id("ntf"),
        team: "regional-ke",
        channel: "slack",
        message: "M-Pesa payout delays in Kenya — incident resolved.",
        createdAt: new Date(now.getTime() - 44 * 3600 * 1000),
        status: "sent",
        readAt: new Date(now.getTime() - 43 * 3600 * 1000),
        href: `/incidents/${mpesaIncidentId}`,
      },
      {
        id: id("ntf"),
        team: "compliance",
        channel: "email",
        message: "GBP/NGN spread cap applied after quote drift at London open.",
        createdAt: new Date(now.getTime() - 10.4 * 3600 * 1000),
        status: "sent",
        readAt: new Date(now.getTime() - 9 * 3600 * 1000),
        href: `/incidents/${fxIncidentId}`,
      },
    ],
  });

  await prisma.workflow.createMany({
    data: [
      {
        id: id("wf"),
        name: "Checkout error-rate page",
        description: "If checkout failure rate exceeds 5% for 10 minutes, page payments and open a sev2 incident.",
        trigger: "metric.checkout.failure_rate > 0.05 for 10m",
        enabled: true,
        stepsJson: JSON.stringify([
          { type: "query", tool: "get_transaction_metrics" },
          { type: "notify", team: "payments", channel: "pagerduty" },
          { type: "action", tool: "create_incident", severity: "sev2" },
        ]),
        lastRunAt: spikeEnd,
        lastStatus: "fired",
        runCount: 14,
      },
      {
        id: id("wf"),
        name: "Provider latency failover",
        description: "When a provider p95 exceeds 2s in a region, shift new traffic off that route.",
        trigger: "provider.p95_ms > 2000 for 5m",
        enabled: true,
        stepsJson: JSON.stringify([
          { type: "query", tool: "get_provider_health" },
          { type: "action", tool: "disable_payment_route" },
          { type: "notify", team: "payments", channel: "slack" },
        ]),
        lastRunAt: new Date(spikeStart.getTime() + 8 * 60 * 1000),
        lastStatus: "suggested",
        runCount: 6,
      },
      {
        id: id("wf"),
        name: "High-risk merchant freeze",
        description: "Three declines plus velocity in 10 minutes moves KYC to review and notifies risk.",
        trigger: "customer.declines >= 3 AND velocity_anomaly",
        enabled: true,
        stepsJson: JSON.stringify([
          { type: "query", tool: "get_customer" },
          { type: "notify", team: "risk", channel: "slack" },
        ]),
        lastRunAt: new Date(now.getTime() - 6 * 3600 * 1000),
        lastStatus: "ok",
        runCount: 3,
      },
      {
        id: id("wf"),
        name: "Nightly NG/GH reconciliation",
        description: "Compare ledger vs provider settlements for NGN and GHS corridors.",
        trigger: "cron 01:30 WAT",
        enabled: true,
        stepsJson: JSON.stringify([
          { type: "query", tool: "compare_regions" },
          { type: "notify", team: "platform", channel: "email" },
        ]),
        lastRunAt: new Date(now.getTime() - 12.5 * 3600 * 1000),
        lastStatus: "ok",
        runCount: 41,
      },
      {
        id: id("wf"),
        name: "UK remit compliance sweep",
        description: "Flag GBP corridors with quote drift or missing travel-rule fields.",
        trigger: "fx.drift_bps > 25 OR travel_rule.missing",
        enabled: false,
        stepsJson: JSON.stringify([
          { type: "notify", team: "compliance", channel: "email" },
        ]),
        lastRunAt: null,
        lastStatus: null,
        runCount: 0,
      },
    ],
  });

  console.log(`Seeded ${txns.length} transactions, ${customers.length} merchants.`);
  console.log(
    `Spike window ${spikeStart.toISOString()} → ${spikeEnd.toISOString()} (deploy ${deployAt.toISOString()})`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
