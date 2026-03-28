-- Enable UUID extension
create extension if not exists "pgcrypto";

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  experience_slug text not null,
  experience_name text not null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  booking_date date not null,
  group_size integer not null default 1,
  adults integer not null default 1,
  children integer not null default 0,
  package_tier_id text,
  package_tier_name text,
  subtotal numeric(10,2) not null,
  deposit_amount numeric(10,2) not null,
  paystack_reference text unique,
  paystack_status text check (paystack_status in ('success','failed','abandoned')),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "public_insert_bookings" on public.bookings
  for insert with check (true);

create policy "authenticated_select_bookings" on public.bookings
  for select using (auth.role() = 'authenticated');

create policy "authenticated_update_bookings" on public.bookings
  for update using (auth.role() = 'authenticated');

create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function update_updated_at();
