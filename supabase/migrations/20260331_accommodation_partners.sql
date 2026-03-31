create table if not exists accommodation_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,                        -- e.g. "Riverside Cabins", "Eco Chalets"
  distance text not null,                    -- e.g. "12 min drive"
  price_from text not null,                  -- e.g. "GHS 450"
  guests text not null,                      -- e.g. "2–4 guests"
  highlights text[] not null default '{}',   -- e.g. ["River views", "AC", "Breakfast"]
  badge text,                                -- e.g. "Popular", "New"
  badge_color text,                          -- Tailwind classes or hex
  image_url text,
  whatsapp_override text,                    -- custom WA number for this partner (optional)
  enquiry_url text,                          -- external booking URL (optional)
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table accommodation_partners enable row level security;

-- Public can read active partners
create policy "Public reads active partners"
  on accommodation_partners for select
  using (is_active = true);

-- Seed with the 4 placeholder partners so the site isn't blank
insert into accommodation_partners (name, type, distance, price_from, guests, highlights, badge, sort_order)
values
  ('Akuse River Lodge',    'Riverside Cabins', '12 min drive', 'GHS 450', '2–4 guests', ARRAY['River views', 'Air conditioning', 'Breakfast included'], 'Popular',     1),
  ('Volta Forest Retreat', 'Eco Chalets',      '18 min drive', 'GHS 380', '2–6 guests', ARRAY['Forest setting', 'Private bathroom', 'Free Wi-Fi'],       'Eco-Friendly', 2),
  ('Okwenya Guesthouse',   'Budget Rooms',     '5 min drive',  'GHS 180', '1–2 guests', ARRAY['Walking distance', 'Fan-cooled', 'Local meals'],           'Best Value',  3),
  ('Eastern Hills Camp',   'Glamping Tents',   '8 min drive',  'GHS 320', '2 guests',   ARRAY['Luxury tents', 'Stargazing deck', 'Firepit'],              'New',         4);
