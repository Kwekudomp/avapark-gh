-- Inquiries submitted via the public contact form.
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  experience text,
  dates text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx on inquiries (created_at desc);
create index if not exists inquiries_status_idx on inquiries (status);

alter table inquiries enable row level security;

-- Public can insert an inquiry (the form posts from the browser
-- through our API route, but we keep this open for API-free inserts too).
create policy "Anyone can submit an inquiry"
  on inquiries for insert
  with check (true);

-- No public read/update/delete. Admin actions use the service role,
-- which bypasses RLS.
