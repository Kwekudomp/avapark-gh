"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WHATSAPP_URL, PHONE_TEL, PHONE_DISPLAY, EMAIL, INSTAGRAM_URL, TIKTOK_URL, SNAPCHAT_URL, TWITTER_URL } from "@/data/constants";

const experiences = [
  { name: "Camping", slug: "camping" },
  { name: "Party In The Woods", slug: "party-in-the-woods" },
  { name: "Saturday BBQ", slug: "saturday-bbq" },
  { name: "Hiking Tours", slug: "krobo-mountain-hike" },
  { name: "Picnic Packages", slug: "picnic-packages" },
  { name: "Game Night", slug: "game-night" },
];

const quickLinks = [
  { name: "Attractions", href: "/attractions" },
  { name: "Activities", href: "/activities" },
  { name: "Eastern/Volta Tours", href: "/tours" },
  { name: "Event Calendar", href: "/event-calendar" },
  { name: "Festivals", href: "/festivals" },
  { name: "Gallery", href: "/gallery" },
];

interface Partner {
  id: string;
  name: string;
}

export default function Footer() {
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    fetch("/api/cms/accommodation")
      .then((res) => res.json())
      .then((data) => {
        if (data.partners) setPartners(data.partners);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-dark text-white">
      {/* Gold accent line */}
      <div className="h-px bg-secondary" />

      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Column 1 */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hp-logo.png"
              alt="Hidden Paradise Nature Park"
              className="h-24 w-auto object-contain"
            />
            <p className="mt-3 text-sm italic text-white/60">
              Your Escape Into Nature
            </p>
            <p className="mt-2 text-sm text-white/50">Akuse Road, Okwenya</p>
          </div>

          {/* Column 2 */}
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

          {/* Column 3 */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-[3px]">
              WHERE TO STAY
            </h3>
            <ul className="space-y-2">
              {partners.map((p) => (
                <li key={p.id}>
                  <Link
                    href="/accommodation"
                    className="text-sm text-white/60 transition hover:text-secondary"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/accommodation"
                  className="text-sm text-white/60 transition hover:text-secondary"
                >
                  Tent Rentals
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/60 transition hover:text-secondary"
                >
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
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

          {/* Column 5 */}
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

            {/* Follow us */}
            <div className="mt-6">
              <p className="text-xs font-semibold tracking-[2px] text-white/40 uppercase mb-3">
                Follow Us
              </p>
              <div className="flex gap-3">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram @hiddenparadise_gh"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/60 transition-all hover:border-[#E1306C] hover:bg-[#E1306C] hover:text-white"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a
                  href={TIKTOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on TikTok @hiddenparadise_gh"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/60 transition-all hover:border-white hover:bg-black hover:text-white"
                >
                  <svg width="16" height="18" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M448 209.9a210.1 210.1 0 01-122.8-39.3v178.8A162.6 162.6 0 11185 188.3v89.9a74.6 74.6 0 1052.2 71.2V0h88a121 121 0 00122.8 120.1v89.8z" />
                  </svg>
                </a>
                <a
                  href={SNAPCHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Add us on Snapchat hiddenp_gh"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/60 transition-all hover:border-[#FFFC00] hover:bg-[#FFFC00] hover:text-black"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z" />
                  </svg>
                </a>
                <a
                  href={TWITTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on X (Twitter) @hiddenp_gh"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/60 transition-all hover:border-white hover:bg-black hover:text-white"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
                  </svg>
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with us on WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-white/60 transition-all hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
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
