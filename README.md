# QuantumSpecs

Operations intelligence for Kora — payment infrastructure across Nigeria, Ghana, Kenya, South Africa, and the UK.

The console tracks checkout health, incidents, merchants, and deployments. The operations analyst queries that same data through tools, then proposes actions you can run: open an incident, page a team, roll back a release, or disable a payment route.

## Stack

- Next.js App Router, TypeScript, Tailwind
- Prisma + SQLite (Postgres via Docker Compose)
- TanStack Query, Recharts
- Optional OpenAI via the Vercel AI SDK

## Setup

```bash
npm install
npx prisma generate
npm run db:reset
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `⌘K` / `Ctrl+K` opens the analyst.

Optional LLM in `.env`:

```
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o
```

Without a key, the local analyst still calls the same tools against the database.

Postgres and Redis:

```bash
docker compose up -d
```

Point `DATABASE_URL` at Postgres and switch the Prisma provider if you want that stack.

## Scripts

| Script | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run db:reset` | Recreate SQLite and seed Kora |
| `npm test` | Unit tests |
| `npm run test:e2e` | Playwright |
| `npm run build` | Production build |

## Seeded scenario

Each reset plants a checkout regression a few hours behind the current time: `checkout-api@2.14.3`, Paystack NG latency, mobile timeouts. Overview surfaces it; the analyst can investigate it.

## Tools

Read: `get_transaction_metrics`, `get_customer`, `search_customers`, `search_incidents`, `get_incident`, `get_deployment`, `query_logs`, `compare_regions`, `get_provider_health`.

Write (confirm in the UI): `create_incident`, `send_notification`, `rollback_deployment`, `disable_payment_route`.
