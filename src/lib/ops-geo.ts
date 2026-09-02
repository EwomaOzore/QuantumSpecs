export type OpsRegionSlug =
  | "west-africa"
  | "east-africa"
  | "southern-africa"
  | "north-africa"
  | "gulf"
  | "europe"
  | "americas";

export type OpsHub = {
  slug: string;
  name: string;
  country: string;
  countryAliases: string[];
  region: string;
  regionSlug: OpsRegionSlug;
  lat: number;
  lng: number;
  isHub: boolean;
  isPrimary: boolean;
  koraCode?: string;
};

export const COUNTRY_NAME_ALIASES: Record<string, string> = {
  "United States of America": "United States",
  "United States": "United States",
  USA: "United States",
  "United Republic of Tanzania": "Tanzania",
  Tanzania: "Tanzania",
  "Ivory Coast": "Côte d'Ivoire",
  "Cote d'Ivoire": "Côte d'Ivoire",
  "Côte d'Ivoire": "Côte d'Ivoire",
  "Czech Republic": "Czechia",
  "Russian Federation": "Russia",
  "Republic of Korea": "South Korea",
  "Korea": "South Korea",
  "Dem. Rep. Congo": "Democratic Republic of the Congo",
  "Democratic Republic of the Congo": "Democratic Republic of the Congo",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
  "Central African Rep.": "Central African Republic",
  "Dominican Rep.": "Dominican Republic",
  "Eq. Guinea": "Equatorial Guinea",
  "S. Sudan": "South Sudan",
  "Solomon Is.": "Solomon Islands",
  "Falkland Is.": "Falkland Islands",
  "W. Sahara": "Western Sahara",
  eSwatini: "Eswatini",
  Swaziland: "Eswatini",
  "S. Africa": "South Africa",
  "United Arab Emirates": "United Arab Emirates",
  UAE: "United Arab Emirates",
  "Saudi Arabia": "Saudi Arabia",
  "United Kingdom": "United Kingdom",
  "Great Britain": "United Kingdom",
};

export function normalizeCountryName(name: string) {
  const trimmed = name.trim();
  return COUNTRY_NAME_ALIASES[trimmed] ?? trimmed;
}

export const OPS_HUBS: OpsHub[] = [
  {
    slug: "lagos",
    name: "Lagos",
    country: "Nigeria",
    countryAliases: ["Nigeria"],
    region: "West Africa",
    regionSlug: "west-africa",
    lat: 6.5244,
    lng: 3.3792,
    isHub: true,
    isPrimary: true,
    koraCode: "NG",
  },
  {
    slug: "abuja",
    name: "Abuja",
    country: "Nigeria",
    countryAliases: ["Nigeria"],
    region: "West Africa",
    regionSlug: "west-africa",
    lat: 9.0765,
    lng: 7.3986,
    isHub: false,
    isPrimary: false,
    koraCode: "NG",
  },
  {
    slug: "accra",
    name: "Accra",
    country: "Ghana",
    countryAliases: ["Ghana"],
    region: "West Africa",
    regionSlug: "west-africa",
    lat: 5.6037,
    lng: -0.187,
    isHub: true,
    isPrimary: true,
    koraCode: "GH",
  },
  {
    slug: "abidjan",
    name: "Abidjan",
    country: "Côte d'Ivoire",
    countryAliases: ["Côte d'Ivoire", "Ivory Coast", "Cote d'Ivoire"],
    region: "West Africa",
    regionSlug: "west-africa",
    lat: 5.36,
    lng: -4.0083,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "dakar",
    name: "Dakar",
    country: "Senegal",
    countryAliases: ["Senegal"],
    region: "West Africa",
    regionSlug: "west-africa",
    lat: 14.7167,
    lng: -17.4677,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "nairobi",
    name: "Nairobi",
    country: "Kenya",
    countryAliases: ["Kenya"],
    region: "East Africa",
    regionSlug: "east-africa",
    lat: -1.2921,
    lng: 36.8219,
    isHub: true,
    isPrimary: true,
    koraCode: "KE",
  },
  {
    slug: "kampala",
    name: "Kampala",
    country: "Uganda",
    countryAliases: ["Uganda"],
    region: "East Africa",
    regionSlug: "east-africa",
    lat: 0.3476,
    lng: 32.5825,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "dar-es-salaam",
    name: "Dar es Salaam",
    country: "Tanzania",
    countryAliases: ["Tanzania", "United Republic of Tanzania"],
    region: "East Africa",
    regionSlug: "east-africa",
    lat: -6.7924,
    lng: 39.2083,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "addis-ababa",
    name: "Addis Ababa",
    country: "Ethiopia",
    countryAliases: ["Ethiopia"],
    region: "East Africa",
    regionSlug: "east-africa",
    lat: 9.032,
    lng: 38.7469,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "johannesburg",
    name: "Johannesburg",
    country: "South Africa",
    countryAliases: ["South Africa"],
    region: "Southern Africa",
    regionSlug: "southern-africa",
    lat: -26.2041,
    lng: 28.0473,
    isHub: true,
    isPrimary: true,
    koraCode: "ZA",
  },
  {
    slug: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    countryAliases: ["South Africa"],
    region: "Southern Africa",
    regionSlug: "southern-africa",
    lat: -33.9249,
    lng: 18.4241,
    isHub: false,
    isPrimary: false,
    koraCode: "ZA",
  },
  {
    slug: "lusaka",
    name: "Lusaka",
    country: "Zambia",
    countryAliases: ["Zambia"],
    region: "Southern Africa",
    regionSlug: "southern-africa",
    lat: -15.3875,
    lng: 28.3228,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "gaborone",
    name: "Gaborone",
    country: "Botswana",
    countryAliases: ["Botswana"],
    region: "Southern Africa",
    regionSlug: "southern-africa",
    lat: -24.6282,
    lng: 25.9231,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "cairo",
    name: "Cairo",
    country: "Egypt",
    countryAliases: ["Egypt"],
    region: "North Africa",
    regionSlug: "north-africa",
    lat: 30.0444,
    lng: 31.2357,
    isHub: true,
    isPrimary: true,
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    countryAliases: ["United Arab Emirates", "UAE"],
    region: "Gulf",
    regionSlug: "gulf",
    lat: 25.2048,
    lng: 55.2708,
    isHub: true,
    isPrimary: true,
  },
  {
    slug: "riyadh",
    name: "Riyadh",
    country: "Saudi Arabia",
    countryAliases: ["Saudi Arabia"],
    region: "Gulf",
    regionSlug: "gulf",
    lat: 24.7136,
    lng: 46.6753,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    countryAliases: ["United Kingdom", "Great Britain"],
    region: "Europe",
    regionSlug: "europe",
    lat: 51.5074,
    lng: -0.1278,
    isHub: true,
    isPrimary: true,
    koraCode: "GB",
  },
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    countryAliases: ["France"],
    region: "Europe",
    regionSlug: "europe",
    lat: 48.8566,
    lng: 2.3522,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "amsterdam",
    name: "Amsterdam",
    country: "Netherlands",
    countryAliases: ["Netherlands"],
    region: "Europe",
    regionSlug: "europe",
    lat: 52.3676,
    lng: 4.9041,
    isHub: false,
    isPrimary: true,
  },
  {
    slug: "atlanta",
    name: "Atlanta",
    country: "United States",
    countryAliases: ["United States", "United States of America", "USA"],
    region: "Americas",
    regionSlug: "americas",
    lat: 33.749,
    lng: -84.388,
    isHub: true,
    isPrimary: true,
  },
  {
    slug: "sao-paulo",
    name: "São Paulo",
    country: "Brazil",
    countryAliases: ["Brazil"],
    region: "Americas",
    regionSlug: "americas",
    lat: -23.5558,
    lng: -46.6396,
    isHub: false,
    isPrimary: true,
  },
];

