import AccommodationSection from "@/components/AccommodationSection";
import SectionHeader from "@/components/SectionHeader";
import { getAccommodationPartners } from "@/lib/cms";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accommodation | Hidden Paradise Nature Park",
  description:
    "Find where to stay near Hidden Paradise Nature Park — trusted partner lodges, chalets, and guest houses minutes from the park.",
};

export default async function AccommodationPage() {
  const partners = await getAccommodationPartners();

  return (
    <main className="pt-28 pb-24">
      {partners.length > 0 ? (
        <AccommodationSection partners={partners} />
      ) : (
        <section className="px-[5%]">
          <SectionHeader
            tag="WHERE TO STAY"
            title="Rest Close, Wake Ready"
            description="Extend your Hidden Paradise experience. We've partnered with trusted lodges nearby so you can arrive fresh and leave recharged."
          />
          <div className="max-w-2xl mx-auto text-center mt-8">
            <div className="bg-bg-alt rounded-2xl border border-border p-12">
              <p className="text-5xl mb-4">🏕️</p>
              <p className="text-text-secondary">
                Accommodation listings are being updated. Please contact us via
                WhatsApp or the contact page for accommodation enquiries.
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
