/**
 * Hidden Paradise kitchen menu.
 *
 * Prices below are PLACEHOLDERS while the kitchen finalises its price list.
 * The order form shows a visible disclaimer so guests know they're estimates.
 * When real prices are locked, either update this file or move the data into
 * Supabase and manage via the admin panel.
 */

export type DietTag = "spicy" | "seafood";
export type MealTime = "breakfast" | "lunch" | "supper" | "all-day";

export interface MenuItem {
  id: string;
  name: string;
  subnote?: string;
  price: number;
  category: string;
  meal: MealTime;
  tags?: DietTag[];
}

function item(
  id: string,
  name: string,
  price: number,
  category: string,
  meal: MealTime,
  extra: { subnote?: string; tags?: DietTag[] } = {},
): MenuItem {
  return { id, name, price, category, meal, ...extra };
}

export const MENU_ITEMS: MenuItem[] = [
  /* ── BREAKFAST (Saturday buffet) ────────────────── */
  item("b-club-sandwich", "Club Sandwich", 35, "Breakfast Sandwiches", "breakfast"),
  item("b-tuna-sandwich", "Tuna Sandwich", 35, "Breakfast Sandwiches", "breakfast", { tags: ["seafood"] }),
  item("b-egg-sandwich", "Egg Sandwich", 30, "Breakfast Sandwiches", "breakfast"),
  item("b-chicken-waffle", "Chicken & Waffle Sandwich", 45, "Breakfast Sandwiches", "breakfast"),

  item("b-pancake-original", "Original Pancake", 30, "Pancakes", "breakfast"),
  item("b-pancake-vanilla", "Vanilla Pancake", 30, "Pancakes", "breakfast"),
  item("b-pancake-lemon-blueberry", "Lemon Blueberry Pancake", 35, "Pancakes", "breakfast"),
  item("b-pancake-banana", "Banana Pancake", 30, "Pancakes", "breakfast"),
  item("b-pancake-buttermilk", "Buttermilk Pancake", 30, "Pancakes", "breakfast"),

  item("b-porridge-koko", "Koko", 20, "Porridge", "breakfast", { subnote: "Millet or Corn" }),
  item("b-porridge-hausa-koko", "Hausa Koko", 20, "Porridge", "breakfast"),
  item("b-porridge-tombrown", "Tombrown", 20, "Porridge", "breakfast"),
  item("b-porridge-rice", "Rice Porridge", 20, "Porridge", "breakfast"),
  item("b-porridge-oats", "Oats", 20, "Porridge", "breakfast"),

  item("b-salad-ghana", "Ghana Salad", 35, "Breakfast Salads", "breakfast"),
  item("b-salad-tuna", "Tuna Salad", 40, "Breakfast Salads", "breakfast", { tags: ["seafood"] }),
  item("b-salad-potato", "Potato Salad", 30, "Breakfast Salads", "breakfast"),
  item("b-salad-avocado", "Avocado Salad", 35, "Breakfast Salads", "breakfast"),
  item("b-salad-vegan", "Vegan Salad", 35, "Breakfast Salads", "breakfast"),

  item("b-fruit-watermelon", "Watermelon", 15, "Fresh Fruits", "breakfast"),
  item("b-fruit-orange", "Orange", 15, "Fresh Fruits", "breakfast"),
  item("b-fruit-pawpaw", "Pawpaw", 15, "Fresh Fruits", "breakfast"),
  item("b-fruit-banana", "Banana", 10, "Fresh Fruits", "breakfast"),
  item("b-fruit-pineapple", "Pineapple", 15, "Fresh Fruits", "breakfast"),
  item("b-fruit-berries", "Berries", 25, "Fresh Fruits", "breakfast"),
  item("b-fruit-apple", "Apple", 15, "Fresh Fruits", "breakfast"),
  item("b-fruit-tangerine", "Tangerine", 10, "Fresh Fruits", "breakfast"),

  item("b-bev-hot-tea", "Hot Tea", 10, "Beverages", "breakfast"),
  item("b-bev-iced-tea", "Iced Tea", 15, "Beverages", "breakfast"),
  item("b-bev-coffee", "Coffee", 15, "Beverages", "breakfast"),
  item("b-bev-herbal", "Hot Herbal Tea", 15, "Beverages", "breakfast", { subnote: "Hibiscus, Mint, Lemongrass" }),
  item("b-bev-soda", "Soda", 15, "Beverages", "breakfast"),
  item("b-bev-milkshake", "Milk Shake", 25, "Beverages", "breakfast"),
  item("b-bev-smoothie", "Smoothie", 25, "Beverages", "breakfast"),
  item("b-bev-lemonade", "Lemonade", 20, "Beverages", "breakfast"),
  item("b-bev-fresh-juice", "Fresh Juices", 20, "Beverages", "breakfast", { subnote: "Watermelon, Orange, Mango, Pineapple" }),

  item("b-extra-bacon", "Bacon", 25, "Extras", "breakfast"),
  item("b-extra-sausage", "Sausage", 20, "Extras", "breakfast"),
  item("b-extra-ham", "Ham", 25, "Extras", "breakfast"),
  item("b-extra-fried-potatoes", "Fried Potatoes", 20, "Extras", "breakfast"),
  item("b-extra-chicken-wings", "Fried Chicken Wings", 35, "Extras", "breakfast", { tags: ["spicy"] }),
  item("b-extra-yogurt", "Yogurt", 15, "Extras", "breakfast"),
  item("b-extra-bagel", "Bagel", 15, "Extras", "breakfast"),
  item("b-extra-tea-bread", "Tea Bread", 10, "Extras", "breakfast"),
  item("b-extra-cheese", "Cheese", 20, "Extras", "breakfast"),
  item("b-extra-croissant", "Croissant", 20, "Extras", "breakfast"),
  item("b-extra-waffles", "Waffles", 25, "Extras", "breakfast"),
  item("b-extra-eggs", "Eggs", 15, "Extras", "breakfast", { subnote: "Scrambled, Boiled" }),
  item("b-extra-choc-cake", "Chocolate Cake", 25, "Extras", "breakfast"),
  item("b-extra-ice-cream", "Chocolate / Vanilla Ice Cream", 25, "Extras", "breakfast"),

  /* ── LUNCH ──────────────────────────────────────── */
  item("l-grill-chicken", "Grilled Chicken", 80, "Light Grills", "lunch"),
  item("l-grill-tilapia", "Grilled Tilapia", 100, "Light Grills", "lunch", { tags: ["seafood"] }),
  item("l-grill-goat-khebab", "Goat Khebab", 80, "Light Grills", "lunch"),
  item("l-grill-chicken-khebab", "Chicken Khebab", 70, "Light Grills", "lunch"),

  item("l-rice-fried", "Fried Rice", 60, "Rice Dishes", "lunch"),
  item("l-rice-jollof", "Jollof Rice", 60, "Rice Dishes", "lunch"),
  item("l-rice-plain", "Plain Rice", 50, "Rice Dishes", "lunch"),
  item("l-rice-herb", "Special Herb Rice", 70, "Rice Dishes", "lunch"),
  item("l-rice-waakye", "Waakye", 60, "Rice Dishes", "lunch"),

  item("l-side-fried-yam", "Fried Yam", 40, "Fried Sides", "lunch"),
  item("l-side-sweet-potato", "Fried Sweet Potato", 40, "Fried Sides", "lunch"),
  item("l-side-cocoyam", "Fried Cocoyam", 40, "Fried Sides", "lunch"),
  item("l-side-ampesi", "Ampesi", 45, "Fried Sides", "lunch", { subnote: "Yam, Plantain, Cocoyam" }),

  /* ── SUPPER ─────────────────────────────────────── */
  item("s-soup-goat-light", "Goat Light Soup", 100, "Traditional Soups", "supper"),
  item("s-soup-chicken-light", "Local Chicken Light Soup", 90, "Traditional Soups", "supper"),
  item("s-soup-groundnut", "Groundnut Soup", 90, "Traditional Soups", "supper"),
  item("s-soup-palmnut", "Palmnut Soup", 90, "Traditional Soups", "supper"),
  item("s-soup-okro", "Okro Soup", 80, "Traditional Soups", "supper"),
  item("s-soup-dry-fish", "Dry Fish Light Soup", 95, "Traditional Soups", "supper", { tags: ["seafood"] }),
  item("s-soup-fresh-tilapia", "Fresh Tilapia Light Soup", 110, "Traditional Soups", "supper", { tags: ["seafood"] }),

  item("s-stew-local-chicken", "Local Chicken Stew", 80, "Stews", "supper"),
  item("s-stew-beans", "Beans Stew", 50, "Stews", "supper"),
  item("s-stew-koobi-egg", "Koobi & Egg Stew", 60, "Stews", "supper", { tags: ["seafood"] }),
  item("s-stew-okro", "Okro Stew", 70, "Stews", "supper"),
  item("s-stew-palava", "Palava Sauce", 70, "Stews", "supper"),
  item("s-stew-abobi-tadzi", "Abobi Tadzi", 70, "Stews", "supper", { subnote: "Dry Anchovies", tags: ["seafood"] }),
  item("s-stew-tomato-gravy", "Tomato Gravy", 80, "Stews", "supper", { subnote: "Goat or Fish" }),
  item("s-stew-cabbage", "Cabbage Stew", 60, "Stews", "supper"),
  item("s-stew-garden-egg", "Garden Egg Stew", 65, "Stews", "supper"),
  item("s-stew-beef-sauce", "Beef Sauce", 80, "Stews", "supper"),
  item("s-stew-chicken-sauce", "Chicken Sauce", 75, "Stews", "supper"),

  item("s-staple-banku", "Banku", 20, "Traditional Staples", "supper"),
  item("s-staple-fufu", "Fufu", 25, "Traditional Staples", "supper"),
  item("s-staple-konkonte", "Konkonte", 15, "Traditional Staples", "supper"),
  item("s-staple-ewo-kple", "Ewo Kple", 20, "Traditional Staples", "supper"),
  item("s-staple-omo-tuo", "Omo Tuo", 25, "Traditional Staples", "supper", { subnote: "Rice Balls" }),
  item("s-staple-eba", "Eba", 20, "Traditional Staples", "supper"),
  item("s-staple-ga-kenkey", "Ga Kenkey", 15, "Traditional Staples", "supper"),
  item("s-staple-fante-kenkey", "Fante Kenkey", 15, "Traditional Staples", "supper"),
  item("s-staple-angwamo", "Angwamo", 25, "Traditional Staples", "supper"),
  item("s-staple-abolo", "Abolo", 20, "Traditional Staples", "supper"),

  item("s-roast-duck", "Roast Duck", 160, "Roasts & Hearty Grills", "supper"),
  item("s-roast-rabbit", "Roast Rabbit", 140, "Roasts & Hearty Grills", "supper"),
  item("s-roast-lamb", "Roast Lamb", 180, "Roasts & Hearty Grills", "supper"),
  item("s-roast-guinea-fowl", "Roast Guinea Fowl", 150, "Roasts & Hearty Grills", "supper"),
  item("s-roast-pork", "Roast Pork", 140, "Roasts & Hearty Grills", "supper"),
  item("s-roast-sausage", "Sausage", 45, "Roasts & Hearty Grills", "supper"),

  /* ── ALL DAY ────────────────────────────────────── */
  item("a-start-samosa", "Samosa", 25, "Starters", "all-day"),
  item("a-start-spring-roll", "Spring Rolls", 30, "Starters", "all-day"),
  item("a-start-kelewele", "Kelewele", 25, "Starters", "all-day", { tags: ["spicy"] }),
  item("a-start-domedo", "Pork Domedo", 40, "Starters", "all-day"),
  item("a-start-wings", "Spicy Hot Chicken Wings", 45, "Starters", "all-day", { tags: ["spicy"] }),
  item("a-start-snails", "Spicy Snails", 50, "Starters", "all-day", { tags: ["spicy"] }),
  item("a-start-gizzard", "Spicy Gizzard", 40, "Starters", "all-day", { tags: ["spicy"] }),
  item("a-start-suya", "Suya", 40, "Starters", "all-day", { tags: ["spicy"] }),

  item("a-salad-ghana", "Ghana Salad", 40, "Salads", "all-day"),
  item("a-salad-tuna", "Tuna Salad", 50, "Salads", "all-day", { tags: ["seafood"] }),
  item("a-salad-chicken", "Chicken Salad", 50, "Salads", "all-day"),

  item("a-dessert-fruit-mix", "Fresh Fruit Mix", 30, "Dessert", "all-day"),
  item("a-dessert-coconut", "Fresh Coconut", 20, "Dessert", "all-day"),
  item("a-dessert-cake", "Cake Slice", 25, "Dessert", "all-day"),
  item("a-dessert-ice-cream", "Ice Cream", 25, "Dessert", "all-day"),

  item("a-juice-pineapple", "Pineapple Juice", 20, "Natural Juices", "all-day"),
  item("a-juice-orange", "Orange Juice", 20, "Natural Juices", "all-day"),
  item("a-juice-mango", "Mango Juice", 20, "Natural Juices", "all-day"),
  item("a-juice-watermelon", "Watermelon Juice", 20, "Natural Juices", "all-day"),
  item("a-juice-mixed", "Mixed Fruit Juice", 25, "Natural Juices", "all-day"),

  item("a-drink-lamugin", "Lamugin", 20, "Local Drinks", "all-day"),
  item("a-drink-bissap", "Bissap", 20, "Local Drinks", "all-day"),
  item("a-drink-asaana", "Asaana", 25, "Local Drinks", "all-day"),
  item("a-drink-pitoo", "Pitoo", 25, "Local Drinks", "all-day"),
];

export function getItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find((i) => i.id === id);
}

export const MEAL_LABELS: Record<MealTime, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  supper: "Supper",
  "all-day": "All Day",
};
