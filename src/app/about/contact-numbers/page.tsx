import SectionHeader from "@/components/SectionHeader";
import { PHONE_TEL, PHONE_DISPLAY } from "@/data/constants";

export const metadata = {
  title: "Contact Numbers | Hidden Paradise Nature Park",
  description:
    "Reach Hidden Paradise by phone. Main line, kitchen line, customer service, and 24-hour hotline.",
};

export default function ContactNumbersPage() {
  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader tag="REACH US" title="Contact Numbers" />
      <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <a
          href={`tel:${PHONE_TEL}`}
          className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
        >
          <span className="text-3xl block mb-2">📞</span>
          <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
            Main Line
          </p>
          <p className="text-sm font-bold text-dark">{PHONE_DISPLAY}</p>
        </a>
        <a
          href={`tel:${PHONE_TEL}`}
          className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
        >
          <span className="text-3xl block mb-2">🍽️</span>
          <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
            Kitchen Line
          </p>
          <p className="text-sm font-bold text-dark">{PHONE_DISPLAY}</p>
        </a>
        <a
          href={`tel:${PHONE_TEL}`}
          className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
        >
          <span className="text-3xl block mb-2">🎧</span>
          <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
            Customer Service
          </p>
          <p className="text-sm font-bold text-dark">{PHONE_DISPLAY}</p>
        </a>
        <a
          href={`tel:${PHONE_TEL}`}
          className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
        >
          <span className="text-3xl block mb-2">🚨</span>
          <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
            24hr Hotline
          </p>
          <p className="text-sm font-bold text-dark">{PHONE_DISPLAY}</p>
        </a>
      </div>
    </main>
  );
}
