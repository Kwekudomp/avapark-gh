import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";
import {
  UtensilsCrossed,
  ChefHat,
  Soup,
  Wheat,
  Leaf,
  GlassWater,
  Martini,
  Flame,
  Fish,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Food & Drinks | Hidden Paradise Nature Park",
  description:
    "The Hidden Paradise kitchen menu. Ghanaian classics including fried rice combos, banku specials, fufu, omotuo, local soups, and fresh natural juices.",
};

type DietTag = "spicy" | "seafood";

interface MenuItem {
  name: string;
  description: string;
  tags?: DietTag[];
}

interface MenuSection {
  title: string;
  Icon: LucideIcon;
  items: MenuItem[];
}

const MENU: MenuSection[] = [
  {
    title: "Rice Dishes",
    Icon: UtensilsCrossed,
    items: [
      {
        name: "Fried Rice & Fried Chicken",
        description: "Our house fried rice with a crispy, golden fried chicken leg.",
      },
      {
        name: "Fried Rice & Grilled Chicken",
        description: "Fragrant fried rice paired with marinated, flame-grilled chicken.",
      },
      {
        name: "Fried Rice & Grilled Tilapia",
        description: "Fried rice served with a fresh, seasoned grilled tilapia from the lake.",
        tags: ["seafood"],
      },
      {
        name: "Fried Rice & Chicken Sauce",
        description: "Fried rice topped with a rich tomato-based chicken sauce.",
      },
      {
        name: "Plain Rice & Beef Sauce",
        description: "Steamed rice served with a slow-cooked beef sauce full of flavour.",
      },
      {
        name: "Plain Rice & Local Chicken Stew",
        description: "Steamed rice with our signature Ghanaian local chicken stew.",
      },
    ],
  },
  {
    title: "Banku Specials",
    Icon: ChefHat,
    items: [
      {
        name: "Banku & Grilled Tilapia",
        description: "Warm banku served with a whole grilled tilapia, fresh pepper, and onions.",
        tags: ["seafood", "spicy"],
      },
      {
        name: "Banku & Fried Tilapia",
        description: "Banku with golden fried tilapia, shito, and fresh pepper sauce.",
        tags: ["seafood", "spicy"],
      },
      {
        name: "Banku & Grilled Chicken",
        description: "Banku paired with flame-grilled chicken and a side of shito.",
      },
      {
        name: "Banku & Shito Lo",
        description: "Banku served with our house shito and slow-cooked meats.",
        tags: ["spicy"],
      },
      {
        name: "Banku & Abobi Tadzi Stew",
        description: "Banku with a traditional seafood stew simmered in palm oil and spices.",
        tags: ["seafood"],
      },
    ],
  },
  {
    title: "Traditional Soups & Staples",
    Icon: Soup,
    items: [
      {
        name: "Fufu & Local Chicken Light Soup",
        description: "Pounded fufu in our peppery light soup with tender local chicken.",
        tags: ["spicy"],
      },
      {
        name: "Omotuo & Groundnut Soup",
        description: "Rice balls (omotuo) served in a rich, creamy groundnut soup.",
      },
      {
        name: "Ewo Kple & Okro Soup",
        description: "Traditional Ewe ewokple with a fresh okro soup and meats of the day.",
      },
    ],
  },
  {
    title: "Yam, Potato & Noodles",
    Icon: Wheat,
    items: [
      {
        name: "Fried Yam & Grilled Chicken",
        description: "Golden fried yam served with grilled chicken and fresh pepper sauce.",
      },
      {
        name: "Fried Sweet Potato & Fried Tilapia",
        description: "Sweet fried potato paired with crispy fried tilapia and shito.",
        tags: ["seafood"],
      },
      {
        name: "Assorted Noodles",
        description: "Stir-fried noodles with assorted meats and fresh vegetables.",
      },
      {
        name: "Chicken / Beef Noodles",
        description: "Stir-fried noodles with your choice of chicken or beef.",
      },
    ],
  },
  {
    title: "Small Plates",
    Icon: Leaf,
    items: [
      {
        name: "Red Red",
        description: "Classic Ghanaian bean stew in palm oil, served with sweet fried plantain.",
      },
      {
        name: "Abolo Platter",
        description: "A platter of abolo (steamed corn cakes) served with fried fish and fresh pepper.",
        tags: ["seafood", "spicy"],
      },
    ],
  },
  {
    title: "Natural Juices",
    Icon: GlassWater,
    items: [
      {
        name: "Mango",
        description: "Freshly blended ripe mango juice.",
      },
      {
        name: "Watermelon",
        description: "Cool, refreshing watermelon juice.",
      },
      {
        name: "Orange",
        description: "Fresh-squeezed orange juice.",
      },
      {
        name: "Pineapple",
        description: "Sweet, tangy pineapple juice.",
      },
      {
        name: "Coconut",
        description: "Fresh coconut water, straight from the fruit.",
      },
    ],
  },
];

const TAG_STYLES: Record<DietTag, { label: string; Icon: LucideIcon; className: string }> = {
  spicy: { label: "Spicy", Icon: Flame, className: "bg-red-100 text-red-700" },
  seafood: { label: "Seafood", Icon: Fish, className: "bg-blue-100 text-blue-700" },
};

function ItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow flex flex-col">
      <h3 className="font-display text-lg font-bold text-dark mb-2">{item.name}</h3>
      <p className="text-sm text-text-secondary flex-1">{item.description}</p>
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {item.tags.map((t) => {
            const style = TAG_STYLES[t];
            return (
              <span
                key={t}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${style.className}`}
              >
                <style.Icon className="w-3 h-3" strokeWidth={2} />
                {style.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FoodDrinksPage() {
  const reserveUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to reserve a table at the Hidden Paradise kitchen."
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="THE KITCHEN"
        title="Food & Drinks"
        description="Authentic Ghanaian cooking from our on-site kitchen. Rice combos, banku specials, fufu with light soup, omotuo with groundnut soup, fresh-pressed juices, and a full bar of drinks."
      />

      {/* Info strip */}
      <div className="max-w-[1200px] mx-auto mb-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
        <p className="text-sm text-text-secondary">
          <span className="font-semibold text-primary">Hours:</span> 9:00 AM – 11:00 PM daily ·{" "}
          <span className="font-semibold text-primary">Kitchen closes:</span> 10:00 PM ·{" "}
          <span className="font-semibold text-primary">Reservations:</span> Recommended for groups of 6+
        </p>
      </div>

      {MENU.map((section) => (
        <div key={section.title} className="max-w-[1200px] mx-auto mb-16">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <section.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl font-bold text-primary">{section.title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      ))}

      {/* Open bar banner */}
      <div className="max-w-[1200px] mx-auto mb-16 bg-gradient-to-br from-primary to-accent text-white rounded-2xl p-8 sm:p-10 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
          <Martini className="w-7 h-7" strokeWidth={1.8} />
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
          Open Bar With All Drinks
        </h3>
        <p className="text-white/90 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Our bar stocks a full selection of local beers, spirits, wines, and cocktails alongside the fresh juices on the menu. Ask your server for today&apos;s specials.
        </p>
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
