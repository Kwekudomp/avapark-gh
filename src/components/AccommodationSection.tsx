"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SectionHeader from "./SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";
import type { AccommodationPartner } from "@/lib/supabase";

function getEnquiryLink(partner: AccommodationPartner) {
  if (partner.enquiry_url) return partner.enquiry_url;
  const number = partner.whatsapp_override ?? WHATSAPP_NUMBER;
  const msg = `Hi%2C+I%27d+like+to+enquire+about+accommodation+near+Hidden+Paradise+%E2%80%94+${encodeURIComponent(partner.name)}`;
  return `https://wa.me/${number}?text=${msg}`;
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

export default function AccommodationSection({ partners }: { partners: AccommodationPartner[] }) {
  if (partners.length === 0) return null;

  return (
    <section id="stay" className="py-24 px-[5%] bg-bg-alt">
      <SectionHeader
        tag="WHERE TO STAY"
        title="Rest Close, Wake Ready"
        description="Extend your Hidden Paradise experience. We've partnered with trusted lodges nearby so you can arrive fresh and leave recharged."
      />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {partners.map((partner, i) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            {/* Image */}
            <div className="relative h-44 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
              {partner.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={partner.image_url} alt={partner.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">🏕️</span>
              )}
              {partner.badge && (
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass(partner.badge)}`}>
                  {partner.badge}
                </span>
              )}
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
        Accommodation is managed by our trusted local partners.{" "}
        <Link href="/contact" className="text-accent hover:underline">
          Contact us
        </Link>{" "}
        if you'd like to list your property.
      </p>
    </section>
  );
}
