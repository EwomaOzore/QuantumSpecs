# QuantumSpecs

Operations intelligence for Kora — payment infrastructure across Nigeria, Ghana, Kenya, South Africa, and the UK.

The console tracks checkout health, incidents, merchants, and deployments. The operations analyst queries that same data through tools, then proposes actions you can run: open an incident, page a team, roll back a release, or disable a payment route.

## Stack

- Next.js App Router, TypeScript, Tailwind
- Prisma + Postgres (Docker locally)
- TanStack Query, Recharts
- Optional OpenAI via the Vercel AI SDK
- Auth.js credentials login

## Setup

Postgres must be running. From the repo root:

```bash
docker compose up -d
```

Copy `.env.example` to `.env` and set:

```
DATABASE_URL="postgresql://quantumspecs:quantumspecs@localhost:5432/quantumspecs"
DIRECT_URL="postgresql://quantumspecs:quantumspecs@localhost:5432/quantumspecs"
OPENAI_API_KEY=
AI_MODEL="gpt-4o"
AUTH_SECRET="dev-quantumspecs-auth-secret"
CONSOLE_PASSWORD="kora-ops"
```

Then:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in as `ewoma@kora.pay` with `kora-ops`. `⌘K` / `Ctrl+K` opens the analyst.

## Scripts

| Script             |                                        |
| ------------------ | -------------------------------------- |
| `npm run dev`      | Dev server                             |
| `npm run db:reset` | Recreate Postgres schema and seed Kora |
| `npm test`         | Unit tests                             |
| `npm run test:e2e` | Playwright                             |
| `npm run build`    | Production build                       |

## Seeded scenario

Each reset plants a checkout regression a few hours behind the current time: `checkout-api@2.14.3`, Paystack NG latency, mobile timeouts. Overview surfaces it; the analyst can investigate it. Opening Overview also writes a small batch of live checkouts if traffic has gone stale. **Simulate traffic** does the same on demand. A daily cron (`/api/cron/tick`) ingests more volume and auto-runs notify/page steps when a playbook trigger matches.

## Tools

Read: `get_transaction_metrics`, `get_customer`, `search_customers`, `search_incidents`, `get_incident`, `get_deployment`, `query_logs`, `compare_regions`, `get_provider_health`.

Write (confirm in the UI): `create_incident`, `send_notification`, `rollback_deployment`, `disable_payment_route`.
