import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";

export const metadata = {
  title: "Festivals | Hidden Paradise Nature Park",
  description:
    "Experience Ghana's vibrant festivals from Hidden Paradise — Ngmayem, Homowo, Dipo, and more. We organise festival packages with accommodation, transport, and guides.",
};

const FESTIVALS = [
  {
    name: "Ngmayem Festival",
    people: "Krobo (Manya & Yilo)",
    timing: "October – November",
    description:
      "The biggest harvest festival in the Eastern Region. A week of drumming, dancing, durbar of chiefs, and thanksgiving. Hidden Paradise is the closest nature stay to the celebrations.",
    icon: "🥁",
  },
  {
    name: "Homowo Festival",
    people: "Ga people (Accra & surrounds)",
    timing: "August – September",
    description:
      "Literally 'hooting at hunger' — Accra's most famous festival featuring the sprinkling of kpokpoi, traditional drumming, and family reunions. Easy day trip from the park.",
    icon: "🎊",
  },
  {
    name: "Dipo Festival",
    people: "Krobo",
    timing: "April",
    description:
      "A sacred rite-of-passage ceremony for young Krobo women. Features traditional bead-wearing, dance, and cultural performances at Krobo Mountain — just 25 minutes from us.",
    icon: "💃",
  },
  {
    name: "Asogli Yam Festival",
    people: "Ewe (Ho & Volta Region)",
    timing: "September",
    description:
      "Celebration of the yam harvest in Ho. Features a grand durbar, cultural performances, and feasting. A scenic drive from Hidden Paradise into the Volta Region.",
    icon: "🍠",
  },
  {
    name: "Odwira Festival",
    people: "Akuapem (Akropong)",
    timing: "September – October",
    description:
      "Purification and thanksgiving festival of the Akuapem people. Features a procession along the Akuapem ridge — one of Ghana's most scenic cultural events.",
    icon: "🏔️",
  },
  {
    name: "Easter & Christmas at Hidden Paradise",
    people: "All guests",
    timing: "March/April & December",
    description:
      "Our own holiday specials — camping, bonfires, live music, and community feasts at the park. The perfect Ghanaian holiday getaway.",
    icon: "🎄",
  },
];

export default function FestivalsPage() {
  const enquiryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'm interested in a festival package at Hidden Paradise. Which festivals are coming up?"
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="CULTURE & CELEBRATIONS"
        title="Festivals Near Hidden Paradise"
        description="Ghana's Eastern Region is alive with festivals year-round. Stay with us and experience the culture up close — we'll arrange transport, guides, and the best viewing spots."
      />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FESTIVALS.map((f) => (
          <div
            key={f.name}
            className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow flex flex-col"
          >
            <span className="text-4xl mb-3">{f.icon}</span>
            <h3 className="font-display text-lg font-bold text-dark">
              {f.name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-1.5 mb-3">
              <span className="text-xs font-semibold tracking-wider text-accent uppercase">
                {f.timing}
              </span>
              <span className="text-xs text-text-secondary">
                · {f.people}
              </span>
            </div>
            <p className="text-sm text-text-secondary flex-1">
              {f.description}
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
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
