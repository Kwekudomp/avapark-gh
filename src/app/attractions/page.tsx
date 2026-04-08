import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";
import {
  Waves, Building2, Binoculars, Droplets, Mountain, Gem, PawPrint,
  Droplet, MountainSnow, Eye, TreePine, Wind, Squirrel, Scissors,
  Skull, Trees,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Attractions | Hidden Paradise Nature Park",
  description:
    "Explore tourist attractions across the Eastern and Volta regions from Hidden Paradise. Waterfalls, mountains, wildlife reserves, cultural villages, and more.",
};

interface Attraction {
  name: string;
  distance: string;
  description: string;
  Icon: LucideIcon;
}

const EASTERN_ATTRACTIONS: Attraction[] = [
  {
    name: "Volta River & Lake",
    distance: "On-site",
    description:
      "The Volta stretches right along our 300-acre grounds. Enjoy boat cruises, kayaking, and some of the best sunsets in Ghana without leaving the park.",
    Icon: Waves,
  },
  {
    name: "Akosombo Dam",
    distance: "~30 min drive",
    description:
      "One of the largest hydroelectric dams in West Africa, built in 1965 on the Volta River. Guided tours take you through the history of the dam that created Lake Volta, the world's largest man-made lake by surface area.",
    Icon: Building2,
  },
  {
    name: "Shai Hills Resource Reserve",
    distance: "~40 min drive",
    description:
      "A 52 sq km wildlife reserve home to baboons, antelopes, ostriches, and over 90 bird species. Explore ancient Dangme caves used as shelter during the 17th century and hike to the hilltop for views of the Accra plains.",
    Icon: Binoculars,
  },
  {
    name: "Boti Falls",
    distance: "~1.5 hr drive",
    description:
      "A twin waterfall near the town of Boti in the Eastern hills. During the rainy season, the male and female falls merge into one powerful flow. While you're there, check out the famous Umbrella Rock and the sacred three-headed palm tree.",
    Icon: Droplets,
  },
  {
    name: "Krobo Mountain",
    distance: "~25 min drive",
    description:
      "Sacred ancestral home of the Krobo people, rising over 300 metres above the plains. The summit offers panoramic views of the Eastern/Volta landscape. Learn about the Krobo's forced relocation during the construction of Akosombo Dam.",
    Icon: Mountain,
  },
  {
    name: "Cedi Bead Factory (Krobo Beads)",
    distance: "~20 min drive",
    description:
      "Watch craftsmen transform recycled glass powder into Ghana's iconic Krobo beads using techniques passed down for generations. Each bead is hand-painted and kiln-fired. Shop directly from the artisans for authentic pieces you won't find anywhere else.",
    Icon: Gem,
  },
  {
    name: "Kalakpa Resource Reserve",
    distance: "~2 hr drive",
    description:
      "A peaceful 325 sq km savanna reserve in the Volta region, home to bushbuck, duiker, monkeys, and over 200 bird species. One of Ghana's least crowded wildlife destinations, perfect for guided bush walks and birdwatching in the dry season.",
    Icon: PawPrint,
  },
];

