import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Waves,
  Flower2,
  PartyPopper,
  Info,
  Trophy,
  Utensils,
  Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Amenities | Hidden Paradise Nature Park",
  description:
    "Everything you need at Hidden Paradise. Swimming pool, sunset gardens, event spaces, admin and info center, sports complex, food court, and fire side.",
};

const amenities: { title: string; description: string; Icon: LucideIcon }[] = [
  {
    title: "Admin & Info Center",
    description:
      "Your first stop on arrival. Check in, ask questions, pick up a park map, and sort out bookings with our friendly front-desk team.",
    Icon: Info,
  },
  {
    title: "Swimming Pool",
    description:
      "Our LED-lit pool is the centrepiece for pool parties, night swims, and daytime relaxation.",
    Icon: Waves,
  },
  {
    title: "Sunset Gardens",
    description:
      "Beautifully landscaped gardens perfect for photography, events, and peaceful walks. Flowers, flower pots, and garden art pieces are also available for sale.",
    Icon: Flower2,
  },
  {
    title: "Sports Complex",
    description:
      "Open fields and courts for football, volleyball, basketball, and group games. Gear available on request.",
    Icon: Trophy,
  },
  {
    title: "Food Court",
    description:
      "A range of food vendors and drink stations serving Ghanaian classics, grills, snacks, and refreshments throughout the day.",
    Icon: Utensils,
  },
  {
    title: "Fire Side",
    description:
      "A cosy bonfire area for storytelling, drum circles, late-night conversations, and marshmallow roasts under the stars.",
    Icon: Flame,
  },
  {
    title: "Event Spaces",
    description:
      "Outdoor event areas with canopy setups for weddings, corporate retreats, birthdays, and more.",
    Icon: PartyPopper,
  },
];

export default function AmenitiesPage() {
  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader tag="OUR AMENITIES" title="Everything You Need" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1400px] mx-auto">
        {amenities.map((amenity, i) => (
          <ScrollReveal key={amenity.title} delay={i * 0.1}>
            <div className="bg-white rounded-2xl p-6 border border-border hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <amenity.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-semibold text-primary mb-2">
                {amenity.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {amenity.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </main>
  );
}
