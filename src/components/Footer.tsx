import Link from "next/link";
import { WHATSAPP_URL, PHONE_TEL, PHONE_DISPLAY, EMAIL, INSTAGRAM_URL } from "@/data/constants";

const experiences = [
  { name: "Camping", slug: "camping" },
  { name: "Party In The Woods", slug: "party-in-the-woods" },
  { name: "Saturday BBQ", slug: "saturday-bbq" },
  { name: "Hiking Tours", slug: "krobo-mountain-hike" },
  { name: "Picnic Packages", slug: "picnic-packages" },
  { name: "Game Night", slug: "game-night" },
];

const stayLinks = [
  { name: "Tent Rentals", href: "/accommodation" },
  { name: "Partner Lodges", href: "/accommodation" },
  { name: "Camping Experience", href: "/experiences/camping" },
  { name: "List Your Property", href: "/contact" },
];

const quickLinks = [
  { name: "Attractions", href: "/attractions" },
  { name: "Activities", href: "/activities" },
  { name: "Eastern-Volta Tours", href: "/tours" },
  { name: "Events", href: "/events" },
  { name: "Festivals", href: "/festivals" },
  { name: "Gallery", href: "/gallery" },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      {/* Gold accent line */}
      <div className="h-px bg-secondary" />

      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1 — Brand */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hp-logo.svg"
              alt="Hidden Paradise Nature Park"
              className="h-16 w-auto object-contain"
            />
            <p className="mt-3 text-sm italic text-white/60">
              Your Escape Into Nature
            </p>
            <p className="mt-2 text-sm text-white/50">Akuse Road, Okwenya</p>
          </div>

          {/* Column 2 — Experiences */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-[3px]">
              EXPERIENCES
            </h3>
            <ul className="space-y-2">
              {experiences.map((exp) => (
                <li key={exp.slug}>
                  <Link
                    href={`/experiences/${exp.slug}`}
                    className="text-sm text-white/60 transition hover:text-secondary"
                  >
                    {exp.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Stay */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-[3px]">
              WHERE TO STAY
            </h3>
            <ul className="space-y-2">
              {stayLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition hover:text-secondary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Quick Links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-[3px]">
              EXPLORE
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition hover:text-secondary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-[3px]">
              GET IN TOUCH
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="text-sm text-white/60 transition hover:text-secondary"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-sm text-white/60 transition hover:text-secondary"
                >
                  {EMAIL}
                </a>
              </li>
              <li>
                <p className="text-sm text-white/60">
                  Hidden Paradise, Akuse Road
                  <br />
                  (About an hour east of Accra)
                </p>
              </li>
            </ul>

            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-xs font-semibold text-white/60 transition-all hover:border-secondary hover:bg-secondary hover:text-white"
              >
                IG
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-xs font-semibold text-white/60 transition-all hover:border-secondary hover:bg-secondary hover:text-white"
              >
                WA
              </a>
            </div>
          </div>
        </div>

        {/* Copyright row */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="text-center text-xs tracking-[2px] text-white/40">
            &copy; {new Date().getFullYear()} HIDDEN PARADISE NATURE PARK. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
