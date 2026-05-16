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
