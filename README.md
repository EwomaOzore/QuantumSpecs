# QuantumSpecs

Operations intelligence for Kora — payment infrastructure across Nigeria, Ghana, Kenya, South Africa, and the UK.

The console tracks checkout health, incidents, merchants, and deployments. The operations analyst queries that same data through tools, then proposes actions you can run: open an incident, page a team, roll back a release, or disable a payment route.

## Stack

- Next.js App Router, TypeScript, Tailwind
- Prisma + Postgres (Docker locally, Neon on Vercel)
- TanStack Query, Recharts
- Optional OpenAI via the Vercel AI SDK

## Setup

Postgres must be running. From the repo root:

```bash
docker compose up -d
```

In `.env`:

```
DATABASE_URL="postgresql://quantumspecs:quantumspecs@localhost:5432/quantumspecs"
OPENAI_API_KEY=
AI_MODEL="gpt-4o"
```

Then:

```bash
npm install
npx prisma generate
npm run db:reset
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `⌘K` / `Ctrl+K` opens the analyst.

## Deploy to Vercel

Do not use `file:./dev.db` on Vercel. The serverless filesystem cannot keep SQLite.

1. Create a free Postgres database on [Neon](https://console.neon.tech) (GitHub login works).
2. Copy the connection URI (`postgresql://...?sslmode=require`). Use the **direct / non-pooled** string.
3. In the Vercel import screen, set:

   | Key | Value |
   | --- | --- |
   | `DATABASE_URL` | the Neon URI |
   | `OPENAI_API_KEY` | `sk-...` |
   | `AI_MODEL` | `gpt-4o` |
   | `NEXT_PUBLIC_TENANT_NAME` | `Kora` |
   | `NEXT_PUBLIC_OPERATOR_NAME` | `Ewoma` |

4. Push this repo, then Deploy. Build runs `prisma db push` so tables exist.
5. Seed production once from your laptop (this wipes that database and loads Kora):

```bash
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" npm run db:seed
```

## Scripts

| Script | |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run db:reset` | Recreate Postgres schema and seed Kora |
| `npm test` | Unit tests |
| `npm run test:e2e` | Playwright |
| `npm run build` | Production build |

## Seeded scenario

Each reset plants a checkout regression a few hours behind the current time: `checkout-api@2.14.3`, Paystack NG latency, mobile timeouts. Overview surfaces it; the analyst can investigate it.

## Tools

Read: `get_transaction_metrics`, `get_customer`, `search_customers`, `search_incidents`, `get_incident`, `get_deployment`, `query_logs`, `compare_regions`, `get_provider_health`.

Write (confirm in the UI): `create_incident`, `send_notification`, `rollback_deployment`, `disable_payment_route`.
