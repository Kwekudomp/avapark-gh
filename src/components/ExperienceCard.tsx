"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CMSExperience } from "@/lib/supabase";
import ScrollReveal from "./ScrollReveal";

interface ExperienceCardProps {
  experience: CMSExperience;
  index?: number;
}

export default function ExperienceCard({
  experience,
  index = 0,
}: ExperienceCardProps) {
  const { slug, name, tagline, schedule, cover_image_url, deposit_amount } = experience;
  const [imgError, setImgError] = useState(false);

  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl">
        {/* Image container — links to experience detail */}
        <Link href={`/experiences/${slug}`} className="block">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-bg-alt">
            {cover_image_url && !imgError ? (
              <Image
                src={cover_image_url}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-primary/30 text-4xl">🌿</span>
              </div>
            )}

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
          <Link href={`/book/${slug}`}
            className="mt-4 block w-full text-center bg-accent text-white py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition">
            {deposit_amount ? `Book — GHC ${deposit_amount} deposit` : "Reserve Spot"}
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}
