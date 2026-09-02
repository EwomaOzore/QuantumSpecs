# QuantumSpecs

AI operations and intelligence platform for **Kora**, a fictional pan-African payments company running corridors in Nigeria, Ghana, Kenya, South Africa and the UK.

This is not a chat wrapper. The analyst has tools. Those tools query a real SQLite database of merchants, checkouts, deployments, logs and incidents. Suggested actions mutate that database: open an incident, page a team, roll back `checkout-api`, or disable Paystack in Nigeria.

## Why this exists

QuantumSpecs is a senior-portfolio product at the intersection of:

- operations UI (Datadog × Linear × Stripe Dashboard)
- agentic architecture (tool calling, traces, confirmable write actions)
- AI product engineering (evaluation, latency, hallucination checks)

The seeded story is always a few hours behind “now”:

- `checkout-api@2.14.3` ships a Paystack NG retry change
- Paystack Nigeria latency jumps ~2.1×
- mobile `/v1/checkout` timeouts cluster for ~32 minutes
- the overview banner asks you to investigate

Ask: **Why did checkout failures increase this morning?**

## Stack

| Layer | Choice |
| --- | --- |
| UI | Next.js App Router, React Server Components, Tailwind v4 |
| Client state | TanStack Query, Zustand-ready UI islands |
| Data | Prisma + SQLite (Postgres-ready schema) |
| Agent | Local operations analyst + optional OpenAI via Vercel AI SDK |
| Charts | Recharts |
| Tests | Vitest + Playwright |

Redis and Postgres are declared in `docker-compose.yml` for a production-shaped deploy. Local demo uses SQLite so `npm run dev` works without Docker.

## Architecture

```
Next.js UI
    │
AI interaction layer  (stream SSE)
    │
┌─────────────┬─────────────┬──────────────┐
│ Analytics   │ Search      │ Actions      │
│ tools       │ tools       │ tools        │
└──────┬──────┴──────┬──────┴──────┬───────┘
       └─────────────┼─────────────┘
                     │
                 API / Prisma
                     │
              SQLite (or Postgres)
```

Read tools (always executed during investigation):

- `get_transaction_metrics`
- `get_customer` / `search_customers`
- `search_incidents` / `get_incident`
- `get_deployment`
- `query_logs`
- `compare_regions`
- `get_provider_health`

Write tools (proposed, never auto-run):

- `create_incident`
- `send_notification`
- `rollback_deployment`
- `disable_payment_route`

If `OPENAI_API_KEY` is set, the same tools are bound to `gpt-4o`. If not, the local analyst plans tools heuristically and synthesizes evidence from **actual** query results.

## Setup

```bash
npm install
npx prisma generate
npm run db:reset
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional LLM:

```bash
# .env
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o
```

Optional Postgres/Redis:

```bash
docker compose up -d
# then point DATABASE_URL at postgresql://quantumspecs:quantumspecs@localhost:5432/quantumspecs
# and switch prisma/schema.prisma provider to postgresql
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run db:reset` | Recreate SQLite + seed Kora |
| `npm test` | Vitest (planner + formatters) |
| `npm run test:e2e` | Playwright smoke on overview |
| `npm run build` | Production build |

## Product surfaces

- **Overview** — KPIs, 24h traffic, regional health, live alert, incidents, deploys
- **Analytics** — time series, providers, channels, error codes
- **Customers** — merchants, KYC, risk, corridor volume
- **Incidents** — Linear-style stream with timelines
- **AI Agent** — investigate → evidence → execute
- **Workflows** — playbooks that call the same tools
- **AI Evaluation** — accuracy, latency, tokens, failed tools, hallucination checks
- **Settings** — routes, team, notifications, integrations

Keyboard: `⌘K` / `Ctrl+K` asks the analyst from anywhere.
