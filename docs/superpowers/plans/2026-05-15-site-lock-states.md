# Three-State Site Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the env-only `MAINTENANCE_MODE` toggle with a Supabase-backed three-state flag (`off` / `maintenance` / `lockdown`) that is flipped instantly from a hidden password-protected page, with `lockdown` also locking the client's `/admin` panel.

**Architecture:** A single-row `site_state` table in Supabase holds the current state. Middleware reads it on every request via `getSiteState()` — a lightweight cached `fetch` to the Supabase REST API. A hidden `/sys` page (password-gated) calls `/api/sys`, which writes the row using the service-role key. An optional `MAINTENANCE_MODE` env var overrides the DB flag for emergencies.

**Tech Stack:** Next.js App Router, TypeScript, Supabase (PostgreSQL + PostgREST), Vitest. Spec: `docs/superpowers/specs/2026-05-15-site-lock-states-design.md`.

---

## File Structure

| File | Responsibility |
|---|---|
| `supabase/migrations/20260515_site_state.sql` | **Create** — `site_state` table, RLS, seed row |
| `src/lib/site-state.ts` | **Create** — `getSiteState()` helper + `SiteState` type, env override, cache, fail-open |
| `src/middleware.ts` | **Modify** — replace env check with three-state gate |
| `src/app/api/sys/route.ts` | **Create** — POST endpoint: password-gated read/write of the flag |
| `src/app/sys/page.tsx` | **Create** — hidden control page (server, `noindex`) |
| `src/app/sys/SysControl.tsx` | **Create** — client component: password gate + 3 state buttons |
| `src/components/PublicShell.tsx` | **Modify** — render `/sys` bare (no nav/footer) |
| `env.local.example` | **Modify** — document `MAINTENANCE_SECRET` + repurposed `MAINTENANCE_MODE` |
| `tests/site-state.test.ts` | **Create** — unit tests for `getSiteState()` |
| `tests/middleware.test.ts` | **Create** — middleware gate behavior tests |
| `tests/api/sys.test.ts` | **Create** — `/api/sys` route tests |

---

## Task 1: Database migration — `site_state` table

**Files:**
- Create: `supabase/migrations/20260515_site_state.sql`

- [ ] **Step 1: Write the migration file**

Create `supabase/migrations/20260515_site_state.sql`:

```sql
-- Site Lock State Migration — adds the single-row site_state flag table.
-- The middleware reads this row (anon key) to gate public/admin traffic.
-- Writes happen only via the service-role key (no write RLS policy below).

create table public.site_state (
  id          text primary key default 'singleton' check (id = 'singleton'),
  state       text not null default 'off' check (state in ('off','maintenance','lockdown')),
  note        text,
  updated_at  timestamptz not null default now()
);

alter table public.site_state enable row level security;

-- The flag is not sensitive — anon (middleware) may read it.
create policy "public_read_site_state" on public.site_state
  for select using (true);

-- No insert/update/delete policy: only the service-role key can write.

-- updated_at trigger — set_updated_at() already exists from 20260425_staff_roles.sql
create trigger site_state_updated_at
  before update on public.site_state
  for each row execute function public.set_updated_at();

-- Seed the single row.
insert into public.site_state (id, state) values ('singleton', 'off')
  on conflict (id) do nothing;
```

- [ ] **Step 2: Apply the migration to Supabase**

Open the Supabase dashboard for the avapark project → SQL Editor → paste the file contents → Run.

- [ ] **Step 3: Verify the table and seed row**

In the SQL Editor run:

```sql
select * from public.site_state;
```

Expected: exactly one row — `id = 'singleton'`, `state = 'off'`, `note = null`, `updated_at` populated.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260515_site_state.sql
git commit -m "feat(db): add site_state flag table for site lock"
```

---

## Task 2: `getSiteState()` helper

**Files:**
- Create: `src/lib/site-state.ts`
- Test: `tests/site-state.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/site-state.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getSiteState, _resetSiteStateCache } from "@/lib/site-state";

