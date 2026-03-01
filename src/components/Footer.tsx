import Link from "next/link";

const experiences = [
  { name: "Camping", slug: "camping" },
  { name: "Party In The Woods", slug: "party-in-the-woods" },
  { name: "Saturday BBQ", slug: "saturday-bbq" },
  { name: "Hiking Tours", slug: "hiking-tours" },
  { name: "Picnic Packages", slug: "picnic-packages" },
  { name: "Game Night", slug: "game-night" },
];

const quickLinks = [
  { name: "All Experiences", href: "/experiences" },
  { name: "Gallery", href: "/gallery" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      {/* Gold accent line */}
      <div className="h-px bg-secondary" />

      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand */}
          <div>
            <p className="text-lg font-semibold tracking-[3px]">AVA PARK</p>
            <p className="mt-2 text-sm italic text-white/60">
              Your Escape Into Nature
            </p>
            <p className="mt-3 text-sm text-white/50">Akuse Road, Okwenya</p>
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

          {/* Column 3 — Quick Links */}
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
                  href="tel:+233540879700"
                  className="text-sm text-white/60 transition hover:text-secondary"
                >
                  +233 (0) 540 879 700
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@avapark-gh.com"
                  className="text-sm text-white/60 transition hover:text-secondary"
                >
                  info@avapark-gh.com
                </a>
              </li>
              <li>
                <p className="text-sm text-white/60">
                  Ava Park, Akuse Road
                  <br />
                  (About an hour east of Accra)
                </p>
              </li>
            </ul>

            {/* Social icons */}
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/avapark_gh"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-xs font-semibold text-white/60 transition-all hover:border-secondary hover:bg-secondary hover:text-white"
              >
                IG
              </a>
              <a
                href="https://wa.me/233540879700"
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
            &copy; 2026 AVA PARK. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
