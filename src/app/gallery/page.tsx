import { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import { getGalleryItems } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Explore photos of Hidden Paradise, from our camping grounds and swimming pool to the sunset gardens and event spaces.",
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <>
      <section className="py-32 pt-40 px-[5%] bg-bg-alt text-center">
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-primary">
          Gallery
        </h1>
        <p className="text-text-secondary text-lg mt-6 max-w-2xl mx-auto">
          A glimpse into the Hidden Paradise experience, from sunrise campouts to
          moonlit pool parties.
        </p>
      </section>

      <section className="py-24 px-[5%]">
        {items.length > 0 ? (
          <GalleryGrid initialItems={items} />
        ) : (
          <div className="text-center py-16 text-text-secondary">
            <p className="text-4xl mb-4">📸</p>
            <p className="text-lg">Photos coming soon</p>
          </div>
        )}
      </section>
    </>
  );
}
