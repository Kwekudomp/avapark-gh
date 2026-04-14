import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";
import {
  ChefHat,
  Flame,
  Soup,
  UtensilsCrossed,
  Wheat,
  Salad,
  Cake,
  GlassWater,
  Wine,
  Sandwich,
  Cookie,
  Coffee,
  Egg,
  Apple,
  Fish,
  Clock,
  MapPin,
  CheckCircle2,
  Sunrise,
  Sun,
  Moon,
  Infinity as InfinityIcon,
  Drumstick,
  Carrot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Food & Drinks | Hidden Paradise Nature Park",
  description:
    "The full Hidden Paradise kitchen menu organised by meal: Saturday breakfast buffet, lunch, supper, and all-day items. Ghanaian cooking, flame grills, soups, stews, and fresh drinks.",
};

type DietTag = "spicy" | "seafood";

interface MenuItem {
  name: string;
  subnote?: string;
  tags?: DietTag[];
}

interface MenuSection {
  title: string;
  Icon: LucideIcon;
  items: MenuItem[];
}

/* ── BREAKFAST (Saturday Buffet) ─────────────────────── */

const BREAKFAST_MENU: MenuSection[] = [
  {
    title: "Breakfast Sandwiches",
    Icon: Sandwich,
    items: [
      { name: "Club Sandwich" },
      { name: "Tuna Sandwich", tags: ["seafood"] },
      { name: "Egg Sandwich" },
      { name: "Chicken & Waffle Sandwich" },
    ],
  },
  {
    title: "Pancakes",
    Icon: Cookie,
    items: [
      { name: "Original Pancake" },
      { name: "Vanilla Pancake" },
      { name: "Lemon Blueberry Pancake" },
      { name: "Banana Pancake" },
      { name: "Buttermilk Pancake" },
    ],
  },
  {
    title: "Porridge",
    Icon: Soup,
    items: [
      { name: "Koko", subnote: "Millet or Corn" },
      { name: "Hausa Koko" },
      { name: "Tombrown" },
      { name: "Rice Porridge" },
      { name: "Oats" },
    ],
  },
  {
    title: "Breakfast Salads",
    Icon: Salad,
    items: [
      { name: "Ghana Salad" },
      { name: "Tuna Salad", tags: ["seafood"] },
      { name: "Potato Salad" },
      { name: "Avocado Salad" },
      { name: "Vegan Salad" },
    ],
  },
  {
    title: "Fresh Fruits",
    Icon: Apple,
    items: [
      { name: "Watermelon" },
      { name: "Orange" },
      { name: "Pawpaw" },
      { name: "Banana" },
      { name: "Pineapple" },
      { name: "Berries" },
      { name: "Apple" },
      { name: "Tangerine" },
    ],
  },
  {
    title: "Beverages",
    Icon: Coffee,
    items: [
      { name: "Hot Tea" },
      { name: "Iced Tea" },
      { name: "Coffee" },
      { name: "Hot Herbal Tea", subnote: "Hibiscus, Mint, Lemongrass" },
      { name: "Soda" },
      { name: "Milk Shake" },
      { name: "Smoothie" },
      { name: "Lemonade" },
      { name: "Fresh Juices", subnote: "Watermelon, Orange, Mango, Pineapple" },
    ],
  },
  {
    title: "Extras",
    Icon: Egg,
    items: [
      { name: "Bacon" },
      { name: "Sausage" },
      { name: "Ham" },
      { name: "Fried Potatoes" },
      { name: "Fried Chicken Wings", tags: ["spicy"] },
      { name: "Yogurt" },
      { name: "Bagel" },
      { name: "Tea Bread" },
      { name: "Cheese" },
      { name: "Croissant" },
      { name: "Waffles" },
      { name: "Eggs", subnote: "Scrambled, Boiled" },
      { name: "Chocolate Cake" },
      { name: "Chocolate / Vanilla Ice Cream" },
    ],
  },
];

/* ── LUNCH ───────────────────────────────────────────── */

const LUNCH_MENU: MenuSection[] = [
  {
    title: "Light Grills",
    Icon: Flame,
    items: [
      { name: "Chicken" },
      { name: "Tilapia", tags: ["seafood"] },
      { name: "Goat Khebab" },
      { name: "Chicken Khebab" },
    ],
  },
  {
    title: "Rice Dishes",
    Icon: Wheat,
    items: [
      { name: "Fried Rice" },
      { name: "Jollof Rice" },
      { name: "Plain Rice" },
      { name: "Special Herb Rice" },
      { name: "Waakye" },
    ],
  },
  {
    title: "Fried Sides",
    Icon: Carrot,
    items: [
      { name: "Fried Yam" },
      { name: "Fried Sweet Potato" },
      { name: "Fried Cocoyam" },
      { name: "Ampesi", subnote: "Yam, Plantain, Cocoyam" },
    ],
  },
];

/* ── SUPPER ─────────────────────────────────────────── */

