import type { Metadata } from "next";
import { TENANT } from "@/lib/constants";

export function siteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://quantumspecs.vercel.app");
  return raw.replace(/\/$/, "");
}

export const SITE = {
  name: "QuantumSpecs",
  product: "QuantumSpecs Operations",
  tagline: "AI operations command center for Kora payments",
  locale: "en_NG",
} as const;

export type SitePage = {
  path: string;
  title: string;
  description: string;
};

export const SITE_PAGES: SitePage[] = [
  {
    path: "/",
    title: "Command",
    description:
      "Kora command center: hub KPIs, checkout telemetry, regional rollup, and the live event feed for West Africa and beyond.",
  },
  {
    path: "/globe",
    title: "Globe",
    description:
      "Interactive Earth of Kora ops hubs. Click a country to select its primary city and keep Command, Network, and Incidents in sync.",
  },
  {
    path: "/network",
    title: "Network",
    description:
      "Virtualized table of Kora last-mile and telecom sites across Lagos, Accra, Nairobi, Johannesburg, and the other ops hubs.",
  },
  {
    path: "/incidents",
    title: "Incidents",
    description:
      "Incident board for radio, last-mile, core, and checkout failures, filtered by the same region and city as the globe.",
  },
  {
    path: "/analytics",
    title: "Analytics",
    description:
      "24-hour Kora checkout analytics by region, provider, channel, and error code.",
  },
  {
    path: "/customers",
    title: "Customers",
    description:
      "Kora merchants across NGN, GHS, KES, ZAR, and GBP corridors, with KYC status and monthly volume.",
  },
  {
    path: "/agent",
    title: "Operations analyst",
    description:
      "Ask the QuantumSpecs analyst about checkout failures, then review evidence and run suggested actions.",
  },
  {
    path: "/agent/runs",
    title: "Past investigations",
    description: "Stored analyst runs with tool traces, latency, and token usage.",
  },
  {
    path: "/workflows",
    title: "Workflows",
    description: "Automated Kora ops workflows and recent run history.",
  },
  {
    path: "/evaluation",
    title: "AI evaluation",
    description: "Eval suite scoring the operations analyst against known Kora incident cases.",
  },
  {
    path: "/settings",
    title: "Settings",
    description: "Workspace, payment routes, team, and integrations for the Kora production console.",
  },
  {
    path: "/login",
    title: "Sign in",
    description: "Sign in to the QuantumSpecs operations console for Kora payments.",
  },
];

export function findSitePage(path: string) {
  return SITE_PAGES.find((page) => page.path === path);
}

export function pageMetadata(
  path: string,
  override?: Partial<Pick<SitePage, "title" | "description" | "path">>,
): Metadata {
  const base = findSitePage(path) ?? {
    path,
    title: "QuantumSpecs",
    description: SITE.tagline,
  };
  const title = override?.title ?? base.title;
  const description = override?.description ?? base.description;
  const canonical = override?.path ?? base.path;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE.name}`,
      description,
    },
  };
}

export function breadcrumbItems(path: string, extra?: { label: string; href?: string }) {
  const items: Array<{ name: string; path: string }> = [{ name: "Command", path: "/" }];
  if (path !== "/") {
    const parts = path.split("/").filter(Boolean);
    let acc = "";
    for (const part of parts) {
      acc += `/${part}`;
      const known = findSitePage(acc);
      items.push({
        name: known?.title ?? decodeURIComponent(part),
        path: acc,
      });
    }
  }
  if (extra) {
    const last = items[items.length - 1];
    if (last && !findSitePage(last.path)) {
      last.name = extra.label;
      if (extra.href) last.path = extra.href;
    } else {
      items.push({ name: extra.label, path: extra.href ?? path });
    }
  }
  return items;
}

export function breadcrumbJsonLd(path: string, extra?: { label: string; href?: string }) {
  const origin = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems(path, extra).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function siteJsonLd() {
  const origin = siteUrl();
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      alternateName: SITE.product,
      url: origin,
      description: SITE.tagline,
      inLanguage: "en",
      publisher: { "@id": `${origin}/#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: SITE.name,
      legalName: "QuantumSpecs",
      url: origin,
      logo: `${origin}/icon.svg`,
      description: SITE.tagline,
      parentOrganization: { "@id": `${origin}/#kora` },
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${origin}/#kora`,
      name: TENANT.legalName,
      alternateName: TENANT.name,
      description: TENANT.tagline,
      url: "https://www.kora.pay",
      email: "ewoma@kora.pay",
      image: `${origin}/opengraph-image`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lagos",
        addressRegion: "Lagos",
        addressCountry: "NG",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 6.5244,
        longitude: 3.3792,
      },
      areaServed: [
        { "@type": "Country", name: "Nigeria" },
        { "@type": "Country", name: "Ghana" },
        { "@type": "Country", name: "Kenya" },
        { "@type": "Country", name: "South Africa" },
        { "@type": "Country", name: "United Kingdom" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE.product,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: origin,
      description: SITE.tagline,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: { "@id": `${origin}/#organization` },
    },
  ];
}