describe("getSiteState", () => {
  beforeEach(() => {
    _resetSiteStateCache();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const mockFetch = (rows: Array<{ state: string }>) =>
    vi.fn().mockResolvedValue({ ok: true, json: async () => rows });

  it("returns the env override when MAINTENANCE_MODE=lockdown, without fetching", async () => {
    vi.stubEnv("MAINTENANCE_MODE", "lockdown");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    expect(await getSiteState()).toBe("lockdown");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns the env override when MAINTENANCE_MODE=maintenance", async () => {
    vi.stubEnv("MAINTENANCE_MODE", "maintenance");
    expect(await getSiteState()).toBe("maintenance");
  });

  it("ignores an invalid env override value and reads the DB", async () => {
    vi.stubEnv("MAINTENANCE_MODE", "true");
    vi.stubGlobal("fetch", mockFetch([{ state: "off" }]));
    expect(await getSiteState()).toBe("off");
  });

  it("reads the state from the Supabase REST API", async () => {
    vi.stubGlobal("fetch", mockFetch([{ state: "lockdown" }]));
    expect(await getSiteState()).toBe("lockdown");
  });

  it("caches the value — a second call within TTL does not fetch again", async () => {
    const fetchSpy = mockFetch([{ state: "maintenance" }]);
    vi.stubGlobal("fetch", fetchSpy);
    await getSiteState();
    await getSiteState();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("fails open to 'off' when the fetch throws and there is no cache", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await getSiteState()).toBe("off");
  });

  it("fails open to 'off' when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    expect(await getSiteState()).toBe("off");
  });

  it("returns 'off' when the row holds an unrecognized state", async () => {
    vi.stubGlobal("fetch", mockFetch([{ state: "banana" }]));
    expect(await getSiteState()).toBe("off");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/site-state.test.ts`
Expected: FAIL — `Cannot find module '@/lib/site-state'`.

- [ ] **Step 3: Write the helper**

Create `src/lib/site-state.ts`:

```ts
// Resolves the current site lock state for the middleware gate.
// Resolution order: env override -> fresh cache -> DB read -> stale cache -> 'off'.

export type SiteState = "off" | "maintenance" | "lockdown";

const VALID: readonly SiteState[] = ["off", "maintenance", "lockdown"];
const CACHE_TTL_MS = 15_000;

let cache: { value: SiteState; at: number } | null = null;

/** Test-only: clears the module-scope cache so tests start clean. */
export function _resetSiteStateCache(): void {
  cache = null;
}

function envOverride(): SiteState | null {
  const env = process.env.MAINTENANCE_MODE;
  if (env === "maintenance" || env === "lockdown") return env;
  return null;
}

async function fetchState(): Promise<SiteState> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env not configured");

  const res = await fetch(
    `${url}/rest/v1/site_state?id=eq.singleton&select=state`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`site_state read failed: ${res.status}`);

  const rows = (await res.json()) as Array<{ state?: string }>;
  const state = rows[0]?.state;
  if (state && VALID.includes(state as SiteState)) return state as SiteState;
  return "off";
}

export async function getSiteState(): Promise<SiteState> {
  const override = envOverride();
  if (override) return override;

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.value;
  }

  try {
    const value = await fetchState();
    cache = { value, at: Date.now() };
    return value;
  } catch {
    // Fail-open: never let a flag-read failure take the site down.
    return cache?.value ?? "off";
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- tests/site-state.test.ts`
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/site-state.ts tests/site-state.test.ts
git commit -m "feat(site-state): getSiteState helper with env override + cache"
```

---

## Task 3: Middleware three-state gate

**Files:**
- Modify: `src/middleware.ts`
- Test: `tests/middleware.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/middleware.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/site-state", () => ({ getSiteState: vi.fn() }));
// Middleware imports createServerClient; no test path below reaches it,
// but mock it so the import is inert.
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

import { middleware } from "@/middleware";
import { getSiteState } from "@/lib/site-state";

const req = (path: string) => new NextRequest(`https://example.com${path}`);
const rewriteTarget = (res: Response) => res.headers.get("x-middleware-rewrite");

describe("middleware maintenance gate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("off: lets public traffic through (no rewrite)", async () => {
    vi.mocked(getSiteState).mockResolvedValue("off");
    const res = await middleware(req("/experiences"));
    expect(rewriteTarget(res)).toBeNull();
    expect(res.headers.get("x-pathname")).toBe("/experiences");
  });

  it("maintenance: rewrites public traffic to /maintenance", async () => {
    vi.mocked(getSiteState).mockResolvedValue("maintenance");
    const res = await middleware(req("/experiences"));
    expect(rewriteTarget(res)).toContain("/maintenance");
  });

  it("maintenance: leaves /admin reachable", async () => {
    vi.mocked(getSiteState).mockResolvedValue("maintenance");
    const res = await middleware(req("/admin"));
    expect(rewriteTarget(res)).toBeNull();
  });

  it("maintenance: leaves /sys reachable", async () => {
    vi.mocked(getSiteState).mockResolvedValue("maintenance");
    const res = await middleware(req("/sys"));
    expect(rewriteTarget(res)).toBeNull();
  });

  it("lockdown: rewrites public traffic to /maintenance", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/experiences"));
    expect(rewriteTarget(res)).toContain("/maintenance");
  });

  it("lockdown: rewrites /admin to /maintenance (client locked out)", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/admin"));
    expect(rewriteTarget(res)).toContain("/maintenance");
  });

  it("lockdown: rewrites /api/admin to /maintenance", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/api/admin/bookings"));
    expect(rewriteTarget(res)).toContain("/maintenance");
  });

  it("lockdown: leaves /sys reachable so the lock can be lifted", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/sys"));
    expect(rewriteTarget(res)).toBeNull();
  });

  it("lockdown: leaves /api/sys reachable", async () => {
    vi.mocked(getSiteState).mockResolvedValue("lockdown");
    const res = await middleware(req("/api/sys"));
    expect(rewriteTarget(res)).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/middleware.test.ts`
Expected: FAIL — current middleware checks `process.env.MAINTENANCE_MODE === "true"`, so the `maintenance`/`lockdown` cases do not rewrite.

- [ ] **Step 3: Rewrite the middleware**

Replace the entire contents of `src/middleware.ts` with:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSiteState } from "@/lib/site-state";

// Paths reachable while state = 'maintenance' (real maintenance — admin keeps working).
const MAINTENANCE_ALLOWED_PREFIXES = [
  "/admin",
  "/api/admin",
  "/api/auth",
  "/sys",
  "/api/sys",
  "/maintenance",
  "/_next",
];

// Paths reachable while state = 'lockdown' (hard lock — admin is locked out too).
// Only the control surface and the maintenance page survive, so the lock can be lifted.
const LOCKDOWN_ALLOWED_PREFIXES = [
  "/sys",
  "/api/sys",
  "/maintenance",
  "/_next",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Site lock gate — rewrite gated traffic to /maintenance.
  const siteState = await getSiteState();

  if (
    siteState === "maintenance" &&
    !MAINTENANCE_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  if (
    siteState === "lockdown" &&
    !LOCKDOWN_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  // 2) Always expose pathname via header so the admin layout server component
  // can read it (Next.js App Router does not expose pathname to layouts).
  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  response.headers.set("x-pathname", pathname);

  // 3) Admin auth refresh — only for /admin/* (not /admin itself which is the login page)
  if (!pathname.startsWith("/admin/")) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  // Match all routes except static assets and Next internals. We still need this
  // to be broad enough for the maintenance gate AND narrow enough that static
  // images / fonts / favicons aren't rewritten.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|hp-logo|images/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf)$).*)",
  ],
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- tests/middleware.test.ts`
Expected: PASS — all 9 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts tests/middleware.test.ts
git commit -m "feat(middleware): three-state site lock gate"
```

---

## Task 4: `/api/sys` control endpoint

**Files:**
- Create: `src/app/api/sys/route.ts`
- Test: `tests/api/sys.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/api/sys.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase-server", () => ({ createAdminSupabase: vi.fn() }));

import { createAdminSupabase } from "@/lib/supabase-server";
import { POST } from "@/app/api/sys/route";

// Builds a mock admin client whose select returns `state` and whose update succeeds.
const makeAdmin = (
  state: string | null,
  opts: { updateError?: { message: string }; selectError?: { message: string } } = {}
) => {
  const updateEq = vi.fn().mockResolvedValue({ error: opts.updateError ?? null });
  const update = vi.fn(() => ({ eq: updateEq }));
  const maybeSingle = vi.fn().mockResolvedValue({
    data: state ? { state } : null,
    error: opts.selectError ?? null,
  });
  const select = vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle })) }));
  return { client: { from: vi.fn(() => ({ update, select })) }, update, updateEq };
};

