"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";

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

const TENT_OPTIONS = [
  {
    id: "tent-standard",
    name: "Standard Tent",
    type: "On-site Tent Rental",
    distance: "On-site",
    price_from: "Contact us",
    guests: "2 guests",
    highlights: ["Sleeping mats included", "Lantern provided", "Manicured lawn"],
    badge: null,
    image_url: null,
    icon: "⛺",
  },
  {
    id: "tent-family",
    name: "Family Tent",
    type: "On-site Tent Rental",
    distance: "On-site",
    price_from: "Contact us",
    guests: "4-6 guests",
    highlights: ["Extra spacious", "Perfect for groups", "Under the stars"],
    badge: null,
    image_url: null,
    icon: "🏕️",
  },
  {
    id: "tent-byo",
    name: "Bring Your Own Tent",
    type: "On-site Camping Spot",
    distance: "On-site",
    price_from: "Contact us",
    guests: "Any size",
    highlights: ["Lawn access", "Facility use", "Bring your own gear"],
    badge: null,
    image_url: null,
    icon: "🎒",
  },
];

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

export default function AccommodationPage() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetch("/api/cms/accommodation")
      .then((res) => res.json())
      .then((data) => {
        if (data.partners) setPartners(data.partners);
      })
      .catch(() => {});
  }, []);

  const tentEnquiryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to enquire about tent rental / camping accommodation at Hidden Paradise."
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="WHERE TO STAY"
        title="Rest Close, Wake Ready"
        description="Sleep right inside Hidden Paradise with our tent rentals, or choose from trusted partner lodges nearby. Either way, you wake up ready for adventure."
      />

      {/* Unified grid: tents + partner lodges */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Tent cards */}
        {TENT_OPTIONS.map((tent, i) => (
          <motion.div
            key={tent.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="relative h-44 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
              <span className="text-5xl">{tent.icon}</span>
              <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary text-white">
                On-site
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <p className="text-xs font-semibold tracking-[2px] text-text-secondary uppercase mb-1">
                {tent.type}
              </p>
              <h3 className="font-display text-lg font-bold text-dark leading-tight">
                {tent.name}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                <span>📍 {tent.distance}</span>
                <span>👥 {tent.guests}</span>
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
                  <p className="font-semibold text-dark text-sm">{tent.price_from}</p>
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

        {/* Partner lodge cards */}
        {partners.map((partner, i) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (TENT_OPTIONS.length + i) * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
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

      <p className="text-center text-sm text-text-secondary mt-10 max-w-xl mx-auto">
        Want to list your property as a partner lodge?{" "}
        <Link href="/contact" className="text-accent hover:underline">
          Get in touch
        </Link>.
      </p>
    </main>
  );
}
