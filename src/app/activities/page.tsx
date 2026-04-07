import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "Activities | Hidden Paradise Nature Park",
  description:
    "Things to do at Hidden Paradise including hiking, swimming, horse riding, ATV rides, archery, boat cruises, and more on 300 acres of nature.",
};

const ACTIVITIES = [
  {
    name: "Hiking & Nature Walks",
    description: "Guided trails through 300 acres of forest, hills, and riverside paths.",
    icon: "🥾",
  },
  {
    name: "Swimming Pool",
    description: "Cool off in our pool, open daily for guests and day visitors.",
    icon: "🏊",
  },
  {
    name: "Horse Riding",
    description: "Scenic horseback rides across the grounds, suitable for beginners and experienced riders.",
    icon: "🐴",
  },
  {
    name: "ATV & Dirt Rides",
    description: "Hit the trails on an ATV for an adrenaline-pumping off-road adventure.",
    icon: "🏍️",
  },
  {
    name: "Boat Cruise",
    description: "Cruise the Volta River at sunset or take a fishing trip with local guides.",
    icon: "⛵",
  },
  {
    name: "Biking",
    description: "Mountain bike trails through the park. Bikes available for rent.",
    icon: "🚴",
  },
  {
    name: "Archery",
    description: "Test your aim at our archery range. Equipment and coaching provided.",
    icon: "🏹",
  },
  {
    name: "Board Games & Bonfire",
    description: "Unwind with board games and gather around the bonfire under the stars.",
    icon: "🎲",
  },
  {
    name: "Sip & Paint",
    description: "Creative painting sessions with drinks, perfect for groups and couples.",
    icon: "🎨",
  },
  {
    name: "Treasure Hunt",
    description: "Team-based treasure hunts across the park, great for corporate groups and families.",
    icon: "🗺️",
  },
  {
    name: "Kids Zone",
    description: "Supervised play area with activities designed for children of all ages.",
    icon: "🧒",
  },
  {
    name: "Outdoor Cinema",
    description: "Movie nights under the stars on our big screen, part of Friday and Saturday events.",
    icon: "🎬",
  },
];

export default function ActivitiesPage() {
  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="THINGS TO DO"
        title="Activities at Hidden Paradise"
        description="Whether you're here for adventure or relaxation, there's something for everyone on our 300-acre nature park."
      />

      <div className="max-w-[1200px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {ACTIVITIES.map((a) => (
          <div
            key={a.name}
            className="bg-white rounded-2xl border border-border p-5 text-center hover:shadow-md transition-shadow"
          >
            <span className="text-3xl block mb-2">{a.icon}</span>
            <h3 className="font-display text-base font-bold text-dark leading-tight">
              {a.name}
            </h3>
            <p className="text-xs text-text-secondary mt-2">{a.description}</p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-text-secondary text-sm mb-4">
          Most activities are included with our experience packages or available as add-ons.
        </p>
        <Link
          href="/experiences"
          className="inline-flex items-center bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition"
        >
          Browse Experiences
        </Link>
      </div>
    </main>
  );
}
