# Experience Carousel — Full-Screen Background Carousel for Experiences Page

**Date:** 2026-04-16
**Status:** Approved

## Summary

Replace the current experiences page (`/experiences`) with a full-screen background carousel showcasing the 6 featured experiences. Each slide fills the viewport with an immersive background image, overlaid content (name, tagline, schedule, price, CTA), and a thumbnail navigation strip at the bottom. Inspired by the Goreme Valley travel site pattern — background changes with carousel, synced content and thumbnail cards.

## Decisions

- **Scope:** Full page replacement — `/experiences` becomes the carousel (no scrolling grid)
- **Experiences shown:** 6 featured experiences only (`is_featured: true`)
- **Navigation:** 3 visible thumbnail info cards (bottom-right) + prev/next arrows + progress line below cards + auto-rotation (6s interval)
- **Transitions:** Zoom crossfade — Ken Burns slow zoom while active, Framer Motion crossfade between slides
- **Content per slide:** Category badge, name, tagline, schedule + time, price, CTA button
- **CTA action:** Links to `/experiences/[slug]` detail page
- **Approach:** Pure CSS + Framer Motion (no carousel library)

## Layout

```
┌─────────────────────────────────────────────┐
│  [Navbar - existing, stays on top]          │
├─────────────────────────────────────────────┤
│                                             │
│   FULL-SCREEN BACKGROUND IMAGE              │
│   (with Ken Burns slow zoom 1.0 → 1.1)     │
│                                             │
│   ┌──────────────────────┐                  │
│   │  Category badge      │   ┌──────┐ ┌──────┐ ┌──────┐
│   │  Experience Name     │   │ img  │ │ img  │ │ img  │
│   │  Tagline             │   │ cat  │ │ cat  │ │ cat  │
│   │  Schedule · Time     │   │ name │ │ name │ │ name │
│   │  Price               │   │ sched│ │ sched│ │ sched│
│   │  [Explore →] button  │   └──────┘ └──────┘ └──────┘
│   └──────────────────────┘   (←) ———————— 02/06 (→)
│                                             │
└─────────────────────────────────────────────┘
```

- Page takes `100vh` minus navbar height
- Background image: `object-cover`, fills viewport
- Dark gradient overlay: bottom-heavy for text readability
- Content block: bottom-left
- **Thumbnail cards: bottom-right, only 3 visible at a time** (active + next 2, wrapping)
- Each card is tall (~150x190px) and shows: image, category, name, schedule
- Below cards: left arrow, progress line, slide counter (01/06), right arrow
- Hidden cards rotate in as slides advance

## Animations & Transitions

### Ken Burns (while slide is active)
- Background image scales from `1.0` to `1.1` over 6 seconds
- CSS `@keyframes` animation, runs continuously on current slide

### Slide transition (crossfade)
- Outgoing image + text fades out (opacity 1 → 0, ~600ms)
- Incoming image + text fades in (opacity 0 → 1, ~600ms)
- Framer Motion `AnimatePresence` with `mode="wait"`
- Incoming image starts at scale `1.0` (Ken Burns begins fresh)

### Thumbnail cards (bottom-right, 3 visible)
- Only 3 cards visible: active + next 2 (wrapping around the array)
- Each card shows: cover image, category label, name, schedule
- Active card: gold border (`#D4A843`) + glow shadow, full opacity
- Other visible cards: dimmed (0.65 opacity), subtle border on hover
- Hidden cards use `display: none`, swap in on slide change
- Clicking a visible card switches to that slide and resets timer

### Navigation controls (below cards)
- Left/right circular arrow buttons
- Progress line between arrows (fills over 6 seconds)
- Slide counter: "01 / 06"
- Progress bar also on the active thumbnail card (bottom edge)

### Auto-rotation
- 6-second interval per slide
- Pauses on hover (desktop), resumes on mouse leave
- Resets when user manually clicks a thumbnail

### Mobile
- Thumbnails shrink but stay visible
- Content text scales down, remains readable
- No swipe gestures — thumbnails and auto-rotate handle navigation

## Component Architecture

### New: `ExperienceCarousel.tsx`
- Client component (`"use client"`)
- Props: `experiences: CMSExperience[]` (featured experiences)
- State: `activeIndex` (number), auto-rotate timer (via `useEffect`/`useInterval`)
- Renders:
  - Background image layer (Next.js `Image` with `fill`, `priority`)
  - Dark gradient overlay
  - Content block (category badge, name, tagline, schedule, time, price, CTA)
  - Thumbnail strip (map over experiences, highlight active)
- All animation logic contained within this component

### Modified: `/experiences/page.tsx`
- Remove current hero + `ExperienceGrid` layout
- Fetch featured experiences server-side via `getFeaturedCMSExperiences()`
- Render `<ExperienceCarousel experiences={featured} />`
- Full-viewport, no-scroll layout

### Unchanged
- Navbar, detail pages (`/experiences/[slug]`), booking flow
- `ExperienceCard`, `ExperienceGrid` (remain available for use elsewhere)
- Data layer, CMS service, Supabase schema

## Data Mapping

| Slide element | Data source |
|---|---|
| Background image | `cover_image_url` (fallback: first in `images[]`) |
| Category badge | `category` → "Weekly Event" / "Tour" / "Special Event" |
| Experience name | `name` |
| Tagline | `tagline` |
| Schedule + Time | `schedule · time` |
| Price | `price` → "GH₵X" or "Free" if null/0 |
| CTA button | Links to `/experiences/[slug]` |
| Thumbnail image | `cover_image_url` |
| Thumbnail label | `name` (truncated if needed) |

### The 6 featured experiences
1. Game Night
2. Camping (2 Nights)
3. Party In The Woods
4. Saturday BBQ
5. Krobo Mountain Hiking
6. Night Market

All have cover images — no data gaps.

## Tech Stack (existing, no new deps)
- Next.js 16 + React 19
- Tailwind CSS 4
- Framer Motion 12 (AnimatePresence, motion.div)
- Next.js Image component
- Lucide React for icons
