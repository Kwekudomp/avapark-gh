"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";

/* ── Types ──────────────────────────────────────────────── */

interface Partner {
  id: string;
  name: string;
  type: string;
  distance: string;
  price_from: string;
  guests: string;
  highlights: string[];
  badge: string | null;
  image_url: string | null;
  whatsapp_override: string | null;
  enquiry_url: string | null;
}

/* ── Tent data ──────────────────────────────────────────── */

const TENT_OPTIONS = [
  {
    id: "tent-standard",
    name: "Standard Tent",
    type: "On-site Tent Rental",
    guests: "2 guests",
    icon: "⛺",
    includes: [
      "2-person tent setup on manicured lawn",
      "Sleeping mats and lantern",
      "Access to washrooms and showers",
      "Bonfire area access",
    ],
    ideal: "Couples and solo travellers looking for a cosy night under the stars.",
  },
  {
    id: "tent-family",
    name: "Family Tent",
    type: "On-site Tent Rental",
    guests: "4-6 guests",
    icon: "🏕️",
    includes: [
      "Spacious family-size tent",
      "Sleeping mats and lanterns",
      "Access to washrooms and showers",
      "Bonfire area access",
      "Extra ground space for kids",
    ],
    ideal: "Families and friend groups who want room to spread out.",
  },
  {
    id: "tent-byo",
    name: "Bring Your Own Tent",
    type: "On-site Camping Spot",
    guests: "Any size",
    icon: "🎒",
    includes: [
      "Reserved lawn spot",
      "Access to washrooms and showers",
      "Bonfire area access",
      "Power outlet access",
    ],
    ideal: "Experienced campers who prefer their own gear.",
  },
];

const CAMP_CHECKLIST = [
  "Toiletries",
  "Swimsuit",
  "Bedsheet / Duvet",
  "Extension Board",
  "Towels",
  "Pillows",
  "Sportswear (Hiking & Games)",
  "Party Outfits",
  "Sneakers for Games",
  "Bug Spray / Mosquito Repellent",
];

/* ── Helpers ────────────────────────────────────────────── */

