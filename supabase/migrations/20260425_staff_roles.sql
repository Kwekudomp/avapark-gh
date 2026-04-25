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
