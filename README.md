# Hidden Paradise Nature Park — hiddenparadisegh.com

Website, booking funnel, and admin CMS for Hidden Paradise Nature Park
(Akuse Road, Okwenya, Eastern Region, Ghana). Public site + `/admin` panel +
WhatsApp ordering, running serverlessly at zero fixed monthly cost.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + React + Tailwind CSS 4 |
| Database | Neon Postgres (serverless) via Drizzle ORM |
| Auth | Cookie sessions (jose HS256 JWT) + bcrypt, roles in `users` table |
| Media storage | Cloudflare R2 (S3 API), public bucket `hiddenparadise-media` |
| Email | Resend (`noreply@hiddenparadisegh.com`) |
| Hosting | Vercel — push to `main` deploys production |
| AI (on hold) | Anthropic Claude for the WhatsApp agent |
| Payments (on hold) | Paystack deposits |

> Migrated off Supabase in July 2026 — see
> [docs/MIGRATION_RUNBOOK.md](docs/MIGRATION_RUNBOOK.md) for the record and
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how everything fits together.

## Local development

```bash
npm install
cp env.local.example .env.local   # fill in DATABASE_URL, SESSION_SECRET, R2_*, …
npm run dev                        # http://localhost:3000
```

Useful scripts:

| Command | What it does |
|---|---|
| `npm run dev` / `npm run build` / `npm start` | Standard Next.js |
| `npm test` | Vitest suite (76 tests) |
| `npm run db:generate` | Generate SQL from `src/db/schema.ts` |
| `npm run db:push` | Push schema to the DB in `DATABASE_URL` |
| `node scripts/seed-neon.mjs` | Seed an empty database (content + first admin) |

## Where things live

```
src/app/            public pages + /admin panel + /api routes
src/db/             Drizzle schema (20 tables) + client
src/lib/            auth, session, cms readers, r2, email, site-state, whatsapp agent
src/components/     public + admin React components
supabase/migrations historical SQL (reference only — schema source of truth is src/db/schema.ts)
scripts/            one-off ops scripts (seeding)
docs/               architecture, operations, migration runbook, feature plans
tests/              vitest suites
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design, data model, auth, integrations
- [docs/OPERATIONS.md](docs/OPERATIONS.md) — running the site day to day: admin panel, staff, deploys, env vars, on-hold features
- [docs/MIGRATION_RUNBOOK.md](docs/MIGRATION_RUNBOOK.md) — the Supabase → Neon/R2 migration record
- [docs/superpowers/plans/](docs/superpowers/plans/) — feature design/implementation plans
