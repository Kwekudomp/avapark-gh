import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { PHONE_DISPLAY, PHONE_TEL } from "@/data/constants";
import {
  ScrollText,
  Waves,
  Flame,
  Mountain,
  Wine,
  Baby,
  PawPrint,
  Camera,
  Leaf,
  Siren,
  Shield,
  ShieldCheck,
  Stethoscope,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Rules & Safety | Hidden Paradise Nature Park",
  description:
    "Park rules, safety guidelines, and emergency information for visitors to Hidden Paradise Nature Park. Please read before your visit.",
};

interface RuleSection {
  title: string;
  Icon: LucideIcon;
  items: string[];
}

const RULES: RuleSection[] = [
  {
    title: "General Conduct",
    Icon: ScrollText,
    items: [
      "Guests are expected to treat the park, staff, and fellow visitors with respect at all times.",
      "Unauthorised weapons of any kind are strictly prohibited on the premises.",
      "Littering is not permitted. Please use the waste bins located throughout the park.",
      "Some areas of the park are restricted to guests aged 18 and above. Please respect signage.",
      "Your wristband or ticket must remain visible throughout your visit.",
      "Management reserves the right to ask any guest whose conduct disturbs others, endangers life, or breaks park rules to leave. No refunds will be issued in such cases.",
    ],
  },
  {
    title: "Medical Unit",
    Icon: Stethoscope,
    items: [
      "Our on-site Medical Unit is staffed by a volunteer doctor and nurse during peak program hours.",
      "Basic first aid and medical services are provided at the unit for a small fee.",
      "All Hidden Paradise staff are trained in basic first aid and can direct you to the Medical Unit.",
      "In the event of a medical emergency, alert any staff member immediately or call the main line.",
      "For serious cases, we can help coordinate transport to the nearest hospital.",
    ],
  },
  {
    title: "Park Security",
    Icon: ShieldCheck,
    items: [
      "The park is patrolled at all times by our in-house Hidden Paradise Security Department.",
      "Our security team works in close coordination with the Akuse Police Station, located near the VRA Estate in Akuse town.",
      "Report suspicious activity, lost items, or any safety concern to the nearest security officer or member of staff.",
      "In case of a serious security incident, call our main line immediately — help will be dispatched right away.",
      "Uniformed security officers wear Hidden Paradise identification for easy recognition.",
    ],
  },
  {
    title: "Swimming Pool Safety",
    Icon: Waves,
    items: [
      "No diving or running around the pool area.",
      "Children under 12 must be accompanied and supervised by an adult at all times.",
      "Glass bottles and containers are not allowed in or near the pool.",
      "Appropriate swimwear is required. Street clothes are not permitted in the pool.",
      "Swim at your own risk. Lifeguards may not be on duty at all hours.",
      "Please shower before entering the pool.",
    ],
  },
  {
    title: "Camping & Fire Safety",
    Icon: Flame,
    items: [
      "Fires are only permitted in designated fire pits and BBQ areas.",
      "Never leave a fire unattended. Fully extinguish fires before sleeping or leaving your site.",
      "No open flames inside tents.",
      "Secure your tent and personal belongings at night.",
      "Quiet hours are observed from 11:00 PM to 6:00 AM.",
      "Dispose of cigarette butts and matches only in designated ashtrays, never on the ground.",
    ],
  },
  {
    title: "Hiking & Mountain Trails",
    Icon: Mountain,
    items: [
      "Krobo, Yogaga, and other mountain hikes must be done with an official park guide.",
      "Wear sturdy, closed-toe shoes. Flip-flops and sandals are not suitable for trails.",
      "Carry water, sunscreen, and insect repellent on every hike.",
      "Start early and plan to turn back at least two hours before sunset.",
      "Stay on marked trails. Do not venture off-path or take shortcuts.",
      "Inform park staff before starting any hike and on your return.",
    ],
  },
  {
    title: "Alcohol & Events",
    Icon: Wine,
    items: [
      "Outside alcoholic beverages are not permitted. All drinks must be purchased from park bars and restaurants.",
      "No alcohol will be served to persons under 18. Valid ID may be requested.",
      "Last call times vary by event; please check with bar staff.",
      "Intoxicated guests may be asked to leave for their own safety and that of others.",
      "Do not drink and drive. We can help arrange safe transportation home if needed.",
    ],
  },
  {
    title: "Children Policy",
    Icon: Baby,
    items: [
      "Children must be supervised by a parent or guardian at all times.",
      "Certain activities and areas have minimum age requirements. Please check before booking.",
      "A kids wristband must be worn during your visit for easy identification by staff.",
      "Parents are responsible for their children's safety, behaviour, and belongings.",
      "Lost children should be reported immediately at the main entrance or to any staff member.",
    ],
  },
  {
    title: "Pets",
    Icon: PawPrint,
    items: [
      "Pets are welcome but must be kept on a leash at all times.",
      "All pets must be up to date on vaccinations. Proof may be requested.",
      "Owners are responsible for cleaning up after their pets.",
      "Pets are not allowed in the swimming pool, restaurant, or indoor event spaces.",
      "Aggressive animals will be asked to leave the premises.",
    ],
  },
  {
    title: "Photography & Drones",
    Icon: Camera,
    items: [
      "Personal photography and videography are welcome throughout the park.",
      "Commercial photography, filming, or influencer shoots require prior written permission from management.",
      "Drones may only be flown with a permit issued by the park. Contact us in advance to arrange.",
      "Please respect the privacy of other guests. Do not photograph them without consent.",
    ],
  },
  {
    title: "Wildlife & Environment",
    Icon: Leaf,
    items: [
      "Do not feed, touch, or chase any wildlife on the premises.",
      "Do not pick flowers, fruits, or plants without permission.",
      "Watch out for snakes and insects, especially when hiking or sitting in grass.",
      "Observe posted speed limits on all park roads. Animals and children may be on the road.",
      "Help us protect the land — take only photos, leave only footprints.",
    ],
  },
  {
    title: "Valuables & Liability",
    Icon: Shield,
    items: [
      "Hidden Paradise Nature Park is not responsible for lost, stolen, or damaged personal belongings.",
      "Do not leave valuables unattended in tents, at the poolside, or in parked vehicles.",
      "Ask at reception about secure storage options for high-value items.",
      "Visitors participate in all activities at their own risk. Hidden Paradise accepts no liability for injury resulting from non-compliance with posted rules and guide instructions.",
      "Lost and found items are held at the main reception for 14 days.",
    ],
  },
];