const VOLTA_ATTRACTIONS: Attraction[] = [
  {
    name: "Wli Agumatsa Waterfall",
    distance: "~3.5 hr drive",
    description:
      "The tallest waterfall in West Africa, dropping about 80 metres into a pool surrounded by forest. The hike to the lower falls is a gentle 45-minute walk through a fruit bat colony. The upper falls take more effort to reach but the views are incredible.",
    Icon: Droplet,
  },
  {
    name: "Mount Afadjato",
    distance: "~3.5 hr drive",
    description:
      "At 885 metres, this is the highest point in Ghana. The guided hike from the village of Liati Wote takes about 2 hours through montane grasslands and butterfly-rich forest. On a clear day, you can see all the way to Lake Volta from the summit.",
    Icon: MountainSnow,
  },
  {
    name: "Amedzofe & Mount Gemi",
    distance: "~3 hr drive",
    description:
      "A cool mountain village sitting at over 700 metres, making it one of the highest settlements in Ghana. Hike to the summit of Mount Gemi to see the famous cross monument and take in views of the surrounding valleys and the Volta region below.",
    Icon: Mountain,
  },
  {
    name: "Amedzofe Canopy Walkway",
    distance: "~3 hr drive",
    description:
      "A 30-metre-high walkway suspended through the forest canopy near Amedzofe. Walk among the treetops with views over the Volta landscape. One of only a few canopy walkways in Ghana and far less crowded than Kakum.",
    Icon: Eye,
  },
  {
    name: "Tagbo Falls",
    distance: "~3.5 hr drive",
    description:
      "A beautiful waterfall near Liati Wote in the Volta region, pouring over a rock face surrounded by dense tropical forest. The hike passes through cocoa farms and local villages, so you get a real feel for rural Volta life.",
    Icon: Wind,
  },
  {
    name: "Tafi Atome Monkey Sanctuary",
    distance: "~2.5 hr drive",
    description:
      "A community-managed sanctuary protecting the sacred Mona monkeys that the people of Tafi Atome have lived alongside for centuries. The monkeys are friendly and accustomed to visitors. A guided forest walk brings you face-to-face with them in their natural habitat.",
    Icon: Squirrel,
  },
  {
    name: "Tafi Abuife Kente Village",
    distance: "~2.5 hr drive",
    description:
      "The birthplace of Ewe kente weaving. Watch weavers work on traditional wooden looms, creating the colourful striped cloth that is a symbol of Ghanaian culture. Try your hand at weaving and purchase authentic kente directly from the artisans who make it.",
    Icon: Scissors,
  },
  {
    name: "Likpe Ancestral Caves",
    distance: "~4 hr drive",
    description:
      "A network of caves in the Likpe hills used as hiding places by the Bakpele people during inter-tribal wars. The caves contain ancient pottery and artefacts. A guided tour explains the history and significance of these shelters to the local community.",
    Icon: Skull,
  },
  {
    name: "Kyabobo National Park",
    distance: "~4.5 hr drive",
    description:
      "Ghana's newest national park, covering 360 sq km of rugged terrain along the Togo border. Home to forest elephants, buffalo, and rare primates. Remote and wild, perfect if you want something truly off the beaten path.",
    Icon: Trees,
  },
];

function AttractionCard({ a }: { a: Attraction }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <a.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-bold text-dark">{a.name}</h3>
      <p className="text-xs font-semibold tracking-wider text-accent uppercase mt-1">
        {a.distance}
      </p>
      <p className="text-sm text-text-secondary mt-3 flex-1">{a.description}</p>
    </div>
  );
}

export default function AttractionsPage() {
  const enquiryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to learn more about visiting attractions around Hidden Paradise."
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="EXPLORE THE REGION"
        title="Attractions Near Us"
        description="Hidden Paradise sits at the crossroads of Ghana's Eastern and Volta regions. From our location on the Akuse Road, you can reach waterfalls, mountains, wildlife reserves, and cultural villages all within a few hours. We arrange transport, guides, and full-day packages for all of them."
      />

      <div className="max-w-[1200px] mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold text-primary mb-6 text-center">
          Eastern Region
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {EASTERN_ATTRACTIONS.map((a) => (
            <AttractionCard key={a.name} a={a} />
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mb-16">
        <h2 className="font-display text-2xl font-bold text-primary mb-6 text-center">
          Volta Region
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VOLTA_ATTRACTIONS.map((a) => (
            <AttractionCard key={a.name} a={a} />
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
        <h3 className="font-display text-xl font-bold text-primary">
          Want to visit any of these attractions?
        </h3>
        <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto">
          We organise day trips and multi-stop tours from Hidden Paradise.
          Message us to build a custom itinerary for your group.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <a
            href={enquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition"
          >
            Plan a Visit
          </a>
          <Link
            href="/tours"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-white transition"
          >
            View Tour Packages
          </Link>
        </div>
      </div>
    </main>
  );
}
