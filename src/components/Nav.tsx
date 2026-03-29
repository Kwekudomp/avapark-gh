"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WHATSAPP_URL } from "@/data/constants";

const NAV_LINKS = [
  { label: "Experiences", href: "/experiences" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;
const SCROLL_THRESHOLD = 50;

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    // Check initial position
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
  }, [pathname]);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-bg/95 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-18">
          {/* Logo */}
          <Link href="/" onClick={closeMenu} aria-label="Hidden Paradise Nature Park — Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hp-logo.svg"
              alt="Hidden Paradise Nature Park"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden min-[968px]:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-accent"
                    : "text-dark hover:text-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Book Now CTA */}
            <Link
              href="/experiences"
              className="bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition-colors duration-200"
            >
              Book Now
            </Link>
          </div>

          {/* Hamburger button (mobile) */}
          <button
            type="button"
            className="min-[968px]:hidden relative w-8 h-8 flex items-center justify-center"
            onClick={toggleMenu}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
          >
            <div className="w-6 flex flex-col items-end gap-[5px]">
              <span
                className={`block h-[2px] bg-primary transition-all duration-300 origin-center ${
                  isOpen
                    ? "w-6 rotate-45 translate-y-[7px]"
                    : "w-6"
                }`}
              />
              <span
                className={`block h-[2px] bg-primary transition-all duration-300 ${
                  isOpen ? "w-0 opacity-0" : "w-5"
                }`}
              />
              <span
                className={`block h-[2px] bg-primary transition-all duration-300 origin-center ${
                  isOpen
                    ? "w-6 -rotate-45 -translate-y-[7px]"
                    : "w-4"
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`min-[968px]:hidden fixed inset-0 top-16 z-40 transition-all duration-300 ${
          isOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
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
          <div className="flex flex-col px-6 pt-8 pb-6 h-full">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`text-lg font-medium py-3 px-4 rounded-xl transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-accent bg-accent/5"
                      : "text-dark hover:text-accent hover:bg-accent/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Book Now button (mobile - full width) */}
            <div className="mt-8">
              <Link
                href="/experiences"
                onClick={closeMenu}
                className="block w-full text-center bg-accent text-white px-6 py-3.5 rounded-full text-base font-medium hover:bg-accent-dark transition-colors duration-200"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
