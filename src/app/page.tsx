import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import SectionHeader from "@/components/SectionHeader";
import ExperienceCard from "@/components/ExperienceCard";
import PhotoMosaic from "@/components/PhotoMosaic";
import ValueCards from "@/components/ValueCards";
import WeeklySchedule from "@/components/WeeklySchedule";
import DiasporaCTA from "@/components/DiasporaCTA";
import { getFeaturedExperiences } from "@/data/experiences";

const featured = getFeaturedExperiences();

export default function Home() {
  return (
    <>
      {/* Hero */}
      <HeroCarousel />

      {/* Featured Experiences */}
      <section className="py-24 px-[5%]">
        <SectionHeader
          tag="OUR EXPERIENCES"
          title="Discover What Awaits"
          description="From camping under the stars to thrilling hiking tours — explore our most popular experiences."
        />
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((exp, i) => (
            <ExperienceCard key={exp.slug} experience={exp} index={i} />
          ))}
        </div>
        <Link
          href="/experiences"
          className="text-accent font-medium hover:text-accent-dark transition text-center block mt-12 text-lg"
        >
          View All Experiences &rarr;
        </Link>
      </section>

      {/* Photo Mosaic */}
      <PhotoMosaic />

      {/* Why Ava Park */}
      <section className="py-24 px-[5%]">
        <SectionHeader
          tag="WHY AVA PARK"
          title="What Makes Us Special"
          description="More than a park — it's an experience you'll never forget."
        />
        <ValueCards />
      </section>

      {/* Weekly Schedule */}
      <WeeklySchedule />

      {/* Diaspora CTA */}
      <DiasporaCTA />
    </>
  );
}
