-- Hidden Paradise kitchen menu items
-- Moves the menu from a static data file into a CMS table so admins can
-- update prices, availability, and copy from the /admin/menu panel.

create table if not exists menu_items (
  id text primary key,
  name text not null,
  subnote text,
  category text not null,
  meal text not null check (meal in ('breakfast', 'lunch', 'supper', 'all-day')),
  price numeric(10, 2),
  tags text[] not null default '{}',
  available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_meal_idx on menu_items (meal);
create index if not exists menu_items_sort_idx on menu_items (sort_order);

-- Keep updated_at fresh on every UPDATE
create or replace function set_menu_items_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists menu_items_set_updated_at on menu_items;
create trigger menu_items_set_updated_at
  before update on menu_items
  for each row execute function set_menu_items_updated_at();

alter table menu_items enable row level security;

-- Public visitors can read any available item (admin toggles availability)
drop policy if exists "Public can read available menu items" on menu_items;
create policy "Public can read available menu items"
  on menu_items for select
  to public
  using (available = true);

-- Authenticated admins can read everything (including unavailable)
drop policy if exists "Authenticated can read all menu items" on menu_items;
create policy "Authenticated can read all menu items"
  on menu_items for select
  to authenticated
  using (true);

-- Only authenticated admins can insert
drop policy if exists "Authenticated can insert menu items" on menu_items;
create policy "Authenticated can insert menu items"
  on menu_items for insert
  to authenticated
  with check (true);

-- Only authenticated admins can update
drop policy if exists "Authenticated can update menu items" on menu_items;
create policy "Authenticated can update menu items"
  on menu_items for update
  to authenticated
  using (true)
  with check (true);

-- Only authenticated admins can delete
drop policy if exists "Authenticated can delete menu items" on menu_items;
create policy "Authenticated can delete menu items"
  on menu_items for delete
  to authenticated
  using (true);

-- ── Seed the table with all current items (prices NULL until admin sets them) ──
insert into menu_items (id, name, subnote, category, meal, tags, sort_order) values
  -- Breakfast
  ('b-club-sandwich', 'Club Sandwich', null, 'Breakfast Sandwiches', 'breakfast', '{}', 10),
  ('b-tuna-sandwich', 'Tuna Sandwich', null, 'Breakfast Sandwiches', 'breakfast', '{seafood}', 20),
  ('b-egg-sandwich', 'Egg Sandwich', null, 'Breakfast Sandwiches', 'breakfast', '{}', 30),
  ('b-chicken-waffle', 'Chicken & Waffle Sandwich', null, 'Breakfast Sandwiches', 'breakfast', '{}', 40),
  ('b-pancake-original', 'Original Pancake', null, 'Pancakes', 'breakfast', '{}', 50),
  ('b-pancake-vanilla', 'Vanilla Pancake', null, 'Pancakes', 'breakfast', '{}', 60),
  ('b-pancake-lemon-blueberry', 'Lemon Blueberry Pancake', null, 'Pancakes', 'breakfast', '{}', 70),
  ('b-pancake-banana', 'Banana Pancake', null, 'Pancakes', 'breakfast', '{}', 80),
  ('b-pancake-buttermilk', 'Buttermilk Pancake', null, 'Pancakes', 'breakfast', '{}', 90),
  ('b-porridge-koko', 'Koko', 'Millet or Corn', 'Porridge', 'breakfast', '{}', 100),
  ('b-porridge-hausa-koko', 'Hausa Koko', null, 'Porridge', 'breakfast', '{}', 110),
  ('b-porridge-tombrown', 'Tombrown', null, 'Porridge', 'breakfast', '{}', 120),
  ('b-porridge-rice', 'Rice Porridge', null, 'Porridge', 'breakfast', '{}', 130),
  ('b-porridge-oats', 'Oats', null, 'Porridge', 'breakfast', '{}', 140),
  ('b-salad-ghana', 'Ghana Salad', null, 'Breakfast Salads', 'breakfast', '{}', 150),
  ('b-salad-tuna', 'Tuna Salad', null, 'Breakfast Salads', 'breakfast', '{seafood}', 160),
  ('b-salad-potato', 'Potato Salad', null, 'Breakfast Salads', 'breakfast', '{}', 170),
  ('b-salad-avocado', 'Avocado Salad', null, 'Breakfast Salads', 'breakfast', '{}', 180),
  ('b-salad-vegan', 'Vegan Salad', null, 'Breakfast Salads', 'breakfast', '{}', 190),
  ('b-fruit-watermelon', 'Watermelon', null, 'Fresh Fruits', 'breakfast', '{}', 200),
  ('b-fruit-orange', 'Orange', null, 'Fresh Fruits', 'breakfast', '{}', 210),
  ('b-fruit-pawpaw', 'Pawpaw', null, 'Fresh Fruits', 'breakfast', '{}', 220),
  ('b-fruit-banana', 'Banana', null, 'Fresh Fruits', 'breakfast', '{}', 230),
  ('b-fruit-pineapple', 'Pineapple', null, 'Fresh Fruits', 'breakfast', '{}', 240),
  ('b-fruit-berries', 'Berries', null, 'Fresh Fruits', 'breakfast', '{}', 250),
  ('b-fruit-apple', 'Apple', null, 'Fresh Fruits', 'breakfast', '{}', 260),
  ('b-fruit-tangerine', 'Tangerine', null, 'Fresh Fruits', 'breakfast', '{}', 270),
  ('b-bev-hot-tea', 'Hot Tea', null, 'Beverages', 'breakfast', '{}', 280),
  ('b-bev-iced-tea', 'Iced Tea', null, 'Beverages', 'breakfast', '{}', 290),
  ('b-bev-coffee', 'Coffee', null, 'Beverages', 'breakfast', '{}', 300),
  ('b-bev-herbal', 'Hot Herbal Tea', 'Hibiscus, Mint, Lemongrass', 'Beverages', 'breakfast', '{}', 310),
  ('b-bev-soda', 'Soda', null, 'Beverages', 'breakfast', '{}', 320),
  ('b-bev-milkshake', 'Milk Shake', null, 'Beverages', 'breakfast', '{}', 330),
  ('b-bev-smoothie', 'Smoothie', null, 'Beverages', 'breakfast', '{}', 340),
  ('b-bev-lemonade', 'Lemonade', null, 'Beverages', 'breakfast', '{}', 350),
  ('b-bev-fresh-juice', 'Fresh Juices', 'Watermelon, Orange, Mango, Pineapple', 'Beverages', 'breakfast', '{}', 360),
  ('b-extra-bacon', 'Bacon', null, 'Extras', 'breakfast', '{}', 370),
  ('b-extra-sausage', 'Sausage', null, 'Extras', 'breakfast', '{}', 380),
  ('b-extra-ham', 'Ham', null, 'Extras', 'breakfast', '{}', 390),
  ('b-extra-fried-potatoes', 'Fried Potatoes', null, 'Extras', 'breakfast', '{}', 400),
  ('b-extra-chicken-wings', 'Fried Chicken Wings', null, 'Extras', 'breakfast', '{spicy}', 410),
  ('b-extra-yogurt', 'Yogurt', null, 'Extras', 'breakfast', '{}', 420),
  ('b-extra-bagel', 'Bagel', null, 'Extras', 'breakfast', '{}', 430),
  ('b-extra-tea-bread', 'Tea Bread', null, 'Extras', 'breakfast', '{}', 440),
  ('b-extra-cheese', 'Cheese', null, 'Extras', 'breakfast', '{}', 450),
  ('b-extra-croissant', 'Croissant', null, 'Extras', 'breakfast', '{}', 460),
  ('b-extra-waffles', 'Waffles', null, 'Extras', 'breakfast', '{}', 470),
  ('b-extra-eggs', 'Eggs', 'Scrambled, Boiled', 'Extras', 'breakfast', '{}', 480),
  ('b-extra-choc-cake', 'Chocolate Cake', null, 'Extras', 'breakfast', '{}', 490),
  ('b-extra-ice-cream', 'Chocolate / Vanilla Ice Cream', null, 'Extras', 'breakfast', '{}', 500),
  -- Lunch
  ('l-grill-chicken', 'Grilled Chicken', null, 'Light Grills', 'lunch', '{}', 1010),
  ('l-grill-tilapia', 'Grilled Tilapia', null, 'Light Grills', 'lunch', '{seafood}', 1020),
  ('l-grill-goat-khebab', 'Goat Khebab', null, 'Light Grills', 'lunch', '{}', 1030),
  ('l-grill-chicken-khebab', 'Chicken Khebab', null, 'Light Grills', 'lunch', '{}', 1040),
  ('l-rice-fried', 'Fried Rice', null, 'Rice Dishes', 'lunch', '{}', 1050),
  ('l-rice-jollof', 'Jollof Rice', null, 'Rice Dishes', 'lunch', '{}', 1060),
  ('l-rice-plain', 'Plain Rice', null, 'Rice Dishes', 'lunch', '{}', 1070),
  ('l-rice-herb', 'Special Herb Rice', null, 'Rice Dishes', 'lunch', '{}', 1080),
  ('l-rice-waakye', 'Waakye', null, 'Rice Dishes', 'lunch', '{}', 1090),
  ('l-side-fried-yam', 'Fried Yam', null, 'Fried Sides', 'lunch', '{}', 1100),
  ('l-side-sweet-potato', 'Fried Sweet Potato', null, 'Fried Sides', 'lunch', '{}', 1110),
  ('l-side-cocoyam', 'Fried Cocoyam', null, 'Fried Sides', 'lunch', '{}', 1120),
  ('l-side-ampesi', 'Ampesi', 'Yam, Plantain, Cocoyam', 'Fried Sides', 'lunch', '{}', 1130),
  -- Supper
  ('s-soup-goat-light', 'Goat Light Soup', null, 'Traditional Soups', 'supper', '{}', 2010),
  ('s-soup-chicken-light', 'Local Chicken Light Soup', null, 'Traditional Soups', 'supper', '{}', 2020),
  ('s-soup-groundnut', 'Groundnut Soup', null, 'Traditional Soups', 'supper', '{}', 2030),
  ('s-soup-palmnut', 'Palmnut Soup', null, 'Traditional Soups', 'supper', '{}', 2040),
  ('s-soup-okro', 'Okro Soup', null, 'Traditional Soups', 'supper', '{}', 2050),
  ('s-soup-dry-fish', 'Dry Fish Light Soup', null, 'Traditional Soups', 'supper', '{seafood}', 2060),
  ('s-soup-fresh-tilapia', 'Fresh Tilapia Light Soup', null, 'Traditional Soups', 'supper', '{seafood}', 2070),
  ('s-stew-local-chicken', 'Local Chicken Stew', null, 'Stews', 'supper', '{}', 2080),
  ('s-stew-beans', 'Beans Stew', null, 'Stews', 'supper', '{}', 2090),
  ('s-stew-koobi-egg', 'Koobi & Egg Stew', null, 'Stews', 'supper', '{seafood}', 2100),
  ('s-stew-okro', 'Okro Stew', null, 'Stews', 'supper', '{}', 2110),
  ('s-stew-palava', 'Palava Sauce', null, 'Stews', 'supper', '{}', 2120),
  ('s-stew-abobi-tadzi', 'Abobi Tadzi', 'Dry Anchovies', 'Stews', 'supper', '{seafood}', 2130),
  ('s-stew-tomato-gravy', 'Tomato Gravy', 'Goat or Fish', 'Stews', 'supper', '{}', 2140),
  ('s-stew-cabbage', 'Cabbage Stew', null, 'Stews', 'supper', '{}', 2150),
  ('s-stew-garden-egg', 'Garden Egg Stew', null, 'Stews', 'supper', '{}', 2160),
  ('s-stew-beef-sauce', 'Beef Sauce', null, 'Stews', 'supper', '{}', 2170),
  ('s-stew-chicken-sauce', 'Chicken Sauce', null, 'Stews', 'supper', '{}', 2180),
  ('s-staple-banku', 'Banku', null, 'Traditional Staples', 'supper', '{}', 2190),
  ('s-staple-fufu', 'Fufu', null, 'Traditional Staples', 'supper', '{}', 2200),
  ('s-staple-konkonte', 'Konkonte', null, 'Traditional Staples', 'supper', '{}', 2210),
  ('s-staple-ewo-kple', 'Ewo Kple', null, 'Traditional Staples', 'supper', '{}', 2220),
  ('s-staple-omo-tuo', 'Omo Tuo', 'Rice Balls', 'Traditional Staples', 'supper', '{}', 2230),
  ('s-staple-eba', 'Eba', null, 'Traditional Staples', 'supper', '{}', 2240),
  ('s-staple-ga-kenkey', 'Ga Kenkey', null, 'Traditional Staples', 'supper', '{}', 2250),
  ('s-staple-fante-kenkey', 'Fante Kenkey', null, 'Traditional Staples', 'supper', '{}', 2260),
  ('s-staple-angwamo', 'Angwamo', null, 'Traditional Staples', 'supper', '{}', 2270),
  ('s-staple-abolo', 'Abolo', null, 'Traditional Staples', 'supper', '{}', 2280),
  ('s-roast-duck', 'Roast Duck', null, 'Roasts & Hearty Grills', 'supper', '{}', 2290),
  ('s-roast-rabbit', 'Roast Rabbit', null, 'Roasts & Hearty Grills', 'supper', '{}', 2300),
  ('s-roast-lamb', 'Roast Lamb', null, 'Roasts & Hearty Grills', 'supper', '{}', 2310),
  ('s-roast-guinea-fowl', 'Roast Guinea Fowl', null, 'Roasts & Hearty Grills', 'supper', '{}', 2320),
  ('s-roast-pork', 'Roast Pork', null, 'Roasts & Hearty Grills', 'supper', '{}', 2330),
  ('s-roast-sausage', 'Sausage', null, 'Roasts & Hearty Grills', 'supper', '{}', 2340),
  -- All Day
  ('a-start-samosa', 'Samosa', null, 'Starters', 'all-day', '{}', 3010),
  ('a-start-spring-roll', 'Spring Rolls', null, 'Starters', 'all-day', '{}', 3020),
  ('a-start-kelewele', 'Kelewele', null, 'Starters', 'all-day', '{spicy}', 3030),
  ('a-start-domedo', 'Pork Domedo', null, 'Starters', 'all-day', '{}', 3040),
  ('a-start-wings', 'Spicy Hot Chicken Wings', null, 'Starters', 'all-day', '{spicy}', 3050),
  ('a-start-snails', 'Spicy Snails', null, 'Starters', 'all-day', '{spicy}', 3060),
  ('a-start-gizzard', 'Spicy Gizzard', null, 'Starters', 'all-day', '{spicy}', 3070),
  ('a-start-suya', 'Suya', null, 'Starters', 'all-day', '{spicy}', 3080),
  ('a-salad-ghana', 'Ghana Salad', null, 'Salads', 'all-day', '{}', 3090),
  ('a-salad-tuna', 'Tuna Salad', null, 'Salads', 'all-day', '{seafood}', 3100),
  ('a-salad-chicken', 'Chicken Salad', null, 'Salads', 'all-day', '{}', 3110),
  ('a-dessert-fruit-mix', 'Fresh Fruit Mix', null, 'Dessert', 'all-day', '{}', 3120),
  ('a-dessert-coconut', 'Fresh Coconut', null, 'Dessert', 'all-day', '{}', 3130),
  ('a-dessert-cake', 'Cake Slice', null, 'Dessert', 'all-day', '{}', 3140),
  ('a-dessert-ice-cream', 'Ice Cream', null, 'Dessert', 'all-day', '{}', 3150),
  ('a-juice-pineapple', 'Pineapple Juice', null, 'Natural Juices', 'all-day', '{}', 3160),
  ('a-juice-orange', 'Orange Juice', null, 'Natural Juices', 'all-day', '{}', 3170),
  ('a-juice-mango', 'Mango Juice', null, 'Natural Juices', 'all-day', '{}', 3180),
  ('a-juice-watermelon', 'Watermelon Juice', null, 'Natural Juices', 'all-day', '{}', 3190),
  ('a-juice-mixed', 'Mixed Fruit Juice', null, 'Natural Juices', 'all-day', '{}', 3200),
  ('a-drink-lamugin', 'Lamugin', null, 'Local Drinks', 'all-day', '{}', 3210),
  ('a-drink-bissap', 'Bissap', null, 'Local Drinks', 'all-day', '{}', 3220),
  ('a-drink-asaana', 'Asaana', null, 'Local Drinks', 'all-day', '{}', 3230),
  ('a-drink-pitoo', 'Pitoo', null, 'Local Drinks', 'all-day', '{}', 3240)
on conflict (id) do nothing;
