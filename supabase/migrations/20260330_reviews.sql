create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_email text not null,
  experience_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;

-- Public can insert (submit a review)
create policy "Anyone can submit a review"
  on reviews for insert
  with check (true);

-- Public can only read approved reviews
create policy "Public reads approved reviews"
  on reviews for select
  using (status = 'approved');

-- Service role (admin API) can do everything — handled via service key, no RLS needed
