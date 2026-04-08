import SectionHeader from "@/components/SectionHeader";
import { PHONE_TEL, PHONE_DISPLAY } from "@/data/constants";
import { Phone, ChefHat, Headphones, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Contact Numbers | Hidden Paradise Nature Park",
  description:
    "Reach Hidden Paradise by phone. Main line, kitchen line, customer service, and 24-hour hotline.",
};

const LINES = [
  { label: "Main Line", number: PHONE_DISPLAY, tel: PHONE_TEL, Icon: Phone },
  { label: "Kitchen Line", number: PHONE_DISPLAY, tel: PHONE_TEL, Icon: ChefHat },
  { label: "Customer Service", number: PHONE_DISPLAY, tel: PHONE_TEL, Icon: Headphones },
  { label: "24hr Hotline", number: PHONE_DISPLAY, tel: PHONE_TEL, Icon: ShieldAlert },
];

export default function ContactNumbersPage() {
  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader tag="REACH US" title="Contact Numbers" />
      <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LINES.map((line) => (
          <a
            key={line.label}
            href={`tel:${line.tel}`}
            className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <line.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
              {line.label}
            </p>
            <p className="text-sm font-bold text-dark">{line.number}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
