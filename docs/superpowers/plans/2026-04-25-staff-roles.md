# Staff Roles — Marketing & Sales Officer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a role system to the admin portal — `admin` (full access, status quo) and `marketing_sales` (bookings + enquiries correspondence + own gallery uploads). Admin creates staff accounts via a new `/admin/users` page.

**Architecture:** A `profiles` table keyed to `auth.users.id` stores role + display name. Three SECURITY DEFINER helpers (`current_role`, `is_admin`, `is_staff`) drive RLS on every admin-managed table and storage bucket. A new `/admin/layout.tsx` server component reads the role and redirects MSO away from admin-only routes. The dashboard branches server-side: admin sees today's view (unchanged), MSO sees a focused new client. Existing admin users are backfilled with `role = 'admin'` so nothing breaks on rollout.

**Tech Stack:** Next.js 16 App Router (existing), Supabase PostgreSQL + Auth + Storage (existing), Vitest 4 (existing). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-25-staff-roles-design.md`

---

## File Structure

### New Files

```
supabase/migrations/
  20260425_staff_roles.sql              — profiles table, helpers, RLS rewrite, backfill
src/lib/auth/
  roles.ts                              — getCurrentRole, assertAdmin, assertStaff helpers
tests/auth/
  roles.test.ts                         — unit tests for the role helpers
src/components/admin/
  AdminRoleContext.tsx                  — client context provider for { role, name, email, userId }
  MarketingDashboardClient.tsx          — MSO dashboard view
  UsersAdminClient.tsx                  — Users page list + add/edit/delete modals
src/app/admin/users/
  page.tsx                              — server component, fetches profiles + last_sign_in_at
src/app/api/admin/users/
  route.ts                              — POST create
  [id]/route.ts                         — PATCH update / DELETE remove
```

### Modified Files

```
src/lib/supabase.ts                     — add Profile + UserRole types
src/app/admin/layout.tsx                — convert to server component, role gate
src/app/admin/dashboard/page.tsx        — branch on role
src/components/admin/AdminDashboardClient.tsx — add Staff Users nav card
src/app/admin/gallery/page.tsx          — pass user.id to client
src/components/admin/GalleryCMSClient.tsx — conditional Edit/Delete, show uploader, pass currentUserId
src/app/api/cms/gallery/route.ts        — assertStaff, set uploaded_by, ownership check
src/app/api/cms/inquiries/route.ts      — replace requireAdmin with assertStaff/assertAdmin
src/app/api/cms/upload/route.ts         — assertStaff
src/app/api/bookings/[id]/route.ts      — assertStaff
```

---

## Task 1: Create the migration file scaffolding

**Files:**
- Create: `supabase/migrations/20260425_staff_roles.sql`

- [ ] **Step 1: Create the migration file with the header comment**

Create `supabase/migrations/20260425_staff_roles.sql` with this opening section:

```sql
-- Staff Roles Migration — adds profiles table, role helpers, and updates all RLS policies.
-- Bootstraps existing auth.users into profiles with role = 'admin' so today's admin keeps full access.

