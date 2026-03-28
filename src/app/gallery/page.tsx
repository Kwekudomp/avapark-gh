import { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore photos of Hidden Paradise — our camping grounds, swimming pool, sunset gardens, and event spaces.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="py-32 pt-40 px-[5%] bg-bg-alt text-center">
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-primary">
          Gallery
        </h1>
        <p className="text-text-secondary text-lg mt-6 max-w-2xl mx-auto">
          A glimpse into the Hidden Paradise experience — from sunrise campouts to
          moonlit pool parties.
        </p>
      </section>

      <section className="py-24 px-[5%]">
        <GalleryGrid />
      </section>
    </>
  );
}
