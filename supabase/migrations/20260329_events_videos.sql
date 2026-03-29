-- Events table
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  end_date date,
  image_url text,
  price text,
  ticket_url text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Videos table
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  youtube_url text not null,
  category text not null default 'highlights',
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now()
);
