"use client";

import SectionHeader from "./SectionHeader";
import ScrollReveal from "./ScrollReveal";

interface ScheduleEvent {
  event: string;
  time: string;
  colour: string;
}

interface DayColumn {
  day: string;
  events: ScheduleEvent[];
}

const schedule: DayColumn[] = [
  {
    day: "Thursday",
    events: [
      { event: "Game Night", time: "8:00 PM \u2013 2:00 AM", colour: "bg-primary" },
    ],
  },
  {
    day: "Friday",
    events: [
      {
        event: "Party In The Woods",
        time: "7:00 PM \u2013 5:00 AM",
        colour: "bg-accent",
      },
      {
        event: "Movie Night",
        time: "7:00 PM \u2013 1:00 AM",
        colour: "bg-secondary",
      },
    ],
  },
  {
    day: "Saturday",
    events: [
      {
        event: "Saturday BBQ",
        time: "7:30 PM \u2013 Midnight",
        colour: "bg-accent",
      },
      {
        event: "Hiking Tours",
        time: "9:00 AM \u2013 5:00 PM",
        colour: "bg-primary",
      },
    ],
  },
  {
    day: "Weekends",
    events: [
      {
        event: "Camping Experience",
        time: "Friday \u2013 Sunday",
        colour: "bg-primary-light",
      },
    ],
  },
];

export default function WeeklySchedule() {
  return (
    <section className="bg-dark text-white py-24 px-[5%]">
      <SectionHeader
        tag="WEEKLY LINEUP"
        title="Something Happening Every Day"
        light
      />

      <div className="max-w-[1400px] mx-auto">
        {/* Horizontal scroll wrapper on mobile, grid on desktop */}
        <div className="flex lg:grid lg:grid-cols-4 gap-6 overflow-x-auto pb-4 lg:pb-0 snap-x snap-mandatory scrollbar-hide">
          {schedule.map((col, i) => (
            <ScrollReveal
              key={col.day}
              delay={i * 0.1}
              className="min-w-[260px] lg:min-w-0 snap-start"
            >
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 h-full">
                {/* Day header */}
                <p className="font-semibold text-sm uppercase tracking-wider text-white/60 mb-5">
                  {col.day}
                </p>

                {/* Event blocks */}
                <div className="space-y-4">
                  {col.events.map((ev) => (
                    <div
                      key={ev.event}
                      className="flex items-start gap-3"
                    >
                      {/* Colour bar */}
                      <div
                        className={`${ev.colour} w-1 rounded-full self-stretch shrink-0`}
                      />
                      <div>
                        <p className="font-medium text-sm text-white">
                          {ev.event}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {ev.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
