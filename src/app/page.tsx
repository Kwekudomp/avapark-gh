export const dynamic = "force-dynamic";

import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import SectionHeader from "@/components/SectionHeader";
import ExperienceCard from "@/components/ExperienceCard";
import PhotoMosaic from "@/components/PhotoMosaic";
import ValueCards from "@/components/ValueCards";
import WeeklySchedule from "@/components/WeeklySchedule";
import DiasporaCTA from "@/components/DiasporaCTA";
import UpcomingEventsTeaser from "@/components/UpcomingEventsTeaser";
import VideoSection from "@/components/VideoSection";
import ReviewsSection from "@/components/ReviewsSection";
import AccommodationSection from "@/components/AccommodationSection";
import HowToGetHere from "@/components/HowToGetHere";
import EmailSignup from "@/components/EmailSignup";
import { getFeaturedCMSExperiences, getUpcomingEvents, getVideos, getApprovedReviews, getAccommodationPartners } from "@/lib/cms";

export default async function Home() {
  const [featured, events, videos, reviews, partners] = await Promise.all([
    getFeaturedCMSExperiences(),
    getUpcomingEvents(),
    getVideos(),
    getApprovedReviews(),
    getAccommodationPartners(),
  ]);

  return (
    <>
      {/* Hero + Activity Finder */}
      <HeroCarousel />

      {/* Upcoming Events teaser — auto-hides when no events */}
      <UpcomingEventsTeaser events={events} />

      {/* Featured Experiences */}
      <section className="py-24 px-[5%]">
        <SectionHeader
          tag="OUR EXPERIENCES"
          title="Discover What Awaits"
          description="From camping under the stars to thrilling hiking tours, explore our most popular experiences."
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

      {/* Accommodation */}
      <AccommodationSection partners={partners} />

      {/* Photo Mosaic */}
      <PhotoMosaic />

      {/* Weekly Schedule */}
      <WeeklySchedule />

      {/* Order Food CTA */}
      <section className="py-20 px-[5%]">
        <div className="max-w-[1100px] mx-auto rounded-3xl bg-primary text-white px-8 py-12 sm:px-14 sm:py-16 text-center relative overflow-hidden">
          <p className="text-xs font-bold tracking-[4px] text-secondary-light uppercase mb-3">The Kitchen</p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold">Hungry? Order ahead of your visit.</h2>
          <p className="text-white/70 mt-4 max-w-xl mx-auto text-sm sm:text-base">
            Browse the full menu, build your order, and send it to the kitchen for dine-in, pickup, or delivery — before you even arrive.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Link
              href="/food-drinks/order"
              className="inline-flex items-center gap-2 bg-accent text-white px-7 py-3 rounded-full text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              Order Food Online
            </Link>
            <Link
              href="/food-drinks"
              className="inline-flex items-center px-7 py-3 rounded-full text-sm font-medium border border-white/30 text-white hover:bg-white hover:text-primary transition-colors"
            >
              View the Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Videos */}
      <VideoSection videos={videos} />

      {/* Why Hidden Paradise */}
      <section className="py-24 px-[5%]">
        <SectionHeader
          tag="WHY HIDDEN PARADISE"
          title="What Makes Us Special"
          description="More than a park. It's an experience you'll never forget."
        />
        <ValueCards />
      </section>

      {/* Reviews */}
      <ReviewsSection initialReviews={reviews} />

      {/* How to Get Here */}
      <HowToGetHere />

      {/* Diaspora CTA */}
      <DiasporaCTA />

      {/* Email Signup */}
      <EmailSignup />
    </>
  );
}
