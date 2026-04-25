# Staff Roles — Marketing & Sales Officer

**Date:** 2026-04-25
**Status:** Approved

## Summary

Introduce a role system to the admin portal. Today every authenticated user has full access to every section. This change adds two roles — `admin` and `marketing_sales` — and gates the database (RLS), the admin API routes, and the admin UI accordingly.

The first non-admin role is **Marketing & Sales Officer (MSO)**. They handle bookings and enquiries correspondence and upload gallery images. They cannot manage experiences, events, videos, menu, reviews, accommodation partners, site settings, or other staff users.

A new admin-only `/admin/users` page lets the admin create staff accounts directly (email + name + role + password). No email invites — the admin shares the password manually.

## Decisions

- **Roles:** `admin`, `marketing_sales`. No more granular split for now.
- **Storage:** `public.profiles` table keyed to `auth.users.id` with `name`, `email`, `role`. SECURITY DEFINER helper functions read it for RLS and app code.
- **Enforcement:** three layers — RLS in Postgres (security boundary), `/admin/layout.tsx` server-side role check (UX redirects), sidebar/dashboard role-aware rendering (visible affordance).
- **Bookings & enquiries:** MSO has full edit (insert/update). Only admin can delete.
- **Gallery:** MSO can upload, and edit/delete only their own items (tracked via new `uploaded_by` column on `gallery_items` and Storage `owner` field).
- **User creation:** admin creates users with email + name + role + password through `/admin/users`. Password copied to clipboard for manual sharing. No invitation email.
- **Password reset:** admin-driven only (Edit modal in `/admin/users` includes a Reset password section). No self-service forgot-password flow in this iteration.
- **Sidebar:** trimmed for MSO — only Dashboard, Bookings, Enquiries, Gallery.
- **Dashboard:** split into two server-side branches. Admin sees the existing dashboard. MSO sees a focused view: unread enquiries count, bookings needing follow-up count, recent personal gallery uploads.
- **Existing user bootstrap:** migration backfills every current `auth.users` row with `role = 'admin'` so today's admin keeps full access without manual steps.

## Data Model

### New table — `public.profiles`

| column | type | notes |
| --- | --- | --- |
| `id` | uuid PK | FK → `auth.users.id`, on delete cascade |
| `email` | text | mirrored from `auth.users` for easy listing |
| `name` | text not null | display name entered by admin |
| `role` | text not null | check (`role in ('admin','marketing_sales')`), default `'admin'` for backfill safety |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | default `now()`, trigger to auto-update |

Index on `(role)` for fast filtering on the Users page.

### `gallery_items` modification

Add nullable `uploaded_by uuid references auth.users(id) on delete set null`. Existing rows stay NULL — treated as admin-uploaded for ownership purposes (admin can edit/delete anything regardless).

### SECURITY DEFINER helpers

All three live in the `public` schema, owned by `postgres`, granted EXECUTE to `authenticated`. They read `profiles` while bypassing its own RLS.

- `public.current_role() returns text` — returns the calling user's role, or NULL if no profile row exists.
- `public.is_admin() returns boolean` — `current_role() = 'admin'`.
- `public.is_staff() returns boolean` — `current_role() in ('admin', 'marketing_sales')`. This replaces today's `auth.role() = 'authenticated'` as the "any logged-in staff" check.

## RLS Policies

Today every "admin" table reads `for all using (auth.role() = 'authenticated')`. Each becomes one of two patterns:

### Bookings & inquiries

```
SELECT/INSERT/UPDATE → is_staff()
DELETE              → is_admin()
```

### Gallery items

```
SELECT  → public (unchanged)
INSERT  → is_staff()
UPDATE  → is_admin() OR uploaded_by = auth.uid()
DELETE  → is_admin() OR uploaded_by = auth.uid()
```

### Profiles

```
SELECT (own row)     → auth.uid() = id   -- any staff member can read their own profile (for the role context)
SELECT (all rows)    → is_admin()        -- only admin can list all staff for the Users page
INSERT/UPDATE/DELETE → is_admin()
```

### Everything else admin-only

`experiences`, `events`, `videos`, `menu_items`, `reviews`, `accommodation_partners`, `site_settings`, `whatsapp_*`, `escalations`, plus any other admin table — replace `authenticated` with `is_admin()`. Public-facing SELECT policies stay public.

### Storage buckets

- `gallery`: INSERT requires `is_staff()`. UPDATE/DELETE allowed when `is_admin() OR owner = auth.uid()` (Supabase Storage tracks `owner` on every object).
- `experience-images`: all writes require `is_admin()`. Public SELECT unchanged.

### Defence in depth

Server-side API routes that handle gallery uploads also call `assertStaff()` (the app-level equivalent of `is_staff()`) before issuing the storage write, so a misconfigured bucket policy is not the only barrier.

## User Creation Flow

### Page — `/admin/users` (admin-only)

**List view.** Table of all `profiles` rows with columns: name, email, role badge, created date, last sign-in (joined from `auth.users.last_sign_in_at` server-side via the admin client). Two action buttons per row: Edit, Delete.

**Add staff modal.** Fields: Name, Email, Role (dropdown: Admin / Marketing & Sales Officer), Password, Confirm Password. Validation — password ≥ 8 chars; passwords match; email unique. Includes a "Show / hide" toggle and a Copy button for the password. After successful save, the modal stays open for ~3 seconds showing "✓ Created — password copied to clipboard. Send to user." then closes and refreshes the list.

**Edit modal.** Change name, change role. Email read-only (changing email requires Supabase admin email-change flow; out of scope). Optional "Reset password" section with the same password + confirm + copy flow as Add.

**Delete.** Confirmation dialog naming the user. On confirm, calls the delete API which removes from `auth.users` (cascades to `profiles`).

