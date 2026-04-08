"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SectionHeader from "./SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";
import type { AccommodationPartner } from "@/lib/supabase";
import { Tent, TreePine, Backpack, Building, MapPin, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

function getEnquiryLink(partner: AccommodationPartner) {
  if (partner.enquiry_url) return partner.enquiry_url;
  const number = partner.whatsapp_override ?? WHATSAPP_NUMBER;
  return `https://wa.me/${number}?text=${encodeURIComponent(`Hi, I'd like to enquire about accommodation at ${partner.name}`)}`;
}

const BADGE_COLORS: Record<string, string> = {
  Popular: "bg-secondary text-dark",
  "Eco-Friendly": "bg-primary text-white",
  "Best Value": "bg-accent text-white",
  New: "bg-dark text-white",
  Serene: "bg-dark text-white",
  Modern: "bg-dark text-white",
};

function badgeClass(badge: string | null) {
  if (!badge) return "";
  return BADGE_COLORS[badge] ?? "bg-dark text-white";
}

const TENT_OPTIONS: { id: string; name: string; type: string; guests: string; highlights: string[]; Icon: LucideIcon }[] = [
  {
    id: "tent-standard",
    name: "Standard Tent",
    type: "On-site Tent Rental",
    guests: "2 guests",
    highlights: ["Sleeping mats included", "Lantern provided", "Manicured lawn"],
    Icon: Tent,
  },
  {
    id: "tent-family",
    name: "Family Tent",
    type: "On-site Tent Rental",
    guests: "4-6 guests",
    highlights: ["Extra spacious", "Perfect for groups", "Under the stars"],
    Icon: TreePine,
  },
  {
    id: "tent-byo",
    name: "Bring Your Own Tent",
    type: "On-site Camping Spot",
    guests: "Any size",
    highlights: ["Lawn access", "Facility use", "Bring your own gear"],
    Icon: Backpack,
  },
];

type Tab = "tents" | "lodges";

export default function AccommodationSection({ partners }: { partners: AccommodationPartner[] }) {
  const [tab, setTab] = useState<Tab>("tents");

  const tentEnquiryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to enquire about tent rental / camping accommodation at Hidden Paradise."
  )}`;

  return (
    <section id="stay" className="py-24 px-[5%] bg-bg-alt">
      <SectionHeader
        tag="WHERE TO STAY"
        title="Rest Close, Wake Ready"
        description="Sleep right inside Hidden Paradise with our tent rentals, or choose from trusted partner lodges nearby."
      />

      {/* Tab switcher */}
      <div className="max-w-[1400px] mx-auto flex justify-center mb-10">
        <div className="inline-flex bg-white rounded-full p-1 border border-border">
          <button
            onClick={() => setTab("tents")}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              tab === "tents"
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-dark"
            }`}
          >
            Tent Rentals
          </button>
          <button
            onClick={() => setTab("lodges")}
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
        {/* Tent Rentals */}
        {tab === "tents" && (
          <motion.div
            key="tents"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {TENT_OPTIONS.map((tent, i) => (
              <motion.div
                key={tent.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="relative h-44 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center">
                    <tent.Icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </div>
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
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> On-site</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {tent.guests}</span>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {tent.highlights.map((h) => (
                      <li key={h} className="text-xs text-text-secondary flex items-center gap-1.5">
                        <span className="text-secondary font-bold">✓</span> {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-xs text-text-secondary">Price</span>
                      <p className="font-semibold text-dark text-sm">Contact us</p>
                    </div>
                    <a
                      href={tentEnquiryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-accent text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-accent-dark transition-colors"
                    >
                      Enquire
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Partner Lodges */}
        {tab === "lodges" && (
          <motion.div
            key="lodges"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {partners.length > 0 ? (
              <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {partners.map((partner, i) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div className="relative h-44 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                      {partner.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={partner.image_url} alt={partner.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white/60 flex items-center justify-center">
                          <Building className="w-7 h-7 text-primary" strokeWidth={1.5} />
                        </div>
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
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {partner.distance}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {partner.guests}</span>
                      </div>
                      {partner.highlights.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {partner.highlights.map((h) => (
                            <li key={h} className="text-xs text-text-secondary flex items-center gap-1.5">
                              <span className="text-secondary font-bold">✓</span> {h}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-xs text-text-secondary">From</span>
                          <p className="font-semibold text-dark text-sm">
                            {partner.price_from}<span className="text-text-secondary font-normal"> / night</span>
                          </p>
                        </div>
                        <a
                          href={getEnquiryLink(partner)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-accent text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-accent-dark transition-colors"
                        >
                          Enquire
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="max-w-md mx-auto text-center bg-white rounded-2xl border border-border p-10">
                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <p className="text-text-secondary text-sm">
                  Partner lodge listings are being updated. Contact us for accommodation enquiries.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Link
        href="/accommodation"
        className="text-accent font-bold hover:text-accent-dark transition text-center block mt-10 text-sm"
      >
        View All Accommodation Options &rarr;
      </Link>
    </section>
  );
}
