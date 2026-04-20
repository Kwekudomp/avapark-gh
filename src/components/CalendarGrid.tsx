"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CMSEvent } from "@/lib/supabase";
import { toLocalISODate } from "@/lib/dates";
import EventDetailModal from "@/components/EventDetailModal";

interface CalendarGridProps {
  events: CMSEvent[];
}

const WEEKLY_EVENTS: { day: number; name: string; color: string }[] = [
  { day: 4, name: "Game Night", color: "bg-primary" },
  { day: 5, name: "Party in the Woods", color: "bg-accent" },
  { day: 6, name: "BBQ & Cinema", color: "bg-secondary" },
];

export default function CalendarGrid({ events }: CalendarGridProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [openEvent, setOpenEvent] = useState<CMSEvent | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en-GH", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { date: Date; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }

  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, isCurrentMonth: false });
  }

  function getEventsForDay(date: Date): { specials: CMSEvent[]; weekly: typeof WEEKLY_EVENTS } {
    const dateStr = toLocalISODate(date);
    const specials = events.filter((e) => {
      const start = e.event_date;
      const end = e.end_date || e.event_date;
      return dateStr >= start && dateStr <= end;
    });
    const weekly = WEEKLY_EVENTS.filter((w) => w.day === date.getDay());
    return { specials, weekly };
  }

  function isToday(date: Date) {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  function isSelected(date: Date) {
    return (
      selectedDay !== null &&
      date.getFullYear() === selectedDay.getFullYear() &&
      date.getMonth() === selectedDay.getMonth() &&
      date.getDate() === selectedDay.getDate()
    );
  }

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : null;

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <button
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            className="w-10 h-10 rounded-full hover:bg-bg-alt flex items-center justify-center transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
          <h3 className="font-display text-2xl font-bold text-primary">{monthName}</h3>
          <button
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            className="w-10 h-10 rounded-full hover:bg-bg-alt flex items-center justify-center transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="bg-bg-alt text-center py-3 text-xs font-semibold tracking-wider text-text-secondary uppercase"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-px bg-border">
          {cells.map((cell, i) => {
            const { specials, weekly } = getEventsForDay(cell.date);
            const hasEvents = specials.length > 0 || weekly.length > 0;
            const todayCell = isToday(cell.date);
            const selected = isSelected(cell.date);

            return (
              <button
                key={i}
                type="button"
                onClick={() => hasEvents && setSelectedDay(cell.date)}
                className={`relative bg-white min-h-[80px] sm:min-h-[100px] p-2 text-left transition ${
                  hasEvents ? "cursor-pointer hover:bg-bg-alt" : "cursor-default"
                } ${!cell.isCurrentMonth ? "opacity-40" : ""} ${
                  selected ? "ring-2 ring-accent ring-inset" : ""
                }`}
              >
                <span
                  className={`text-sm font-medium ${
                    todayCell
                      ? "inline-flex w-7 h-7 items-center justify-center rounded-full bg-accent text-white"
                      : cell.isCurrentMonth
                      ? "text-dark"
                      : "text-text-secondary"
                  }`}
                >
                  {cell.date.getDate()}
                </span>
                {hasEvents && (
                  <div className="mt-1 space-y-1">
                    {weekly.slice(0, 2).map((w) => (
                      <div
                        key={w.name}
                        className={`${w.color} text-white text-[10px] font-medium px-1.5 py-0.5 rounded truncate`}
                      >
                        {w.name}
                      </div>
                    ))}
                    {specials.slice(0, 1).map((s) => (
                      <div
                        key={s.id}
                        className="bg-dark text-white text-[10px] font-medium px-1.5 py-0.5 rounded truncate"
                      >
                        {s.title}
                      </div>
                    ))}
                    {specials.length + weekly.length > 3 && (
                      <div className="text-[10px] text-text-secondary">
                        +{specials.length + weekly.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day details */}
      {selectedDay && selectedDayEvents && (
        <div className="mt-6 bg-bg-alt rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display text-lg font-bold text-primary">
              {selectedDay.toLocaleDateString("en-GH", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-sm text-text-secondary hover:text-accent"
            >
              Close
            </button>
          </div>
          <div className="space-y-3">
            {selectedDayEvents.weekly.map((w) => (
              <div
                key={w.name}
                className="flex items-center gap-3 bg-white rounded-xl p-4 border border-border"
              >
                <div className={`${w.color} w-1 self-stretch rounded-full`} />
                <div>
                  <p className="font-semibold text-dark text-sm">{w.name}</p>
                  <p className="text-xs text-text-secondary">Weekly recurring event</p>
                </div>
              </div>
            ))}
            {selectedDayEvents.specials.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setOpenEvent(s)}
                className="flex items-start gap-3 bg-white rounded-xl p-4 border border-border text-left w-full hover:border-accent hover:shadow-sm transition cursor-pointer"
              >
                <div className="bg-dark w-1 self-stretch rounded-full" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark text-sm">{s.title}</p>
                  {s.description && (
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{s.description}</p>
                  )}
                  {s.price && (
                    <p className="text-xs text-accent font-semibold mt-1">{s.price}</p>
                  )}
                  <p className="text-xs text-accent mt-2 font-semibold">View full details &rarr;</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary" />
          Game Night
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-accent" />
          Party in the Woods
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-secondary" />
          BBQ & Cinema
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-dark" />
          Special Event
        </div>
      </div>

      <EventDetailModal event={openEvent} onClose={() => setOpenEvent(null)} />
    </div>
  );
}
