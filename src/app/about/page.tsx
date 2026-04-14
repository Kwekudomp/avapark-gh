import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import ValueCards from "@/components/ValueCards";
import { WHATSAPP_URL } from "@/data/constants";
import {
  Tent,
  HelpCircle,
  MapPin,
  Phone,
  Navigation,
  BookOpen,
  Shield,
  Eye,
  Target,
  Sparkles,
  Mountain,
  HeartPulse,
  Briefcase,
  Users,
  Leaf,
  Palette,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Hidden Paradise, Ghana's premier outdoor recreation destination. Camping, hiking, events, and more on the banks of the Volta, just an hour from Accra.",
};

const OFFERINGS: { title: string; description: string; Icon: LucideIcon }[] = [
  {
    title: "Outdoor Adventures",
    description: "Hiking, camping, picnics, outdoor games, and trail walks across our 150+ acres of green space.",
    Icon: Mountain,
  },
  {
    title: "Wellness Focus",
    description: "Relaxation spaces, mental wellness programs, yoga, and meditation in a serene natural setting.",
    Icon: HeartPulse,
  },
  {
    title: "Corporate & Church Retreats",
    description: "Customised experiences to enhance team collaboration, wellness, and productivity.",
    Icon: Briefcase,
  },
  {
    title: "Family & Group Packages",
    description: "Activities and venues designed for bonding, fun, and relaxation with people you love.",
    Icon: Users,
  },
  {
    title: "Eco-Friendly Environment",
    description: "A commitment to sustainability and creating a peaceful space that respects the land.",
    Icon: Leaf,
  },
  {
    title: "Arts & Cultural Experience",
    description: "Live music, art shows, pottery, and cultural celebrations that connect you to Ghana's creativity.",
    Icon: Palette,
  },
];