function RuleCard({ section }: { section: RuleSection }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 sm:p-7">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <section.Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
        </div>
        <h2 className="font-display text-xl font-bold text-primary">{section.title}</h2>
      </div>
      <ul className="space-y-2.5">
        {section.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm text-text-secondary leading-relaxed">
            <span className="text-accent font-bold flex-shrink-0">·</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RulesPage() {
  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="VISITOR INFORMATION"
        title="Park Rules & Safety"
        description="These guidelines help keep Hidden Paradise safe, clean, and enjoyable for every guest. Please read before your visit and share with your group. By entering the park, you agree to follow these rules."
      />

      {/* Quick emergency strip at the top */}
      <div className="max-w-[1200px] mx-auto mb-12 bg-red-50 border border-red-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
          <Siren className="w-6 h-6 text-red-600" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-red-900 mb-1">In case of emergency</p>
          <p className="text-sm text-red-800">
            Call our 24-hour Security Line immediately, or find any staff member wearing a Hidden Paradise wristband. All staff are trained in basic first aid.
          </p>
        </div>
        <a
          href={`tel:${PHONE_TEL}`}
          className="flex-shrink-0 inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-red-700 transition whitespace-nowrap"
        >
          <Phone className="w-4 h-4" strokeWidth={2.5} />
          {PHONE_DISPLAY}
        </a>
      </div>

      {/* Rules grid */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {RULES.map((section) => (
          <RuleCard key={section.title} section={section} />
        ))}
      </div>

      {/* Emergency callout at the bottom */}
      <div className="max-w-[1200px] mx-auto mt-16 bg-gradient-to-br from-primary to-accent text-white rounded-2xl p-8 sm:p-10 text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
          <Shield className="w-7 h-7" strokeWidth={1.8} />
        </div>
        <h3 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
          Your Safety Is Our Priority
        </h3>
        <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          If you have questions, see something unsafe, or need help at any time during your visit, do not hesitate to reach out. Every member of our team is here to help you enjoy Hidden Paradise safely.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <Link
            href="/about/contact-numbers"
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/90 transition"
          >
            <Phone className="w-4 h-4" strokeWidth={2.5} />
            All Contact Numbers
          </Link>
          <Link
            href="/about/faq"
            className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold border border-white/40 text-white hover:bg-white/10 transition"
          >
            Read the FAQ
          </Link>
        </div>
      </div>

      <p className="max-w-[1200px] mx-auto text-xs text-text-secondary/70 text-center mt-10">
        These rules are subject to change. Last updated April 2026. Management reserves the right to enforce all park rules at its discretion.
      </p>
    </main>
  );
}
