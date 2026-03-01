"use client";

import Image from "next/image";
import ScrollReveal from "./ScrollReveal";
import SectionHeader from "./SectionHeader";

interface PhotoTile {
  src: string;
  alt: string;
  /** CSS grid-area value: row-start / col-start / row-end / col-end */
  gridArea: string;
  mobileOrder: number;
  delay: number;
}

const photos: PhotoTile[] = [
  {
    src: "/images/venue/campground-day.jpeg",
    alt: "Colourful tents on green lawn during the day",
    gridArea: "1 / 1 / 2 / 2",
    mobileOrder: 1,
    delay: 0,
  },
  {
    src: "/images/venue/pool-night.jpeg",
    alt: "Swimming pool with blue LED lights at night",
    gridArea: "1 / 2 / 2 / 3",
    mobileOrder: 2,
    delay: 0.1,
  },
  {
    src: "/images/venue/event-setup.jpeg",
    alt: "Outdoor event with white canopy tents and tables",
    gridArea: "1 / 3 / 2 / 5",
    mobileOrder: 3,
    delay: 0.15,
  },
  {
    src: "/images/venue/gardens.jpeg",
    alt: "Landscaped garden with rock features and hedges",
    gridArea: "2 / 1 / 3 / 3",
    mobileOrder: 4,
    delay: 0.2,
  },
  {
    src: "/images/venue/pool-party.jpeg",
    alt: "People socializing at poolside area",
    gridArea: "2 / 3 / 3 / 4",
    mobileOrder: 5,
    delay: 0.25,
  },
  {
    src: "/images/venue/campground-moonrise.jpeg",
    alt: "Night camping with moonrise",
    gridArea: "2 / 4 / 3 / 5",
    mobileOrder: 6,
    delay: 0.3,
  },
  {
    src: "/images/venue/campground-night.jpeg",
    alt: "Tents at night with movie screen in background",
    gridArea: "3 / 2 / 4 / 4",
    mobileOrder: 7,
    delay: 0.35,
  },
];

export default function PhotoMosaic() {
  return (
    <section className="tropical-gradient py-24 px-[5%]">
      <SectionHeader
        tag="OUR GROUNDS"
        title="Experience the Beauty"
        description="From sunrise campouts to moonlit pool parties — explore our lush grounds on the banks of the Volta."
      />

      {/* Desktop mosaic grid (md and up) */}
      <div
        className="hidden md:grid gap-4 max-w-7xl mx-auto"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "320px 320px 280px",
        }}
      >
        {photos.map((photo) => (
          <div key={photo.src} style={{ gridArea: photo.gridArea }}>
            <ScrollReveal delay={photo.delay} className="h-full">
              <div className="group relative h-full rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-500">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1280px) 50vw, 25vw"
                />
              </div>
            </ScrollReveal>
          </div>
        ))}
      </div>

      {/* Mobile 2-column grid (below md) */}
      <div className="grid grid-cols-2 gap-3 md:hidden max-w-lg mx-auto">
        {photos.map((photo) => (
          <ScrollReveal
            key={photo.src}
            delay={photo.delay}
          >
            <div
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-500"
              style={{ order: photo.mobileOrder }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="50vw"
              />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
