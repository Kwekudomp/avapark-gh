# Ava Park Website — Design Document

**Date:** 2026-03-01
**Status:** Approved

## Overview

A multi-page marketing website for **Ava Park** (Okwenya, Ghana) — an outdoor recreation and events venue on Akuse Road, about an hour east of Accra. The site targets diaspora visitors planning trips to Ghana, promoting camping, hiking, pool parties, BBQ nights, and more.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Language:** TypeScript
- **Deployment:** Vercel (or similar)

## Visual Identity

### Mood

Fresh tropical meets modern adventure — lush, energetic, inviting. The site should make diaspora visitors feel "I need to experience this when I visit Ghana."

### Colour Palette

| Token              | Value                        | Usage                      |
| ------------------- | ---------------------------- | -------------------------- |
| `--color-primary`   | `#1B4332` (deep forest green) | Nav, headings, dark sections |
| `--color-secondary` | `#D4A843` (warm gold/amber)  | Accents, badges, highlights |
| `--color-accent`    | `#E8722A` (vibrant orange)   | CTAs, energy elements       |
| `--color-bg`        | `#FEFAF4` (warm cream)       | Page backgrounds            |
| `--color-dark`      | `#1A1A1A` (rich charcoal)    | Dark sections, footer       |
| `--color-text`      | `#2D2D2D`                    | Primary body text           |
| `--color-text-sec`  | `#6B7280`                    | Secondary/muted text        |

### Typography

- **Display:** `Playfair Display` — serif, classy headings (weights: 400, 600, 700)
- **Body:** `DM Sans` — clean, modern sans-serif (weights: 400, 500, 600)

### Design Tokens

- Border radius: 16–20px on cards
- Scroll-reveal animations on all sections (Framer Motion `whileInView`)
- Full-bleed hero images with gradient overlays
- Floating WhatsApp button (sticky, bottom-right)

## Site Structure

```
/                        → Home
/experiences             → All experiences grid
/experiences/[slug]      → Individual experience detail
/gallery                 → Photo gallery
/about                   → About, location, directions
/contact                 → Inquiry form + map + contact info
```

## Page Designs

### Home Page (`/`)

1. **Hero** — Full-screen image carousel (pool at night, campground, sunset gardens). Headline: "Your Escape Into Nature". Subtext targeting diaspora: "Just an hour from Accra — camping, hiking, pool parties & more." Two CTAs: "Explore Experiences" (ghost button) + "Book via WhatsApp" (accent button).

2. **Experience Highlights** — 6-card grid of top experiences (Camping, Hiking Tours, Party In The Woods, Saturday BBQ, Picnic Packages, Game Night). Each card: photo, title, short description, schedule badge.

3. **Photo Mosaic / Venue Showcase** — Dynamic grid of venue photos with hover zoom effects.

4. **"Why Ava Park"** — 4 value cards: Nature Escape, 30+ Activities, Made for Groups, Camping Under Stars.

5. **Diaspora CTA Section** — "Planning a trip to Ghana? Make Ava Park part of your itinerary." With inline inquiry form or link to /contact.

6. **Weekly Schedule Strip** — Visual timeline: Thursday (Game Night), Friday (Party In The Woods), Saturday (BBQ, Hikes), Weekends (Tours).

7. **Footer** — Contact info, social links (IG, WhatsApp), location, quick links.

### Experiences Page (`/experiences`)

- Hero banner with title
- Filterable grid of all experiences
- Each card links to `/experiences/[slug]`

### Experience Detail (`/experiences/[slug]`)

- Hero image with title overlay
- Description & package includes (bullet list)
- Schedule, timing, pricing info
- Photo gallery for that experience
- WhatsApp booking CTA + "Inquire" button linking to /contact
- "Other Experiences" cross-links at bottom

### Gallery Page (`/gallery`)

- Masonry or grid layout of all venue photos
- Lightbox on click (zoom, prev/next, keyboard nav)
- Category filter tabs (Venue, Camping, Pool, Events, Gardens)

### About Page (`/about`)

- Hero with "About Ava Park" heading
- Brand story text
- Amenities overview (farm, gardens, pool, games)
- Location section with directions from Accra
- "How to Get Here" (self-drive + bus options)

### Contact Page (`/contact`)

- Inquiry form: Name, Email, Phone, Experience Interest (dropdown), Preferred Dates, Message
- Contact info sidebar: phone, WhatsApp, email, Instagram, website
- Location details with GPS/directions
- Operating hours

## Data Architecture

All experience data stored in a single TypeScript file (`src/data/experiences.ts`), similar to Prince Orison's `collections.ts`:

```typescript
interface Experience {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  schedule: string;        // e.g. "Every Friday"
  time: string;            // e.g. "7:00 PM – 5:00 AM"
  packageIncludes: string[];
  activities: string[];
  coverImage: string;
  images: string[];
  category: "recurring" | "tour" | "special";
  whatsappMessage: string;
}
```

## Key Features

- **Sticky WhatsApp FAB** — Floating green WhatsApp button on every page
- **Inquiry Form** — Submissions sent to info@avapark-gh.com (via API route or Formspree)
- **Image Optimisation** — All images through `next/image` with proper sizing/lazy loading
- **Mobile-First** — Fully responsive, hamburger nav on mobile
- **SEO** — Metadata, Open Graph, LocalBusiness structured data
- **Scroll Animations** — Framer Motion `whileInView` reveals on all sections

## Contact Details (from flyers)

- **Phone:** +233 (0) 540 879 700
- **Picnic line:** +233 (0) 547 352 490
- **Email:** info@avapark-gh.com
- **Instagram:** @avapark_gh
- **Website:** www.avapark-gh.com
- **Location:** Ava Park, Akuse Road (about an hour east of Accra)

## Image Assets

29 images available in `c:/Users/kweku/Desktop/Avapark/`:
- 20 promotional flyers (source material for content)
- 9 venue photos (to be used directly on site)
- Venue photos: campground (day/night), pool (blue LED), gardens, event setup, social area