const post = (body: unknown) =>
  POST(new Request("https://example.com/api/sys", {
    method: "POST",
    body: JSON.stringify(body),
  }) as never);

describe("POST /api/sys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("MAINTENANCE_SECRET", "s3cret");
  });

  it("returns 503 when MAINTENANCE_SECRET is not configured", async () => {
    vi.stubEnv("MAINTENANCE_SECRET", "");
    const res = await post({ password: "s3cret" });
    expect(res.status).toBe(503);
  });

  it("returns 401 for a wrong password", async () => {
    const res = await post({ password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("returns the current state for a correct password with no state change", async () => {
    const { client } = makeAdmin("maintenance");
    vi.mocked(createAdminSupabase).mockReturnValue(client as never);
    const res = await post({ password: "s3cret" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ state: "maintenance" });
  });

  it("updates the row and returns the new state", async () => {
    const { client, update } = makeAdmin("lockdown");
    vi.mocked(createAdminSupabase).mockReturnValue(client as never);
    const res = await post({ password: "s3cret", state: "lockdown" });
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({ state: "lockdown" });
    expect(await res.json()).toEqual({ state: "lockdown" });
  });

  it("returns 400 for an invalid state value", async () => {
    const { client } = makeAdmin("off");
    vi.mocked(createAdminSupabase).mockReturnValue(client as never);
    const res = await post({ password: "s3cret", state: "banana" });
    expect(res.status).toBe(400);
  });

  it("returns 500 when the update fails", async () => {
    const { client } = makeAdmin("off", { updateError: { message: "db down" } });
    vi.mocked(createAdminSupabase).mockReturnValue(client as never);
    const res = await post({ password: "s3cret", state: "off" });
    expect(res.status).toBe(500);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/api/sys.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/sys/route'`.

- [ ] **Step 3: Write the route**

Create `src/app/api/sys/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";

const VALID = ["off", "maintenance", "lockdown"] as const;
type SiteState = (typeof VALID)[number];

export async function POST(req: Request) {
  const secret = process.env.MAINTENANCE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Control panel not configured" },
      { status: 503 }
    );
  }

  let body: { password?: string; state?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.password !== secret) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const admin = createAdminSupabase();

  // Apply a state change if one was requested.
  if (body.state !== undefined) {
    if (!VALID.includes(body.state as SiteState)) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }
    const update: { state: string; note?: string } = { state: body.state };
    if (typeof body.note === "string" && body.note.trim()) {
      update.note = body.note.trim();
    }
    const { error } = await admin
      .from("site_state")
      .update(update)
      .eq("id", "singleton");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Return the current state.
  const { data, error } = await admin
    .from("site_state")
    .select("state")
    .eq("id", "singleton")
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ state: data?.state ?? "off" });
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- tests/api/sys.test.ts`
Expected: PASS — all 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/sys/route.ts tests/api/sys.test.ts
git commit -m "feat(api): /api/sys password-gated site lock control endpoint"
```

---

## Task 5: `/sys` control page, PublicShell, and env docs

**Files:**
- Create: `src/app/sys/page.tsx`
- Create: `src/app/sys/SysControl.tsx`
- Modify: `src/components/PublicShell.tsx`
- Modify: `env.local.example`

- [ ] **Step 1: Create the control page (server component)**

Create `src/app/sys/page.tsx`:

```tsx
import SysControl from "./SysControl";

export const metadata = {
  title: "System",
  robots: { index: false, follow: false },
};

export default function SysPage() {
  return <SysControl />;
}
```

- [ ] **Step 2: Create the client control component**

Create `src/app/sys/SysControl.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Power, Wrench, Lock, ShieldAlert } from "lucide-react";

type SiteState = "off" | "maintenance" | "lockdown";

const STATES: { value: SiteState; label: string; icon: typeof Power; hint: string }[] = [
  { value: "off", label: "Off", icon: Power, hint: "Site fully live" },
  { value: "maintenance", label: "Maintenance", icon: Wrench, hint: "Public down, admin stays open" },
  { value: "lockdown", label: "Lockdown", icon: Lock, hint: "Everyone locked out, incl. admin" },
];

export default function SysControl() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [state, setState] = useState<SiteState | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function call(nextState?: SiteState) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/sys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState ? { password, state: nextState } : { password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      setState(data.state as SiteState);
      setUnlocked(true);
    } catch {
      setError("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="flex items-center gap-2 text-primary mb-6">
          <ShieldAlert className="w-6 h-6" strokeWidth={2} />
          <h1 className="font-display text-2xl font-semibold">Site Control</h1>
        </div>

        {!unlocked ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) call();
            }}
            className="space-y-4"
          >
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Control password"
              autoFocus
              className="w-full rounded-lg border border-black/10 px-4 py-3 bg-white text-text-primary outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy || !password}
              className="w-full rounded-lg bg-primary text-white px-4 py-3 font-medium disabled:opacity-50"
            >
              {busy ? "Checking…" : "Unlock"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Current state:{" "}
              <span className="font-semibold text-text-primary">{state}</span>
            </p>
            {STATES.map(({ value, label, icon: Icon, hint }) => (
              <button
                key={value}
                onClick={() => call(value)}
                disabled={busy || state === value}
                className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition disabled:opacity-50 ${
                  state === value
                    ? "border-primary bg-primary/5"
                    : "border-black/10 bg-white hover:border-primary"
                }`}
              >
                <Icon className="w-5 h-5 text-primary shrink-0" strokeWidth={2} />
                <span>
                  <span className="block font-medium text-text-primary">{label}</span>
                  <span className="block text-xs text-text-secondary">{hint}</span>
                </span>
              </button>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-text-secondary/70 pt-2">
              Changes take effect within ~15 seconds.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Render `/sys` bare in PublicShell**

In `src/components/PublicShell.tsx`, change the two body lines that compute `isMaintenance` and the bare-render guard. Replace:

```tsx
  const isMaintenance = pathname.startsWith("/maintenance");

  // Admin pages and the maintenance page render bare (no nav/footer/FAB)
  if (isAdmin || isMaintenance) return <>{children}</>;
```

with:

```tsx
  const isMaintenance = pathname.startsWith("/maintenance");
  const isSys = pathname.startsWith("/sys");

  // Admin, maintenance, and the hidden control page render bare (no nav/footer/FAB)
  if (isAdmin || isMaintenance || isSys) return <>{children}</>;
```

- [ ] **Step 4: Document the env vars**

Append to `env.local.example`:

```
# --- Site Lock ---
# Password for the hidden /sys control page (set/clear the site lock state).
MAINTENANCE_SECRET=choose-a-long-random-string

# Optional emergency override. When set to "maintenance" or "lockdown" it
# overrides the Supabase site_state flag entirely (no DB read). Leave unset
# for normal operation — the /sys page is the day-to-day control.
# MAINTENANCE_MODE=
```

- [ ] **Step 5: Verify the build compiles**

Run: `npm run build`
Expected: build succeeds; route list includes `/sys` and `/api/sys`.

- [ ] **Step 6: Commit**

```bash
git add src/app/sys/page.tsx src/app/sys/SysControl.tsx src/components/PublicShell.tsx env.local.example
git commit -m "feat(sys): hidden password-gated site lock control page"
```

---

## Task 6: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — all suites green, including the three new files.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual smoke test (local)**

1. Set `MAINTENANCE_SECRET` in `.env.local`, run `npm run dev`.
2. Visit `/sys` → enter the password → confirm the three buttons appear and current state shows `off`.
3. Click **Maintenance** → wait ~15s → reload `/` → confirm the maintenance page shows; reload `/admin` → confirm the login page still loads.
4. Click **Lockdown** → wait ~15s → reload `/admin` → confirm it now shows the maintenance page; confirm `/sys` still loads.
5. Click **Off** → wait ~15s → confirm `/` and `/admin` are back to normal.

- [ ] **Step 4: Post-deploy checklist (not a code step)**

After merging and deploying to Vercel:
- Add `MAINTENANCE_SECRET` to Vercel Production env vars.
- Confirm the `site_state` migration has been applied to the production Supabase project.
- Remove any existing `MAINTENANCE_MODE=true` value from Vercel env (the old `true` value no longer does anything; it must be `maintenance` or `lockdown` to act as an override).

---

## Notes for the Implementer

- **TDD order matters:** Tasks 2, 3, 4 are strict test-first. Write the test, watch it fail for the *expected* reason, then implement.
- **`set_updated_at()` already exists** — it was created in `20260425_staff_roles.sql`. Do not redefine it in Task 1.
- **Fail-open is intentional.** If `getSiteState()` can't reach Supabase it returns `off`. A guaranteed lock independent of Supabase is the `MAINTENANCE_MODE` env override.
- **The `/maintenance` page is reused as-is** for both `maintenance` and `lockdown` — no change to `src/app/maintenance/page.tsx`. The public must not see that a lockdown is payment-related.
- **Propagation delay:** flipping the flag takes up to ~15s (the cache TTL) to apply across warm edge instances. This is expected and surfaced to the user in the `/sys` UI.
```
