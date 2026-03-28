"use client";

import { useState } from "react";
import { CMSExperience } from "@/lib/cms";
import ExperienceCard from "@/components/ExperienceCard";

type Filter = "all" | "recurring" | "tour" | "special";

const tabs: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Weekly Events", value: "recurring" },
  { label: "Tours", value: "tour" },
  { label: "Special Events", value: "special" },
];

export default function ExperienceGrid({ initialExperiences }: { initialExperiences: CMSExperience[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const filtered =
    activeFilter === "all"
      ? initialExperiences
      : initialExperiences.filter((e) => e.category === activeFilter);

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-3 justify-center mb-12 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === tab.value
                ? "bg-primary text-white"
                : "bg-bg-alt text-text-secondary hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Experience grid */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((exp, i) => (
          <ExperienceCard key={exp.slug} experience={exp} index={i} />
        ))}
      </div>
    </>
  );
}