-- ──────────────────────────────────────────────────────────────────────────
-- 1. profiles table
-- ──────────────────────────────────────────────────────────────────────────

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null,
  role        text not null default 'admin' check (role in ('admin','marketing_sales')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260425_staff_roles.sql
git commit -m "feat(migration): scaffold profiles table + updated_at trigger"
```

---

## Task 2: Add role helper SQL functions

**Files:**
- Modify: `supabase/migrations/20260425_staff_roles.sql`

- [ ] **Step 1: Append the three SECURITY DEFINER helpers**

Append to `supabase/migrations/20260425_staff_roles.sql`:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- 2. Role helpers (SECURITY DEFINER — bypass profiles RLS to read self)
-- ──────────────────────────────────────────────────────────────────────────

create or replace function public.current_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_role() = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(public.current_role() in ('admin','marketing_sales'), false);
$$;

grant execute on function public.current_role() to authenticated;
grant execute on function public.is_admin()      to authenticated;
grant execute on function public.is_staff()      to authenticated;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260425_staff_roles.sql
git commit -m "feat(migration): add current_role/is_admin/is_staff helpers"
```

---

## Task 3: Add `uploaded_by` column to `gallery_items`

**Files:**
- Modify: `supabase/migrations/20260425_staff_roles.sql`

- [ ] **Step 1: Append the column add**

Append to the migration:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- 3. gallery_items.uploaded_by
-- ──────────────────────────────────────────────────────────────────────────

alter table public.gallery_items
  add column uploaded_by uuid references auth.users(id) on delete set null;

create index gallery_items_uploaded_by_idx on public.gallery_items(uploaded_by);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260425_staff_roles.sql
git commit -m "feat(migration): track uploaded_by on gallery_items"
```

---

## Task 4: Backfill existing users into profiles

**Files:**
- Modify: `supabase/migrations/20260425_staff_roles.sql`

- [ ] **Step 1: Append the backfill INSERT**

Append:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- 4. Backfill — every existing auth.users row becomes an admin profile.
-- Uses the email local-part as a placeholder display name; admin can edit later.
-- ──────────────────────────────────────────────────────────────────────────

insert into public.profiles (id, email, name, role)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
  'admin'
from auth.users u
on conflict (id) do nothing;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260425_staff_roles.sql
git commit -m "feat(migration): backfill existing users as admins"
```

---

## Task 5: Replace RLS on `bookings` and `inquiries`

**Files:**
- Modify: `supabase/migrations/20260425_staff_roles.sql`

- [ ] **Step 1: Append the policy rewrites**

Append:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- 5. RLS — bookings + inquiries (staff full edit; only admin can DELETE)
-- ──────────────────────────────────────────────────────────────────────────

-- BOOKINGS
drop policy if exists "authenticated_manage_bookings" on public.bookings;
drop policy if exists "anon_insert_bookings"          on public.bookings;

create policy "staff_select_bookings" on public.bookings
  for select using (public.is_staff());
create policy "staff_insert_bookings" on public.bookings
  for insert with check (public.is_staff());
create policy "staff_update_bookings" on public.bookings
  for update using (public.is_staff()) with check (public.is_staff());
create policy "admin_delete_bookings" on public.bookings
  for delete using (public.is_admin());
-- Anonymous public booking creation (used by /api/bookings POST)
create policy "anon_insert_bookings" on public.bookings
  for insert with check (true);

-- INQUIRIES
drop policy if exists "authenticated_manage_inquiries" on public.inquiries;
drop policy if exists "anon_insert_inquiries"          on public.inquiries;

create policy "staff_select_inquiries" on public.inquiries
  for select using (public.is_staff());
create policy "staff_update_inquiries" on public.inquiries
  for update using (public.is_staff()) with check (public.is_staff());
create policy "admin_delete_inquiries" on public.inquiries
  for delete using (public.is_admin());
-- Anonymous public form submissions
create policy "anon_insert_inquiries" on public.inquiries
  for insert with check (true);
```

> **Note:** if your existing bookings/inquiries policies have different names, run `select policyname from pg_policies where tablename = 'bookings';` first and update the `drop policy` lines to match. The names above match the convention in `002_cms.sql` (`authenticated_manage_*`).

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260425_staff_roles.sql
git commit -m "feat(migration): role-aware RLS on bookings + inquiries"
```

---

## Task 6: Replace RLS on `gallery_items` and `profiles`

**Files:**
- Modify: `supabase/migrations/20260425_staff_roles.sql`

- [ ] **Step 1: Append gallery_items + profiles policies**

Append:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- 6. RLS — gallery_items (admin full; MSO insert any + edit/delete only own)
--          profiles      (admin full; staff read own)
-- ──────────────────────────────────────────────────────────────────────────

-- GALLERY_ITEMS
drop policy if exists "authenticated_manage_gallery" on public.gallery_items;
-- public_read_gallery (is_active = true) is left in place; do not drop.

create policy "staff_insert_gallery" on public.gallery_items
  for insert with check (public.is_staff());
create policy "gallery_update_own_or_admin" on public.gallery_items
  for update using (public.is_admin() or uploaded_by = auth.uid())
  with check (public.is_admin() or uploaded_by = auth.uid());
create policy "gallery_delete_own_or_admin" on public.gallery_items
  for delete using (public.is_admin() or uploaded_by = auth.uid());

-- PROFILES
create policy "profile_select_self" on public.profiles
  for select using (auth.uid() = id);
create policy "profile_select_all_admin" on public.profiles
  for select using (public.is_admin());
create policy "profile_insert_admin" on public.profiles
  for insert with check (public.is_admin());
create policy "profile_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());
create policy "profile_delete_admin" on public.profiles
  for delete using (public.is_admin());
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260425_staff_roles.sql
git commit -m "feat(migration): role-aware RLS on gallery_items + profiles"
```

---

## Task 7: Replace RLS on remaining admin-only tables

**Files:**
- Modify: `supabase/migrations/20260425_staff_roles.sql`

- [ ] **Step 1: Append admin-only policy rewrites**

Append:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- 7. RLS — admin-only tables (replace `authenticated_manage_*` with is_admin)
-- ──────────────────────────────────────────────────────────────────────────

-- Helper macro pattern — for each table:
--   drop policy if exists "authenticated_manage_<t>" on public.<t>;
--   create policy "admin_manage_<t>" on public.<t>
--     for all using (public.is_admin()) with check (public.is_admin());

-- experiences
drop policy if exists "authenticated_manage_experiences" on public.experiences;
create policy "admin_manage_experiences" on public.experiences
  for all using (public.is_admin()) with check (public.is_admin());

-- events
drop policy if exists "authenticated_manage_events" on public.events;
create policy "admin_manage_events" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- videos
drop policy if exists "authenticated_manage_videos" on public.videos;
create policy "admin_manage_videos" on public.videos
  for all using (public.is_admin()) with check (public.is_admin());

-- menu_items
drop policy if exists "authenticated_manage_menu_items" on public.menu_items;
create policy "admin_manage_menu_items" on public.menu_items
  for all using (public.is_admin()) with check (public.is_admin());

-- reviews
drop policy if exists "authenticated_manage_reviews" on public.reviews;
create policy "admin_manage_reviews" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- accommodation_partners
drop policy if exists "authenticated_manage_accommodation" on public.accommodation_partners;
create policy "admin_manage_accommodation" on public.accommodation_partners
  for all using (public.is_admin()) with check (public.is_admin());

-- site_settings
drop policy if exists "authenticated_manage_site_settings" on public.site_settings;
create policy "admin_manage_site_settings" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- escalations (whatsapp)
drop policy if exists "authenticated_manage_escalations" on public.escalations;
create policy "admin_manage_escalations" on public.escalations
  for all using (public.is_admin()) with check (public.is_admin());

-- whatsapp_conversations + messages + faqs + closures + venue_settings
drop policy if exists "authenticated_manage_wa_conversations" on public.wa_conversations;
create policy "admin_manage_wa_conversations" on public.wa_conversations
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "authenticated_manage_wa_messages" on public.wa_messages;
create policy "admin_manage_wa_messages" on public.wa_messages
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "authenticated_manage_wa_faqs" on public.wa_faqs;
create policy "admin_manage_wa_faqs" on public.wa_faqs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "authenticated_manage_wa_closures" on public.wa_closures;
create policy "admin_manage_wa_closures" on public.wa_closures
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "authenticated_manage_wa_venue_settings" on public.wa_venue_settings;
create policy "admin_manage_wa_venue_settings" on public.wa_venue_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- orders (kitchen)
drop policy if exists "authenticated_manage_orders" on public.orders;
create policy "admin_manage_orders" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());
```

> **Note:** Before running, list every existing `authenticated_manage_*` policy in your DB:
> `select schemaname, tablename, policyname from pg_policies where policyname like 'authenticated_manage_%';`
> Add any missing tables to the migration. The list above covers the tables visible in the migrations directory + git history. If a table doesn't exist, the `drop policy if exists` is a no-op so it's safe to leave.

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260425_staff_roles.sql
git commit -m "feat(migration): admin-only RLS on remaining tables"
```

---

## Task 8: Storage bucket policies

**Files:**
- Modify: `supabase/migrations/20260425_staff_roles.sql`

- [ ] **Step 1: Append storage policy rewrites**

Append:

```sql
-- ──────────────────────────────────────────────────────────────────────────
-- 8. Storage buckets — gallery (staff write, own delete) + experience-images (admin)
-- ──────────────────────────────────────────────────────────────────────────

-- Drop any existing authenticated policies on these buckets (names vary by setup)
drop policy if exists "authenticated_write_gallery"           on storage.objects;
drop policy if exists "authenticated_write_experience_images" on storage.objects;
drop policy if exists "Authenticated users can upload"        on storage.objects;

-- GALLERY bucket — staff upload, admin or owner can update/delete
create policy "gallery_staff_insert" on storage.objects
  for insert with check (bucket_id = 'gallery' and public.is_staff());

create policy "gallery_owner_update" on storage.objects
  for update using (
    bucket_id = 'gallery' and (public.is_admin() or owner = auth.uid())
  ) with check (
    bucket_id = 'gallery' and (public.is_admin() or owner = auth.uid())
  );

create policy "gallery_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'gallery' and (public.is_admin() or owner = auth.uid())
  );

-- EXPERIENCE-IMAGES bucket — admin only for writes
create policy "experience_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'experience-images' and public.is_admin());

create policy "experience_images_admin_update" on storage.objects
  for update using (bucket_id = 'experience-images' and public.is_admin())
  with check (bucket_id = 'experience-images' and public.is_admin());

create policy "experience_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'experience-images' and public.is_admin());

