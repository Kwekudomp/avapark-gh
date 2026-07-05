# Architecture

Last updated: 2026-07-05 (post Supabase → Neon/R2 migration).

## System overview

```
Visitors ──▶ Vercel (Next.js App Router)
                │
                ├─ Public pages (SSR/static) ── src/lib/cms.ts readers
                ├─ /admin panel (session-gated) ── Drizzle queries
                ├─ /api/* route handlers ── Drizzle + route-level authz
                │
                ├──▶ Neon Postgres (Drizzle ORM, HTTP driver)
                ├──▶ Cloudflare R2 (media uploads, public URLs)
                ├──▶ Resend (booking/inquiry notification emails)
                ├──▶ Paystack (deposit verification — ON HOLD, key absent)
                └──▶ Meta WhatsApp Cloud API + Anthropic (AI agent — ON HOLD)
```

There is no separate backend: every server concern is a Next.js route
handler or server component on Vercel. The database is reached over Neon's
serverless HTTP driver (`@neondatabase/serverless`), which also works in
Edge middleware.

## Data model (20 tables, `src/db/schema.ts`)

The schema is the single source of truth; `supabase/migrations/*.sql` is
historical reference only.

- **Auth** — `users` (email, name, role `admin|marketing_sales`,
  `password_hash` bcrypt, `last_sign_in_at`). Replaces Supabase
  `auth.users` + `profiles`.
- **Content** — `experiences`, `gallery_items` (tracks `uploaded_by` →
  users), `events`, `videos`, `reviews`, `accommodation_partners`,
  `site_settings` (key-value).
- **Commerce** — `menu_items` (text PK, 121 kitchen items), `orders`
  (public insert, wa.me handoff), `bookings` (public insert, deposit
  fields), `inquiries` (contact form).
- **Site lock** — `site_state` (singleton row: `off|maintenance|lockdown`).
- **WhatsApp agent** — `venues`, `faqs`, `closures`, `conversations`,
  `messages`, `escalations` (assigned_to → users), `staff_whatsapp`
  (per-venue permissions).

Money columns are `numeric(10,2)` read as JS numbers (`mode:"number"`);
timestamps are ISO strings (`mode:"string"`). There are **no DB triggers**
— the app sets `updated_at` on every update.

## Auth & authorization

- **Login**: `POST /api/auth/login` checks bcrypt against `users`, sets an
  httpOnly cookie `hp_admin_session` — a jose HS256 JWT (`SESSION_SECRET`),
  7-day expiry, payload `{sub: userId, email}`.
- **Middleware** (`src/middleware.ts`, Edge): verifies the cookie for
  `/admin/*`; also applies the site-lock gate (below) and forwards
  `x-pathname` so the admin layout can gate per-route.
- **Roles are never trusted from the token** — `src/lib/auth/roles.ts`
  (`getCurrentRole`, `assertAdmin`, `assertStaff`) reads the role from the
  DB per request, so demotions apply immediately. `marketing_sales` users
  are confined to dashboard/inquiries/gallery by `src/app/admin/layout.tsx`.
- **Route-level authorization replaces RLS**: public POST routes
  (bookings, reviews, orders, inquiries) force safe server-side values
  (e.g. reviews are always `status='pending'`); everything else requires a
  session and, where appropriate, a role or a `staff_whatsapp` row.
- Staff management is at `/admin/users` (create, rename, change role,
  reset password, delete — self-deletion blocked).

## Media (Cloudflare R2)

Single upload endpoint `POST /api/cms/upload` (multipart). The legacy
`bucket` form field is now the R2 **key prefix** (`gallery/`,
`experience-images/`), so client components didn't change. Files get a
timestamped random name and are served from `R2_PUBLIC_URL` (currently the
rate-limited `pub-….r2.dev` — attach `media.hiddenparadisegh.com` before
heavy traffic). Gallery uploads are staff-permitted; other prefixes are
admin-only.

## Site lock (maintenance mode)

`src/lib/site-state.ts` resolves `off | maintenance | lockdown` with:
env override (`MAINTENANCE_MODE`) → 15s in-memory cache → DB read →
stale cache → `off` (fail-open, so a DB outage can never lock the site).
Middleware rewrites gated traffic to `/maintenance`. State is changed via
`POST /api/sys` (password = `MAINTENANCE_SECRET`, rate-limited) or the
hidden `/sys` control page. `maintenance` keeps `/admin` working;
`lockdown` locks everyone out except `/sys`.

## WhatsApp AI agent (ON HOLD — code live, keys absent)

Flow when enabled: Meta webhook → `POST /api/whatsapp/webhook` (HMAC
signature check) → `src/lib/whatsapp/agent.ts` finds/creates the
conversation (24h reuse window) → `classifier.ts` (Claude Haiku) detects
intent/language → high-confidence FAQ/availability/order-status intents get
an auto-reply from `generator.ts` grounded in DB facts (`resolver.ts`:
faqs, experiences, menu, closures) → everything else creates an
`escalations` row for a human. Staff answer from `/admin/whatsapp/inbox`,
which polls `GET /api/whatsapp/escalations` every 15 seconds (this replaced
Supabase Realtime). Replies go out via the Meta Graph API (`sender.ts`).

To enable: set `ANTHROPIC_API_KEY`, `WHATSAPP_ACCESS_TOKEN`,
`WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` on Vercel, and put the real
Meta `phone_number_id` on the venue row (currently
`REPLACE_WITH_REAL_PHONE_NUMBER_ID`).

Normal customer WhatsApp contact does **not** depend on any of this — the
site's WhatsApp buttons and the order flow are plain `wa.me/233540879700`
links.

## Email (Resend)

`src/lib/email.ts` — booking and inquiry notifications from
`noreply@hiddenparadisegh.com` (domain must stay verified in the shared
Resend account). Sends are fire-and-forget: a Resend failure never fails
the API request that triggered it; a missing `RESEND_API_KEY` just logs a
warning and skips.

## Payments (Paystack — ON HOLD, key absent)

`GET /api/paystack/verify` checks a transaction reference server-side;
`POST /api/bookings` rejects reused references. With no
`PAYSTACK_SECRET_KEY` set, verification fails gracefully and bookings
proceed as pay-at-venue.

## Testing

`tests/` (Vitest, 76 tests): middleware site-lock + session gates, auth
role helpers, site-state resolution, `/api/sys`, rate limiting, and the
WhatsApp agent pipeline (webhook parsing, classification thresholds,
escalation logic, fact building, sender). DB access is mocked at the
`@/db` / `@neondatabase/serverless` boundary; session cookies in tests are
real jose tokens.
