import { Metadata } from "next";
import ExperienceGrid from "@/components/ExperienceGrid";
import { getCMSExperiences } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Our Experiences",
  description:
    "Explore all experiences at Hidden Paradise — camping, hiking tours, pool parties, BBQ nights, picnics, game nights, and special events. Book your adventure today.",
};

export default async function ExperiencesPage() {
  const experiences = await getCMSExperiences();

  return (
    <>
      {/* Hero banner */}
      <section className="py-32 pt-40 px-[5%] bg-bg-alt text-center">
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-primary">
          Our Experiences
        </h1>
        <p className="text-text-secondary text-lg mt-6 max-w-2xl mx-auto">
          From weekly events to special adventures — find your perfect Hidden Paradise
          experience.
        </p>
      </section>

      {/* Filterable experience grid */}
      <section className="py-24 px-[5%]">
        <ExperienceGrid initialExperiences={experiences} />
      </section>
    </>
  );
}
