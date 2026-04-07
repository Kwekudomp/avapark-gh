"use client";

import ScrollReveal from "./ScrollReveal";

const values = [
  {
    title: "Nature Escape",
    description:
      "Disconnect from the city and reconnect with nature on our lush grounds along the Volta.",
    icon: (
      <svg
        className="w-10 h-10 text-accent"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 L10 22 H16 L12 34 L30 16 H22 L28 6 Z" />
        <path d="M8 36 C8 28 14 24 20 24 C26 24 32 28 32 36" />
      </svg>
    ),
  },
  {
    title: "30+ Activities",
    description:
      "From hiking and swimming to archery and karaoke \u2014 there\u2019s something for everyone.",
    icon: (
      <svg
        className="w-10 h-10 text-accent"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="20,4 24.5,14 35.5,15.5 27.5,23 29.5,34 20,29 10.5,34 12.5,23 4.5,15.5 15.5,14" />
      </svg>
    ),
  },
  {
    title: "Perfect for Groups",
    description:
      "Whether it\u2019s a birthday, corporate retreat, or wedding party, we host groups of all sizes.",
    icon: (
      <svg
        className="w-10 h-10 text-accent"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="20" cy="12" r="5" />
        <path d="M10 32 C10 24 14 20 20 20 C26 20 30 24 30 32" />
        <circle cx="9" cy="14" r="3.5" />
        <path d="M2 30 C2 24 5 21 9 21" />
        <circle cx="31" cy="14" r="3.5" />
        <path d="M38 30 C38 24 35 21 31 21" />
      </svg>
    ),
  },
  {
    title: "Gateway to the East",
    description:
      "Your base camp for exploring the Eastern and Volta regions, from Akosombo Dam to Krobo Mountain and beyond.",
    icon: (
      <svg
        className="w-10 h-10 text-accent"
        viewBox="0 0 40 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 34 L20 10 L36 34 Z" />
        <path d="M16 34 L20 26 L24 34" />
        <circle cx="32" cy="8" r="2" />
        <path d="M8 6 L9 8 L7 8 Z" />
        <circle cx="12" cy="4" r="0.8" />
      </svg>
    ),
  },
];

export default function ValueCards() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {values.map((value, i) => (
          <ScrollReveal key={value.title} delay={i * 0.1}>
            <div className="glass-card p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-5">{value.icon}</div>
              <h3 className="font-display text-xl font-semibold text-primary mb-3">
                {value.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {value.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
