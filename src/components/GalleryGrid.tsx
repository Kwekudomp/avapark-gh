"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import Lightbox from "@/components/Lightbox";
import { GalleryItem } from "@/lib/cms";

const categories = ["all", "venue", "camping", "pool", "gardens", "events"] as const;

const categoryLabels: Record<string, string> = {
  all: "All",
  venue: "Venue",
  camping: "Camping",
  pool: "Pool",
  gardens: "Gardens",
  events: "Events",
};

export default function GalleryGrid({ initialItems }: { initialItems: GalleryItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? initialItems
        : initialItems.filter((img) => img.category === activeCategory),
    [activeCategory, initialItems],
  );

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-3 justify-center mb-12 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-primary text-white"
                : "bg-bg-alt text-text-secondary hover:text-primary"
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-[1400px] mx-auto">
        {filtered.map((img, i) => (
          <ScrollReveal key={img.id} delay={Math.min(i * 0.08, 0.4)}>
            <div
              className="rounded-xl overflow-hidden cursor-pointer aspect-[4/3] relative group"
              onClick={() => setLightboxIndex(i)}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={filtered.map(({ url, alt }) => ({ src: url, alt }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
