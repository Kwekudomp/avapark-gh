"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CMSExperience } from "@/lib/supabase";
import ExperienceGrid from "@/components/ExperienceGrid";

export default function CollapsibleExperiences({
  experiences,
}: {
  experiences: CMSExperience[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="px-[5%] pb-24">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full py-8 flex items-center justify-center gap-3 group cursor-pointer"
        aria-expanded={isOpen}
      >
        <h2 className="font-display text-3xl md:text-4xl font-semibold text-primary">
          All Experiences
        </h2>
        <span className="w-10 h-10 rounded-full bg-bg-alt flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-primary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary" />
          )}
        </span>
      </button>

      {/* Collapsible content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-12">
              From weekly events to special adventures, find your perfect Hidden
              Paradise experience.
            </p>
            <ExperienceGrid initialExperiences={experiences} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
