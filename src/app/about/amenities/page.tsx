import SectionHeader from "@/components/SectionHeader";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Amenities | Hidden Paradise Nature Park",
  description:
    "Everything you need at Hidden Paradise. Camping grounds, LED-lit pool, sunset gardens, restaurant, working farm, and event spaces.",
};

const amenities = [
  {
    title: "Camping Grounds",
    description:
      "Spacious green lawns with tent camping setup for groups of all sizes. Tents available or bring your own.",
  },
  {
    title: "Swimming Pool",
    description:
      "Our LED-lit pool is the centrepiece for pool parties, night swims, and daytime relaxation.",
  },
  {
    title: "Sunset Gardens",
    description:
      "Beautifully landscaped gardens perfect for photography, events, and peaceful walks.",
  },
  {
    title: "The Hidden Grill Restaurant",
    description:
      "On-site restaurant serving local favourites, from grilled meats to traditional dishes.",
  },
  {
    title: "Hidden Paradise Farm",
    description:
      "A working farm where you can tour, buy fresh produce, and learn about sustainable farming.",
  },
  {
    title: "Event Spaces",
    description:
      "Outdoor event areas with canopy setups for weddings, corporate retreats, birthdays, and more.",
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
