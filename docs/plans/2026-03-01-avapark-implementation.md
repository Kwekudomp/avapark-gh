# Ava Park Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multi-page marketing website for Ava Park (Ghana) targeting diaspora visitors, with experience pages, photo gallery, and dual WhatsApp + inquiry form booking.

**Architecture:** Next.js 16 App Router with static data in TypeScript files. All experiences defined in `src/data/experiences.ts`. Pages use server components by default, client components only for interactivity (carousel, lightbox, form, nav). Images served via `next/image` from `/public/images/`.

**Tech Stack:** Next.js 16, Tailwind CSS 4, Framer Motion, TypeScript, DM Sans + Playfair Display (Google Fonts)

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `postcss.config.mjs`
- Create: `next.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx` (placeholder)
- Create: `.gitignore`

**Step 1: Initialize Next.js project**

Run from `c:/Users/kweku/Desktop/avapark-gh`:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --yes
```
If the directory already has files, use `--force` or remove docs folder temporarily.

**Step 2: Install additional dependencies**

```bash
npm install framer-motion
```

**Step 3: Set up path alias**

Ensure `tsconfig.json` has:
```json
"paths": { "@/*": ["./src/*"] }
```

**Step 4: Copy image assets**

```bash
mkdir -p public/images/venue public/images/experiences public/images/hero
cp c:/Users/kweku/Desktop/Avapark/ava22.jpeg public/images/venue/campground-day.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava23.jpeg public/images/venue/pool-night.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava24.jpeg public/images/venue/campground-night.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava25.jpeg public/images/venue/pool-party.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava26.jpeg public/images/venue/campground-moonrise.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava27.jpeg public/images/venue/gardens.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava5417.jpeg public/images/venue/event-setup.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava1.jpeg public/images/experiences/camping-checklist.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava2.jpeg public/images/experiences/yogaga-hike.jpeg
cp c:/Users/kweku/Desktop/Avapark/av3.jpeg public/images/experiences/shai-hills.jpeg
cp c:/Users/kweku/Desktop/Avapark/Av4.jpeg public/images/experiences/game-night.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava5.jpeg public/images/experiences/saturday-bbq.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava6.jpeg public/images/experiences/eastern-tour.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava7.jpeg public/images/experiences/games-activities.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava9.jpeg public/images/experiences/krobo-hike.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava10.jpeg public/images/experiences/sunset-gardens.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava11.jpeg public/images/experiences/movie-night.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava12.jpeg public/images/experiences/farm.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava13.jpeg public/images/experiences/party-woods-1.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava14.jpeg public/images/experiences/picnic-packages.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava15.jpeg public/images/experiences/camping-2nights.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava16.jpeg public/images/experiences/art-show.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava17.jpeg public/images/experiences/family-fun-day.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava18.jpeg public/images/experiences/garden-fair.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava19.jpeg public/images/experiences/night-market.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava20.jpeg public/images/experiences/party-woods-2.jpeg
cp c:/Users/kweku/Desktop/Avapark/ava21.jpeg public/images/experiences/camping-2nights-v2.jpeg
```

**Step 5: Verify dev server starts**

```bash
npm run dev
```
Expected: Server running on localhost:3000

**Step 6: Commit**

```bash
git init && git add -A && git commit -m "chore: scaffold Next.js project with assets"
```

---

## Task 2: Global Styles, Fonts & Layout Shell

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Step 1: Write globals.css with Ava Park design tokens**

```css
@import "tailwindcss";

@theme inline {
  /* Colours */
  --color-primary: #1B4332;
  --color-primary-light: #2D6A4F;
  --color-secondary: #D4A843;
  --color-secondary-light: #E8C56D;
  --color-accent: #E8722A;
  --color-accent-dark: #C45A1A;
  --color-bg: #FEFAF4;
  --color-bg-alt: #F5F0E8;
  --color-dark: #1A1A1A;
  --color-text: #2D2D2D;
  --color-text-secondary: #6B7280;
  --color-border: #E5E1D8;
  --color-whatsapp: #25D366;

  /* Fonts */
  --font-display: var(--font-playfair), serif;
  --font-body: var(--font-dm-sans), sans-serif;
}

