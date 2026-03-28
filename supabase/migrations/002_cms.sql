-- ============================================================
-- EXPERIENCES TABLE (replaces hardcoded experiences.ts data)
-- ============================================================
create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  schedule text not null default '',
  time text not null default '',
  package_includes text[] not null default '{}',
  activities text[] not null default '{}',
  cover_image_url text,
  images text[] not null default '{}',
  category text not null default 'recurring' check (category in ('recurring','tour','special')),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  price numeric(10,2),
  deposit_amount numeric(10,2),
  package_tiers jsonb,
  sort_order integer not null default 0,
  whatsapp_message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.experiences enable row level security;
create policy "public_read_experiences" on public.experiences
  for select using (is_active = true);
create policy "authenticated_manage_experiences" on public.experiences
  for all using (auth.role() = 'authenticated');

create trigger experiences_updated_at
  before update on public.experiences
  for each row execute function update_updated_at();

-- ============================================================
-- GALLERY ITEMS TABLE
-- ============================================================
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text not null default '',
  category text not null default 'venue',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;
create policy "public_read_gallery" on public.gallery_items
  for select using (is_active = true);
create policy "authenticated_manage_gallery" on public.gallery_items
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- SITE SETTINGS TABLE (key-value store)
-- ============================================================
create table public.site_settings (
  key text primary key,
  value text not null default '',
  label text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
create policy "public_read_settings" on public.site_settings
  for select using (true);
create policy "authenticated_manage_settings" on public.site_settings
  for all using (auth.role() = 'authenticated');

-- Default settings
insert into public.site_settings (key, label, value) values
  ('phone_primary', 'Primary Phone', '+233 (0) 540 879 700'),
  ('phone_picnic', 'Picnic Line', '+233 (0) 547 352 490'),
  ('email', 'Email Address', 'info@hiddenparadisegh.com'),
  ('instagram_handle', 'Instagram Handle', 'hiddenparadisegh'),
  ('whatsapp_number', 'WhatsApp Number', '233540879700'),
  ('location_address', 'Address', 'Akuse Road, Okwenya, Eastern Region, Ghana'),
  ('location_description', 'Location Description', 'About an hour east of Accra'),
  ('hours_weekday', 'Weekday Hours', '9:00 AM – 1:00 AM'),
  ('hours_weekend', 'Weekend Hours', '9:00 AM – 3:00 AM'),
  ('tagline', 'Site Tagline', 'Your Escape Into Nature');

-- ============================================================
-- STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ============================================================
-- NOTE: Create these buckets manually in Supabase Storage:
--   experience-images  (public)
--   gallery            (public)
