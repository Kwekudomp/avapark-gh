import { Metadata } from "next";
import ExperienceCarousel from "@/components/ExperienceCarousel";
import ExperienceGrid from "@/components/ExperienceGrid";
import { getCMSExperiences, getFeaturedCMSExperiences } from "@/lib/cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Experiences",
  description:
    "Explore all experiences at Hidden Paradise including camping, hiking tours, pool parties, BBQ nights, picnics, game nights, and special events. Book your adventure today.",
};

export default async function ExperiencesPage() {
  const [featured, allExperiences] = await Promise.all([
    getFeaturedCMSExperiences(),
    getCMSExperiences(),
  ]);

  return (
    <>
      <ExperienceCarousel experiences={featured} />

      <section className="py-24 px-[5%]">
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary text-center mb-4">
          All Experiences
        </h2>
        <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-12">
          From weekly events to special adventures, find your perfect Hidden
          Paradise experience.
        </p>
        <ExperienceGrid initialExperiences={allExperiences} />
      </section>
    </>
  );
}
