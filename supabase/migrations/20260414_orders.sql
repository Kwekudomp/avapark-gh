-- Hidden Paradise online ordering
-- Creates the orders table and RLS policies to mirror the reviews pattern:
-- anonymous clients can INSERT new orders from the public order form,
-- authenticated admins can read and update order status.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  order_type text not null check (order_type in ('dine-in', 'pickup', 'delivery')),
  scheduled_time text,
  items jsonb not null,
  subtotal numeric(10, 2) not null default 0,
  notes text,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists orders_status_idx on orders (status);

alter table orders enable row level security;

-- Anyone can submit an order (matches reviews insert policy)
drop policy if exists "Anyone can submit an order" on orders;
create policy "Anyone can submit an order"
  on orders for insert
  to public
  with check (true);

-- Only authenticated users (admins) can read orders
drop policy if exists "Authenticated users can read orders" on orders;
create policy "Authenticated users can read orders"
  on orders for select
  to authenticated
  using (true);

-- Only authenticated users (admins) can update order status
drop policy if exists "Authenticated users can update orders" on orders;
create policy "Authenticated users can update orders"
  on orders for update
  to authenticated
  using (true)
  with check (true);