const SUPPER_MENU: MenuSection[] = [
  {
    title: "Traditional Soups",
    Icon: Soup,
    items: [
      { name: "Goat Light Soup" },
      { name: "Local Chicken Light Soup" },
      { name: "Groundnut Soup" },
      { name: "Palmnut Soup" },
      { name: "Okro Soup" },
      { name: "Dry Fish Light Soup", tags: ["seafood"] },
      { name: "Fresh Tilapia Light Soup", tags: ["seafood"] },
    ],
  },
  {
    title: "Stews",
    Icon: UtensilsCrossed,
    items: [
      { name: "Local Chicken Stew" },
      { name: "Beans Stew" },
      { name: "Koobi & Egg Stew", tags: ["seafood"] },
      { name: "Okro Stew" },
      { name: "Palava Sauce" },
      { name: "Abobi Tadzi", subnote: "Dry Anchovies", tags: ["seafood"] },
      { name: "Tomato Gravey", subnote: "Goat, Fish" },
      { name: "Cabbage Stew" },
      { name: "Garden Egg Stew" },
      { name: "Beef Sauce" },
      { name: "Chicken Sauce" },
    ],
  },
  {
    title: "Traditional Staples",
    Icon: Wheat,
    items: [
      { name: "Banku" },
      { name: "Fufu" },
      { name: "Konkonte" },
      { name: "Ewo Kple" },
      { name: "Omo Tuo", subnote: "Rice Balls" },
      { name: "Eba" },
      { name: "Ga Kenkey" },
      { name: "Fante Kenkey" },
      { name: "Angwamo" },
      { name: "Abolo" },
    ],
  },
  {
    title: "Roasts & Hearty Grills",
    Icon: Drumstick,
    items: [
      { name: "Duck" },
      { name: "Rabbit" },
      { name: "Lamb" },
      { name: "Guinea Fowl" },
      { name: "Pork" },
      { name: "Sausage" },
    ],
  },
];

/* ── AVAILABLE ALL DAY ──────────────────────────────── */

const ALL_DAY_MENU: MenuSection[] = [
  {
    title: "Starters",
    Icon: ChefHat,
    items: [
      { name: "Samosa" },
      { name: "Spring Rolls" },
      { name: "Kelewele", tags: ["spicy"] },
      { name: "Pork", subnote: "Domedo" },
      { name: "Spicy Hot Chicken Wings", tags: ["spicy"] },
      { name: "Spicy Snails", tags: ["spicy"] },
      { name: "Spicy Gizzard", tags: ["spicy"] },
      { name: "Suya", tags: ["spicy"] },
    ],
  },
  {
    title: "Salads",
    Icon: Salad,
    items: [
      { name: "Ghana Salad" },
      { name: "Tuna Salad", tags: ["seafood"] },
      { name: "Chicken Salad" },
    ],
  },
  {
    title: "Dessert",
    Icon: Cake,
    items: [
      { name: "Fresh Fruit Mix" },
      { name: "Fresh Coconut" },
      { name: "Cake Slice" },
      { name: "Ice Cream" },
    ],
  },
  {
    title: "Natural Juices",
    Icon: GlassWater,
    items: [
      { name: "Pineapple" },
      { name: "Orange" },
      { name: "Mango" },
      { name: "Watermelon" },
      { name: "Mixed Fruit" },
    ],
  },
  {
    title: "Local Drinks",
    Icon: Wine,
    items: [
      { name: "Lamugin" },
      { name: "Bissap" },
      { name: "Asaana" },
      { name: "Pitoo" },
    ],
  },
];

const TAG_STYLES: Record<DietTag, { label: string; Icon: LucideIcon; className: string }> = {
  spicy: { label: "Spicy", Icon: Flame, className: "bg-red-100 text-red-700" },
  seafood: { label: "Seafood", Icon: Fish, className: "bg-blue-100 text-blue-700" },
};

function ItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
      <p className="font-display font-bold text-dark text-sm leading-tight">{item.name}</p>
      {item.subnote && (
        <p className="text-xs text-text-secondary/70 mt-0.5 italic">({item.subnote})</p>
      )}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {item.tags.map((t) => {
            const style = TAG_STYLES[t];
            return (
              <span
                key={t}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.className}`}
              >
                <style.Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
                {style.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MenuSectionBlock({ section }: { section: MenuSection }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <section.Icon className="w-5 h-5 text-primary" strokeWidth={1.7} />
        </div>
        <h3 className="font-display text-xl font-bold text-primary">{section.title}</h3>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text-secondary/60">{section.items.length} items</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {section.items.map((item) => (
          <ItemCard key={item.name} item={item} />
        ))}
      </div>
    </div>
  );
}

interface MealHeadingProps {
  tag: string;
  title: string;
  Icon: LucideIcon;
  subtitle?: string;
}

function MealHeading({ tag, title, Icon, subtitle }: MealHeadingProps) {
  return (
    <div className="text-center mb-10">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent text-white mb-4">
        <Icon className="w-7 h-7" strokeWidth={1.7} />
      </div>
      <p className="text-xs font-bold tracking-[4px] text-accent uppercase mb-2">{tag}</p>
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary">{title}</h2>
      {subtitle && (
        <p className="text-sm text-text-secondary mt-3 max-w-xl mx-auto">{subtitle}</p>
      )}
      <div className="mt-4 w-16 h-[2px] bg-accent mx-auto" />
    </div>
  );
}

export default function FoodDrinksPage() {
  const reserveUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to reserve a table at the Hidden Paradise kitchen."
  )}`;
  const breakfastUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to join the Saturday Breakfast in the Park at Hidden Paradise."
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="THE KITCHEN"
        title="Food & Drinks"
        description="The full Hidden Paradise menu, organised by meal time. Saturday breakfast buffet, lunch, supper, and our all-day favourites."
      />

      {/* Info strip */}
      <div className="max-w-[1200px] mx-auto mb-16 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-primary">Kitchen hours:</span> 9:00 AM – 11:00 PM daily ·{" "}
          <span className="font-semibold text-primary">Last orders:</span> 10:00 PM ·{" "}
          <span className="font-semibold text-primary">Reservations:</span> Recommended for groups of 6+
        </p>
      </div>

      {/* ── BREAKFAST ─────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto mb-20">
        {/* Saturday buffet feature banner */}
        <div className="relative overflow-hidden rounded-3xl mb-12 bg-gradient-to-br from-primary via-primary to-accent p-8 sm:p-12 text-white">
          <div className="relative max-w-3xl mx-auto text-center">
            <span className="inline-block bg-white text-primary text-xs font-bold tracking-[3px] uppercase px-4 py-1.5 rounded-full mb-5">
              Free Entry
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold mb-3">
              Breakfast in the Park
            </h2>
            <p className="text-white/90 text-base sm:text-lg mb-6 max-w-xl mx-auto">
              Every Saturday morning. All meals served buffet style in the open green surrounded by nature.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" strokeWidth={2} />
                6:00 AM – 10:30 AM
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" strokeWidth={2} />
                Hidden Paradise, Akuse Road
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/90 text-left max-w-lg mx-auto mb-8">
              {[
                "All meals served buffet style",
                "Morning hike",
                "Yoga session",
                "Music & fun games",
                "Free pool access",
                "Shower & washroom facilities",
                "Tents available for a quick nap",
                "Massage session (pay-to-use)",
              ].map((perk) => (
                <div key={perk} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-white" strokeWidth={2} />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
            <a
              href={breakfastUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary px-7 py-3 rounded-full text-sm font-semibold hover:bg-white/90 transition"
            >
              Book Saturday Breakfast
            </a>
          </div>
        </div>

        <MealHeading
          tag="Saturday Buffet"
          title="Breakfast"
          Icon={Sunrise}
          subtitle="Everything served buffet style during the Saturday morning session."
        />
        {BREAKFAST_MENU.map((section) => (
          <MenuSectionBlock key={section.title} section={section} />
        ))}
      </div>

      {/* ── LUNCH ─────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto mb-20">
        <MealHeading
          tag="Midday"
          title="Lunch"
          Icon={Sun}
          subtitle="Quick grills, rice dishes, and lighter fare served at the Hidden Grill through the day."
        />
        {LUNCH_MENU.map((section) => (
          <MenuSectionBlock key={section.title} section={section} />
        ))}
      </div>

      {/* ── SUPPER ────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto mb-20">
        <MealHeading
          tag="Evening"
          title="Supper"
          Icon={Moon}
          subtitle="Traditional Ghanaian soups, stews, staples, and hearty grills for a full evening meal."
        />
        {SUPPER_MENU.map((section) => (
          <MenuSectionBlock key={section.title} section={section} />
        ))}
      </div>

      {/* ── ALL DAY ──────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto mb-20">
        <MealHeading
          tag="Any Time"
          title="Available All Day"
          Icon={InfinityIcon}
          subtitle="Starters, salads, desserts, and drinks you can order at breakfast, lunch, or supper."
        />
        {ALL_DAY_MENU.map((section) => (
          <MenuSectionBlock key={section.title} section={section} />
        ))}

        {/* Open bar mini-banner */}
        <div className="bg-gradient-to-br from-primary to-accent text-white rounded-2xl p-6 sm:p-8 text-center mt-4">
          <h3 className="font-display text-xl sm:text-2xl font-semibold mb-2">
            Open Bar With All Drinks
          </h3>
          <p className="text-white/90 text-sm max-w-xl mx-auto">
            A full selection of local beers, spirits, wines, and cocktails at the park bar.
          </p>
        </div>
      </div>

      {/* Reservation CTA */}
      <div className="max-w-[1200px] mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
        <h3 className="font-display text-xl font-bold text-primary">Reserve a table</h3>
        <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto">
          Planning a meal for a group, a special occasion, or a private dinner under the stars? Message us
          and we&apos;ll hold a table for you.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <a
            href={reserveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition"
          >
            Reserve a Table
          </a>
          <Link
            href="/experiences"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-white transition"
          >
            View Experiences
          </Link>
        </div>
        <p className="text-xs text-text-secondary/70 mt-5">
          Menu items may change based on availability and season. Confirm with your server on the day.
        </p>
      </div>
    </main>
  );
}
