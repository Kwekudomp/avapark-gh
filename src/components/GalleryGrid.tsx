"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import ScrollReveal from "@/components/ScrollReveal";
import Lightbox from "@/components/Lightbox";

interface GalleryImage {
  src: string;
  alt: string;
  category: string;
}

const galleryImages: GalleryImage[] = [
  // Venue photos
  { src: "/images/venue/campground-day.jpeg", alt: "Camping grounds at Hidden Paradise", category: "camping" },
  { src: "/images/venue/pool-night.jpeg", alt: "Swimming pool at night", category: "pool" },
  { src: "/images/venue/campground-night.jpeg", alt: "Night camping with movie screen", category: "camping" },
  { src: "/images/venue/pool-party.jpeg", alt: "Pool party and social area", category: "pool" },
  { src: "/images/venue/campground-moonrise.jpeg", alt: "Campground under the moonrise", category: "camping" },
  { src: "/images/venue/gardens.jpeg", alt: "Sunset Gardens landscaping", category: "gardens" },
  { src: "/images/venue/event-setup.jpeg", alt: "Outdoor event setup", category: "events" },
  // Experience photos
  { src: "/images/experiences/camping-2nights.jpeg", alt: "Two-night camping experience", category: "camping" },
  { src: "/images/experiences/party-woods-1.jpeg", alt: "Party in the Woods event", category: "events" },
  { src: "/images/experiences/saturday-bbq.jpeg", alt: "Saturday BBQ at Hidden Paradise", category: "events" },
  { src: "/images/experiences/sunset-gardens.jpeg", alt: "Sunset Gardens experience", category: "gardens" },
  { src: "/images/experiences/farm.jpeg", alt: "Hidden Paradise Farm tour", category: "gardens" },
];

const categories = ["all", "camping", "pool", "gardens", "events"] as const;

const categoryLabels: Record<string, string> = {
  all: "All",
  camping: "Camping",
  pool: "Pool",
  gardens: "Gardens",
  events: "Events",
};

export default function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory === "all"
        ? galleryImages
        : galleryImages.filter((img) => img.category === activeCategory),
    [activeCategory],
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
          <ScrollReveal key={img.src} delay={Math.min(i * 0.08, 0.4)}>
            <div
              className="rounded-xl overflow-hidden cursor-pointer aspect-[4/3] relative group"
              onClick={() => setLightboxIndex(i)}
            >
              <Image
                src={img.src}
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
          images={filtered.map(({ src, alt }) => ({ src, alt }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
