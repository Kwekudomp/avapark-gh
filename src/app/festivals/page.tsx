import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";

export const metadata = {
  title: "Festivals | Hidden Paradise Nature Park",
  description:
    "Experience Ghana's vibrant festivals from Hidden Paradise, including Ngmayem, Homowo, Dipo, Hogbetsotso, Asogli Yam Festival, and more. We organise festival packages with accommodation, transport, and guides.",
};

const EASTERN_FESTIVALS = [
  {
    name: "Ngmayem Festival",
    people: "Krobo (Manya & Yilo)",
    timing: "October / November",
    description:
      "The biggest harvest festival in the Eastern/Volta region. A week of drumming, dancing, durbar of chiefs, and thanksgiving celebrations. Hidden Paradise is the closest nature stay to the festivities, just minutes from the heart of Krobo land.",
    icon: "🥁",
  },
  {
    name: "Dipo Festival",
    people: "Krobo",
    timing: "April",
    description:
      "A sacred rite-of-passage ceremony for young Krobo women. Features traditional bead-wearing, dance, and cultural performances at Krobo Mountain, just 25 minutes from us. One of the most visually striking cultural events in Ghana.",
    icon: "💃",
  },
  {
    name: "Odwira Festival",
    people: "Akuapem (Akropong)",
    timing: "September / October",
    description:
      "A purification and thanksgiving festival of the Akuapem people held along the scenic Akuapem ridge. Features a grand procession of chiefs, traditional music, and feasting. The ridge itself offers stunning views of the Eastern plains.",
    icon: "🏔️",
  },
  {
    name: "Ohum Festival",
    people: "Akyem (Akyem Abuakwa)",
    timing: "August",
    description:
      "A week-long harvest and purification festival of the Akyem people in Kibi. Highlights include a river-cleansing ceremony, a durbar of chiefs, and traditional dances. The town sits near the foothills of the Atewa Range.",
    icon: "🌾",
  },
  {
    name: "Papa Festival",
    people: "Shai (Dangme)",
    timing: "March / April",
    description:
      "Celebrated by the Shai people near the Shai Hills Reserve, this festival marks the migration of the Dangme from the Shai caves. Features traditional warrior dances, storytelling, and a pilgrimage to the ancestral caves.",
    icon: "🗿",
  },
];

const VOLTA_FESTIVALS = [
  {
    name: "Asogli Yam Festival (Te Za)",
    people: "Ewe (Ho)",
    timing: "September",
    description:
      "The grandest yam festival in the Volta region, celebrated by the Asogli state in Ho. A week of cultural displays culminates in a spectacular durbar of chiefs. The ceremonial eating of new yam marks the beginning of the harvest season.",
    icon: "🍠",
  },
  {
    name: "Agotime Kente Festival",
    people: "Agotime (Kpetoe)",
    timing: "September",
    description:
      "A vibrant celebration of Ewe kente weaving heritage in the town of Kpetoe, one of the oldest kente-weaving communities in the Volta region. The festival showcases spectacular kente displays, with locals and visitors wearing their finest cloth. Highlights include weaving competitions, a durbar of chiefs, and cultural performances that honour the artisans keeping this centuries-old craft alive.",
    icon: "🧵",
  },
  {
    name: "Golokwati Festival",
    people: "Avatime (Volta Region)",
    timing: "October",
    description:
      "Celebrated by the Avatime people in the hills near Ho, this rice harvest festival features drumming, traditional dancing, and a durbar. The Avatime hills offer some of the most scenic landscapes in the Volta region.",
    icon: "🌾",
  },
  {
    name: "Gbidukor Festival",
    people: "Hohoe (Volta Region)",
    timing: "November",
    description:
      "A traditional war drumming festival celebrated by the people of Hohoe in the Volta region. Features intense war drum performances, warrior dances, and cultural displays that honour the history and fighting spirit of the Hohoe people.",
    icon: "🪘",
  },
  {
    name: "Yeke Yeke Festival",
    people: "Nzema / Volta communities",
    timing: "December",
    description:
      "An end-of-year celebration featuring masquerade performances, traditional drumming, and community feasting. A colourful way to close out the year with deep cultural roots.",
    icon: "🎉",
  },
];

const HP_SPECIALS = [
  {
    name: "Easter at Hidden Paradise",
    people: "All guests",
    timing: "March / April",
    description:
      "Our annual Easter weekend celebration with camping, bonfire nights, live music, and community feasts. A perfect family getaway over the long weekend.",
    icon: "🐣",
  },
  {
    name: "Christmas at Hidden Paradise",
    people: "All guests",
    timing: "December",
    description:
      "End the year at the park with our special Christmas programme. Camping, BBQ, games, and celebrations under the stars with friends, family, and fellow nature lovers.",
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
        description="The Eastern and Volta regions are alive with festivals year-round. Stay with us and experience the culture up close. We'll arrange transport, guides, and the best viewing spots."
      />

      {/* Eastern Region Festivals */}
      <div className="max-w-[1200px] mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold text-primary mb-6 text-center">
          Eastern Region Festivals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EASTERN_FESTIVALS.map((f) => (
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
      </div>

      {/* Volta Region Festivals */}
      <div className="max-w-[1200px] mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold text-primary mb-6 text-center">
          Volta Region Festivals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VOLTA_FESTIVALS.map((f) => (
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
      </div>

      {/* Hidden Paradise Specials */}
      <div className="max-w-[800px] mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold text-primary mb-6 text-center">
          Hidden Paradise Specials
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {HP_SPECIALS.map((f) => (
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
