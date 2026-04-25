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

-- ──────────────────────────────────────────────────────────────────────────
-- 3. gallery_items.uploaded_by
-- ──────────────────────────────────────────────────────────────────────────

alter table public.gallery_items
  add column uploaded_by uuid references auth.users(id) on delete set null;

create index gallery_items_uploaded_by_idx on public.gallery_items(uploaded_by);

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

-- ──────────────────────────────────────────────────────────────────────────
-- 7. RLS — admin-only tables (replace `authenticated_manage_*` with is_admin)
-- ──────────────────────────────────────────────────────────────────────────

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

-- whatsapp tables
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
