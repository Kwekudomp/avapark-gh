"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Clock, Calendar } from "lucide-react";
import type { CMSExperience } from "@/lib/supabase";

const CATEGORY_LABELS: Record<CMSExperience["category"], string> = {
  recurring: "Weekly Event",
  tour: "Tour",
  special: "Special Event",
};

const AUTO_ROTATE_MS = 6000;
const VISIBLE_CARDS = 3;

interface ExperienceCarouselProps {
  experiences: CMSExperience[];
}

export default function ExperienceCarousel({ experiences }: ExperienceCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const total = experiences.length;

  if (!total) return null;

  const active = experiences[activeIndex];

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(0);
  }, []);

  const goPrev = useCallback(() => {
    goTo((activeIndex - 1 + total) % total);
  }, [activeIndex, total, goTo]);

  const goNext = useCallback(() => {
    goTo((activeIndex + 1) % total);
  }, [activeIndex, total, goTo]);

  // Which 3 card indices are visible: active + next 2
  const visibleIndices = useMemo(() => {
    return Array.from({ length: VISIBLE_CARDS }, (_, k) => (activeIndex + k) % total);
  }, [activeIndex, total]);

  // Auto-rotation timer — activeIndex intentionally excluded; functional updaters
  // handle the current value, and the effect resets via setProgress(0) inside the callback.
  useEffect(() => {
    if (isPaused || total <= 1) return;

    const tick = 50;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (tick / AUTO_ROTATE_MS) * 100;
        if (next >= 100) {
          setActiveIndex((i) => (i + 1) % total);
          return 0;
        }
        return next;
      });
    }, tick);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, total]);

  const formatPrice = (price: number | null) => {
    if (!price) return "Free";
    return `GH\u20B5${price}`;
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  }, [goPrev, goNext]);

  return (
    <div
      className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-dark"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured experiences"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
    >
      {/* Background image with Ken Burns */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.slug}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{ animation: `ken-burns ${AUTO_ROTATE_MS}ms ease-out forwards` }}
          >
            <Image
              src={active.cover_image_url || active.images[0] || "/images/hero-bg.jpeg"}
              alt={active.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/15 z-10" />

      {/* Content overlay — bottom-left on desktop, center-bottom on mobile */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${active.slug}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute bottom-24 md:bottom-20 left-0 right-0 px-[5%] z-20 md:right-[40%]"
        >
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-accent/90 text-white mb-3">
              {CATEGORY_LABELS[active.category]}
            </span>

            <h1 className="font-display text-3xl md:text-6xl lg:text-7xl font-bold text-white mb-2 md:mb-3">
              {active.name}
            </h1>

            <p className="text-white/80 text-base md:text-xl max-w-xl mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">
              {active.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/70 text-sm mb-4 md:mb-6">
              {active.schedule && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {active.schedule}
                </span>
              )}
              {active.time && (
                <span className="flex items-center gap-1.5 hidden md:flex">
                  <Clock className="w-4 h-4" />
                  {active.time}
                </span>
              )}
              <span className="font-semibold text-secondary-light text-base">
                {formatPrice(active.price)}
              </span>
            </div>

            <Link
              href={`/experiences/${active.slug}`}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full font-medium text-sm md:text-base transition-colors duration-200"
            >
              Explore
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mobile navigation — bottom center, arrows + counter only */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex md:hidden items-center justify-center gap-5">
        <button
          onClick={goPrev}
          className="w-10 h-10 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-white flex items-center justify-center"
          aria-label="Previous"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-16 h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white/60 text-sm font-medium">
            <span className="text-white font-semibold">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            {" / "}
            {String(total).padStart(2, "0")}
          </span>
        </div>

        <button
          onClick={goNext}
          className="w-10 h-10 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-white flex items-center justify-center"
          aria-label="Next"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop navigation — bottom-right, cards + arrows */}
      <div className="absolute bottom-10 right-[5%] z-20 hidden md:flex flex-col gap-4">
        {/* Thumbnail cards — only 3 visible */}
        <div className="flex gap-3">
          {experiences.map((exp, i) => {
            const isVisible = visibleIndices.includes(i);
            if (!isVisible) return null;

            return (
              <button
                key={exp.slug}
                onClick={() => goTo(i)}
                className={`relative w-[150px] h-[190px] rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                  i === activeIndex
                    ? "border-secondary shadow-[0_0_20px_rgba(212,168,67,0.3)] opacity-100"
                    : "border-transparent opacity-65 hover:opacity-95 hover:border-white/30"
                }`}
                aria-label={`Go to ${exp.name}`}
              >
                <Image
                  src={exp.cover_image_url || exp.images[0] || "/images/hero-bg.jpeg"}
                  alt={exp.name}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-secondary-light mb-1">
                    {CATEGORY_LABELS[exp.category]}
                  </div>
                  <div className="font-display text-sm font-semibold text-white leading-tight mb-0.5">
                    {exp.name}
                  </div>
                  <div className="text-[11px] text-white/60">
                    {exp.schedule}
                  </div>
                </div>
                {/* Progress bar on active card */}
                {i === activeIndex && (
                  <div
                    className="absolute bottom-0 left-0 h-[3px] bg-secondary z-10"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Arrow controls + progress line */}
        <div className="flex items-center gap-4">
          <button
            onClick={goPrev}
            className="w-11 h-11 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/15 hover:border-white/60 transition-all"
            aria-label="Previous"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>

          <div className="w-[120px] h-0.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-white/60 text-sm font-medium min-w-[40px] text-center">
            <span className="text-white font-semibold">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            {" / "}
            {String(total).padStart(2, "0")}
          </span>

          <button
            onClick={goNext}
            className="w-11 h-11 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/15 hover:border-white/60 transition-all"
            aria-label="Next"
          >
            <ArrowRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
