import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import {
  Footprints, Waves, Horse, Bike, Ship, Target, Crosshair,
  TableTennis, Circle, Flag, Dribbble, Flame, Palette, Map,
  Baby, Film,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Activities | Hidden Paradise Nature Park",
  description:
    "Things to do at Hidden Paradise including hiking, swimming, horse riding, ATV and bike rides, archery, paintball, mini golf, boat cruises, and more on 300 acres of nature.",
};

const ACTIVITIES: { name: string; description: string; Icon: LucideIcon }[] = [
  {
    name: "Hiking & Nature Walks",
    description: "Guided trails through 300 acres of forest, hills, and riverside paths.",
    Icon: Footprints,
  },
  {
    name: "Swimming Pool",
    description: "Cool off in our pool, open daily for guests and day visitors.",
    Icon: Waves,
  },
  {
    name: "Horse Riding",
    description: "Scenic horseback rides across the grounds, suitable for beginners and experienced riders.",
    Icon: Horse,
  },
  {
    name: "ATV & Bike Rides",
    description: "Hit the trails on an ATV or mountain bike for an off-road adventure. Bikes available for rent.",
    Icon: Bike,
  },
  {
    name: "Boat Cruise & Fishing",
    description: "Cruise the Volta River at sunset or cast a line with local fishing guides.",
    Icon: Ship,
  },
  {
    name: "Archery & Dart Board",
    description: "Test your aim at our archery range or the dart board. Equipment and coaching provided.",
    Icon: Target,
  },
  {
    name: "Paintball Shooting Range",
    description: "Tactical paintball sessions and target shooting on our outdoor course. All gear provided.",
    Icon: Crosshair,
  },
  {
    name: "Table Tennis",
    description: "Challenge your friends to a game of ping pong. Tables set up and ready to play.",
    Icon: TableTennis,
  },
  {
    name: "Pool / Snooker Table",
    description: "Rack up and play pool or snooker in our recreation area.",
    Icon: Circle,
  },
  {
    name: "Mini Golf Course",
    description: "Fun for all ages on our outdoor mini golf course set among the gardens.",
    Icon: Flag,
  },
  {
    name: "Soccer & Volleyball",
    description: "Join a pickup game on our soccer pitch or volleyball court. Open to all guests.",
    Icon: Dribbble,
  },
  {
    name: "Board Games & Bonfire",
    description: "Unwind with board games and gather around the bonfire under the stars.",
    Icon: Flame,
  },
  {
    name: "Sip & Paint",
    description: "Creative painting sessions with drinks, perfect for groups and couples.",
    Icon: Palette,
  },
  {
    name: "Treasure Hunt",
    description: "Team-based treasure hunts across the park, great for corporate groups and families.",
    Icon: Map,
  },
  {
    name: "Kids Zone",
    description: "Supervised play area with activities designed for children of all ages.",
    Icon: Baby,
  },
  {
    name: "Outdoor Cinema",
    description: "Movie nights under the stars on our big screen, part of Friday and Saturday events.",
    Icon: Film,
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
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <a.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
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
