import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";

export const metadata = {
  title: "Attractions | Hidden Paradise Nature Park",
  description:
    "Explore tourist attractions around Hidden Paradise, including the Volta River, Akosombo Dam, Shai Hills, Boti Falls, and more. Experience them all through us.",
};

const ATTRACTIONS = [
  {
    name: "Volta River & Lake",
    distance: "On-site",
    description:
      "Stretching along our 300-acre grounds, the Volta offers boat cruises, kayaking, and stunning sunsets right from the park.",
    icon: "🌊",
  },
  {
    name: "Akosombo Dam",
    distance: "~30 min drive",
    description:
      "One of the largest hydroelectric dams in West Africa. Guided tours let you see the engineering marvel that powers Ghana up close.",
    icon: "🏗️",
  },
  {
    name: "Shai Hills Resource Reserve",
    distance: "~40 min drive",
    description:
      "Home to baboons, antelopes, and ancient caves. A wildlife and hiking experience perfect for nature lovers.",
    icon: "🦌",
  },
  {
    name: "Boti Falls",
    distance: "~1.5 hr drive",
    description:
      "A breathtaking twin waterfall surrounded by lush forest. Best visited during the rainy season when both falls flow.",
    icon: "💧",
  },
  {
    name: "Krobo Mountain",
    distance: "~25 min drive",
    description:
      "Sacred mountain of the Krobo people with panoramic views of the Eastern Region. Rich in culture and history.",
    icon: "⛰️",
  },
  {
    name: "Cedi Bead Factory (Krobo Beads)",
    distance: "~20 min drive",
    description:
      "Watch traditional glass beads being made by hand, a living cultural heritage of the Krobo people. Shop for unique souvenirs.",
    icon: "📿",
  },
];

export default function AttractionsPage() {
  const enquiryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to learn more about visiting attractions around Hidden Paradise."
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="EXPLORE THE REGION"
        title="Attractions Near Us"
        description="Hidden Paradise is your gateway to the best of the Eastern and Volta region. Explore these attractions through us and we'll arrange transport, guides, and packages."
      />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ATTRACTIONS.map((a) => (
          <div
            key={a.name}
            className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow flex flex-col"
          >
            <span className="text-4xl mb-3">{a.icon}</span>
            <h3 className="font-display text-lg font-bold text-dark">
              {a.name}
            </h3>
            <p className="text-xs font-semibold tracking-wider text-accent uppercase mt-1">
              {a.distance}
            </p>
            <p className="text-sm text-text-secondary mt-3 flex-1">
              {a.description}
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
        <h3 className="font-display text-xl font-bold text-primary">
          Want to visit any of these attractions?
        </h3>
        <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto">
          We organise day trips and multi-stop tours from Hidden Paradise.
          Message us to build a custom itinerary for your group.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <a
            href={enquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition"
          >
            Plan a Visit
          </a>
          <Link
            href="/tours"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-white transition"
          >
            View Tour Packages
          </Link>
        </div>
      </div>
    </main>
  );
}
