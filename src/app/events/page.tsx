import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import UpcomingEvents from "@/components/UpcomingEvents";
import WeeklySchedule from "@/components/WeeklySchedule";
import { getUpcomingEvents } from "@/lib/cms";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events | Hidden Paradise Nature Park",
  description:
    "Upcoming events and weekly schedule at Hidden Paradise including Party in the Woods, BBQ nights, Game Night, Family Day, and special events.",
};

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <main className="pt-28 pb-24">
      {/* Upcoming special events from CMS */}
      <section className="px-[5%]">
        <SectionHeader
          tag="WHAT'S COMING UP"
          title="Events at Hidden Paradise"
          description="Whether it's our weekly favourites or a special one-off, there's always something happening at the park."
        />
      </section>

      <UpcomingEvents events={events} />

      {events.length === 0 && (
        <div className="max-w-2xl mx-auto text-center px-[5%] mb-16">
          <div className="bg-bg-alt rounded-2xl border border-border p-10">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-text-secondary text-sm">
              No upcoming special events right now, but our weekly events run every week! See the schedule below.
            </p>
          </div>
        </div>
      )}

      {/* Weekly schedule */}
      <WeeklySchedule />

      <div className="text-center mt-12 px-[5%]">
        <p className="text-text-secondary text-sm mb-4">
          Want to host a private event at Hidden Paradise?
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition"
        >
          Get in Touch
        </Link>
      </div>
    </main>
  );
}
