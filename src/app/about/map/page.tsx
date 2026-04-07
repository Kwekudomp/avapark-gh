import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_URL } from "@/data/constants";

export const metadata = {
  title: "Park Map | Hidden Paradise Nature Park",
  description:
    "View and download the Hidden Paradise site map showing camping areas, pool, restaurant, event spaces, trails, and more.",
};

export default function MapPage() {
  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader tag="FIND YOUR WAY" title="Park Map" />
      <div className="max-w-[900px] mx-auto">
        <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 text-center">
          <span className="text-5xl block mb-4">🗺️</span>
          <h3 className="font-display text-xl font-bold text-primary mb-2">
            Site Map Coming Soon
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
            We&apos;re putting together a detailed map of the park grounds showing
            camping areas, the pool, restaurant, event spaces, trails, and more.
            It will be available to view and download here shortly.
          </p>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition"
          >
            Ask Us for Directions on WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
