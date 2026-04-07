import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import ValueCards from "@/components/ValueCards";
import { WHATSAPP_URL } from "@/data/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Hidden Paradise, Ghana's premier outdoor recreation destination. Camping, hiking, events, and more on the banks of the Volta, just an hour from Accra.",
};

const QUICK_LINKS = [
  { label: "Amenities", href: "/about/amenities", icon: "🏕️", desc: "Pool, camping, restaurant, gardens, farm, and event spaces." },
  { label: "FAQ", href: "/about/faq", icon: "❓", desc: "Opening hours, booking, parking, kids, private events, and more." },
  { label: "Park Map", href: "/about/map", icon: "🗺️", desc: "Find your way around the park grounds." },
  { label: "Contact Numbers", href: "/about/contact-numbers", icon: "📞", desc: "Main line, kitchen, customer service, and 24hr hotline." },
  { label: "How to Get Here", href: "/about/directions", icon: "📍", desc: "Directions from Accra, transport options, and address." },
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

      {/* Brand Story */}
      <section className="py-24 px-[5%]">
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
              recreation destination on Akuse Road, in Ghana&apos;s Eastern/Volta region
              , about an hour&apos;s drive from Accra. Set in lush forest
              land with proximity to the Volta, we&apos;ve built a community where
              adventure, culture, and relaxation come together.
            </p>
            <p>
              Currently operating on 30 acres, our grounds feature camping
              facilities, a LED-lit swimming pool, sunset gardens, a working farm,
              event spaces, and the Hidden Grill restaurant, all set against
              the stunning backdrop of Ghana&apos;s Eastern corridor.
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

      {/* Values Section */}
      <section className="py-24 px-[5%] bg-bg-alt">
        <SectionHeader tag="WHAT WE STAND FOR" title="Our Values" />
        <ValueCards />
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
              <span className="text-3xl mb-3">{link.icon}</span>
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
