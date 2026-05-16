# Three-State Site Lock — Design

**Date:** 2026-05-15
**Status:** Approved (brainstorming)
**Repo:** Kwekudomp/avapark-gh

## Problem

The site has an env-toggled maintenance mode (`MAINTENANCE_MODE`, commit `3cc8b3a`).
Two limitations:

1. Flipping it requires editing a Vercel env var and waiting for a redeploy (~60s),
   and requires Vercel dashboard access.
2. It keeps `/admin` open, so it cannot be used as a hard lockout — the client's
   staff keep working regardless.

We need an **instant toggle** (no redeploy) with a **hard lockout** option, so the
site can be locked if the client does not pay outstanding fees.

## Goals

- Toggle site state instantly without a Vercel redeploy or Vercel access.
- Support a hard lockdown that locks the client's `/admin` panel too.
- Keep a normal "soft" maintenance mode for real deploys (admin stays open).
- The public must never see that a lockdown is payment-related.

## Three States

| State         | Public site            | `/admin`              | Use case                  |
|---------------|------------------------|-----------------------|---------------------------|
| `off`         | normal                 | normal                | default                   |
| `maintenance` | → `/maintenance` page  | **stays open**        | real deploys / updates    |
| `lockdown`    | → `/maintenance` page  | → `/maintenance` page | payment leverage          |

The flag lives in a single Supabase row. State is changed from a hidden,
password-protected control page — no redeploy.

## Components

### 1. Supabase table `site_state`

Single-row table holding the current state.

- `id` — fixed primary key (`text`, constant value e.g. `'singleton'`) so there is
  always exactly one row.
- `state` — `text` with a `CHECK` constraint in (`off`, `maintenance`, `lockdown`).
- `updated_at` — `timestamptz`, defaults to `now()`, set on every update.
- `note` — `text`, nullable; optional free-text reason for the change.

**RLS:**
- `SELECT` allowed for `anon` — the flag is not sensitive; middleware reads it
  with the anon key.
- No `INSERT`/`UPDATE`/`DELETE` policy for `anon` or `authenticated` — writes
  happen only via the service-role key, which bypasses RLS.

Delivered as a new migration file under `supabase/migrations/`, seeding the
single row with `state = 'off'`.

### 2. Flag reader — `getSiteState()`

A helper used by the middleware to resolve the current state.

- Reads the `site_state` row via a lightweight `fetch` to the Supabase REST
  (PostgREST) endpoint using the anon key — edge-runtime safe (no `supabase-js`
  client needed in middleware).
- **Module-scope cache** with a ~15s TTL: at most one DB read per warm edge
  instance per 15s, not one per request. A state flip therefore propagates
  within ~15s.
- **Env override:** if `process.env.MAINTENANCE_MODE` is set to `maintenance`
  or `lockdown`, that value wins and no DB read happens. This is the emergency
  hard override for when Supabase or `/sys` is unreachable.
- **Failure handling — fail-open:** if the DB read fails (network/Supabase
  outage) and no env override is set, return `off`. A payment lever must not
  cause a self-inflicted outage; a guaranteed lock is still available via the
  env override.

Resolution order: env override → cached value → fresh DB read → `off`.

### 3. Middleware update — `src/middleware.ts`

Replace the current `process.env.MAINTENANCE_MODE === "true"` check with a call
to `getSiteState()`.

- `off` → no gating; continue with existing pathname-header + admin-auth logic.
- `maintenance` → current behavior. Public traffic rewritten to `/maintenance`;
  allowed prefixes stay reachable: `/admin`, `/api/admin`, `/api/auth`,
  `/maintenance`, `/_next`. Plus `/sys` and `/api/sys` (see below).
- `lockdown` → rewrite **all** traffic, including `/admin` and `/api/admin`, to
  `/maintenance`. Only these stay reachable: `/sys`, `/api/sys`, `/maintenance`,
  `/_next`. This guarantees the control page is always reachable to unlock.

`getSiteState()` is `async`; the middleware is already `async`, so this is a
straightforward `await`.

### 4. Hidden control page — `/sys`

A route that is **not linked anywhere** and carries `robots: noindex`.

- Renders a password form.
- On submit, the password is checked **server-side** against a new
  `MAINTENANCE_SECRET` env var (never sent to the client; never compared
  client-side).
- On correct password, shows the current state and three buttons:
  **Off**, **Maintenance**, **Lockdown**.
- Each button calls `/api/sys` to apply the new state.

The exact path (`/sys`) is fixed; obscurity is a minor layer — the real
protection is the password gate.

### 5. API route — `/api/sys`

- `POST` only.
- Validates the submitted password against `MAINTENANCE_SECRET`.
- On success, updates the `site_state` row (`state`, `updated_at`, optional
  `note`) using a Supabase **service-role** client.
- Returns the new state; on bad password returns `401`.

### 6. `/maintenance` page

Reused unchanged for both `maintenance` and `lockdown`. The public sees the same
neutral "we'll be right back" copy — no indication of a payment dispute. The
client hitting `/admin` during lockdown lands on the same page.

### 7. Env changes

- `MAINTENANCE_SECRET` — new; password for `/sys`. Added to `env.local.example`.
- `MAINTENANCE_MODE` — repurposed: now an optional emergency override accepting
  `maintenance` or `lockdown` (the old `true` value is no longer used). Updated
  in `env.local.example` with a comment explaining it overrides the DB flag.

## Data Flow

```
Developer ── password ──▶ /sys ──▶ /api/sys ──(service role)──▶ site_state row
                                                                      │
Visitor ──▶ middleware ──▶ getSiteState() ──(anon, cached 15s)────────▶│
                  │
                  ├─ off         → normal request
                  ├─ maintenance → rewrite public → /maintenance
                  └─ lockdown    → rewrite all (incl. /admin) → /maintenance
```

## Error Handling

| Situation                          | Behavior                                      |
|------------------------------------|-----------------------------------------------|
| Supabase read fails in middleware  | Fail-open → treat as `off` (site stays up)    |
| `MAINTENANCE_MODE` env set         | Overrides DB flag entirely                    |
| Wrong password at `/sys`           | `401`, no state change                        |
| `MAINTENANCE_SECRET` env unset     | `/sys` rejects all submissions (no access)    |
| `/api/sys` service-role write fails| Return `500`; state unchanged                 |

## Testing

Repo already uses Vitest.

- **`getSiteState()` unit tests:** env override wins; cache returns within TTL
  and refreshes after TTL; DB failure → `off`; valid DB values map correctly.
- **Middleware behavior tests:** for each of the three states, assert which
  paths are rewritten to `/maintenance` and which pass through — in particular
  that `/admin` passes through under `maintenance` but is rewritten under
  `lockdown`, and that `/sys` + `/api/sys` are always reachable.
- **`/api/sys` tests:** wrong password → `401`; correct password → row updated.

## Out of Scope (YAGNI)

- Read-only admin mode.
- Per-page or per-section locking.
- Audit history of state changes (only the latest `updated_at`/`note` is kept).
- Scheduled / time-based auto-lock.
```
