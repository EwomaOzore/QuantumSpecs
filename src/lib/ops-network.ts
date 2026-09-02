import { mulberry32 } from "@/lib/utils";
import { OPS_HUBS, type OpsHub, type OpsRegionSlug } from "@/lib/ops-geo";

export const SITE_TYPES = ["tower", "warehouse", "last-mile", "pop", "gateway"] as const;
export const SITE_STATUSES = ["up", "degraded", "down"] as const;

export type OpsSite = {
  id: string;
  name: string;
  city: string;
  citySlug: string;
  country: string;
  region: string;
  regionSlug: OpsRegionSlug;
  type: (typeof SITE_TYPES)[number];
  status: (typeof SITE_STATUSES)[number];
  uptimePct: number;
  revenueUsd: number;
  lat: number;
  lng: number;
};

export type OpsEvent = {
  id: string;
  at: string;
  city: string;
  citySlug: string;
  regionSlug: OpsRegionSlug;
  type: "incident" | "routing" | "deploy" | "site";
  status: "open" | "mitigated" | "resolved" | "info";
  message: string;
};

export type OpsIncident = {
  id: string;
  title: string;
  severity: "sev1" | "sev2" | "sev3" | "sev4";
  status: "open" | "investigating" | "mitigated" | "resolved";
  city: string;
  citySlug: string;
  country: string;
  regionSlug: OpsRegionSlug;
  type: "radio" | "last-mile" | "core" | "checkout";
  openedAt: string;
  owner: string;
};

const TYPES = [...SITE_TYPES];
let cachedSites: OpsSite[] | null = null;
let cachedEvents: OpsEvent[] | null = null;
let cachedIncidents: OpsIncident[] | null = null;

function jitter(rng: () => number, scale: number) {
  return (rng() - 0.5) * scale;
}

export function getOpsSites(): OpsSite[] {
  if (cachedSites) return cachedSites;
  const rng = mulberry32(20260902);
  const sites: OpsSite[] = [];
  const target = 12_000;
  const weights = OPS_HUBS.map((h) => (h.isHub ? 3.2 : 1.4));
  const weightSum = weights.reduce((a, b) => a + b, 0);

  for (let i = 0; i < target; i++) {
    let pick = rng() * weightSum;
    let hub: OpsHub = OPS_HUBS[0]!;
    for (let h = 0; h < OPS_HUBS.length; h++) {
      pick -= weights[h]!;
      if (pick <= 0) {
        hub = OPS_HUBS[h]!;
        break;
      }
    }
    const type = TYPES[Math.floor(rng() * TYPES.length)]!;
    let status: OpsSite["status"] = "up";
    const roll = rng();
    if (roll > 0.97) status = "down";
    else if (roll > 0.9) status = "degraded";
    const spread = hub.isHub ? 2.8 : 1.6;
    sites.push({
      id: `site_${(i + 1).toString(16).padStart(4, "0")}`,
      name: `${hub.name} ${type} ${String(i % 900).padStart(3, "0")}`,
      city: hub.name,
      citySlug: hub.slug,
      country: hub.country,
      region: hub.region,
      regionSlug: hub.regionSlug,
      type,
      status,
      uptimePct: status === "up" ? 99.2 + rng() * 0.7 : status === "degraded" ? 96 + rng() * 2.5 : 88 + rng() * 6,
      revenueUsd: 4_000 + rng() * (hub.isHub ? 42_000 : 18_000),
      lat: hub.lat + jitter(rng, spread),
      lng: hub.lng + jitter(rng, spread),
    });
  }
  cachedSites = sites;
  return sites;
}