export const DEFAULT_HUB = OPS_HUBS[0]!;

export const PRIMARY_HUBS = OPS_HUBS.filter((h) => h.isHub);

export function findHub(slug?: string | null) {
  if (!slug) return DEFAULT_HUB;
  return OPS_HUBS.find((h) => h.slug === slug) ?? DEFAULT_HUB;
}

export function hubsInCountry(countryName: string) {
  const normalized = normalizeCountryName(countryName);
  return OPS_HUBS.filter(
    (h) =>
      normalizeCountryName(h.country) === normalized ||
      h.countryAliases.some((alias) => normalizeCountryName(alias) === normalized),
  );
}

export function primaryHubForCountry(countryName: string) {
  const hubs = hubsInCountry(countryName);
  return hubs.find((h) => h.isHub && h.isPrimary) ?? hubs.find((h) => h.isPrimary) ?? hubs[0] ?? null;
}

export function hubKpis(hub: OpsHub) {
  const seed = hub.slug.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const revenue = 1_150_000 + (seed % 80) * 48_000;
  const uptime = 99.1 + (seed % 9) * 0.08;
  const incidents = 2 + (seed % 7);
  const sites = 380 + (seed % 40) * 12;
  return {
    revenueUsd: revenue,
    uptimePct: Math.min(99.98, uptime),
    openIncidents: incidents,
    sites,
    packetsMs: 18 + (seed % 22),
  };
}

export type OpsArc = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  from: string;
  to: string;
};

export function hubArcs(): OpsArc[] {
  const names = ["lagos", "accra", "nairobi", "johannesburg", "cairo", "dubai", "london", "atlanta"];
  const hubs = names.map((slug) => OPS_HUBS.find((h) => h.slug === slug)!);
  const lagos = hubs[0]!;
  const arcs: OpsArc[] = [];
  for (const dest of hubs.slice(1)) {
    arcs.push({
      startLat: lagos.lat,
      startLng: lagos.lng,
      endLat: dest.lat,
      endLng: dest.lng,
      from: lagos.slug,
      to: dest.slug,
    });
  }
  const ring: Array<[number, number]> = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 6],
    [6, 7],
  ];
  for (const [a, b] of ring) {
    const from = hubs[a]!;
    const to = hubs[b]!;
    arcs.push({
      startLat: from.lat,
      startLng: from.lng,
      endLat: to.lat,
      endLng: to.lng,
      from: from.slug,
      to: to.slug,
    });
  }
  return arcs;
}
