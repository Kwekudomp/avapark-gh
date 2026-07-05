# Operations Guide

Day-to-day running of hiddenparadisegh.com. Last updated: 2026-07-05.

## The admin panel (`/admin`)

Sign in at `https://www.hiddenparadisegh.com/admin`. Sessions last 7 days.

| Area | What you manage |
|---|---|
| Dashboard | Bookings list + status, badges for pending reviews/inquiries/escalations |
| Experiences | Add/edit/feature/hide experiences, pricing, package tiers, images |
| Kitchen Menu | Prices and availability for the 121 menu items (`/food-drinks`) |
| Gallery | Upload/hide public photos (stored on Cloudflare R2) |
| Events | Event calendar entries with flyers |
| Videos | YouTube embeds on the home page |
| Accommodation | Partner lodge listings |
| Reviews | Approve/reject guest reviews (only approved ones show publicly) |
| Inquiries | Contact-form messages (also emailed to info@) |
| WhatsApp Agent | AI inbox/FAQs/closures — dormant until the agent is enabled |
| Staff Users | Create/remove accounts, set roles, reset passwords |

**Roles:** `admin` = everything. `marketing_sales` = dashboard, inquiries,
gallery only. Create staff at `/admin/users`; there must always be at least
one admin (self-deletion is blocked, but don't delete the last admin).

**Lost admin password:** any other admin can reset it at `/admin/users`.
If no admin can log in, run locally:
`node -e "console.log(require('bcryptjs').hashSync('NEW-PASSWORD',10))"`
and update `users.password_hash` for the account via the Neon SQL console.

## Deploying

Push to `main` on GitHub (`Kwekudomp/avapark-gh`) → Vercel builds and
deploys production automatically (team `team-qons-app`, project
`hiddenparadisegh`). Check status: `npx vercel ls`. Rollback: Vercel
dashboard → Deployments → promote a previous Ready deployment.

Before merging significant changes: `npm test && npx tsc --noEmit && npm run build`.

## Environment variables

Secrets live in **Vercel → Settings → Environment Variables** (production)
and `.env.local` (local, git-ignored). Never commit secrets;
`env.local.example` documents the shape.

| Variable | Status | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ set | Neon pooled connection string |
| `SESSION_SECRET` | ✅ set | Signs admin session JWTs — rotating it logs everyone out |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` / `R2_PUBLIC_URL` | ✅ set | Cloudflare R2 media |
| `RESEND_API_KEY` | ✅ set | Inquiry/booking notification emails (shared Resend account) |
| `MAINTENANCE_SECRET` | ✅ set | Password for `/sys` site-lock control |
| `MAINTENANCE_MODE` | unset | Emergency env override (`maintenance`/`lockdown`) |
| `PAYSTACK_SECRET_KEY`, `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | ⏸ on hold | Deposit payments |
| `ANTHROPIC_API_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` | ⏸ on hold | WhatsApp AI agent |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | local only | Used once by `scripts/seed-neon.mjs` to create the first admin — never set on Vercel |

## Database (Neon)

Console: console.neon.tech (project `hiddenparadise`, eu-central-1).
Free tier; nothing pauses. Neon keeps point-in-time restore history —
that is the backup story; for belt-and-braces, occasionally run
`pg_dump "$DATABASE_URL" > backup.sql`.

- Schema changes: edit `src/db/schema.ts` → `npm run db:generate` (review
  SQL in `drizzle/`) → `npm run db:push` → commit.
- Re-seeding an empty database: `node scripts/seed-neon.mjs` (idempotent —
  only fills empty tables; needs `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env.local`).

## Media (Cloudflare R2)

Bucket `hiddenparadise-media`, Cloudflare account `64ee37e5…688a`.
Uploads go through the admin panel; direct bucket access via
dash.cloudflare.com → R2. **Pending task:** attach custom domain
`media.hiddenparadisegh.com` (bucket → Settings → Custom Domains), then
update `R2_PUBLIC_URL` on Vercel and rewrite stored image URLs — the
default `pub-….r2.dev` host is rate-limited and not meant for sustained
production traffic.

## Site lock (maintenance / emergency)

Visit `/sys`, enter `MAINTENANCE_SECRET`, choose:
- **off** — normal operation
- **maintenance** — public traffic sees `/maintenance`; `/admin` keeps working
- **lockdown** — everything locked except `/sys` (to lift it again)

If the database is unreachable the site **fails open** (stays up).
Emergency alternative: set `MAINTENANCE_MODE=maintenance` on Vercel and
redeploy — the env override beats the database flag.

## Email (Resend)

Notifications send from `noreply@hiddenparadisegh.com` to
`info@hiddenparadisegh.com`. Requirements: `hiddenparadisegh.com` verified
as a sending domain in the shared Resend account (resend.com → Domains).
Email failures never break the site — they are logged and skipped.

## Turning the on-hold features back on

**Paystack deposits:** add `PAYSTACK_SECRET_KEY` +
`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` on Vercel → redeploy. Booking flow picks
it up; no code changes needed.

**WhatsApp AI agent:** add the four `ANTHROPIC/WHATSAPP` keys on Vercel;
set the venue's real `phone_number_id` (Neon SQL console:
`update venues set phone_number_id = '<meta-id>' where name like 'Hidden%'`);
point the Meta app webhook at
`https://www.hiddenparadisegh.com/api/whatsapp/webhook` with
`WHATSAPP_VERIFY_TOKEN`; redeploy. Staff manage it at `/admin/whatsapp`.
Until then, customers reach you through normal `wa.me` links — no setup needed.

## History / recovery notes

- **2026-07-05:** migrated off Supabase (paused over unpaid Qonsapp-org
  invoices) to Neon + R2. Content was rebuilt from in-repo seeds; historical
  bookings/reviews/orders/inquiries/WhatsApp conversations were left behind.
  The paused Supabase project remains restorable **until 31 Aug 2026** by
  settling that org's invoice, if the old records are ever needed.
- The old `supabase/migrations/` SQL stays in the repo as historical
  reference; the live schema source of truth is `src/db/schema.ts`.