html { scroll-behavior: smooth; }

::selection {
  background-color: var(--color-secondary);
  color: white;
}

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}
```

**Step 2: Write layout.tsx with fonts, nav slot, footer slot, structured data**

Root layout loads `Playfair_Display` and `DM_Sans` from `next/font/google`. Includes `<Nav />` and `<Footer />` component slots (create as empty placeholders initially). Adds LocalBusiness JSON-LD for Ava Park.

**Step 3: Verify styles render**

Run dev server, confirm warm cream background and correct fonts load.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add global styles, fonts, and root layout"
```

---

## Task 3: Navigation Component

**Files:**
- Create: `src/components/Nav.tsx`

**Step 1: Build responsive navigation**

Client component with:
- Logo text "AVA PARK" (left)
- Desktop links: Experiences, Gallery, About, Contact (center/right)
- "Book Now" WhatsApp CTA button (accent orange, rounded-full)
- Mobile: hamburger → full-screen drawer
- Scroll behaviour: transparent → solid `bg-bg/95 backdrop-blur` after 50px
- Active link highlighting based on `usePathname()`

**Step 2: Test on mobile and desktop**

Verify hamburger works, links route correctly, scroll effect triggers.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add responsive navigation with mobile drawer"
```

---

## Task 4: Shared UI Components

**Files:**
- Create: `src/components/ScrollReveal.tsx`
- Create: `src/components/WhatsAppFAB.tsx`
- Create: `src/components/SectionHeader.tsx`
- Create: `src/components/ExperienceCard.tsx`

**Step 1: ScrollReveal** — Framer Motion wrapper with `whileInView` fade-up animation. Props: `children`, `delay`, `className`.

**Step 2: WhatsAppFAB** — Fixed bottom-right floating WhatsApp button. Green circle with WhatsApp icon (SVG). Links to `https://wa.me/233540879700`. Pulses gently to attract attention.

**Step 3: SectionHeader** — Reusable section title component. Props: `tag` (small uppercase label), `title` (large display heading), `description` (subtitle text). Centered layout.

**Step 4: ExperienceCard** — Card component for experience grid. Props: `experience` (from data). Shows cover image, title, tagline, schedule badge. Links to `/experiences/[slug]`. Hover: image zoom + slight lift.

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add shared UI components (ScrollReveal, WhatsAppFAB, SectionHeader, ExperienceCard)"
```

---

## Task 5: Experience Data File

**Files:**
- Create: `src/data/experiences.ts`

**Step 1: Define TypeScript interfaces and all experience data**

```typescript
export interface Experience {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  schedule: string;
  time: string;
  packageIncludes: string[];
  activities: string[];
  coverImage: string;
  images: string[];
  category: "recurring" | "tour" | "special";
  whatsappMessage: string;
}
```

Populate with all experiences extracted from the 20 flyer images:
1. `camping` — The Camping Experience (2 nights)
2. `party-in-the-woods` — Party In The Woods (every Friday)
3. `saturday-bbq` — Saturday BBQ (every Saturday)
4. `game-night` — Game Night (every Thursday)
5. `movie-night` — Friday Movie Night
6. `picnic-packages` — Picnic Packages (Standard & Family)
7. `krobo-mountain-hike` — Krobo Mountain Hiking Tour (Saturdays)
8. `yogaga-mountain-hike` — Mountain Yogaga Hike (Saturdays)
9. `shai-hills-tour` — Shai Hills Reserve Experience (weekends)
10. `eastern-tour` — Eastern Tour (weekends)
11. `sunset-gardens` — Sunset Gardens
12. `farm` — Ava Park Farm
13. `art-show` — Art Show
14. `family-fun-day` — Family Fun Day
15. `garden-fair` — Garden Fair
16. `night-market` — Night Market

Add helper: `getExperienceBySlug(slug: string)`.

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add experience data with all 16 experiences"
```

---

## Task 6: Footer Component

**Files:**
- Create: `src/components/Footer.tsx`

**Step 1: Build footer**

