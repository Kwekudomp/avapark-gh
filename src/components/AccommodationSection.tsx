"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionHeader from "./SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";

const PARTNERS = [
  {
    name: "Akuse River Lodge",
    type: "Riverside Cabins",
    distance: "12 min drive",
    priceFrom: "GHS 450",
    guests: "2–4 guests",
    highlights: ["River views", "Air conditioning", "Breakfast included"],
    badge: "Popular",
    badgeColor: "bg-secondary text-dark",
    img: null,
  },
  {
    name: "Volta Forest Retreat",
    type: "Eco Chalets",
    distance: "18 min drive",
    priceFrom: "GHS 380",
    guests: "2–6 guests",
    highlights: ["Forest setting", "Private bathroom", "Free Wi-Fi"],
    badge: "Eco-Friendly",
    badgeColor: "bg-primary text-white",
    img: null,
  },
  {
    name: "Okwenya Guesthouse",
    type: "Budget Rooms",
    distance: "5 min drive",
    priceFrom: "GHS 180",
    guests: "1–2 guests",
    highlights: ["Walking distance", "Fan-cooled", "Local meals"],
    badge: "Best Value",
    badgeColor: "bg-accent text-white",
    img: null,
  },
  {
    name: "Eastern Hills Camp",
    type: "Glamping Tents",
    distance: "8 min drive",
    priceFrom: "GHS 320",
    guests: "2 guests",
    highlights: ["Luxury tents", "Stargazing deck", "Firepit"],
    badge: "New",
    badgeColor: "bg-dark text-white",
    img: null,
  },
];

function getWhatsAppStayLink(partnerName: string) {
  const msg = `Hi%2C+I%27d+like+to+enquire+about+accommodation+near+Hidden+Paradise+%E2%80%94+specifically+${encodeURIComponent(partnerName)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

export default function AccommodationSection() {
  return (
    <section id="stay" className="py-24 px-[5%] bg-bg-alt">
      <SectionHeader
        tag="WHERE TO STAY"
        title="Rest Close, Wake Ready"
        description="Extend your Hidden Paradise experience. We've partnered with trusted lodges nearby so you can arrive fresh and leave recharged."
      />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PARTNERS.map((partner, i) => (
          <motion.div
            key={partner.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            {/* Image placeholder */}
            <div className="relative h-44 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-4xl">🏕️</span>
              <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${partner.badgeColor}`}>
                {partner.badge}
              </span>
            </div>

            {/* Card body */}
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

              <ul className="mt-3 space-y-1">
                {partner.highlights.map((h) => (
                  <li key={h} className="text-xs text-text-secondary flex items-center gap-1.5">
                    <span className="text-secondary font-bold">✓</span> {h}
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-xs text-text-secondary">From</span>
                  <p className="font-semibold text-dark text-sm">{partner.priceFrom}<span className="text-text-secondary font-normal"> / night</span></p>
                </div>
                <a
                  href={getWhatsAppStayLink(partner.name)}
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

      {/* Partner note */}
      <p className="text-center text-sm text-text-secondary mt-10 max-w-xl mx-auto">
        Accommodation is managed by our trusted local partners.{" "}
        <Link href="/contact" className="text-accent hover:underline">
          Contact us
        </Link>{" "}
        if you'd like to list your property.
      </p>
    </section>
  );
}
