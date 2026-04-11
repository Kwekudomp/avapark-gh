import { Store, Sparkles } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/constants";

export default function VendorSpotBanner() {
  const waMessage = encodeURIComponent(
    "Hi! I'd like to reserve a vendor spot at the Hidden Paradise Night Market.",
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  return (
    <section className="px-[5%] py-12">
      <div className="max-w-[1000px] mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-8 md:p-12 text-white shadow-lg">
        <Sparkles
          className="absolute top-6 right-6 w-16 h-16 text-white/15"
          strokeWidth={1.5}
          aria-hidden
        />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Store className="w-9 h-9" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/80 mb-2">
              Vendors & Makers
            </p>
            <h3 className="font-display text-2xl md:text-3xl font-semibold mb-2">
              Reserve a Vendor Spot
            </h3>
            <p className="text-white/90 text-sm md:text-base max-w-xl">
              Showcase and sell your products at our Night Market. Limited spots
              available for brands, artisans, and farm producers.
            </p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            Reserve a Spot
          </a>
        </div>
      </div>
    </section>
  );
}
