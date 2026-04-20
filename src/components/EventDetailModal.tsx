"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Tag, Ticket, ExternalLink } from "lucide-react";
import type { CMSEvent } from "@/lib/supabase";
import { parseLocalDate } from "@/lib/dates";

interface EventDetailModalProps {
  event: CMSEvent | null;
  onClose: () => void;
}

function formatFullDate(iso: string) {
  return parseLocalDate(iso).toLocaleDateString("en-GH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  useEffect(() => {
    if (!event) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [event, onClose]);

  const inquiryHref = event
    ? `/contact?event=${encodeURIComponent(event.title)}&date=${encodeURIComponent(
        event.event_date
      )}${event.image_url ? `&image=${encodeURIComponent(event.image_url)}` : ""}`
    : "/contact";

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key="event-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
        >
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22 }}
            className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Poster — full image, no cropping */}
            <div className="relative bg-black flex items-center justify-center md:h-full h-[50vh] overflow-y-auto">
              {event.image_url ? (
                <Image
                  src={event.image_url}
                  alt={event.title}
                  width={1200}
                  height={1800}
                  className="w-full h-auto object-contain"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center min-h-[50vh]">
                  <span className="text-primary/30 text-6xl">🌿</span>
                </div>
              )}
            </div>

            {/* Info column */}
            <div className="p-6 md:p-8 overflow-y-auto md:max-h-[92vh]">
              <h2
                id="event-modal-title"
                className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight"
              >
                {event.title}
              </h2>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 text-text-secondary">
                  <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" strokeWidth={2} />
                  <div>
                    <div className="text-dark font-medium">
                      {formatFullDate(event.event_date)}
                    </div>
                    {event.end_date && event.end_date !== event.event_date && (
                      <div className="text-xs mt-0.5">
                        Until {formatFullDate(event.end_date)}
                      </div>
                    )}
                  </div>
                </div>

                {event.price && (
                  <div className="flex items-center gap-2.5 text-text-secondary">
                    <Tag className="w-4 h-4 flex-shrink-0 text-accent" strokeWidth={2} />
                    <span className="text-dark font-medium">{event.price}</span>
                  </div>
                )}

                {!event.price && (
                  <div className="flex items-center gap-2.5 text-text-secondary">
                    <Ticket className="w-4 h-4 flex-shrink-0 text-accent" strokeWidth={2} />
                    <span>Free entry</span>
                  </div>
                )}
              </div>

              {event.description && (
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {event.ticket_url ? (
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 flex-1 bg-accent text-white px-5 py-3 rounded-full text-sm font-semibold hover:bg-accent-dark transition"
                  >
                    Get Tickets
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : null}
                <Link
                  href={inquiryHref}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition ${
                    event.ticket_url
                      ? "flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-white"
                      : "flex-1 bg-accent text-white hover:bg-accent-dark"
                  }`}
                  onClick={onClose}
                >
                  Enquire about this event
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
