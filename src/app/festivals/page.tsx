import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";
import {
  Drum, Sparkles, Crown, Wheat, Shield, Utensils,
  Scissors, Leaf, Music, Gift, TreePine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Festivals | Hidden Paradise Nature Park",
  description:
    "Experience Ghana's vibrant festivals from Hidden Paradise, including Ngmayem, Dipo, Asogli Yam Festival, Agotime Kente, and more. We organise festival packages with accommodation, transport, and guides.",
};

interface Festival {
  name: string;
  people: string;
  timing: string;
  description: string;
  Icon: LucideIcon;
}

const EASTERN_FESTIVALS: Festival[] = [
  {
    name: "Ngmayem Festival",
    people: "Manya Krobo",
    timing: "October / November",
    description:
      "The biggest harvest festival in the Eastern/Volta region. Expect a full week of drumming, dancing, durbar of chiefs, and thanksgiving. We're the closest nature stay to the celebrations, just minutes from the heart of Krobo land.",
    Icon: Drum,
  },
  {
    name: "Dipo Festival",
    people: "Krobo",
    timing: "April",
    description:
      "A sacred coming-of-age ceremony for young Krobo women. You'll see traditional bead-wearing, dance, and cultural performances at Krobo Mountain, just 25 minutes from us. Easily one of the most striking cultural events in Ghana.",
    Icon: Sparkles,
  },
  {
    name: "Odwira Festival",
    people: "Akuapem (Akropong)",
    timing: "September / October",
    description:
      "The Akuapem people gather along the scenic Akuapem ridge for this purification and thanksgiving festival. A grand procession of chiefs, traditional music, and feasting. The ridge views alone are worth the trip.",
    Icon: Crown,
  },
  {
    name: "Ohum Festival",
    people: "Akyem (Akyem Abuakwa)",
    timing: "September / October",
    description:
      "A harvest and purification festival of the Akyem people in Kibi. You'll witness a river-cleansing ceremony, durbar of chiefs, and traditional dances. The town sits near the foothills of the Atewa Range.",
    Icon: Wheat,
  },
];

const VOLTA_FESTIVALS: Festival[] = [
  {
    name: "Asogli Yam Festival (Te Za)",
    people: "Ewe (Ho)",
    timing: "September",
    description:
      "The biggest yam festival in the Volta region, celebrated by the Asogli state in Ho. A full week of cultural displays builds up to a spectacular durbar of chiefs. The ceremonial eating of new yam marks the start of the harvest season.",
    Icon: Utensils,
  },
  {
    name: "Agotime Kente Festival",
    people: "Agotime (Kpetoe)",
    timing: "August",
    description:
      "Kpetoe is one of the oldest kente-weaving communities in the Volta region, and this festival puts that heritage on full display. Locals and visitors wear their finest cloth. You'll see weaving competitions, a durbar of chiefs, and performances honouring the artisans who keep this craft alive.",
    Icon: Scissors,
  },
  {
    name: "Amu (Rice) Festival",
    people: "Avatime",
    timing: "November",
    description:
      "The Avatime people celebrate their rice harvest in the scenic hills near Ho. Traditional drumming, dancing, durbar of chiefs, and communal feasting. The Avatime hills are some of the most beautiful landscapes in the Volta region.",
    Icon: Leaf,
  },
  {
    name: "Gbidukorza Festival",
    people: "Gbi people (Hohoe / Peki)",
    timing: "November",
    description:
      "A war drumming festival of the Gbi people, rotating between Hohoe and Peki. Expect powerful drum performances, warrior dances, and cultural displays honouring the history and fighting spirit of the Gbi people.",
    Icon: Shield,
  },
];

const HP_SPECIALS: Festival[] = [
  {
    name: "Easter at Hidden Paradise",
    people: "All guests",
    timing: "March / April",
    description:
      "Our annual Easter weekend celebration with camping, bonfire nights, live music, and community feasts. A perfect family getaway over the long weekend.",
    Icon: Gift,
  },
  {
    name: "Christmas at Hidden Paradise",
    people: "All guests",
    timing: "December",
    description:
      "End the year at the park with our special Christmas programme. Camping, BBQ, games, and celebrations under the stars with friends, family, and fellow nature lovers.",
    Icon: TreePine,
  },
];

function FestivalCard({ f }: { f: Festival }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <f.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-bold text-dark">{f.name}</h3>
      <div className="flex flex-wrap gap-2 mt-1.5 mb-3">
        <span className="text-xs font-semibold tracking-wider text-accent uppercase">
          {f.timing}
        </span>
        <span className="text-xs text-text-secondary">· {f.people}</span>
      </div>
      <p className="text-sm text-text-secondary flex-1">{f.description}</p>
    </div>
  );
}

export default function FestivalsPage() {
  const enquiryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'm interested in a festival package at Hidden Paradise. Which festivals are coming up?"
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="CULTURE & CELEBRATIONS"
        title="Festivals Near Hidden Paradise"
        description="The Eastern and Volta regions are alive with festivals year-round. Stay with us and experience the culture up close. We'll arrange transport, guides, and the best viewing spots."
      />

      <div className="max-w-[1200px] mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold text-primary mb-6 text-center">
          Eastern Region Festivals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EASTERN_FESTIVALS.map((f) => (
            <FestivalCard key={f.name} f={f} />
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold text-primary mb-6 text-center">
          Volta Region Festivals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VOLTA_FESTIVALS.map((f) => (
            <FestivalCard key={f.name} f={f} />
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold text-primary mb-6 text-center">
          Hidden Paradise Specials
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {HP_SPECIALS.map((f) => (
            <FestivalCard key={f.name} f={f} />
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
        <h3 className="font-display text-xl font-bold text-primary">
          Festival Packages
        </h3>
        <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto">
          We offer festival packages with accommodation at the park, transport to the festival grounds, and local guides. Message us to plan your experience.
        </p>
        <a
          href={enquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition mt-6"
        >
          Enquire About Festival Packages
        </a>
      </div>
    </main>
  );
}