const QUICK_LINKS: { label: string; href: string; Icon: LucideIcon; desc: string }[] = [
  { label: "Our Story", href: "#our-story", Icon: BookOpen, desc: "How Hidden Paradise began and where we're headed." },
  { label: "Amenities", href: "/about/amenities", Icon: Tent, desc: "Pool, camping, restaurant, gardens, farm, and event spaces." },
  { label: "How to Get Here", href: "/about/directions", Icon: Navigation, desc: "Directions from Accra, transport options, and address." },
  { label: "Park Map", href: "/about/map", Icon: MapPin, desc: "Find your way around the park grounds." },
  { label: "Contact Numbers", href: "/about/contact-numbers", Icon: Phone, desc: "Customer service, kitchen line, 24hr hotline, and security line." },
  { label: "Rules & Safety", href: "/about/rules", Icon: Shield, desc: "Park rules, safety guidelines, and emergency information." },
  { label: "FAQ", href: "/about/faq", Icon: HelpCircle, desc: "Opening hours, booking, parking, kids, private events, and more." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="pt-32 pb-16 px-[5%] bg-bg-alt text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs tracking-[3px] uppercase text-accent font-semibold">
            ABOUT US
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-primary mt-4">
            More Than a Park. An Experience
          </h1>
        </div>
      </section>

      {/* Motto Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-accent py-16 md:py-20 px-[5%] text-center">
        <div
          className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_30%,white_0%,transparent_40%),radial-gradient(circle_at_80%_70%,white_0%,transparent_40%)]"
          aria-hidden
        />
        <div className="relative max-w-5xl mx-auto">
          <p className="text-xs md:text-sm tracking-[6px] uppercase text-white/70 font-semibold mb-4">
            Our Motto
          </p>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-white leading-tight">
            Where Nature Heals
          </h2>
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-white/40" />
            <span className="text-xs md:text-sm tracking-[3px] uppercase text-white/80">
              Hidden Paradise Nature Park
            </span>
            <span className="h-px w-16 bg-white/40" />
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section id="our-story" className="py-24 px-[5%] scroll-mt-24">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <Image
              src="/images/venue/gardens.jpeg"
              alt="Hidden Paradise sunset gardens"
              width={600}
              height={800}
              className="rounded-2xl object-cover shadow-xl"
            />
          </div>

          <div className="text-text-secondary leading-relaxed space-y-6">
            <p>
              Hidden Paradise Nature Park is a 300-acre tourism hub and outdoor
              recreation destination on Akuse Road, in Ghana&apos;s Eastern/Volta region,
              about an hour&apos;s drive from Accra. Set in lush forest land with views
              of the Akwapem-Togo Range, the Volta Lake, the Kpong Dam, and the
              Krobo, Yogaga, and Osudoku Mountains, we&apos;ve built a community where
              adventure, culture, and relaxation come together.
            </p>
            <p>
              Currently operating on 30 acres, our grounds feature camping
              facilities, a LED-lit swimming pool, sunset gardens, a working farm,
              event spaces, and the Hidden Grill restaurant, all set against
              the stunning backdrop of Ghana&apos;s Eastern corridor. From a quiet
              stroll on a trail to a fitness class or pottery session, there&apos;s
              something here for everyone.
            </p>
            <p>
              Whether you&apos;re planning a weekend camping trip, a mountain
              hike, a family day, or a corporate event, Hidden Paradise
              delivers experiences that reconnect you with nature and community.
              And this is just the beginning: our master plan extends to 300 acres,
              with residential plots, chalets, a marina, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Vision · Mission · Motto */}
      <section className="py-24 px-[5%] bg-bg-alt">
        <SectionHeader tag="OUR PURPOSE" title="Vision, Mission & Motto" />
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="w-12 h-12 mb-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Eye className="w-6 h-6 text-accent" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-semibold tracking-[2px] uppercase text-accent mb-2">
              Our Vision
            </p>
            <p className="text-text-secondary leading-relaxed">
              To connect people and communities through the power of nature,
              wellness, and recreational activities.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-8">
            <div className="w-12 h-12 mb-5 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-accent" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-semibold tracking-[2px] uppercase text-accent mb-2">
              Our Mission
            </p>
            <p className="text-text-secondary leading-relaxed">
              To provide quality year-round recreational activities, facilities,
              and services that are safe, fun, and enhance the quality of life
              for all.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary to-accent text-white rounded-2xl p-8">
            <div className="w-12 h-12 mb-5 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <p className="text-xs font-semibold tracking-[2px] uppercase text-white/80 mb-2">
              Our Motto
            </p>
            <p className="font-display text-3xl font-semibold leading-tight">
              Where Nature Heals
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-[5%]">
        <SectionHeader tag="WHAT WE STAND FOR" title="Our Core Values" />
        <ValueCards />
      </section>

      {/* What We Offer */}
      <section className="py-24 px-[5%] bg-bg-alt">
        <SectionHeader tag="WHAT WE OFFER" title="Experiences That Restore" />
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
          {OFFERINGS.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <item.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-bold text-dark mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links to Subpages */}
      <section className="py-24 px-[5%]">
        <SectionHeader tag="LEARN MORE" title="Everything You Need to Know" />
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-2xl border border-border p-6 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col"
            >
              <div className="w-12 h-12 mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <link.Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-bold text-dark">
                {link.label}
              </h3>
              <p className="text-xs text-text-secondary mt-2 flex-1">
                {link.desc}
              </p>
              <p className="text-accent text-sm font-semibold mt-4">
                View &rarr;
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark text-white py-24 px-[5%] text-center">
        <p className="text-xs tracking-[3px] uppercase font-semibold text-secondary-light">
          READY FOR YOUR ADVENTURE?
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mt-4">
          Book Your Hidden Paradise Experience
        </h2>
        <div className="flex gap-4 justify-center mt-10 flex-wrap">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-white px-8 py-4 rounded-full font-medium hover:bg-accent-dark hover:-translate-y-0.5 transition-all"
          >
            WhatsApp Us
          </a>
          <Link
            href="/contact"
            className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-medium hover:bg-white/10 transition-all"
          >
            Send Inquiry
          </Link>
        </div>
      </section>
    </>
  );
}
