"use client";

import { HeartPulse, Leaf, Link2, Compass, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const values: { title: string; description: string; Icon: LucideIcon }[] = [
  {
    title: "Wellness",
    description:
      "Prioritising mental, physical, and emotional well-being for every guest who walks through our gates.",
    Icon: HeartPulse,
  },
  {
    title: "Sustainability",
    description:
      "Protecting and preserving nature so future generations can experience the same beauty we do today.",
    Icon: Leaf,
  },
  {
    title: "Connection",
    description:
      "Building meaningful relationships within nature \u2014 between people, communities, and the wild.",
    Icon: Link2,
  },
  {
    title: "Adventure",
    description:
      "Encouraging exploration and outdoor activities that get guests moving and discovering.",
    Icon: Compass,
  },
  {
    title: "Tranquility",
    description:
      "Providing a peaceful, relaxing environment where every visitor can unwind and reset.",
    Icon: Waves,
  },
];

export default function ValueCards() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {values.map((value, i) => (
          <ScrollReveal key={value.title} delay={i * 0.1}>
            <div className="glass-card p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full">
              <div className="w-12 h-12 mb-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <value.Icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
              </div>
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
