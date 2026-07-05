"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";

// Known segment → human label. Unknown segments (e.g. dynamic slugs) are
// humanized from the URL.
const LABELS: Record<string, string> = {
  about: "About",
  amenities: "Amenities",
  directions: "How to Get Here",
  map: "Park Map",
  "contact-numbers": "Contact Numbers",
  rules: "Rules & Safety",
  faq: "FAQ",
  accommodation: "Accommodation",
  activities: "Activities",
  "arts-culture": "Art & Culture",
  attractions: "Attractions",
  blog: "Blog",
  contact: "Contact",
  "event-calendar": "Event Calendar",
  events: "Events",
  experiences: "Experiences",
  festivals: "Festivals & Concerts",
  "food-drinks": "Food & Drinks",
  order: "Order Online",
  gallery: "Gallery",
  tours: "Eastern/Volta Tours",
  book: "Book",
};

function humanize(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // No breadcrumbs on the home page.
  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    label: LABELS[seg] ?? humanize(decodeURIComponent(seg)),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className="pt-28 md:pt-32 px-[5%] bg-bg"
    >
      <ol className="max-w-7xl mx-auto flex flex-wrap items-center gap-1.5 text-sm pt-4">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
          >
            <Home className="w-3.5 h-3.5" aria-hidden />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>
        {crumbs.map((c) => (
          <li key={c.href} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-text-secondary/50 shrink-0" aria-hidden />
            {c.isLast ? (
              <span className="font-semibold text-primary" aria-current="page">{c.label}</span>
            ) : (
              <Link href={c.href} className="text-text-secondary hover:text-primary transition-colors">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
