"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const SLIDES = [
  {
    src: "/images/venue/pool-night.jpeg",
    alt: "Stunning blue-lit pool at night at Hidden Paradise",
  },
  {
    src: "/images/venue/campground-day.jpeg",
    alt: "Colourful camping tents on green lawn at Hidden Paradise",
  },
  {
    src: "/images/venue/gardens.jpeg",
    alt: "Beautifully landscaped gardens with hedges at Hidden Paradise",
  },
  {
    src: "/images/venue/event-setup.jpeg",
    alt: "Outdoor event setup with canopy tents at Hidden Paradise",
  },
] as const;


const CYCLE_INTERVAL = 5000;

const ACTIVITIES = [
  { label: "Camping", slug: "camping", wa: "camping+overnight+stay" },
  { label: "Pool Party", slug: "pool-party", wa: "pool+party" },
  { label: "Hiking", slug: "krobo-mountain-hike", wa: "hiking+tour" },
  { label: "BBQ & Bonfire", slug: "saturday-bbq", wa: "BBQ+and+bonfire" },
  { label: "Picnic Package", slug: "picnic-packages", wa: "picnic+package" },
  { label: "Private Event", slug: "party-in-the-woods", wa: "private+event+enquiry" },
  { label: "Game Night", slug: "game-night", wa: "game+night" },
  { label: "Eastern/Volta Tours", slug: "eastern-tour", wa: "tours+enquiry" },
  { label: "Boat Cruise", slug: "boat-cruise", wa: "boat+cruise+enquiry" },
  { label: "ATV & Bike Rides", slug: "atv-dirt-ride", wa: "ATV+and+bike+ride" },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState("");
  const router = useRouter();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const handleSelect = (slug: string) => {
    if (!slug) return;
    setSelectedActivity(slug);
    setTimeout(() => {
      router.push(`/experiences/${slug}`);
    }, 300);
  };


  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background images */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: currentSlide === index ? 1 : 0 }}
          aria-hidden={currentSlide !== index}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
            quality={85}
          />
        </div>
      ))}

      {/* Dark gradient overlay */}
      <div className="hero-gradient absolute inset-0 z-10" />

      {/* Content */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {/* Tag */}
          <p className="text-xl md:text-3xl tracking-[4px] uppercase text-secondary-light font-semibold">
            Where Nature
            <svg
              viewBox="0 0 500 878"
              fill="currentColor"
              className="inline-block align-middle w-14 h-24 md:w-20 md:h-36 mx-[0.25em]"
              aria-hidden="true"
            >
              <path d="M 260 2 C 187 2 83 37 127 214 C 148 297 198 362 239 421 L 24 409 C 30 435 30 461 24 487 L 239 475 L 224 874 C 253 865 277 868 299 874 L 286 475 L 480 487 C 474 461 473 435 480 409 L 286 421 C 322 357 373 300 391 206 C 427 16 330 2 263 2 C 262 2 261 2 260 2 z M 258 51 C 335 50 414 161 264 385 C 106 163 181 51 258 51 z" />
            </svg>
            Heals
          </p>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mt-4 leading-tight">
            Your{" "}
            <span style={{ WebkitTextStroke: "2px white", color: "transparent" }}>
              Escape
            </span>{" "}
            Into
            <br />
            <span className="italic">Hidden</span>{" "}
            <span className="italic text-secondary-light">Paradise</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mt-6 max-w-2xl mx-auto">
            Just an hour from Accra. Camping, hiking, pool parties, bonfires
            &amp; unforgettable experiences.
          </p>

          {/* Activity Finder */}
          <div className="mt-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 max-w-md mx-auto">
            <select
              value={selectedActivity}
              onChange={(e) => handleSelect(e.target.value)}
              className="w-full bg-transparent text-white text-sm font-medium outline-none cursor-pointer"
            >
              <option value="" className="text-dark">Choose an activity...</option>
              {ACTIVITIES.map((a) => (
                <option key={a.slug} value={a.slug} className="text-dark">{a.label}</option>
              ))}
            </select>
          </div>

          {/* Secondary CTA */}
          <div className="flex gap-4 mt-5 justify-center">
            <Link
              href="/experiences"
              className="border border-white/40 text-white/80 px-6 py-2.5 rounded-full text-sm font-medium tracking-wide hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              All Experiences
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "bg-secondary w-8"
                : "bg-white/40 w-2"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
