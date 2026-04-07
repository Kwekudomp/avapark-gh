import Link from "next/link";
import AccommodationSection from "@/components/AccommodationSection";
import SectionHeader from "@/components/SectionHeader";
import { getAccommodationPartners } from "@/lib/cms";
import { WHATSAPP_NUMBER } from "@/data/constants";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accommodation | Hidden Paradise Nature Park",
  description:
    "Stay at Hidden Paradise — rent tents on-site for the full camping experience, or choose from trusted partner lodges and guest houses nearby.",
};

const TENT_OPTIONS = [
  {
    name: "Standard Tent",
    guests: "2 guests",
    description:
      "Cosy 2-person tent set up on our manicured camping grounds. Includes sleeping mats and a lantern.",
    icon: "⛺",
  },
  {
    name: "Family Tent",
    guests: "4–6 guests",
    description:
      "Spacious tent for families or groups. Plenty of room to stretch out under the stars.",
    icon: "🏕️",
  },
  {
    name: "Bring Your Own Tent",
    guests: "Any size",
    description:
      "Prefer your own gear? Reserve a camping spot on the lawn with access to facilities and amenities.",
    icon: "🎒",
  },
];

export default async function AccommodationPage() {
  const partners = await getAccommodationPartners();

  const enquiryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to enquire about tent rental / camping accommodation at Hidden Paradise."
  )}`;

  return (
    <main className="pt-28 pb-24">
      {/* ── Tent Rental Section ──────────────────────────────── */}
      <section className="px-[5%] pb-20">
        <SectionHeader
          tag="STAY ON-SITE"
          title="Camp Under the Stars"
          description="Rent a tent and sleep right inside Hidden Paradise. Wake up to birdsong, fresh air, and 300 acres of nature at your doorstep."
        />

        <div className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
          {TENT_OPTIONS.map((tent) => (
            <div
              key={tent.name}
              className="bg-white rounded-2xl border border-border p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
            >
              <span className="text-4xl mb-3">{tent.icon}</span>
              <h3 className="font-display text-lg font-bold text-dark">
                {tent.name}
              </h3>
              <p className="text-xs font-semibold tracking-wider text-accent uppercase mt-1">
                {tent.guests}
              </p>
              <p className="text-sm text-text-secondary mt-3 flex-1">
                {tent.description}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-[1000px] mx-auto mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-display text-lg font-bold text-primary">
              Ready to book a tent?
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Message us on WhatsApp with your dates and group size — we&apos;ll
              get your spot reserved.
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href={enquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1fb855] transition whitespace-nowrap"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Book a Tent
            </a>
            <Link
              href="/experiences/camping"
              className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-white transition whitespace-nowrap"
            >
              Camping Experience
            </Link>
          </div>
        </div>
      </section>

      {/* ── Partner Lodges Section ───────────────────────────── */}
      {partners.length > 0 && (
        <AccommodationSection partners={partners} />
      )}
    </main>
  );
}
