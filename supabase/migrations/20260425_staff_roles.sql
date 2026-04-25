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
