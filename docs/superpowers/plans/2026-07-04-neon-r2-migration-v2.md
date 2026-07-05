# Supabase → Neon + R2 Migration v2 (current main)

**Goal:** Remove Supabase entirely from the CURRENT production codebase (~170 commits ahead of the v1 snapshot): Neon Postgres via Drizzle, Cloudflare R2 uploads, custom multi-user cookie-session auth with roles, WhatsApp realtime inbox → polling. Hosting stays Vercel. Content rebuilt from in-repo seeds (Supabase data unrecoverable — paused org, user declined invoice).

**Baseline:** branch `migrate/neon-r2-v2` from `origin/main` (a50f601). 72 passing tests. v1 branch `migrate/neon-r2` retained for reference; its primitives (db client, session lib, R2 lib, seed scripts) are ported, not merged.

## Architecture decisions

1. **users table replaces Supabase auth.users + profiles** — one table: `id uuid PK, email unique, name, role ('admin'|'marketing_sales'), password_hash, last_sign_in_at, created_at, updated_at`. FKs in `escalations.assigned_to`, `staff_whatsapp.user_id` re-point here.
2. **Sessions**: jose HS256 JWT cookie `hp_admin_session` (7d) carrying `{ sub: userId, email }`. **Role is always read fresh from the DB** by helpers (matches current behavior where role lives in profiles, not JWT — role changes take effect immediately).
3. **Auth helpers keep their exact signatures** (`getCurrentRole(): Promise<UserRole|null>`, `assertAdmin()`, `assertStaff()` in `src/lib/auth/roles.ts`) so ~40 call sites don't change.
4. **Middleware (Edge)**: keep site-lock gate + x-pathname; session check replaces supabase.auth.getUser(). `site-state.ts` swaps its PostgREST fetch for a `@neondatabase/serverless` HTTP query (Edge-compatible); caching/env-override/fail-open/test-hook behavior preserved.
5. **Realtime inbox → polling**: `InboxClient.tsx` polls `GET /api/whatsapp/escalations?venueId=&after=` (new route) every 15s instead of the `postgres_changes` channel. Same UI behavior on new escalations.
6. **Storage**: single upload route → R2; `bucket` form field becomes key prefix (`gallery/`, `experience-images/`). `next/image` remotePatterns add `**.r2.dev`.
7. **RLS → route-level authz**: public inserts (bookings, inquiries, orders, reviews) keep forced-safe values server-side; everything else already goes through assertAdmin/assertStaff.
8. **Tests**: the 6 Supabase-mocking test files are rewritten to mock the new `@/db` / session layer, preserving each test's intent. setup.ts env stubs swap to DATABASE_URL/SESSION_SECRET/R2.

## Phases

**P1 — Core primitives (inline):**
- `src/db/schema.ts` — all 20 tables (8 ported from v1 + users, menu_items, orders, inquiries, site_state, venues, faqs, closures, conversations, messages, escalations, staff_whatsapp)
- `src/db/index.ts`, `drizzle.config.ts` (ported)
- `src/lib/session.ts` (ported, + sub claim), `src/lib/admin-auth.ts`
- `src/lib/auth/roles.ts` rewrite; `src/app/api/auth/{login,logout}/route.ts`
- `src/app/api/admin/users/**` rewrite (bcrypt CRUD, listUsers equivalent)
- `src/middleware.ts` + `src/lib/site-state.ts` (Edge Neon query)
- `src/lib/r2.ts` + `src/app/api/cms/upload/route.ts` + next.config remotePatterns
- `src/app/admin/layout.tsx`, `src/app/admin/page.tsx` (login), signOut swaps (2 dashboards)

**P2 — Area rewrites (parallel subagents, each given the canonical patterns):**
- Area A: `lib/cms.ts` + content CRUD routes (experiences, events, videos, gallery, accommodation, reviews, bookings, settings) + their admin pages
- Area B: WhatsApp — `lib/whatsapp/{agent,resolver}.ts`, api/whatsapp/* routes, admin/whatsapp/* pages, InboxClient polling + new escalations route
- Area C: menu-items, orders, inquiries routes + admin pages + admin/dashboard + admin/users page
- Area D: tests — rewrite 6 supabase-mocking files against new layers; setup.ts

**P3 — Integration (inline):**
- Delete supabase libs/packages; grep gate = zero supabase refs in src/
- `scripts/seed-neon.mjs` v2: run in-repo seeds (settings 10, experiences 16, partners 4, menu 121, site_state singleton, venue placeholder, gallery from public/images) + create initial admin user
- Push schema to Neon, seed, full gate (vitest 72+, tsc, build), local E2E verify (login, dashboard, menu, inbox, upload, public pages)
- Runbook update, Vercel env checklist

## Canonical pattern transforms (for P2 agents)

1. `const supabase = await createServerSupabase(); const {data:{user}} = await supabase.auth.getUser(); if (!user) 401/redirect`
   → `const session = await getAdminSession(); if (!session) 401/redirect` (from `@/lib/admin-auth`) — or keep `assertAdmin()`/`assertStaff()` calls unchanged (they're rewritten in P1).
2. `createAdminSupabase().from("t").select("*").eq(...).order(...)` → `getDb().select().from(t).where(eq(...)).orderBy(asc(...))` (drizzle-orm operators).
3. `.insert([body]).select().single()` → `.insert(t).values(body).returning()` → `[row]`.
4. `.update(x).eq("id",id).select().single()` → `.update(t).set(x).where(eq(t.id,id)).returning()`.
5. Soft-delete stays `set({is_active:false})`.
6. Response JSON keys stay byte-identical.
7. Numeric money columns are `{mode:"number"}` — no string casts.
8. `count: "exact", head: true` → `select({value: count()})`.

## Constraints

- API response shapes unchanged (client components untouched except the 4 that import supabase-browser).
- Table/column names unchanged.
- WhatsApp webhook/classifier/generator/sender: NO changes (no supabase inside).
- All 72 existing tests must pass (rewritten where they mocked supabase, same assertions).
- Env: `DATABASE_URL, SESSION_SECRET, ADMIN_*` (bootstrap only), `R2_*` added; `*SUPABASE*` removed. WhatsApp/Anthropic/Resend/Paystack/MAINTENANCE vars unchanged.