-- Public SELECT on both buckets is assumed already configured (public buckets).
-- If you previously had named SELECT policies, leave them in place.
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260425_staff_roles.sql
git commit -m "feat(migration): role-aware storage bucket policies"
```

---

## Task 9: Apply the migration to Supabase

**Files:** none (manual operation)

- [ ] **Step 1: Run migration via Supabase CLI**

If using Supabase CLI locally:
```bash
cd C:/Users/kweku/AppData/Local/Temp/avapark-gh
npx supabase db push
```

Or paste the contents of `supabase/migrations/20260425_staff_roles.sql` into the Supabase SQL Editor (dashboard) and run.

- [ ] **Step 2: Verify by querying profiles**

In Supabase SQL Editor, run:
```sql
select id, email, name, role from public.profiles;
```

Expected: one row per existing user in `auth.users`, all with `role = 'admin'`.

- [ ] **Step 3: Verify the helpers**

```sql
-- as your logged-in user (in SQL editor session as authenticated):
select public.current_role(), public.is_admin(), public.is_staff();
```

Expected: `('admin', true, true)`.

- [ ] **Step 4: Verify policies were created**

```sql
select tablename, policyname from pg_policies
where policyname in (
  'staff_select_bookings','admin_delete_bookings',
  'staff_select_inquiries','admin_delete_inquiries',
  'gallery_update_own_or_admin','gallery_delete_own_or_admin',
  'admin_manage_experiences','admin_manage_events',
  'gallery_staff_insert','experience_images_admin_insert'
)
order by tablename, policyname;
```

Expected: 10 rows.

---

## Task 10: Add `Profile` and `UserRole` types

**Files:**
- Modify: `src/lib/supabase.ts`

- [ ] **Step 1: Add type exports**

Add at the top of `src/lib/supabase.ts` (after `BookingStatus`):

```ts
export type UserRole = "admin" | "marketing_sales";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
```

- [ ] **Step 2: Add `uploaded_by` to GalleryItem**

In the same file, update the `GalleryItem` interface:

```ts
export interface GalleryItem {
  id: string;
  url: string;
  alt: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  uploaded_by: string | null;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat(types): add Profile, UserRole types + uploaded_by"
```

---

## Task 11: Write failing tests for the role helpers

**Files:**
- Create: `tests/auth/roles.test.ts`

- [ ] **Step 1: Write the test file**

Create `tests/auth/roles.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the supabase-server module before importing the helper
vi.mock("@/lib/supabase-server", () => ({
  createServerSupabase: vi.fn(),
  createAdminSupabase: vi.fn(),
}));

import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { getCurrentRole, assertAdmin, assertStaff } from "@/lib/auth/roles";

const makeUserClient = (userId: string | null) => ({
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }) },
});

const makeAdminClient = (role: string | null, lookupId?: string) => ({
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn().mockResolvedValue({
          data: role ? { role } : null,
          error: null,
        }),
      })),
    })),
  })),
  __lookupId: lookupId,
});

describe("auth/roles", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("getCurrentRole", () => {
    it("returns null when no user is signed in", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient(null) as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient(null) as never);
      expect(await getCurrentRole()).toBeNull();
    });

    it("returns 'admin' when the user has an admin profile", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-1") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("admin") as never);
      expect(await getCurrentRole()).toBe("admin");
    });

    it("returns 'marketing_sales' when the user has that profile", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-2") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("marketing_sales") as never);
      expect(await getCurrentRole()).toBe("marketing_sales");
    });

    it("returns null when the user has no profile row yet", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-3") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient(null) as never);
      expect(await getCurrentRole()).toBeNull();
    });
  });

  describe("assertAdmin", () => {
    it("returns the user when role is admin", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-1") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("admin") as never);
      const result = await assertAdmin();
      expect(result).toEqual({ ok: true, userId: "user-1" });
    });

    it("returns ok:false for marketing_sales", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-2") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("marketing_sales") as never);
      const result = await assertAdmin();
      expect(result).toEqual({ ok: false, status: 403 });
    });

    it("returns ok:false 401 when unauthenticated", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient(null) as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient(null) as never);
      const result = await assertAdmin();
      expect(result).toEqual({ ok: false, status: 401 });
    });
  });

  describe("assertStaff", () => {
    it("returns ok:true for admin", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-1") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("admin") as never);
      const result = await assertStaff();
      expect(result).toEqual({ ok: true, userId: "user-1", role: "admin" });
    });

    it("returns ok:true for marketing_sales", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient("user-2") as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient("marketing_sales") as never);
      const result = await assertStaff();
      expect(result).toEqual({ ok: true, userId: "user-2", role: "marketing_sales" });
    });

    it("returns ok:false 401 when unauthenticated", async () => {
      vi.mocked(createServerSupabase).mockResolvedValue(makeUserClient(null) as never);
      vi.mocked(createAdminSupabase).mockReturnValue(makeAdminClient(null) as never);
      const result = await assertStaff();
      expect(result).toEqual({ ok: false, status: 401 });
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd C:/Users/kweku/AppData/Local/Temp/avapark-gh
npm test -- tests/auth/roles.test.ts
```

Expected: FAIL — module `@/lib/auth/roles` not found.

---

## Task 12: Implement the role helpers

**Files:**
- Create: `src/lib/auth/roles.ts`

- [ ] **Step 1: Implement the helpers**

Create `src/lib/auth/roles.ts`:

```ts
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import type { UserRole } from "@/lib/supabase";

/**
 * Returns the calling user's role from the profiles table, or null if
 * the user is not signed in or has no profile row yet.
 *
 * Reads via the service-role client so it bypasses profiles RLS without
 * needing to grant SELECT to authenticated.
 */
export async function getCurrentRole(): Promise<UserRole | null> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminSupabase();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (data?.role as UserRole | undefined) ?? null;
}

export type AuthOk = { ok: true; userId: string; role: UserRole };
export type AuthFail = { ok: false; status: 401 | 403 };

/**
 * For API routes — verifies the caller is an admin.
 * Returns { ok: true, userId } or { ok: false, status } on failure.
 */
export async function assertAdmin(): Promise<{ ok: true; userId: string } | AuthFail> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401 };

  const role = await getCurrentRole();
  if (role !== "admin") return { ok: false, status: 403 };
  return { ok: true, userId: user.id };
}

/**
 * For API routes — verifies the caller is staff (admin OR marketing_sales).
 */
