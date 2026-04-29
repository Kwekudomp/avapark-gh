"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { CMSEvent } from "@/lib/supabase";
import EventDetailModal from "@/components/EventDetailModal";
import { parseLocalDate } from "@/lib/dates";

function MiniCard({ event, onOpen }: { event: CMSEvent; onOpen: () => void }) {
  const date = parseLocalDate(event.event_date);
  const day = date.toLocaleDateString("en-GH", { day: "numeric" });
  const month = date.toLocaleDateString("en-GH", { month: "short" }).toUpperCase();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View full details for ${event.title}`}
      className="group bg-white rounded-2xl border border-border overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 flex"
    >
      <div className="relative w-32 sm:w-40 flex-shrink-0 bg-bg-alt overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 128px, 160px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-primary/30 text-3xl">🌿</span>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white rounded-lg px-2 py-1 text-center shadow-sm">
          <p className="text-base font-bold text-primary leading-none">{day}</p>
          <p className="text-[10px] font-semibold text-accent mt-0.5">{month}</p>
        </div>
      </div>
      <div className="p-4 flex-1 min-w-0">
        <h3 className="font-display text-base font-semibold text-primary truncate">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{event.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          {event.price ? (
            <span className="text-xs font-semibold text-primary">{event.price}</span>
          ) : (
            <span className="text-xs text-text-secondary">Free entry</span>
          )}
          <span className="text-accent text-xs font-semibold">
            Details &rarr;
          </span>
        </div>
      </div>
    </button>
  );
}

export default function UpcomingEventsTeaser({ events }: { events: CMSEvent[] }) {
  const [selected, setSelected] = useState<CMSEvent | null>(null);

  if (events.length === 0) return null;

  const top = events.slice(0, 2);

  return (
    <section className="py-12 px-[5%] bg-bg-alt">
      <div className="max-w-[1100px] mx-auto">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[3px] uppercase text-accent mb-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> WHAT&apos;S COMING UP
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary">
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/event-calendar"
            className="text-accent text-sm font-medium hover:text-accent-dark transition whitespace-nowrap"
          >
            View all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {top.map(ev => (
            <MiniCard key={ev.id} event={ev} onOpen={() => setSelected(ev)} />
          ))}
        </div>
      </div>

      <EventDetailModal event={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
