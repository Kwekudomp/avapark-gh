"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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

import { WHATSAPP_URL } from "@/data/constants";

const CYCLE_INTERVAL = 5000;

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [nextSlide]);

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
          <p className="text-xs tracking-[4px] uppercase text-secondary-light font-semibold">
            Where Nature Hails
          </p>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mt-4 leading-tight">
            Your Escape Into
            <br />
            Hidden Paradise
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 mt-6 max-w-2xl mx-auto">
            Just an hour from Accra — camping, hiking, pool parties, bonfires
            &amp; unforgettable experiences.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 mt-10 justify-center flex-wrap">
            <Link
              href="/experiences"
              className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-medium tracking-wide hover:bg-white/10 hover:-translate-y-0.5 transition-all backdrop-blur-sm"
            >
              Explore Experiences
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-accent text-white px-8 py-4 rounded-full font-medium tracking-wide hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Book via WhatsApp
            </a>
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
