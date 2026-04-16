import { Metadata } from "next";
import ExperienceCarousel from "@/components/ExperienceCarousel";
import CollapsibleExperiences from "@/components/CollapsibleExperiences";
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
      <CollapsibleExperiences experiences={allExperiences} />
    </>
  );
}
