import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";

export const metadata = {
  title: "Eastern and Volta Tours | Hidden Paradise Nature Park",
  description:
    "Guided tours from Hidden Paradise to Akosombo Dam, Shai Hills, Boti Falls, Krobo Mountain, bead markets, and the Volta River. Day trips and multi-day packages.",
};

const TOURS = [
  {
    name: "Akosombo Dam & Volta Cruise",
    duration: "Full day",
    description:
      "Visit the Akosombo Dam, learn about Ghana's hydroelectric history, then enjoy a scenic boat cruise on the Volta River with lunch on board.",
    highlights: ["Dam tour", "River cruise", "Lunch included", "Photo stops"],
    icon: "🚢",
  },
  {
    name: "Shai Hills Wildlife Safari",
    duration: "Half day",
    description:
      "Guided hike through Shai Hills Resource Reserve. Spot baboons, antelopes, and explore ancient Dangme caves.",
    highlights: ["Wildlife spotting", "Cave exploration", "Guided hike", "Transport included"],
    icon: "🦁",
  },
  {
    name: "Boti Falls Adventure",
    duration: "Full day",
    description:
      "Journey to the stunning twin waterfalls of Boti. Includes stops at the umbrella rock and a picnic lunch en route.",
    highlights: ["Twin waterfalls", "Umbrella rock", "Picnic lunch", "Scenic drive"],
    icon: "🏞️",
  },
  {
    name: "Krobo Culture & Beads Tour",
    duration: "Half day",
    description:
      "Climb Krobo Mountain for panoramic views, then visit the Cedi Bead Factory to see traditional glass beads made by hand. Shop for souvenirs.",
    highlights: ["Mountain hike", "Bead-making demo", "Souvenir shopping", "Cultural immersion"],
    icon: "📿",
  },
  {
    name: "Eastern Region Grand Tour",
    duration: "2 days / 1 night",
    description:
      "The ultimate Eastern Region experience, combining Akosombo, Shai Hills, Krobo Mountain, and Boti Falls with an overnight stay at Hidden Paradise.",
    highlights: ["All major attractions", "Overnight camping", "All meals", "Personal guide"],
    icon: "🗺️",
  },
];

export default function ToursPage() {
  const enquiryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'm interested in booking an Eastern and Volta tour from Hidden Paradise. Can you share details?"
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="EASTERN / VOLTA TOURS"
        title="Explore Beyond the Park"
        description="Hidden Paradise is your base camp for the best of the Eastern and Volta region. We organise guided tours to top attractions. Just show up and we handle the rest."
      />

      <div className="max-w-[1000px] mx-auto space-y-6">
        {TOURS.map((tour) => (
          <div
            key={tour.name}
            className="bg-white rounded-2xl border border-border p-6 sm:p-8 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl shrink-0">{tour.icon}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-lg font-bold text-dark">
                    {tour.name}
                  </h3>
                  <span className="text-xs font-semibold tracking-wider text-accent uppercase bg-accent/10 px-2.5 py-0.5 rounded-full">
                    {tour.duration}
                  </span>
                </div>
                <p className="text-sm text-text-secondary mt-2">
                  {tour.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tour.highlights.map((h) => (
                    <span
                      key={h}
                      className="text-xs text-primary bg-primary/5 border border-primary/10 px-2.5 py-1 rounded-full"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-[1000px] mx-auto mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
        <h3 className="font-display text-xl font-bold text-primary">
          Book a Tour
        </h3>
        <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto">
          All tours depart from Hidden Paradise. Prices vary by group size, so message us for a quote and to reserve your spot.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <a
            href={enquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition"
          >
            Enquire on WhatsApp
          </a>
          <Link
            href="/attractions"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-white transition"
          >
            View Attractions
          </Link>
        </div>
      </div>
    </main>
  );
}