export function getOpsEvents(): OpsEvent[] {
  if (cachedEvents) return cachedEvents;
  const rng = mulberry32(77);
  const now = Date.now();
  const messages = [
    "Sector congestion on last-mile ring",
    "Microwave hop flap recovered",
    "Gateway failover completed",
    "Warehouse scan lag above SLO",
    "POP CPU 92% for 8m",
    "Checkout timeout burst correlated with radio",
    "Fiber cut — traffic shifted to sat backup",
    "SIM-swap velocity rule fired",
  ];
  const events: OpsEvent[] = [];
  for (let i = 0; i < 48; i++) {
    const hub = OPS_HUBS[Math.floor(rng() * OPS_HUBS.length)]!;
    const types: OpsEvent["type"][] = ["incident", "routing", "deploy", "site"];
    const statuses: OpsEvent["status"][] = ["open", "mitigated", "resolved", "info"];
    events.push({
      id: `evt_${i}`,
      at: new Date(now - i * 7 * 60_000).toISOString(),
      city: hub.name,
      citySlug: hub.slug,
      regionSlug: hub.regionSlug,
      type: types[Math.floor(rng() * types.length)]!,
      status: statuses[Math.floor(rng() * statuses.length)]!,
      message: `${hub.name}: ${messages[Math.floor(rng() * messages.length)]}`,
    });
  }
  cachedEvents = events;
  return events;
}

export function getOpsIncidents(): OpsIncident[] {
  if (cachedIncidents) return cachedIncidents;
  const rng = mulberry32(19);
  const titles = [
    "Last-mile SLA breach",
    "Tower sector down",
    "Core routing oscillation",
    "Warehouse dock congestion",
    "International POP packet loss",
    "Radio backhaul saturation",
  ];
  const owners = ["Adaeze Okonkwo", "Kwame Mensah", "Daniel Kipchoge", "Thandiwe Nkosi", "James Adeyemi"];
  const items: OpsIncident[] = [];
  for (let i = 0; i < 86; i++) {
    const hub = OPS_HUBS[Math.floor(rng() * OPS_HUBS.length)]!;
    const sevRoll = rng();
    const severity = sevRoll > 0.92 ? "sev1" : sevRoll > 0.7 ? "sev2" : sevRoll > 0.4 ? "sev3" : "sev4";
    const statusRoll = rng();
    const status =
      statusRoll > 0.7 ? "open" : statusRoll > 0.5 ? "investigating" : statusRoll > 0.3 ? "mitigated" : "resolved";
    const typeRoll = rng();
    const type = typeRoll > 0.75 ? "radio" : typeRoll > 0.5 ? "last-mile" : typeRoll > 0.25 ? "core" : "checkout";
    items.push({
      id: `ginc_${i}`,
      title: `${hub.name} ${titles[Math.floor(rng() * titles.length)]}`,
      severity,
      status,
      city: hub.name,
      citySlug: hub.slug,
      country: hub.country,
      regionSlug: hub.regionSlug,
      type,
      openedAt: new Date(Date.now() - Math.floor(rng() * 72) * 3600_000).toISOString(),
      owner: owners[Math.floor(rng() * owners.length)]!,
    });
  }
  cachedIncidents = items;
  return items;
}

export function sitesForFilters(input: { city?: string; region?: string; type?: string; status?: string; q?: string }) {
  return getOpsSites().filter((site) => {
    if (input.city && site.citySlug !== input.city) return false;
    if (input.region && site.regionSlug !== input.region) return false;
    if (input.type && site.type !== input.type) return false;
    if (input.status && site.status !== input.status) return false;
    if (input.q) {
      const q = input.q.toLowerCase();
      if (!`${site.name} ${site.city} ${site.country} ${site.id}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function regionalRollup(regionSlug?: string) {
  const sites = getOpsSites().filter((s) => (regionSlug ? s.regionSlug === regionSlug : true));
  const byRegion = new Map<string, { region: string; regionSlug: string; count: number; down: number; degraded: number; revenue: number }>();
  for (const site of sites) {
    const row = byRegion.get(site.regionSlug) ?? {
      region: site.region,
      regionSlug: site.regionSlug,
      count: 0,
      down: 0,
      degraded: 0,
      revenue: 0,
    };
    row.count += 1;
    if (site.status === "down") row.down += 1;
    if (site.status === "degraded") row.degraded += 1;
    row.revenue += site.revenueUsd;
    byRegion.set(site.regionSlug, row);
  }
  return [...byRegion.values()].sort((a, b) => b.count - a.count);
}
