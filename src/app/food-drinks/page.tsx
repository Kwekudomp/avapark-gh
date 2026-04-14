import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";
import {
  Soup,
  UtensilsCrossed,
  Apple,
  GlassWater,
  Martini,
  Cake,
  Leaf,
  Flame,
  Fish,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Food & Drinks | Hidden Paradise Nature Park",
  description:
    "Explore the Hidden Grill menu at Hidden Paradise Nature Park. Ghanaian classics, grilled specialities, fresh drinks, and desserts served daily.",
};

type DietTag = "veg" | "spicy" | "seafood";

interface MenuItem {
  name: string;
  description: string;
  price: number;
  tags?: DietTag[];
}

interface MenuSection {
  title: string;
  Icon: LucideIcon;
  items: MenuItem[];
}

const MENU: MenuSection[] = [
  {
    title: "Starters",
    Icon: Soup,
    items: [
      {
        name: "Kelewele",
        description: "Spicy fried plantain cubes tossed in ginger, pepper, and traditional spices.",
        price: 20,
        tags: ["veg", "spicy"],
      },
      {
        name: "Coconut Soup",
        description: "Creamy coconut broth with fresh herbs and a hint of chilli.",
        price: 30,
        tags: ["veg"],
      },
      {
        name: "Garden Salad",
        description: "Crisp greens from the Hidden Paradise farm with a citrus dressing.",
        price: 25,
        tags: ["veg"],
      },
    ],
  },
  {
    title: "Mains & Grill",
    Icon: UtensilsCrossed,
    items: [
      {
        name: "Hidden Grill BBQ Plate",
        description: "Signature grill with beef, chicken, sausage, jollof, and grilled vegetables.",
        price: 120,
      },
      {
        name: "Jollof Rice & Grilled Chicken",
        description: "Our house jollof paired with marinated grilled chicken and shito.",
        price: 80,
      },
      {
        name: "Banku & Tilapia",
        description: "Grilled whole tilapia served with banku, pepper sauce, and onions.",
        price: 100,
        tags: ["seafood", "spicy"],
      },
      {
        name: "Waakye Deluxe",
        description: "Rice and beans served with spaghetti, egg, gari, wele, and shito.",
        price: 60,
      },
      {
        name: "Fufu with Light Soup",
        description: "Pounded fufu in a peppery light soup with your choice of goat or chicken.",
        price: 70,
        tags: ["spicy"],
      },
      {
        name: "Fried Yam & Pepper Sauce",
        description: "Golden fried yam served with fresh tomato pepper sauce.",
        price: 45,
        tags: ["veg"],
      },
    ],
  },
  {
    title: "Sides",
    Icon: Apple,
    items: [
      {
        name: "Plantain Chips",
        description: "Crispy, lightly salted plantain chips.",
        price: 15,
        tags: ["veg"],
      },
      {
        name: "Fried Plantain",
        description: "Sweet ripe plantain, fried until caramelised.",
        price: 15,
        tags: ["veg"],
      },
      {
        name: "Mixed Vegetables",
        description: "Farm-fresh seasonal vegetables, lightly sauteed.",
        price: 25,
        tags: ["veg"],
      },
    ],
  },
  {
    title: "Soft Drinks & Juices",
    Icon: GlassWater,
    items: [
      {
        name: "Fresh Coconut Water",
        description: "Straight from the coconut, chilled and ready to serve.",
        price: 20,
      },
      {
        name: "Sobolo (Hibiscus)",
        description: "Refreshing hibiscus drink with pineapple and ginger notes.",
        price: 15,
      },
      {
        name: "Fresh Fruit Juice",
        description: "Seasonal fresh-pressed juice — ask your server for today's choice.",
        price: 25,
      },
      {
        name: "Bottled Water",
        description: "Still or sparkling.",
        price: 5,
      },
    ],
  },
  {
    title: "Beer & Cocktails",
    Icon: Martini,
    items: [
      {
        name: "Local Beer",
        description: "Star, Club, or Guinness — always ice-cold.",
        price: 25,
      },
      {
        name: "Palm Wine",
        description: "Fresh-tapped palm wine (subject to season and availability).",
        price: 30,
      },
      {
        name: "Tropical Cocktail",
        description: "House cocktail with fresh fruit and a splash of rum.",
        price: 50,
      },
    ],
  },
  {
    title: "Desserts",
    Icon: Cake,
    items: [
      {
        name: "Fresh Fruit Platter",
        description: "A selection of ripe seasonal fruits from the farm.",
        price: 30,
        tags: ["veg"],
      },
      {
        name: "Ice Cream",
        description: "Scoops of vanilla, chocolate, or strawberry.",
        price: 20,
        tags: ["veg"],
      },
    ],
  },
];

const TAG_STYLES: Record<DietTag, { label: string; Icon: LucideIcon; className: string }> = {
  veg: { label: "Vegetarian", Icon: Leaf, className: "bg-green-100 text-green-700" },
  spicy: { label: "Spicy", Icon: Flame, className: "bg-red-100 text-red-700" },
  seafood: { label: "Seafood", Icon: Fish, className: "bg-blue-100 text-blue-700" },
};

function formatPrice(price: number) {
  return `GHC ${price}`;
}

function ItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-display text-lg font-bold text-dark">{item.name}</h3>
        <p className="font-display text-lg font-bold text-accent whitespace-nowrap">
          {formatPrice(item.price)}
        </p>
      </div>
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
    "Hi, I'd like to reserve a table at the Hidden Grill."
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="HIDDEN GRILL"
        title="Food & Drinks"
        description="Our on-site kitchen serves Ghanaian classics, grilled specialities, and fresh drinks throughout the day. Everything is prepared with produce from our working farm whenever possible."
      />

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

      <div className="max-w-[1200px] mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
        <h3 className="font-display text-xl font-bold text-primary">Reserve a table at the Hidden Grill</h3>
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
          Menu and prices shown are samples and may change. Confirm with your server on the day.
        </p>
      </div>
    </main>
  );
}
