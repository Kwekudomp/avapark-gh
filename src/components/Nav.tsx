"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BookingModal from "./BookingModal";

/* ── Menu structure ───────────────────────────────────────── */

interface NavItem {
  label: string;
  href: string;
}

interface NavDropdown {
  label: string;
  items: NavItem[];
}

const NAV_LINKS: (NavItem | NavDropdown)[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Explore",
    items: [
      { label: "Attractions", href: "/attractions" },
      { label: "Activities", href: "/activities" },
      { label: "Eastern-Volta Tours", href: "/tours" },
      { label: "Events", href: "/events" },
      { label: "Festivals", href: "/festivals" },
    ],
  },
  { label: "Accommodation", href: "/accommodation" },
  { label: "Experiences", href: "/experiences" },
  { label: "Blog", href: "/blog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact Us", href: "/contact" },
];

function isDropdown(item: NavItem | NavDropdown): item is NavDropdown {
  return "items" in item;
}

const SCROLL_THRESHOLD = 50;

/* ── Component ────────────────────────────────────────────── */

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const exploreTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
    setExploreOpen(false);
    setMobileExploreOpen(false);
  }, [pathname]);

  // Close explore dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        exploreRef.current &&
        !exploreRef.current.contains(e.target as Node)
      ) {
        setExploreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  function handleExploreEnter() {
    if (exploreTimeout.current) clearTimeout(exploreTimeout.current);
    setExploreOpen(true);
  }

  function handleExploreLeave() {
    exploreTimeout.current = setTimeout(() => setExploreOpen(false), 150);
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-bg/95 backdrop-blur-lg border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between md:h-24">
            {/* Logo */}
            <Link
              href="/"
              onClick={closeMenu}
              aria-label="Hidden Paradise Nature Park - Home"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hp-logo.svg"
                alt="Hidden Paradise Nature Park"
                className="h-20 w-auto object-contain md:h-24"
              />
            </Link>

            {/* Desktop links */}
            <div className="hidden min-[1080px]:flex items-center gap-6">
              {NAV_LINKS.map((item) =>
                isDropdown(item) ? (
                  /* Explore dropdown */
                  <div
                    key={item.label}
                    ref={exploreRef}
                    className="relative"
                    onMouseEnter={handleExploreEnter}
                    onMouseLeave={handleExploreLeave}
                  >
                    <button
                      type="button"
                      onClick={() => setExploreOpen((p) => !p)}
                      className={`flex items-center gap-1 text-sm font-bold transition-colors duration-200 ${
                        exploreOpen
                          ? "text-accent"
                          : "text-dark hover:text-accent"
                      }`}
                      aria-expanded={exploreOpen}
                      aria-haspopup="true"
                    >
                      {item.label}
                      {/* Chevron arrow — always visible */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`transition-transform duration-200 ${
                          exploreOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* Dropdown panel */}
                    <div
                      className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
                        exploreOpen
                          ? "visible opacity-100 translate-y-0"
                          : "invisible opacity-0 -translate-y-1"
                      }`}
                    >
                      <div className="bg-white rounded-xl shadow-lg border border-border/60 py-2 min-w-[200px]">
                        {item.items.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setExploreOpen(false)}
                            className={`block px-5 py-2.5 text-sm transition-colors ${
                              pathname === sub.href
                                ? "text-accent bg-accent/5 font-medium"
                                : "text-dark hover:text-accent hover:bg-accent/5"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Regular link */
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={`text-sm font-bold transition-colors duration-200 ${
                      pathname === item.href
                        ? "text-accent"
                        : "text-dark hover:text-accent"
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              )}

              {/* Book Now CTA */}
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-accent-dark transition-colors duration-200"
              >
                Book Now
              </button>
            </div>

            {/* Hamburger button (mobile) */}
            <button
              type="button"
              className="min-[1080px]:hidden relative w-8 h-8 flex items-center justify-center"
              onClick={toggleMenu}
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
              aria-expanded={isOpen}
            >
              <div className="w-6 flex flex-col items-end gap-[5px]">
                <span
                  className={`block h-[2px] bg-primary transition-all duration-300 origin-center ${
                    isOpen ? "w-6 rotate-45 translate-y-[7px]" : "w-6"
                  }`}
                />
                <span
                  className={`block h-[2px] bg-primary transition-all duration-300 ${
                    isOpen ? "w-0 opacity-0" : "w-5"
                  }`}
                />
                <span
                  className={`block h-[2px] bg-primary transition-all duration-300 origin-center ${
                    isOpen ? "w-6 -rotate-45 -translate-y-[7px]" : "w-4"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className={`min-[1080px]:hidden fixed inset-0 top-20 z-40 transition-all duration-300 ${
            isOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-dark/30 backdrop-blur-sm transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            className={`absolute top-0 right-0 h-full w-full max-w-sm bg-bg shadow-xl transition-transform duration-300 ease-out ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col px-6 pt-8 pb-6 h-full overflow-y-auto">
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((item) =>
                  isDropdown(item) ? (
                    /* Mobile Explore accordion */
                    <div key={item.label}>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileExploreOpen((p) => !p)
                        }
                        className={`w-full flex items-center justify-between text-lg font-medium py-3 px-4 rounded-xl transition-colors duration-200 ${
                          mobileExploreOpen
                            ? "text-accent bg-accent/5"
                            : "text-dark hover:text-accent hover:bg-accent/5"
                        }`}
                      >
                        {item.label}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 16 16"
                          fill="none"
                          className={`transition-transform duration-200 ${
                            mobileExploreOpen ? "rotate-180" : ""
                          }`}
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-200 ${
                          mobileExploreOpen
                            ? "max-h-60 opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="pl-4 pb-1">
                          {item.items.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={closeMenu}
                              className={`block text-base py-2.5 px-4 rounded-lg transition-colors ${
                                pathname === sub.href
                                  ? "text-accent font-medium"
                                  : "text-text-secondary hover:text-accent"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      onClick={closeMenu}
                      className={`text-lg font-medium py-3 px-4 rounded-xl transition-colors duration-200 ${
                        pathname === item.href
                          ? "text-accent bg-accent/5"
                          : "text-dark hover:text-accent hover:bg-accent/5"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </div>

              {/* Book Now button (mobile) */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    setBookingOpen(true);
                  }}
                  className="block w-full text-center bg-accent text-white px-6 py-3.5 rounded-full text-base font-medium hover:bg-accent-dark transition-colors duration-200"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Booking modal */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </>
  );
}