Dark section (`bg-dark`) with:
- Gold accent line top border
- 3-column grid: Brand (logo + tagline), Quick Links, Contact Info
- Contact: phone, email, Instagram, WhatsApp
- Location: Ava Park, Akuse Road (about an hour east of Accra)
- Social icons: IG, WhatsApp (circular bordered buttons)
- Copyright row at bottom

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add footer component"
```

---

## Task 7: Home Page — Hero Section

**Files:**
- Create: `src/components/HeroCarousel.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Build HeroCarousel**

Client component with auto-cycling full-screen images (pool-night, campground-day, gardens, event-setup). Gradient overlay (bottom-heavy, dark). Content:
- Small tag: "ESCAPE INTO NATURE"
- Headline: "Your Adventure Awaits at Ava Park"
- Subtext: "Just an hour from Accra — camping, hiking, pool parties, bonfires & more."
- Two CTAs: "Explore Experiences" (ghost/outline button) + "Book via WhatsApp" (orange accent)
- Slide indicators at bottom

**Step 2: Wire into page.tsx**

Import and render HeroCarousel as first section.

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add hero carousel to home page"
```

---

## Task 8: Home Page — Experience Highlights Section

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Add experience highlights grid**

Section with SectionHeader ("OUR EXPERIENCES" / "Discover What Awaits"). 6-card grid using ExperienceCard, showing the top 6 recurring experiences. "View All Experiences →" link below.

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add experience highlights section to home page"
```

---

## Task 9: Home Page — Venue Showcase (Photo Mosaic)

**Files:**
- Create: `src/components/PhotoMosaic.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Build PhotoMosaic**

Grid of venue photos in varied aspect ratios (similar to Prince Orison's FloatingMosaic but with a tropical vibe). Uses the 7 venue photos. Hover: slight scale + shadow. ScrollReveal on each tile.

**Step 2: Wire into page.tsx**

Add below experience highlights with SectionHeader: "OUR CRAFT" / "Experience the Grounds".

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add photo mosaic venue showcase"
```

---

## Task 10: Home Page — Why Ava Park + Weekly Schedule + Diaspora CTA

**Files:**
- Create: `src/components/ValueCards.tsx`
- Create: `src/components/WeeklySchedule.tsx`
- Create: `src/components/DiasporaCTA.tsx`
- Modify: `src/app/page.tsx`

**Step 1: ValueCards** — 4 glass-style cards: Nature Escape (tree icon), 30+ Activities (games icon), Perfect for Groups (people icon), Camp Under Stars (tent icon). Each with title + short description.

**Step 2: WeeklySchedule** — Horizontal strip/timeline showing: Thu → Game Night 8pm, Fri → Party In The Woods 7pm + Movie Night 7pm, Sat → BBQ 7:30pm + Hiking 9am, Weekends → Tours 6am. Colour-coded badges.

**Step 3: DiasporaCTA** — Dark section with targeted messaging: "Planning a Trip to Ghana?" / "Make Ava Park part of your itinerary. Whether you're visiting family or exploring the motherland, we'll create an unforgettable experience." Two CTAs: "Send an Inquiry" + "WhatsApp Us".

**Step 4: Wire all into page.tsx**

**Step 5: Commit**

```bash
git add -A && git commit -m "feat: add value cards, weekly schedule, and diaspora CTA to home page"
```

---

## Task 11: Experiences Listing Page

**Files:**
- Create: `src/app/experiences/page.tsx`

**Step 1: Build experiences page**

- Hero banner: "Our Experiences" heading + subtitle
- Grid of all 16 experiences using ExperienceCard
- Optional category filter tabs (Recurring, Tours, Special Events)
- SEO metadata

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add experiences listing page"
```

---

## Task 12: Experience Detail Page

**Files:**
- Create: `src/app/experiences/[slug]/page.tsx`

**Step 1: Build dynamic experience detail page**

- `generateStaticParams()` for all slugs
- `generateMetadata()` for SEO
- Breadcrumb: Home / Experiences / [Name]
- Hero image with title overlay
- Description + "What's Included" list
- Schedule & timing info
- Activities list
- Image gallery (if multiple images)
- WhatsApp CTA + "Send Inquiry" button
- "Other Experiences" section at bottom (3 related cards)

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add experience detail pages with dynamic routing"
```