export async function assertStaff(): Promise<AuthOk | AuthFail> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401 };

  const role = await getCurrentRole();
  if (role !== "admin" && role !== "marketing_sales") return { ok: false, status: 403 };
  return { ok: true, userId: user.id, role };
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npm test -- tests/auth/roles.test.ts
```

Expected: 11 tests pass.

- [ ] **Step 3: Commit**

```bash
git add tests/auth/roles.test.ts src/lib/auth/roles.ts
git commit -m "feat(auth): add getCurrentRole/assertAdmin/assertStaff helpers"
```

---

## Task 13: Wire role helpers into existing API routes

**Files:**
- Modify: `src/app/api/cms/inquiries/route.ts`
- Modify: `src/app/api/cms/upload/route.ts`
- Modify: `src/app/api/bookings/[id]/route.ts`

- [ ] **Step 1: Update inquiries route**

Replace the entire file `src/app/api/cms/inquiries/route.ts` with:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";
import { assertStaff, assertAdmin } from "@/lib/auth/roles";

export async function GET() {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inquiries: data });
}

export async function PATCH(req: NextRequest) {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id, status, admin_note } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (status && !["unread", "read", "archived"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const admin = createAdminSupabase();
  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (admin_note !== undefined) updates.admin_note = admin_note;
  const { data, error } = await admin
    .from("inquiries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inquiry: data });
}

export async function DELETE(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const admin = createAdminSupabase();
  const { error } = await admin.from("inquiries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Update upload route**

Replace `src/app/api/cms/upload/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";
import { assertStaff, assertAdmin } from "@/lib/auth/roles";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) || "gallery";

  // Gallery uploads → staff. Anything else (experience-images, etc) → admin only.
  const auth = bucket === "gallery" ? await assertStaff() : await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const admin = createAdminSupabase();
  const { error } = await admin.storage
    .from(bucket)
    .upload(filename, file, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(filename);

  return NextResponse.json({ url: publicUrl });
}
```

- [ ] **Step 3: Update bookings PATCH route**

Replace `src/app/api/bookings/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";
import { assertStaff } from "@/lib/auth/roles";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await assertStaff();
    if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

    const { id } = await params;
    const body = await req.json();
    const { status, admin_notes } = body;

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    const admin = createAdminSupabase();
    const { data, error } = await admin
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("Update booking error:", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Lint & build to verify no broken imports**

```bash
npm run lint && npm run build
```

Expected: lint clean; build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/cms/inquiries/route.ts src/app/api/cms/upload/route.ts src/app/api/bookings/[id]/route.ts
git commit -m "feat(api): role-aware auth on inquiries, upload, bookings PATCH"
```

---

## Task 14: Update gallery API for ownership tracking

**Files:**
- Modify: `src/app/api/cms/gallery/route.ts`

- [ ] **Step 1: Replace the gallery route**

Replace `src/app/api/cms/gallery/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";
import { assertStaff } from "@/lib/auth/roles";

export async function GET() {
  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const body = await req.json();
  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from("gallery_items")
    .insert([{ ...body, uploaded_by: auth.userId }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

/**
 * Soft-delete (sets is_active = false). Allowed for admin OR the item's uploader.
 * Marketing_sales who try to delete someone else's item get 403.
 */
export async function DELETE(req: NextRequest) {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminSupabase();

  // Ownership check (admin can override)
  if (auth.role !== "admin") {
    const { data: item } = await admin
      .from("gallery_items")
      .select("uploaded_by")
      .eq("id", id)
      .maybeSingle();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.uploaded_by !== auth.userId) {
      return NextResponse.json({ error: "Cannot delete items uploaded by others" }, { status: 403 });
    }
  }

  const { error } = await admin.from("gallery_items").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Lint & build**

```bash
npm run lint && npm run build
```

Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/cms/gallery/route.ts
git commit -m "feat(api): track gallery uploader + enforce ownership on delete"
```

---

## Task 15: Create AdminRoleContext

**Files:**
- Create: `src/components/admin/AdminRoleContext.tsx`

- [ ] **Step 1: Create the context provider**

Create `src/components/admin/AdminRoleContext.tsx`:

```tsx
"use client";

import { createContext, useContext } from "react";
import type { UserRole } from "@/lib/supabase";

export interface AdminRoleValue {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

const AdminRoleContext = createContext<AdminRoleValue | null>(null);

export function AdminRoleProvider({
  value,
  children,
}: {
  value: AdminRoleValue;
  children: React.ReactNode;
}) {
  return <AdminRoleContext.Provider value={value}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole(): AdminRoleValue {
  const ctx = useContext(AdminRoleContext);
  if (!ctx) throw new Error("useAdminRole must be used inside <AdminRoleProvider>");
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/AdminRoleContext.tsx
git commit -m "feat(admin): add AdminRoleContext provider"
```

---

## Task 16: Convert `/admin/layout.tsx` to a server-component role gate

**Files:**
- Modify: `src/app/admin/layout.tsx`

- [ ] **Step 1: Replace the layout**

Replace `src/app/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { AdminRoleProvider } from "@/components/admin/AdminRoleContext";
import type { UserRole } from "@/lib/supabase";

const MSO_ALLOWED_PREFIXES = [
  "/admin",                 // login page itself
  "/admin/dashboard",
  "/admin/inquiries",
  "/admin/gallery",
];

function isMsoAllowed(pathname: string): boolean {
  // Exact match for /admin (login). Everything else must match an allowed prefix.
  if (pathname === "/admin") return true;
  return MSO_ALLOWED_PREFIXES.slice(1).some(p => pathname === p || pathname.startsWith(p + "/"));
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Read pathname so we can gate routes. The /admin login page must be
  // accessible without a session — so we only gate when /admin/* and not /admin itself.
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? hdrs.get("x-url") ?? "";

  // /admin (login) — let the page render without checks
  if (pathname === "/admin" || pathname === "" || pathname.endsWith("/admin")) {
    return <>{children}</>;
  }

  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const adminClient = createAdminSupabase();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    // Auth user with no profile row — security fail-closed.
    redirect("/admin");
  }

  const role = profile.role as UserRole;

  // Route gating for marketing_sales
  if (role === "marketing_sales" && !isMsoAllowed(pathname)) {
    redirect("/admin/dashboard");
  }

  return (
    <AdminRoleProvider
      value={{
        userId: user.id,
        email: profile.email,
        name: profile.name,
        role,
      }}
    >
      {children}
    </AdminRoleProvider>
  );
}
```

> **Note on `x-pathname`:** Next.js doesn't expose pathname in server layouts by default. Add a middleware shim in the next task to set `x-pathname` on every request.

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/layout.tsx
git commit -m "feat(admin): convert admin layout to server-side role gate"
```

---

## Task 17: Add middleware to expose pathname header

**Files:**
- Create: `src/middleware.ts` (only if it doesn't exist; if it does, modify)

- [ ] **Step 1: Check if middleware.ts exists**

```bash
ls C:/Users/kweku/AppData/Local/Temp/avapark-gh/src/middleware.ts 2>&1 || ls C:/Users/kweku/AppData/Local/Temp/avapark-gh/middleware.ts 2>&1
```

- [ ] **Step 2: Create or extend middleware**

If `src/middleware.ts` does not exist, create it with:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

If middleware already exists, add the `res.headers.set("x-pathname", req.nextUrl.pathname);` line to the response and ensure `/admin/:path*` is in the matcher.

- [ ] **Step 3: Verify by running dev server**

```bash
npm run dev
```

Open browser to `http://localhost:3000/admin/dashboard`. As an existing admin (you), you should see the dashboard. The page should not crash.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(middleware): expose x-pathname header for admin layout gate"
```

---

## Task 18: Build the user-creation API (POST)

**Files:**
- Create: `src/app/api/admin/users/route.ts`

- [ ] **Step 1: Write the POST handler**

Create `src/app/api/admin/users/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";
import { assertAdmin } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/supabase";

const VALID_ROLES: UserRole[] = ["admin", "marketing_sales"];

export async function GET() {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const admin = createAdminSupabase();

  // Pull profiles + last_sign_in_at (server-side join — service-role can read auth.users)
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with last_sign_in_at from auth.admin
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers();
  const lastSignInById = new Map(authUsers.map(u => [u.id, u.last_sign_in_at]));

  const enriched = (profiles ?? []).map(p => ({
    ...p,
    last_sign_in_at: lastSignInById.get(p.id) ?? null,
  }));

  return NextResponse.json({ users: enriched });
}

export async function POST(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const body = await req.json() as { email?: string; name?: string; role?: string; password?: string };
  const { email, name, role, password } = body;

  if (!email || !name || !role || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!VALID_ROLES.includes(role as UserRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const admin = createAdminSupabase();

  // Step 1 — create the auth user
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message ?? "Failed to create user" }, { status: 500 });
  }

  // Step 2 — insert profile
  const { error: profileErr } = await admin.from("profiles").insert({
    id: created.user.id,
    email,
    name,
    role,
  });

  if (profileErr) {
    // Rollback the auth user so we don't leave a half-created account
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  return NextResponse.json({
    user: { id: created.user.id, email, name, role },
  });
}
```

- [ ] **Step 2: Lint & build**

```bash
npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/users/route.ts
git commit -m "feat(api): POST /api/admin/users — admin creates staff"
```

---

## Task 19: Build PATCH and DELETE for users

**Files:**
- Create: `src/app/api/admin/users/[id]/route.ts`

- [ ] **Step 1: Write the [id] route**

Create `src/app/api/admin/users/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";
import { assertAdmin } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/supabase";

const VALID_ROLES: UserRole[] = ["admin", "marketing_sales"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await params;
  const body = await req.json() as { name?: string; role?: string; password?: string };
  const { name, role, password } = body;

  const admin = createAdminSupabase();

  if (role !== undefined && !VALID_ROLES.includes(role as UserRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (password !== undefined && password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  // Update profile (name + role)
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (role !== undefined) updates.role = role;
  if (Object.keys(updates).length > 0) {
    const { error } = await admin.from("profiles").update(updates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update password
  if (password !== undefined) {
    const { error } = await admin.auth.admin.updateUserById(id, { password });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await params;

  // Don't allow self-deletion (admins can lock themselves out otherwise)
  if (id === auth.userId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  const admin = createAdminSupabase();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // profiles row cascades via FK on delete

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Lint & build**

```bash
npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/users/[id]/route.ts
git commit -m "feat(api): PATCH/DELETE /api/admin/users/[id]"
```

---

## Task 20: Build the Users admin page (server component)

**Files:**
- Create: `src/app/admin/users/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/admin/users/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { getCurrentRole } from "@/lib/auth/roles";
import UsersAdminClient, { type StaffRow } from "@/components/admin/UsersAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const role = await getCurrentRole();
  if (role !== "admin") redirect("/admin/dashboard");

  const admin = createAdminSupabase();
  const { data: profiles } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: { users: authUsers } } = await admin.auth.admin.listUsers();
  const lastSignInById = new Map(authUsers.map(u => [u.id, u.last_sign_in_at]));

  const rows: StaffRow[] = (profiles ?? []).map(p => ({
    id: p.id,
    email: p.email,
    name: p.name,
    role: p.role,
    created_at: p.created_at,
    last_sign_in_at: lastSignInById.get(p.id) ?? null,
  }));

  return <UsersAdminClient initialUsers={rows} currentAdminId={user.id} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/users/page.tsx
git commit -m "feat(admin): /admin/users server page"
```

---

## Task 21: Build UsersAdminClient — list view

**Files:**
- Create: `src/components/admin/UsersAdminClient.tsx`

- [ ] **Step 1: Create the client component (list view only — modals come next)**

Create `src/components/admin/UsersAdminClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { UserRole } from "@/lib/supabase";

export interface StaffRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  last_sign_in_at: string | null;
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  marketing_sales: "Marketing & Sales",
};

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-primary/10 text-primary",
  marketing_sales: "bg-accent/10 text-accent",
};

function formatDate(s: string | null): string {
  if (!s) return "Never";
  return new Date(s).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

export default function UsersAdminClient({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: StaffRow[];
  currentAdminId: string;
}) {
  const [users, setUsers] = useState<StaffRow[]>(initialUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);

  // Modal placeholders — implementation in next task
  // (We'll dynamically import or inline AddStaffModal + EditStaffModal there.)

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm transition">
          ← Dashboard
        </Link>
        <h1 className="font-semibold">Staff Users</h1>
        <span className="text-white/40 text-sm">({users.length})</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => setShowAdd(true)}
            className="bg-accent text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">No staff yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-bg-alt border-b border-border">
                <tr>
                  {["Name", "Email", "Role", "Created", "Last sign-in", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-bg-alt/50 transition">
                    <td className="px-4 py-3 font-medium text-dark">{u.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(u.last_sign_in_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditing(u)}
                          className="p-1.5 text-text-secondary hover:text-primary transition"
                          aria-label={`Edit ${u.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u, setUsers, currentAdminId)}
                          className="p-1.5 text-text-secondary hover:text-red-600 transition disabled:opacity-30"
                          disabled={u.id === currentAdminId}
                          aria-label={`Delete ${u.name}`}
                          title={u.id === currentAdminId ? "Cannot delete yourself" : ""}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <AddStaffModal
          onClose={() => setShowAdd(false)}
          onCreated={(row) => setUsers(prev => [row, ...prev])}
        />
      )}
      {editing && (
        <EditStaffModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

async function handleDelete(
  user: StaffRow,
  setUsers: React.Dispatch<React.SetStateAction<StaffRow[]>>,
  currentAdminId: string,
) {
  if (user.id === currentAdminId) return;
  if (!confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) return;
  const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.error ?? "Delete failed");
    return;
  }
  setUsers(prev => prev.filter(u => u.id !== user.id));
}

// Modals — implemented in Task 22
function AddStaffModal(_: { onClose: () => void; onCreated: (row: StaffRow) => void }) { return null; }
function EditStaffModal(_: { user: StaffRow; onClose: () => void; onSaved: (updated: Partial<StaffRow> & { id: string }) => void }) { return null; }
```

- [ ] **Step 2: Build to make sure imports resolve**

```bash
npm run build
```

Expected: build succeeds (modals are stubs but typed correctly).

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/UsersAdminClient.tsx
git commit -m "feat(admin): UsersAdminClient list view + delete"
```

---

## Task 22: Implement Add and Edit modals

**Files:**
- Modify: `src/components/admin/UsersAdminClient.tsx`

- [ ] **Step 1: Replace the modal stubs with real implementations**

In `src/components/admin/UsersAdminClient.tsx`, replace the two stub functions at the bottom (`AddStaffModal` and `EditStaffModal`) with the implementations below. **All imports needed (`useState`, `Plus`, `Pencil`, `Trash2`, `UserRole`) are already at the top from Task 21 — do not add new imports.**

```tsx
function AddStaffModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (row: StaffRow) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("marketing_sales");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setSubmitting(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create user");
      setSubmitting(false);
      return;
    }
    // Copy password to clipboard
    try { await navigator.clipboard.writeText(password); } catch { /* noop */ }
    onCreated({
      id: data.user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
    });
    setDone(true);
    setTimeout(() => onClose(), 2500);
  }

  return (
    <ModalShell title="Add Staff" onClose={onClose}>
      {done ? (
        <div className="text-center py-6">
          <p className="text-green-700 font-semibold">✓ Created — password copied to clipboard.</p>
          <p className="text-text-secondary text-sm mt-1">Send to user via WhatsApp or in person.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name">
            <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
          </Field>
          <Field label="Role">
            <select className={inputClass} value={role} onChange={e => setRole(e.target.value as UserRole)}>
              <option value="marketing_sales">Marketing & Sales Officer</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Password (min 8 chars)">
            <PasswordField value={password} onChange={setPassword} show={showPwd} onToggleShow={() => setShowPwd(s => !s)} />
          </Field>
          <Field label="Confirm Password">
            <input className={inputClass} type={showPwd ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </Field>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-full text-sm border border-border hover:bg-bg-alt transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-light transition disabled:opacity-60">
              {submitting ? "Creating…" : "Create Staff"}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

function EditStaffModal({
  user,
  onClose,
  onSaved,
}: {
  user: StaffRow;
  onClose: () => void;
  onSaved: (updated: Partial<StaffRow> & { id: string }) => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [resetting, setResetting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (resetting) {
      if (password.length < 8) return setError("Password must be at least 8 characters");
      if (password !== confirm) return setError("Passwords do not match");
    }
    setSubmitting(true);
    const body: Record<string, unknown> = { name, role };
    if (resetting) body.password = password;

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to save");
      setSubmitting(false);
      return;
    }
    if (resetting) {
      try { await navigator.clipboard.writeText(password); } catch { /* noop */ }
      alert("Password reset and copied to clipboard.");
    }
    onSaved({ id: user.id, name, role });
  }

  return (
    <ModalShell title={`Edit ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Email (read-only)">
          <input className={`${inputClass} bg-bg-alt`} value={user.email} disabled />
        </Field>
        <Field label="Role">
          <select className={inputClass} value={role} onChange={e => setRole(e.target.value as UserRole)}>
            <option value="marketing_sales">Marketing & Sales Officer</option>
            <option value="admin">Admin</option>
          </select>
        </Field>

        <div className="border-t border-border pt-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={resetting} onChange={e => setResetting(e.target.checked)} />
            <span>Reset password</span>
          </label>
          {resetting && (
            <div className="mt-3 space-y-3">
              <Field label="New password (min 8)">
                <PasswordField value={password} onChange={setPassword} show={showPwd} onToggleShow={() => setShowPwd(s => !s)} />
              </Field>
              <Field label="Confirm new password">
                <input className={inputClass} type={showPwd ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required={resetting} />
              </Field>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-full text-sm border border-border hover:bg-bg-alt transition">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-light transition disabled:opacity-60">
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ───────────────────────────── helpers ─────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PasswordField({
  value, onChange, show, onToggleShow,
}: {
  value: string; onChange: (v: string) => void; show: boolean; onToggleShow: () => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        className={`${inputClass} flex-1`}
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      <button type="button" onClick={onToggleShow}
        className="px-3 py-2 rounded-xl text-xs border border-border hover:bg-bg-alt transition">
        {show ? "Hide" : "Show"}
      </button>
      <button type="button" onClick={() => navigator.clipboard.writeText(value).catch(() => {})}
        className="px-3 py-2 rounded-xl text-xs border border-border hover:bg-bg-alt transition">
        Copy
      </button>
    </div>
  );
}

function ModalShell({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-dark transition" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

> **Important:** delete the two old stub function declarations from the bottom of the file before pasting the replacements above.

- [ ] **Step 2: Build & manual smoke test**

```bash
npm run build && npm run dev
```

Open `http://localhost:3000/admin/users`, click "Add Staff", create a test MSO. Confirm the row appears.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/UsersAdminClient.tsx
git commit -m "feat(admin): Add/Edit staff modals with password reset"
```

---

## Task 23: Build the Marketing dashboard client

**Files:**
- Create: `src/components/admin/MarketingDashboardClient.tsx`

- [ ] **Step 1: Create the MSO dashboard view**

Create `src/components/admin/MarketingDashboardClient.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Inbox, Calendar, Image as ImageIcon } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Booking, BookingStatus, GalleryItem } from "@/lib/supabase";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function MarketingDashboardClient({
  initialBookings,
  unreadInquiries,
  recentUploads,
  userName,
  userEmail,
}: {
  initialBookings: Booking[];
  unreadInquiries: number;
  recentUploads: GalleryItem[];
  userName: string;
  userEmail: string;
}) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<"all" | BookingStatus>("pending");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleSignOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  }

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } finally {
      setUpdating(null);
    }
  }

  const pendingCount = bookings.filter(b => b.status === "pending").length;

  const filtered = bookings.filter(b => {
    const matchesStatus = filter === "all" || b.status === filter;
    const matchesSearch = !search ||
      b.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_email.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_phone.includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hp-logo.png" alt="" className="h-8 w-auto" />
          <div>
            <h1 className="font-semibold text-sm">Hidden Paradise</h1>
            <p className="text-white/60 text-xs">Marketing & Sales — {userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-xs hidden sm:block">{userEmail}</span>
          <button onClick={handleSignOut}
            className="text-xs text-white/80 hover:text-white border border-white/30 px-3 py-1.5 rounded-full transition">
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/admin/inquiries" className="bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-sm transition flex items-start gap-4">
            <Inbox className="w-7 h-7 text-primary mt-1" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Unread Enquiries</p>
              <p className="text-2xl font-bold mt-1 text-primary">{unreadInquiries}</p>
              <p className="text-xs text-text-secondary mt-1">Reply to website contact-form messages</p>
            </div>
          </Link>

          <div className="bg-white rounded-2xl border border-border p-5 flex items-start gap-4">
            <Calendar className="w-7 h-7 text-yellow-600 mt-1" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Bookings to Follow Up</p>
              <p className="text-2xl font-bold mt-1 text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-text-secondary mt-1">Pending bookings awaiting confirmation</p>
            </div>
          </div>

          <Link href="/admin/gallery" className="bg-white rounded-2xl border border-border p-5 hover:border-primary hover:shadow-sm transition flex items-start gap-4">
            <ImageIcon className="w-7 h-7 text-accent mt-1" />
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Gallery</p>
              <p className="text-2xl font-bold mt-1 text-accent">Upload</p>
              <p className="text-xs text-text-secondary mt-1">Add photos to the public gallery</p>
            </div>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone, email..."
              className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <div className="flex gap-2 flex-wrap">
              {(["all","pending","confirmed","cancelled"] as const).map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition ${
                    filter === s ? "bg-primary text-white" : "bg-white border border-border text-text-secondary hover:border-primary"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings table */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">No bookings match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-alt border-b border-border">
                  <tr>
                    {["Guest","Experience","Date","Status","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(b => (
                    <tr key={b.id} className="hover:bg-bg-alt/50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-dark">{b.guest_name}</p>
                        <p className="text-text-secondary text-xs">{b.guest_email}</p>
                        <a href={`tel:${b.guest_phone}`} className="text-accent text-xs hover:underline">{b.guest_phone}</a>
                      </td>
                      <td className="px-4 py-3">{b.experience_name}</td>
                      <td className="px-4 py-3 text-text-secondary">{new Date(b.booking_date).toLocaleDateString("en-GH", { day:"numeric", month:"short", year:"numeric" })}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {b.status === "pending" && (
                            <button onClick={() => updateStatus(b.id, "confirmed")} disabled={updating === b.id}
                              className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition disabled:opacity-50">
                              Confirm
                            </button>
                          )}
                          {b.status !== "cancelled" && (
                            <button onClick={() => updateStatus(b.id, "cancelled")} disabled={updating === b.id}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition disabled:opacity-50">
                              Cancel
                            </button>
                          )}
                          <a href={`https://wa.me/${b.guest_phone.replace(/\D/g,"")}?text=${encodeURIComponent(`Hi ${b.guest_name}, this is Hidden Paradise regarding your booking for ${b.experience_name} on ${new Date(b.booking_date).toLocaleDateString()}.`)}`}
                             target="_blank" rel="noopener noreferrer"
                             className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition">
                            WA
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent uploads strip */}
        {recentUploads.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-primary">Your recent gallery uploads</h2>
              <Link href="/admin/gallery" className="text-xs text-accent hover:underline">View all →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto">
              {recentUploads.map(item => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img key={item.id} src={item.url} alt={item.alt}
                  className="h-24 w-24 object-cover rounded-xl flex-shrink-0 border border-border" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/MarketingDashboardClient.tsx
git commit -m "feat(admin): MarketingDashboardClient — MSO-focused dashboard"
```

---

## Task 24: Branch the dashboard server component on role

**Files:**
- Modify: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Replace the dashboard page**

Replace `src/app/admin/dashboard/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { getCurrentRole } from "@/lib/auth/roles";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import MarketingDashboardClient from "@/components/admin/MarketingDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const role = await getCurrentRole();
  if (!role) redirect("/admin"); // user without a profile row

  const admin = createAdminSupabase();

  // Both views need bookings
  const { data: bookings } = await admin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (role === "marketing_sales") {
    const { count: unreadInquiries } = await admin
      .from("inquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread");

    // Last-7-days uploads by this user
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentUploads } = await admin
      .from("gallery_items")
      .select("*")
      .eq("uploaded_by", user.id)
      .eq("is_active", true)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(8);

    // Get profile name/email
    const { data: profile } = await admin
      .from("profiles").select("name, email").eq("id", user.id).maybeSingle();

    return (
      <MarketingDashboardClient
        initialBookings={bookings ?? []}
        unreadInquiries={unreadInquiries ?? 0}
        recentUploads={recentUploads ?? []}
        userName={profile?.name ?? user.email ?? ""}
        userEmail={profile?.email ?? user.email ?? ""}
      />
    );
  }

  // Admin path — unchanged from before
  const { count: pendingReviews } = await admin
    .from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: pendingEscalations } = await admin
    .from("escalations").select("*", { count: "exact", head: true }).eq("status", "pending");
  const { count: unreadInquiries } = await admin
    .from("inquiries").select("*", { count: "exact", head: true }).eq("status", "unread");

  return (
    <AdminDashboardClient
      initialBookings={bookings ?? []}
      userEmail={user.email ?? ""}
      pendingReviews={pendingReviews ?? 0}
      pendingEscalations={pendingEscalations ?? 0}
      unreadInquiries={unreadInquiries ?? 0}
    />
  );
}
```

> **Note:** `gallery_items.created_at` exists in the original schema (`002_cms.sql`), so the date filter is safe.

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/dashboard/page.tsx
git commit -m "feat(admin): role-aware dashboard branching"
```

---

## Task 25: Add Staff Users card to admin dashboard nav

**Files:**
- Modify: `src/components/admin/AdminDashboardClient.tsx`

- [ ] **Step 1: Add Users to the nav grid**

In `src/components/admin/AdminDashboardClient.tsx`, find the array of CMS nav links (currently around line 103). Add a new entry for Staff Users. Replace the `{ href: "/admin/whatsapp", ... }` entry with both entries:

```tsx
{ href: "/admin/whatsapp", label: "WhatsApp Agent", desc: "AI inbox, conversations, FAQs", icon: <MessageSquare className="w-6 h-6 text-emerald-600" />, badge: pendingEscalations },
{ href: "/admin/users", label: "Staff Users", desc: "Add or remove admin and marketing staff", icon: "👥", badge: 0 },
```

- [ ] **Step 2: Build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminDashboardClient.tsx
git commit -m "feat(admin): add Staff Users card to admin nav"
```

---

## Task 26: Wire ownership into the gallery client

**Files:**
- Modify: `src/app/admin/gallery/page.tsx`
- Modify: `src/components/admin/GalleryCMSClient.tsx`

- [ ] **Step 1: Pass user.id and uploader names to the gallery client**

Replace `src/app/admin/gallery/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";
import { getCurrentRole } from "@/lib/auth/roles";
import GalleryCMSClient from "@/components/admin/GalleryCMSClient";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const role = await getCurrentRole();
  if (!role) redirect("/admin");

  const admin = createAdminSupabase();
  const { data: items } = await admin
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });

  // Build a map of uploader id → name for display
  const uploaderIds = Array.from(new Set((items ?? []).map(i => i.uploaded_by).filter(Boolean) as string[]));
  let uploaderMap: Record<string, string> = {};
  if (uploaderIds.length > 0) {
    const { data: uploaders } = await admin
      .from("profiles")
      .select("id, name")
      .in("id", uploaderIds);
    uploaderMap = Object.fromEntries((uploaders ?? []).map(u => [u.id, u.name]));
  }

  return (
    <GalleryCMSClient
      initialItems={items ?? []}
      currentUserId={user.id}
      isAdmin={role === "admin"}
      uploaderMap={uploaderMap}
    />
  );
}
```

- [ ] **Step 2: Update GalleryCMSClient signature and gating**

In `src/components/admin/GalleryCMSClient.tsx`:

a) Update the component prop signature:

```tsx
export default function GalleryCMSClient({
  initialItems,
  currentUserId,
  isAdmin,
  uploaderMap,
}: {
  initialItems: GalleryItem[];
  currentUserId: string;
  isAdmin: boolean;
  uploaderMap: Record<string, string>;
}) {
```

b) Add a `Lock` icon import at the top:

```tsx
import { Lock } from "lucide-react";
```

c) In the grid render block, find each item card. Replace the existing Edit / Delete buttons block with:

```tsx
{(isAdmin || item.uploaded_by === currentUserId) ? (
  <button
    onClick={() => handleDelete(item.id)}
    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
  >
    Delete
  </button>
) : (
  <span
    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-text-secondary text-xs px-2 py-1 rounded-full inline-flex items-center gap-1"
    title={item.uploaded_by ? `Uploaded by ${uploaderMap[item.uploaded_by] ?? "unknown"}` : "Uploaded by admin"}
  >
    <Lock className="w-3 h-3" /> {item.uploaded_by ? uploaderMap[item.uploaded_by] ?? "Other" : "Admin"}
  </span>
)}
```

> **Note:** if the existing GalleryCMSClient has a different layout for the delete button (e.g., not absolute-positioned), keep its existing layout but apply the same conditional logic — render Delete only when `isAdmin || item.uploaded_by === currentUserId`.

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/gallery/page.tsx src/components/admin/GalleryCMSClient.tsx
git commit -m "feat(gallery): show ownership and gate edit/delete to owner or admin"
```

---

## Task 27: End-to-end manual verification

**Files:** none (manual)

- [ ] **Step 1: Sanity check existing admin user**

Sign in to `http://localhost:3000/admin` as the existing admin. Verify:
- Lands on `/admin/dashboard`.
- All 11 nav cards visible (Experiences, Kitchen Menu, Accommodation, Gallery, Events, Videos, Site Settings, Reviews, Inquiries, WhatsApp Agent, Staff Users).
- Bookings table renders with existing data.
- Click "Staff Users" — see yourself in the list with role badge "Admin".

- [ ] **Step 2: Create a Marketing & Sales test user**

In `/admin/users`:
- Click "Add Staff".
- Enter: name "Test MSO", email `mso-test@example.com`, role "Marketing & Sales Officer", password `TestMSO2026!`, confirm same.
- Submit. Verify "✓ Created — password copied to clipboard." appears.
- Verify the new row appears in the list with role badge "Marketing & Sales".

- [ ] **Step 3: Sign in as MSO in incognito**

Open an incognito window. Navigate to `http://localhost:3000/admin`. Sign in as `mso-test@example.com` / `TestMSO2026!`.

Verify:
- Lands on `/admin/dashboard` showing the MarketingDashboardClient view (header says "Marketing & Sales — Test MSO").
- Three KPI cards visible: Unread Enquiries, Bookings to Follow Up, Gallery.
- Bookings table is below; defaults to "pending" filter.
- No CMS nav grid is shown.

- [ ] **Step 4: MSO route-gating**

While signed in as MSO, manually navigate to:
- `/admin/experiences` → should redirect to `/admin/dashboard`.
- `/admin/events` → redirect to dashboard.
- `/admin/users` → redirect to dashboard.
- `/admin/settings` → redirect to dashboard.
- `/admin/inquiries` → loads normally.
- `/admin/gallery` → loads normally.

- [ ] **Step 5: MSO booking edit**

On the dashboard, find a pending booking and click "Confirm". Status updates to confirmed. (No Delete button is present in either view — bookings UI doesn't expose hard-delete.)

- [ ] **Step 6: MSO inquiry edit**

Open `/admin/inquiries`. Pick an unread inquiry, change its status to "read" or add an admin_note. Save. Verify it persists.

Try the inquiry DELETE button (if any exists in the UI). Expected: 403 Forbidden response from the API. (If no delete button exists in the UI, run a manual fetch from devtools console:
```js
fetch("/api/cms/inquiries", { method: "DELETE", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ id: "<some-id>" }) })
  .then(r => r.json()).then(console.log);
```
Expected: `{ error: "Forbidden" }`, status 403.)

- [ ] **Step 7: MSO gallery upload + ownership**

In `/admin/gallery`:
- Upload a test image. Verify it appears in the grid.
- Confirm the new image's tile shows a Delete button (you own it).
- Find an image uploaded by admin (`uploaded_by` is null or not your id). Confirm it shows the lock badge instead of Delete.
- Click Delete on your own image. Confirms successful soft-delete (image removed from grid).

- [ ] **Step 8: RLS direct-DB tests**

In Supabase SQL Editor, switch session to MSO's JWT (or use SQL editor's "Run as authenticated user" feature). Run:

```sql
-- Should fail with row-level-security error
delete from public.bookings where id = (select id from public.bookings limit 1);
delete from public.inquiries where id = (select id from public.inquiries limit 1);

-- Should fail (admin-only)
update public.experiences set name = 'hacked' where slug = 'party-in-the-woods';

-- Should succeed (own gallery item)
update public.gallery_items set alt = 'updated' where uploaded_by = auth.uid();
```

Expected: first three queries fail with `new row violates row-level security policy` or `permission denied`. Fourth succeeds.

- [ ] **Step 9: Sign back in as admin and clean up**

Sign out of incognito. As admin, go to `/admin/users`, find "Test MSO", click delete, confirm. The row disappears.

- [ ] **Step 10: Self-deletion guard**

Try clicking Delete on your own admin row. The button should be disabled (greyed out) with tooltip "Cannot delete yourself". (Admin can still demote themselves by changing role via Edit, but not delete — protects against lockout.)

---

## Task 28: Final commit + push

**Files:** none

- [ ] **Step 1: Confirm all tests still pass**

```bash
npm test
npm run lint
npm run build
```

Expected: all green.

- [ ] **Step 2: Push to origin**

```bash
git push origin main
```

- [ ] **Step 3: Update CLAUDE.md memory note (if running interactively)**

Add a note that the staff role system is now live and what `marketing_sales` role can do. (Skip if running headless.)

---

## Deferred (out of scope)

- Self-service forgot-password flow on `/admin` login page.
- Admin-driven email change for staff.
- Audit log of who edited which booking/inquiry/gallery row.
- More granular roles beyond admin / marketing_sales.
- Per-experience or per-event ownership.
- Two-factor auth.
