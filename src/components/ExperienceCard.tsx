"use client";

import Image from "next/image";
import Link from "next/link";
import { Experience } from "@/data/experiences";
import ScrollReveal from "./ScrollReveal";

interface ExperienceCardProps {
  experience: Experience;
  index?: number;
}

export default function ExperienceCard({
  experience,
  index = 0,
}: ExperienceCardProps) {
  const { slug, name, tagline, schedule, coverImage } = experience;

  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl">
        {/* Image container — links to experience detail */}
        <Link href={`/experiences/${slug}`} className="block">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
            <Image
              src={coverImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Bottom gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Name over image */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="font-display text-xl font-semibold text-white">
                {name}
              </h3>
            </div>
          </div>
        </Link>

        {/* Content below image */}
        <div className="mt-3 px-1">
          {schedule && (
            <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent">
              {schedule}
            </span>
          )}
          {tagline && (
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              {tagline}
            </p>
          )}
          <Link href={`/book/${experience.slug}`}
            className="mt-4 block w-full text-center bg-accent text-white py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition">
            {experience.depositAmount ? `Book — GHC ${experience.depositAmount} deposit` : "Reserve Spot"}
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}
