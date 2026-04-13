import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import { WHATSAPP_NUMBER } from "@/data/constants";
import {
  Flame,
  Music,
  Palette,
  Brush,
  Mic2,
  PartyPopper,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Art & Culture | Hidden Paradise Nature Park",
  description:
    "Experience Ghanaian art and culture at Hidden Paradise. Fireside storytelling, traditional drumming and dancing, art exhibitions, pottery classes, live music, and cultural festivals.",
};

interface Offering {
  name: string;
  tag: string;
  description: string;
  Icon: LucideIcon;
}

const ART_AND_CULTURE: Offering[] = [
  {
    name: "Fireside Storytelling",
    tag: "Evenings",
    description:
      "Gather around the bonfire under the stars as elders and griots share folk tales, proverbs, and Anansesem stories that have been passed down for generations. A relaxed, magical way to end the day.",
    Icon: Flame,
  },
  {
    name: "Drumming & Dancing",
    tag: "Live Sessions",
    description:
      "Join live drum circles led by master drummers from the Volta and Eastern regions. Learn traditional rhythms, dance steps, and the meaning behind each performance. Beginners always welcome.",
    Icon: Music,
  },
  {
    name: "Art Exhibitions",
    tag: "Rotating",
    description:
      "Rotating showcases featuring Ghanaian painters, sculptors, photographers, and mixed-media artists. Many pieces are available to purchase directly from the artists during their exhibition runs.",
    Icon: Palette,
  },
  {
    name: "Pottery & Crafts Classes",
    tag: "Hands-On",
    description:
      "Get your hands dirty in a guided pottery, beadwork, or crafts session. Take home what you make and learn techniques inspired by Krobo bead traditions and Eastern region artisans.",
    Icon: Brush,
  },
  {
    name: "Live Music Nights",
    tag: "Special Events",
    description:
      "Live performances from highlife bands, afrobeats artists, acoustic singer-songwriters, and traditional ensembles. Check the event calendar for upcoming line-ups.",
    Icon: Mic2,
  },
  {
    name: "Cultural Festivals",
    tag: "Seasonal",
    description:
      "Celebrate Ghanaian heritage through curated festival days featuring food, fashion, music, and dance from across the country. A full-day immersion into the culture that makes Ghana home.",
    Icon: PartyPopper,
  },
];

function OfferingCard({ o }: { o: Offering }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <o.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="font-display text-lg font-bold text-dark">{o.name}</h3>
      <p className="text-xs font-semibold tracking-wider text-accent uppercase mt-1">
        {o.tag}
      </p>
      <p className="text-sm text-text-secondary mt-3 flex-1">{o.description}</p>
    </div>
  );
}

export default function ArtsCulturePage() {
  const enquiryUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi, I'd like to learn more about the art and culture experiences at Hidden Paradise."
  )}`;

  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="ART & CULTURE"
        title="Where Heritage Comes Alive"
        description="Hidden Paradise is more than nature \u2014 it's a stage for Ghanaian art, music, and storytelling. From bonfire tales to live drumming and rotating art exhibitions, our cultural programming celebrates the people, traditions, and creativity of the Eastern and Volta regions."
      />

      <div className="max-w-[1200px] mx-auto mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ART_AND_CULTURE.map((o) => (
            <OfferingCard key={o.name} o={o} />
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 text-center">
        <h3 className="font-display text-xl font-bold text-primary">
          Want to host or join a cultural event?
        </h3>
        <p className="text-sm text-text-secondary mt-2 max-w-xl mx-auto">
          We work with artists, performers, schools, and cultural groups to
          curate experiences for visitors and private bookings. Reach out and
          let&apos;s build something memorable together.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <a
            href={enquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition"
          >
            Talk to Us
          </a>
          <Link
            href="/event-calendar"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-white transition"
          >
            View Event Calendar
          </Link>
        </div>
      </div>
    </main>
  );
}
