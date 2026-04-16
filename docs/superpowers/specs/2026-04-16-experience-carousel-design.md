# Experience Carousel — Full-Screen Background Carousel for Experiences Page

**Date:** 2026-04-16
**Status:** Approved

## Summary

Replace the current experiences page (`/experiences`) with a full-screen background carousel showcasing the 6 featured experiences. Each slide fills the viewport with an immersive background image, overlaid content (name, tagline, schedule, price, CTA), and a thumbnail navigation strip at the bottom. Inspired by the Goreme Valley travel site pattern — background changes with carousel, synced content and thumbnail cards.

## Decisions

- **Scope:** Full page replacement — `/experiences` becomes the carousel (no scrolling grid)
- **Experiences shown:** 6 featured experiences only (`is_featured: true`)
- **Navigation:** Thumbnail cards at the bottom + auto-rotation (6s interval)
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
│   │  Category badge      │                  │
│   │  Experience Name     │                  │
│   │  Tagline             │                  │
│   │  Schedule · Time     │                  │
│   │  Price               │                  │
│   │  [Explore →] button  │                  │
│   └──────────────────────┘                  │
│                                             │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │thumb│ │thumb│ │ACTIV│ │thumb│ │thumb│  │
│  │  1  │ │  2  │ │  3  │ │  4  │ │  5  │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
└─────────────────────────────────────────────┘
```

- Page takes `100vh` minus navbar height
- Background image: `object-cover`, fills viewport
- Dark gradient overlay: bottom-heavy for text readability
- Content block: bottom-left on desktop, bottom-center on mobile
- Thumbnail strip: horizontally centered at the very bottom

## Animations & Transitions

### Ken Burns (while slide is active)
- Background image scales from `1.0` to `1.1` over 6 seconds
- CSS `@keyframes` animation, runs continuously on current slide

### Slide transition (crossfade)
- Outgoing image + text fades out (opacity 1 → 0, ~600ms)
- Incoming image + text fades in (opacity 0 → 1, ~600ms)
- Framer Motion `AnimatePresence` with `mode="wait"`
- Incoming image starts at scale `1.0` (Ken Burns begins fresh)

### Thumbnail cards
- Active: gold border (`#D4A843`), slightly larger scale
- Inactive: dimmed, subtle border
- Clicking resets auto-rotate timer
- Thin progress bar fills left-to-right on active thumbnail over 6 seconds

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
