# Experience Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the experiences page with a full-screen background carousel showcasing 6 featured experiences with Ken Burns zoom, crossfade transitions, and thumbnail navigation.

**Architecture:** Single new client component (`ExperienceCarousel`) receives featured experiences as props from a server-rendered page. Framer Motion `AnimatePresence` handles crossfade transitions; CSS `@keyframes` handles Ken Burns zoom. Auto-rotation via `useEffect` interval with pause-on-hover.

**Tech Stack:** Next.js 16, React 19, Framer Motion 12, Tailwind CSS 4, Next.js Image, Lucide React

**Spec:** `docs/superpowers/specs/2026-04-16-experience-carousel-design.md`

---

### Task 1: Add Ken Burns keyframes to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the Ken Burns keyframe animation**

Add at the end of `src/app/globals.css`:

```css
/* Ken Burns slow zoom for carousel backgrounds */
@keyframes ken-burns {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}
```

- [ ] **Step 2: Verify the dev server compiles without errors**

Run: `npm run dev`
Expected: No CSS compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add Ken Burns keyframe animation for experience carousel"
```

---

### Task 2: Build the ExperienceCarousel component

**Files:**
- Create: `src/components/ExperienceCarousel.tsx`

This is the core component. It manages slide state, auto-rotation, Ken Burns animation, crossfade transitions, and the thumbnail strip.

- [ ] **Step 1: Create the ExperienceCarousel component**

Create `src/components/ExperienceCarousel.tsx` with the following content:

```tsx
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

  const active = experiences[activeIndex];
  const total = experiences.length;

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

  // Auto-rotation timer
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
  }, [isPaused, total, activeIndex]);

  const formatPrice = (price: number | null) => {
    if (!price) return "Free";
    return `GH\u20B5${price}`;
  };

  return (
    <div
      className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-dark"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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

      {/* Content overlay — bottom-left */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${active.slug}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute bottom-20 left-0 right-0 px-[5%] z-20 md:right-[40%]"
        >
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-accent/90 text-white mb-4">
              {CATEGORY_LABELS[active.category]}
            </span>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-3">
              {active.name}
            </h1>

            <p className="text-white/80 text-lg md:text-xl max-w-xl mb-4">
              {active.tagline}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm mb-6">
              {active.schedule && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {active.schedule}
                </span>
              )}
              {active.time && (
                <span className="flex items-center gap-1.5">
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
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-full font-medium transition-colors duration-200"
            >
              Explore
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation area — bottom-right */}
      <div className="absolute bottom-10 right-[5%] z-20 flex flex-col gap-4">
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
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/components/ExperienceCarousel.tsx` or check the dev server for type errors.
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add src/components/ExperienceCarousel.tsx
git commit -m "feat: add ExperienceCarousel full-screen component"
```

---

### Task 3: Replace the experiences page

**Files:**
- Modify: `src/app/experiences/page.tsx`

- [ ] **Step 1: Replace the page content**

Replace the entire content of `src/app/experiences/page.tsx` with:

```tsx
import { Metadata } from "next";
import ExperienceCarousel from "@/components/ExperienceCarousel";
import { getFeaturedCMSExperiences } from "@/lib/cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Experiences",
  description:
    "Explore all experiences at Hidden Paradise including camping, hiking tours, pool parties, BBQ nights, picnics, game nights, and special events. Book your adventure today.",
};

export default async function ExperiencesPage() {
  const featured = await getFeaturedCMSExperiences();

  return <ExperienceCarousel experiences={featured} />;
}
```

- [ ] **Step 2: Run the dev server and navigate to `/experiences`**

Run: `npm run dev`
Open: `http://localhost:3000/experiences`

Expected:
- Full-screen background image fills the viewport (minus navbar)
- Experience name, tagline, schedule, time, price are overlaid on the image
- Category badge visible (e.g. "Weekly Event")
- "Explore" button visible with arrow icon
- 6 thumbnail cards at the bottom
- Active thumbnail has gold ring and progress bar
- After 6 seconds, slide auto-advances with crossfade
- Background image slowly zooms (Ken Burns)
- Hovering pauses auto-rotation
- Clicking a thumbnail switches the slide immediately

- [ ] **Step 3: Commit**

```bash
git add src/app/experiences/page.tsx
git commit -m "feat: replace experiences page with full-screen carousel"
```

---

### Task 4: Visual polish and responsive testing

**Files:**
- Possibly modify: `src/components/ExperienceCarousel.tsx`

- [ ] **Step 1: Test mobile viewport (375px width)**

In browser dev tools, check the carousel at 375px width:
- Thumbnails should be smaller but visible
- Text should be readable and not overflow
- CTA button should be reachable (not hidden under thumbnails)
- No horizontal overflow / scrollbar

- [ ] **Step 2: Test tablet viewport (768px width)**

Check at 768px:
- Layout transitions between mobile and desktop sizing
- Thumbnails and text scale appropriately

- [ ] **Step 3: Test image fallback**

If any featured experience has `cover_image_url: null` and empty `images[]`, the component should gracefully fall back to `/images/hero-bg.jpeg`. Verify no broken images.

- [ ] **Step 4: Fix any issues found**

Apply fixes to `src/components/ExperienceCarousel.tsx` if needed. Common issues to watch for:
- Content overlapping thumbnails on short viewports — adjust `bottom-32` positioning
- Text too large on mobile — verify the responsive text classes (`text-4xl md:text-6xl lg:text-7xl`)
- Thumbnails overflowing on small screens — may need horizontal scroll or fewer visible thumbs

- [ ] **Step 5: Commit fixes (if any)**

```bash
git add src/components/ExperienceCarousel.tsx
git commit -m "fix: responsive adjustments for experience carousel"
```

---

### Task 5: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Run the production build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Run lint**

Run: `npm run lint`
Expected: No lint errors (or only pre-existing ones)
