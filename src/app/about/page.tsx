import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import ValueCards from "@/components/ValueCards";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ava Park — Ghana's premier outdoor recreation destination. Camping, hiking, events, and more on the banks of the Volta, just an hour from Accra.",
};

const amenities = [
  {
    title: "Camping Grounds",
    description:
      "Spacious green lawns with tent camping setup for groups of all sizes. Tents available or bring your own.",
  },
  {
    title: "Swimming Pool",
    description:
      "Our LED-lit pool is the centrepiece for pool parties, night swims, and daytime relaxation.",
  },
  {
    title: "Sunset Gardens",
    description:
      "Beautifully landscaped gardens perfect for photography, events, and peaceful walks.",
  },
  {
    title: "Ava Grill Restaurant",
    description:
      "On-site restaurant serving local favourites — from grilled meats to traditional dishes.",
  },
  {
    title: "Ava Farm",
    description:
      "A working farm where you can tour, buy fresh produce, and learn about sustainable farming.",
  },
  {
    title: "Event Spaces",
    description:
      "Outdoor event areas with canopy setups for weddings, corporate retreats, birthdays, and more.",
  },
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
            More Than a Park &mdash; An Experience
          </h1>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-24 px-[5%]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Image */}
          <div>
            <Image
              src="/images/venue/gardens.jpeg"
              alt="Ava Park sunset gardens"
              width={600}
              height={800}
              className="rounded-2xl object-cover shadow-xl"
            />
          </div>

          {/* Right — Text */}
          <div className="text-text-secondary leading-relaxed space-y-6">
            <p>
              Ava Park is a nature-inspired recreation and events destination
              nestled on Akuse Road in Ghana&apos;s Eastern Region, about an
              hour&apos;s drive from Accra. What started as a vision to create
              an outdoor escape has grown into a thriving community hub for
              adventure, relaxation, and celebration.
            </p>
            <p>
              Our grounds feature camping facilities, a swimming pool, sunset
              gardens, a working farm, and the Ava Grill restaurant &mdash; all
              set against the backdrop of Ghana&apos;s beautiful eastern
              landscape.
            </p>
            <p>
              Whether you&apos;re looking for a weekend camping trip, a
              thrilling mountain hike, a fun night out with friends, or the
              perfect venue for your event &mdash; Ava Park delivers experiences
              that reconnect you with nature and community.
            </p>
          </div>
        </div>
      </section>

      {/* Amenities Grid */}
      <section className="py-24 px-[5%] bg-bg-alt">
        <SectionHeader tag="OUR AMENITIES" title="Everything You Need" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1400px] mx-auto">
          {amenities.map((amenity, i) => (
            <ScrollReveal key={amenity.title} delay={i * 0.1}>
              <div className="bg-white rounded-2xl p-6 border border-border hover:-translate-y-1 hover:shadow-lg transition-all">
                <h3 className="font-display text-lg font-semibold text-primary mb-2">
                  {amenity.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {amenity.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-[5%]">
        <SectionHeader tag="WHAT WE STAND FOR" title="Our Values" />
        <ValueCards />
      </section>

      {/* Getting Here */}
      <section className="py-24 px-[5%] bg-bg-alt">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — Visit Us */}
          <div>
            <h2 className="text-xs tracking-[3px] uppercase font-semibold mb-6">
              GETTING HERE
            </h2>
            <div className="space-y-6 text-text-secondary leading-relaxed">
              <p>
                Ava Park, Akuse Road
                <br />
                Okwenya, Eastern Region
                <br />
                Ghana
              </p>
              <p>
                About an hour&apos;s drive east of Accra. Self-drive is
                recommended. Bus options are available at a fee &mdash; contact
                us for details.
              </p>
              <p>
                For visitors from abroad: We&apos;re easily accessible from
                Kotoka International Airport. You can arrange transport through
                Uber, Bolt, or contact us directly and we&apos;ll help arrange
                your transfer.
              </p>
            </div>
          </div>

          {/* Right — Contact */}
          <div>
            <h2 className="text-xs tracking-[3px] uppercase font-semibold mb-6">
              CONTACT
            </h2>
            <ul className="space-y-4 text-text-secondary leading-relaxed">
              <li>
                <a
                  href="tel:+233540879700"
                  className="hover:text-accent transition"
                >
                  +233 (0) 540 879 700
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@avapark-gh.com"
                  className="hover:text-accent transition"
                >
                  info@avapark-gh.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/avapark_gh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition"
                >
                  @avapark_gh
                </a>
              </li>
              <li>
                <a
                  href="https://www.avapark-gh.com"
                  className="hover:text-accent transition"
                >
                  www.avapark-gh.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark text-white py-24 px-[5%] text-center">
        <p className="text-xs tracking-[3px] uppercase font-semibold text-secondary-light">
          READY FOR YOUR ADVENTURE?
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mt-4">
          Book Your Ava Park Experience
        </h2>
        <div className="flex gap-4 justify-center mt-10 flex-wrap">
          <a
            href="https://wa.me/233540879700"
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