---

## Task 13: Gallery Page

**Files:**
- Create: `src/app/gallery/page.tsx`
- Create: `src/components/GalleryGrid.tsx`
- Create: `src/components/Lightbox.tsx`

**Step 1: Build Lightbox** — Full-screen overlay with image, prev/next arrows, close button, keyboard nav (Escape, Arrow keys), zoom controls. Reuse pattern from Prince Orison's ProductLightbox.

**Step 2: Build GalleryGrid** — Masonry-style grid of all venue + experience photos. Click opens Lightbox. Optional filter tabs: All, Venue, Camping, Pool, Events, Gardens.

**Step 3: Build gallery page** — Hero banner + GalleryGrid. SEO metadata.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add gallery page with lightbox"
```

---

## Task 14: About Page

**Files:**
- Create: `src/app/about/page.tsx`

**Step 1: Build about page**

- Hero: "About Ava Park" heading
- Brand story section (2-column: image + text)
- Amenities overview: Farm & Gardens, Swimming Pool, Camping Grounds, Ava Grill Restaurant, Games & Activities
- Location section: Address, directions from Accra, "Self Drive (Bus Options Available at a Fee)"
- "How to Get Here" with practical travel info for diaspora visitors
- CTA section at bottom

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add about page"
```

---

## Task 15: Contact Page with Inquiry Form

**Files:**
- Create: `src/app/contact/page.tsx`
- Create: `src/components/InquiryForm.tsx`
- Create: `src/app/api/inquiry/route.ts`

**Step 1: Build InquiryForm** — Client component with fields: Name, Email, Phone, Experience Interest (dropdown of all experiences + "General Inquiry"), Preferred Dates (date picker or text), Message. Client-side validation. Submit via POST to `/api/inquiry`.

**Step 2: Build API route** — Receives form data, validates, sends email to info@avapark-gh.com (via Resend API or logs for now). Returns success/error JSON.

**Step 3: Build contact page** — 2-column layout: InquiryForm (left) + Contact Info sidebar (right). Sidebar shows: phone, WhatsApp link, email, Instagram, location, operating hours.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add contact page with inquiry form"
```

---

## Task 16: SEO, Metadata & Final Polish

**Files:**
- Modify: `src/app/layout.tsx` (structured data)
- Create: `public/favicon.svg` (or use existing logo)
- Modify: all page files (verify metadata)

**Step 1: Add LocalBusiness JSON-LD to layout**

```json
{
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "name": "Ava Park",
  "description": "Outdoor recreation and events venue...",
  "address": { "addressLocality": "Okwenya", "addressRegion": "Eastern Region", "addressCountry": "GH" },
  "telephone": "+233540879700",
  "email": "info@avapark-gh.com",
  "url": "https://www.avapark-gh.com"
}
```

**Step 2: Verify all pages have proper `<title>` and `<meta description>`**

**Step 3: Test full site flow** — Navigate all pages, check mobile responsiveness, verify all images load, test form submission, verify WhatsApp links work.

**Step 4: Final commit**

```bash
git add -A && git commit -m "feat: add SEO metadata and structured data"
```

---

## Execution Order Summary

| Task | What | Depends On |
|------|------|------------|
| 1 | Project scaffold + assets | — |
| 2 | Global styles + layout | 1 |
| 3 | Navigation | 2 |
| 4 | Shared UI components | 2 |
| 5 | Experience data | — |
| 6 | Footer | 2 |
| 7 | Home: Hero | 3, 4 |
| 8 | Home: Experience highlights | 4, 5 |
| 9 | Home: Photo mosaic | 4 |
| 10 | Home: Values + schedule + CTA | 4 |
| 11 | Experiences listing page | 4, 5 |
| 12 | Experience detail page | 5, 4 |
| 13 | Gallery page | 4 |
| 14 | About page | 4 |
| 15 | Contact page + form | 4 |
| 16 | SEO + polish | All |

**Parallelisable:** Tasks 3, 4, 5, 6 can run in parallel after Task 2. Tasks 7–10 can be done together once 3+4+5 are complete. Tasks 11–15 are independent of each other.