function getEnquiryLink(partner: Partner) {
  if (partner.enquiry_url) return partner.enquiry_url;
  const number = partner.whatsapp_override ?? WHATSAPP_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(`Hi, I'd like to enquire about accommodation at ${partner.name}`)}`;
}

const BADGE_COLORS: Record<string, string> = {
  Popular: "bg-secondary text-dark",
  "Eco-Friendly": "bg-primary text-white",
  "Best Value": "bg-accent text-white",
  New: "bg-dark text-white",
};

function badgeClass(badge: string | null) {
  if (!badge) return "";
  return BADGE_COLORS[badge] ?? "bg-dark text-white";
}

type Tab = "tents" | "lodges";

/* ── Component ──────────────────────────────────────────── */

export default function AccommodationPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [tab, setTab] = useState<Tab>("tents");
  const [selectedTent, setSelectedTent] = useState<string | null>(null);
  const [selectedLodge, setSelectedLodge] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms/accommodation")
      .then((res) => res.json())
      .then((data) => {
        if (data.partners) setPartners(data.partners);
      })
      .catch(() => {});
  }, []);

  const tentEnquiryUrl = (tentName: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Hi, I'd like to book the ${tentName} at Hidden Paradise. Can you share availability and pricing?`
    )}`;

  const activeTent = TENT_OPTIONS.find((t) => t.id === selectedTent);
  const activeLodge = partners.find((p) => p.id === selectedLodge);

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="WHERE TO STAY"
        title="Rest Close, Wake Ready"
        description="Sleep right inside Hidden Paradise with our tent rentals, or choose from trusted partner lodges nearby. Either way, you wake up ready for adventure."
      />

      {/* Tab switcher */}
      <div className="max-w-[1400px] mx-auto flex justify-center mb-10">
        <div className="inline-flex bg-bg-alt rounded-full p-1 border border-border">
          <button
            onClick={() => {
              setTab("tents");
              setSelectedTent(null);
              setSelectedLodge(null);
            }}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === "tents"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-dark"
            }`}
          >
            Tent Rentals
          </button>
          <button
            onClick={() => {
              setTab("lodges");
              setSelectedTent(null);
              setSelectedLodge(null);
            }}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === "lodges"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-dark"
            }`}
          >
            Partner Lodges
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── TENTS TAB ──────────────────────────────────────── */}
        {tab === "tents" && !selectedTent && (
          <motion.div
            key="tents-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {TENT_OPTIONS.map((tent, i) => (
              <motion.button
                key={tent.id}
                type="button"
                onClick={() => setSelectedTent(tent.id)}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col text-left cursor-pointer"
              >
                <div className="relative h-44 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-6xl">{tent.icon}</span>
                  <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-white">
                    On-site
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs font-semibold tracking-[2px] text-text-secondary uppercase mb-1">
                    {tent.type}
                  </p>
                  <h3 className="font-display text-lg font-bold text-dark">
                    {tent.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    👥 {tent.guests}
                  </p>
                  <p className="mt-auto pt-4 text-accent text-sm font-semibold">
                    View Details &rarr;
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── TENT DETAIL VIEW ───────────────────────────────── */}
        {tab === "tents" && selectedTent && activeTent && (
          <motion.div
            key={`tent-${selectedTent}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="max-w-[800px] mx-auto"
          >
            {/* Back button */}
            <button
              onClick={() => setSelectedTent(null)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition mb-6"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to all tents
            </button>

            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
                <span className="text-6xl block mb-3">{activeTent.icon}</span>
                <h2 className="font-display text-2xl font-bold text-primary">
                  {activeTent.name}
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  {activeTent.type} · {activeTent.guests}
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                {/* What's included */}
                <div>
                  <h3 className="font-display text-lg font-bold text-dark mb-3">
                    What&apos;s Included
                  </h3>
                  <ul className="space-y-2">
                    {activeTent.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-secondary font-bold mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ideal for */}
                <div className="bg-bg-alt rounded-xl p-4">
                  <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
                    Ideal For
                  </p>
                  <p className="text-sm text-text-secondary">{activeTent.ideal}</p>
                </div>

                {/* Camping checklist */}
                <div>
                  <h3 className="font-display text-lg font-bold text-dark mb-1">
                    Camping Checklist
                  </h3>
                  <p className="text-xs text-text-secondary mb-3">
                    Remember to pack the following for your stay:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CAMP_CHECKLIST.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-dark bg-bg-alt rounded-lg px-3 py-2">
                        <span className="text-primary">☐</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Book CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={tentEnquiryUrl(activeTent.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3.5 rounded-full text-sm font-bold hover:bg-accent-dark transition"
                  >
                    Book {activeTent.name} on WhatsApp
                  </a>
                  <Link
                    href="/experiences/camping"
                    className="flex-1 inline-flex items-center justify-center px-6 py-3.5 rounded-full text-sm font-bold border border-primary text-primary hover:bg-primary hover:text-white transition"
                  >
                    View Camping Experience
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── LODGES TAB ─────────────────────────────────────── */}
        {tab === "lodges" && !selectedLodge && (
          <motion.div
            key="lodges-grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            {partners.length > 0 ? (
              <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {partners.map((partner, i) => (
                  <motion.button
                    key={partner.id}
                    type="button"
                    onClick={() => setSelectedLodge(partner.id)}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col text-left cursor-pointer"
                  >
                    <div className="relative h-44 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                      {partner.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={partner.image_url} alt={partner.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">🏡</span>
                      )}
                      {partner.badge && (
                        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass(partner.badge)}`}>
                          {partner.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-xs font-semibold tracking-[2px] text-text-secondary uppercase mb-1">
                        {partner.type}
                      </p>
                      <h3 className="font-display text-lg font-bold text-dark leading-tight">
                        {partner.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                        <span>📍 {partner.distance}</span>
                        <span>👥 {partner.guests}</span>
                      </div>
                      <p className="mt-auto pt-4 text-accent text-sm font-semibold">
                        View Details &rarr;
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center bg-bg-alt rounded-2xl border border-border p-10">
                <p className="text-4xl mb-3">🏡</p>
                <p className="text-text-secondary text-sm">
                  Partner lodge listings are being updated. Contact us for accommodation enquiries.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── LODGE DETAIL VIEW ──────────────────────────────── */}
        {tab === "lodges" && selectedLodge && activeLodge && (
          <motion.div
            key={`lodge-${selectedLodge}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="max-w-[800px] mx-auto"
          >
            {/* Back button */}
            <button
              onClick={() => setSelectedLodge(null)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition mb-6"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to all lodges
            </button>

            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {/* Header image */}
              <div className="relative h-56 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                {activeLodge.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeLodge.image_url} alt={activeLodge.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">🏡</span>
                )}
                {activeLodge.badge && (
                  <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full ${badgeClass(activeLodge.badge)}`}>
                    {activeLodge.badge}
                  </span>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <p className="text-xs font-semibold tracking-[2px] text-text-secondary uppercase mb-1">
                    {activeLodge.type}
                  </p>
                  <h2 className="font-display text-2xl font-bold text-primary">
                    {activeLodge.name}
                  </h2>
                </div>

                {/* Quick info */}
                <div className="flex flex-wrap gap-4">
                  <div className="bg-bg-alt rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <div>
                      <p className="text-xs text-text-secondary">Distance</p>
                      <p className="text-sm font-semibold text-dark">{activeLodge.distance}</p>
                    </div>
                  </div>
                  <div className="bg-bg-alt rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    <div>
                      <p className="text-xs text-text-secondary">Capacity</p>
                      <p className="text-sm font-semibold text-dark">{activeLodge.guests}</p>
                    </div>
                  </div>
                  <div className="bg-bg-alt rounded-xl px-4 py-3 flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <div>
                      <p className="text-xs text-text-secondary">Starting from</p>
                      <p className="text-sm font-semibold text-dark">{activeLodge.price_from} / night</p>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                {activeLodge.highlights.length > 0 && (
                  <div>
                    <h3 className="font-display text-lg font-bold text-dark mb-3">
                      Highlights
                    </h3>
                    <ul className="space-y-2">
                      {activeLodge.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="text-secondary font-bold mt-0.5">✓</span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA */}
                <a
                  href={getEnquiryLink(activeLodge)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-3.5 rounded-full text-sm font-bold hover:bg-accent-dark transition"
                >
                  Enquire About {activeLodge.name}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-sm text-text-secondary mt-10 max-w-xl mx-auto">
        Want to list your property as a partner lodge?{" "}
        <Link href="/contact" className="text-accent hover:underline">
          Get in touch
        </Link>.
      </p>
    </main>
  );
}