### API routes

All three live behind a shared `assertAdmin()` helper that reads the caller's session via `createServerSupabase()`, looks up their role in `profiles`, and returns 403 otherwise. A sibling `assertStaff()` helper (returns true for admin OR marketing_sales) is used by the gallery upload API route. The actual `auth.admin.*` calls use `createAdminSupabase()` (service-role client) — never exposed to the browser.

- `POST /api/admin/users` — body `{ email, name, role, password }`. Calls `auth.admin.createUser({ email, password, email_confirm: true })`, then inserts `profiles` row. Returns the new user's id.
- `PATCH /api/admin/users/[id]` — body `{ name?, role?, password? }`. Updates `profiles`; if `password` present, calls `auth.admin.updateUserById(id, { password })`.
- `DELETE /api/admin/users/[id]` — calls `auth.admin.deleteUser(id)`. The `profiles` row goes away via the FK cascade.

## Role-Aware Admin UI

### `/admin/layout.tsx` — server component

Rewritten from today's passthrough into a server component that:

1. Calls `createServerSupabase()` and gets the user. If unauthenticated → redirect to `/admin`.
2. Reads the caller's `profiles.role` (one query).
3. Checks the URL pathname against an allowlist:
   - `admin` → all `/admin/**` routes allowed.
   - `marketing_sales` → only `/admin/dashboard`, `/admin/bookings/**`, `/admin/inquiries/**`, `/admin/gallery/**`.
4. Mismatches redirect to `/admin/dashboard`.
5. Passes `{ role, name, email }` down to client components via a small `AdminRoleContext` provider so the sidebar can render the right menu without a second fetch.

### Sidebar

`AdminSidebar` (used by every admin page today) reads `role` from `AdminRoleContext` and filters its `navItems` array. MSO sees only Dashboard, Bookings, Enquiries, Gallery. The "Users" link only renders for admin. A small role badge appears under the user's name in the sidebar footer ("Admin" or "Marketing & Sales").

### Dashboard

`/admin/dashboard/page.tsx` branches server-side on role:

- **Admin** → existing `AdminDashboardClient` with all counts (no behaviour change).
- **MSO** → new `MarketingDashboardClient` with two primary KPI cards:
  - **Unread Enquiries** — count of `inquiries` rows where `status = 'unread'`. Links to `/admin/inquiries`.
  - **Bookings needing follow-up** — count of `bookings` rows where `status` is in `('pending', 'awaiting_payment')` (whatever the existing pending-side statuses are; the implementation reads them from the bookings status enum already in use). Links to `/admin/bookings`.

  Below the KPI cards: a "Your recent gallery uploads" strip showing thumbnails of the items they uploaded in the last 7 days (filtered by `uploaded_by = auth.uid()`).

### Gallery page

- Upload form unchanged (still posts to the existing gallery-upload API which now also enforces `assertStaff()`).
- List view shows everyone's items so MSO has full context.
- Edit and Delete buttons only render on rows where `uploaded_by === currentUser.id`. Other rows show a lock icon with tooltip "Uploaded by [name]". Admin sees Edit/Delete on every row.

### Bookings & Inquiries pages

No structural UI changes — MSO has the same edit rights as admin. The Delete button (and any "permanently remove" action) is hidden when `role === 'marketing_sales'`. RLS will also reject the action server-side as a backup.

## Migration & Rollout

### Single migration — `supabase/migrations/20260425_staff_roles.sql`

1. Create `profiles` table, indexes, and `updated_at` trigger.
2. Create the three SECURITY DEFINER helpers and grant EXECUTE to `authenticated`.
3. Add `uploaded_by` column to `gallery_items`.
4. Backfill `profiles` — insert one row per `auth.users` record with `role = 'admin'`. The currently-logged-in admin keeps full access.
5. Drop existing `authenticated_manage_*` policies on every affected table.
6. Recreate policies using `is_admin()` / `is_staff()` per the RLS section above.
7. Drop the storage bucket policies for `gallery` and `experience-images` and recreate with the new rules.

### Code rollout order (same PR)

1. Migration file.
2. `/admin/layout.tsx` rewritten as a server component with role gate. `AdminRoleContext` introduced. `AdminSidebar` reads role.
3. `/admin/users` page and the three API routes (`POST`, `PATCH`, `DELETE`).
4. Dashboard split (`AdminDashboardClient` left as-is, new `MarketingDashboardClient` added).
5. Gallery row-level Edit/Delete gating.
6. Bookings / inquiries Delete button hidden for MSO.

### Verification before merge

- Existing admin user logs in → sees everything, nothing visibly changed.
- Create a test MSO via the new Users page.
- Log in as that MSO in an incognito window:
  - Sidebar shows only Dashboard, Bookings, Enquiries, Gallery.
  - Dashboard shows the filtered view.
  - Can edit a booking; Delete button is not rendered.
  - Can edit an enquiry; Delete button is not rendered.
  - Can upload a new gallery item; can edit/delete that one; cannot edit/delete one uploaded by admin.
  - Visiting `/admin/experiences` redirects to `/admin/dashboard`.
- Direct DB / SQL test: with an MSO JWT, `delete from bookings` must fail with permission error. Same for `delete from inquiries`. Same for updating a `gallery_items` row owned by another user.

## Out of Scope

Flagged here so we don't scope-creep during implementation:

- Self-service forgot-password flow on `/admin` login page.
- Admin changing a staff member's email address (requires Supabase admin email-change).
- Audit log of who edited which booking/inquiry/gallery row.
- More granular roles beyond `admin` / `marketing_sales` (e.g., separate "operations" or "finance" roles).
- Per-experience or per-event ownership.
- Two-factor auth for staff.
