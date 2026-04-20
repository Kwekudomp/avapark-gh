"use client";

import { useState } from "react";
import Image from "next/image";
import { CMSEvent } from "@/lib/supabase";
import SectionHeader from "@/components/SectionHeader";
import EventDetailModal from "@/components/EventDetailModal";
import { parseLocalDate } from "@/lib/dates";

function EventCard({ event, onOpen }: { event: CMSEvent; onOpen: () => void }) {
  const date = parseLocalDate(event.event_date);
  const day = date.toLocaleDateString("en-GH", { day: "numeric" });
  const month = date.toLocaleDateString("en-GH", { month: "short" }).toUpperCase();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View full details for ${event.title}`}
      className="group bg-white rounded-2xl border border-border overflow-hidden hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
    >
      <div className="relative aspect-[16/9] bg-bg-alt overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-primary/30 text-5xl">🌿</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 text-center shadow-sm min-w-[52px]">
          <p className="text-xl font-bold text-primary leading-none">{day}</p>
          <p className="text-xs font-semibold text-accent mt-0.5">{month}</p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/30 transition-colors flex items-end justify-center pb-4">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
            View full details
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-primary">{event.title}</h3>
        {event.end_date && event.end_date !== event.event_date && (
          <p className="text-xs text-text-secondary mt-1">
            Until {parseLocalDate(event.end_date).toLocaleDateString("en-GH", { day: "numeric", month: "long" })}
          </p>
        )}
        {event.description && (
          <p className="text-sm text-text-secondary mt-2 line-clamp-2">{event.description}</p>
        )}
        <div className="flex items-center justify-between mt-4">
          {event.price ? (
            <span className="text-sm font-semibold text-primary">{event.price}</span>
          ) : (
            <span className="text-sm text-text-secondary">Free entry</span>
          )}
          <span className="text-accent text-xs font-semibold">
            View details &rarr;
          </span>
        </div>
      </div>
    </button>
  );
}

export default function UpcomingEvents({ events }: { events: CMSEvent[] }) {
  const [selected, setSelected] = useState<CMSEvent | null>(null);

  if (events.length === 0) return null;

  return (
    <section className="py-24 px-[5%] bg-bg-alt">
      <SectionHeader
        tag="WHAT'S COMING UP"
        title="Upcoming Events"
        description="Don't miss out! From special nights to seasonal celebrations, there's always something happening at Hidden Paradise."
      />
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(ev => (
          <EventCard key={ev.id} event={ev} onOpen={() => setSelected(ev)} />
        ))}
      </div>

      <EventDetailModal event={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
