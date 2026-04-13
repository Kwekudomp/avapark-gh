import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import UpcomingEvents from "@/components/UpcomingEvents";
import CalendarGrid from "@/components/CalendarGrid";
import { getUpcomingEvents } from "@/lib/cms";
import { Dice5, PartyPopper, Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Event Calendar | Hidden Paradise Nature Park",
  description:
    "Find out what's happening at Hidden Paradise. Weekly events, special celebrations, and an interactive calendar showing every event coming up.",
};

const WEEKLY: { day: string; name: string; time: string; description: string; Icon: LucideIcon; color: string; href: string }[] = [
  {
    day: "Thursday",
    name: "Game Night",
    time: "8:00 PM to 2:00 AM",
    description: "Snooker, board games, video games, truth or dare, and bonfire vibes. Win prizes and meet new people.",
    Icon: Dice5,
    color: "bg-primary",
    href: "/experiences/game-night",
  },
  {
    day: "Friday",
    name: "Party in the Woods",
    time: "7:00 PM to 5:00 AM",
    description: "Our biggest weekly party. Live DJs, dancing under the trees, and the freedom of the great outdoors.",
    Icon: PartyPopper,
    color: "bg-accent",
    href: "/experiences/party-in-the-woods",
  },
  {
    day: "Saturday",
    name: "BBQ & Cinema",
    time: "7:30 PM to Midnight",
    description: "Smoke and cinema. Fresh grilled meats, drinks, and movies on the big screen under the stars.",
    Icon: Flame,
    color: "bg-secondary",
    href: "/experiences/saturday-bbq",
  },
];

export default async function EventCalendarPage() {
  const events = await getUpcomingEvents();

  return (
    <main className="pt-28 pb-24">
      {/* Hero */}
      <section className="px-[5%] mb-16">
        <SectionHeader
          tag="WHAT'S ON"
          title="Event Calendar"
          description="Weekly favourites, seasonal celebrations, and special one-off events. Plan your visit around what you love most."
        />
      </section>

      {/* Weekly Events */}
      <section className="px-[5%] mb-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-[3px] uppercase text-accent mb-2">
              EVERY WEEK
            </p>
            <h2 className="font-display text-3xl font-bold text-primary">
              Weekly Highlights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WEEKLY.map((w) => (
              <Link
                key={w.name}
                href={w.href}
                className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className={`${w.color} h-2`} />
                <div className="p-5">
                  <div className="w-12 h-12 mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <w.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-semibold tracking-wider text-accent uppercase">
                    {w.day}
                  </p>
                  <h3 className="font-display text-lg font-bold text-dark mt-1 group-hover:text-accent transition-colors">
                    {w.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 mb-3">{w.time}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {w.description}
                  </p>
                  <p className="text-accent text-xs font-semibold mt-4">
                    View Details &rarr;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Special Events from CMS */}
      {events.length > 0 ? (
        <UpcomingEvents events={events} />
      ) : (
        <section className="px-[5%] mb-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-bg-alt rounded-2xl border border-border p-10">
              <PartyPopper className="w-12 h-12 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="font-display text-lg font-bold text-primary mb-1">
                No Special Events Right Now
              </h3>
              <p className="text-text-secondary text-sm">
                Our weekly events run every week. Check back soon for upcoming festivals, holidays, and one-off celebrations.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Calendar Grid */}
      <section className="px-[5%] mt-20">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[3px] uppercase text-accent mb-2">
            FULL CALENDAR
          </p>
          <h2 className="font-display text-3xl font-bold text-primary">
            Browse by Date
          </h2>
          <p className="text-text-secondary text-sm mt-3 max-w-lg mx-auto">
            Click any day with an event to see what&apos;s happening. Use the arrows to navigate between months.
          </p>
        </div>

        <CalendarGrid events={events} />
      </section>

      {/* Private events CTA */}
      <section className="px-[5%] mt-20">
        <div className="max-w-[900px] mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="font-display text-xl font-bold text-primary">
            Hosting a Private Event?
          </h3>
          <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto">
            We host birthdays, weddings, corporate retreats, and milestone celebrations. Get in touch to plan your event at Hidden Paradise.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition mt-6"
          >
            Plan Your Event
          </Link>
        </div>
      </section>
    </main>
  );
}
