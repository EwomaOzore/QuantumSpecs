import { SITE_PAGES, siteUrl } from "@/lib/site";

export function GET() {
  const origin = siteUrl();
  const links = SITE_PAGES.map((page) => `- [${page.title}](${origin}${page.path === "/" ? "/" : page.path}): ${page.description}`).join(
    "\n",
  );
  const body = `# QuantumSpecs

> AI operations and intelligence console for Kora, a pan-African payments company.

QuantumSpecs is a duty-desk for checkout telemetry, last-mile sites, incidents, and an operations analyst. It is Africa-first: Lagos is the default hub, with corridors in Ghana, Kenya, South Africa, and the United Kingdom.

## Product

- Command: KPI strip, charts, regional rollup, live event feed
- Globe: NASA Blue Marble Earth with clickable countries and hub arcs
- Network: virtualized table of about 12,000 sites
- Incidents: board filtered by the same URL params as the globe
- Analyst: investigates checkout failures and can open incidents or roll back deploys

## Pages

${links}

## Contact

- Operator: ewoma@kora.pay
- Payments company: https://www.kora.pay
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
