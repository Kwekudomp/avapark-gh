import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";
import ValueCards from "@/components/ValueCards";
import ScrollReveal from "@/components/ScrollReveal";
import { WHATSAPP_URL, PHONE_TEL, PHONE_DISPLAY, EMAIL, INSTAGRAM_URL, TIKTOK_URL } from "@/data/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Hidden Paradise, Ghana's premier outdoor recreation destination. Camping, hiking, events, and more on the banks of the Volta, just an hour from Accra.",
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
    title: "The Hidden Grill Restaurant",
    description:
      "On-site restaurant serving local favourites, from grilled meats to traditional dishes.",
  },
  {
    title: "Hidden Paradise Farm",
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
            More Than a Park. An Experience
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
              alt="Hidden Paradise sunset gardens"
              width={600}
              height={800}
              className="rounded-2xl object-cover shadow-xl"
            />
          </div>

          {/* Right — Text */}
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
                Hidden Paradise, Akuse Road
                <br />
                Okwenya, Eastern/Volta Region
                <br />
                Ghana
              </p>
              <p>
                About an hour&apos;s drive east of Accra. Self-drive is
                recommended. Bus options are available at a fee, so contact
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
                  href={`tel:${PHONE_TEL}`}
                  className="hover:text-accent transition"
                >
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="hover:text-accent transition"
                >
                  {EMAIL}
                </a>
              </li>
              <li>
                <a
                  href="https://www.hiddenparadisegh.com"
                  className="hover:text-accent transition"
                >
                  www.hiddenparadisegh.com
                </a>
              </li>
            </ul>

            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-all hover:border-[#E1306C] hover:bg-[#E1306C] hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-all hover:border-dark hover:bg-dark hover:text-white">
                <svg width="16" height="18" viewBox="0 0 448 512" fill="currentColor"><path d="M448 209.9a210.1 210.1 0 01-122.8-39.3v178.8A162.6 162.6 0 11185 188.3v89.9a74.6 74.6 0 1052.2 71.2V0h88a121 121 0 00122.8 120.1v89.8z"/></svg>
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-all hover:border-[#25D366] hover:bg-[#25D366] hover:text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Park Rules & Regulations */}
      <section className="py-24 px-[5%]">
        <SectionHeader tag="KNOW BEFORE YOU VISIT" title="Park Rules & Regulations" />
        <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "No smoking in restricted areas",
            "No outside alcohol (drinks available at the bar)",
            "Children under 12 must be supervised by an adult at all times",
            "No pets allowed on the premises",
            "No loud music after 12am (midnight) on weekdays",
            "All guests must check in at reception upon arrival",
            "Swimming pool hours: 9am to 10pm (no lifeguard after 8pm)",
            "Campfires only in designated bonfire areas",
            "Please dispose of waste in the bins provided",
          ].map((rule) => (
            <div
              key={rule}
              className="flex items-start gap-3 bg-bg-alt rounded-xl p-4 border border-border"
            >
              <span className="text-accent font-bold text-sm mt-0.5">●</span>
              <p className="text-sm text-text-secondary">{rule}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safety & Property Damages */}
      <section className="py-24 px-[5%] bg-bg-alt">
        <SectionHeader tag="YOUR SAFETY MATTERS" title="Safety & Property Damages" />
        <div className="max-w-[900px] mx-auto space-y-4">
          {[
            "Hidden Paradise is not liable for loss or theft of personal belongings. Please keep your valuables secure.",
            "Guests are responsible for any damage to tents, equipment, or property during their stay.",
            "A damage deposit may be required for certain equipment rentals.",
            "First aid is available at the reception area.",
            "In case of emergency, contact park security or call the front desk immediately.",
            "All adventure activities (ATV, hiking, horse riding) are done at your own risk. Safety briefings are provided before each activity.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 bg-white rounded-xl p-5 border border-border"
            >
              <span className="text-primary font-bold text-sm mt-0.5">⚠</span>
              <p className="text-sm text-text-secondary">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-[5%]">
        <SectionHeader tag="GOT QUESTIONS?" title="Frequently Asked Questions" />
        <div className="max-w-[900px] mx-auto space-y-4">
          {[
            {
              q: "What are the opening hours?",
              a: "Mon to Wed: 9am to 1am (Weekday Sanctuary, free entry). Thursday: 5pm to 11pm (Game Night). Friday: 5pm to 3am (Party in the Woods). Saturday: 6:30pm to 2am (BBQ & Cinema). Sunday: 9am to 5pm (Family Day).",
            },
            {
              q: "Is there an entry fee?",
              a: "It varies by day and event. Check our Experiences page for current pricing, or message us on WhatsApp for details.",
            },
            {
              q: "Can I bring my own food?",
              a: "Outside food is allowed, but we highly recommend trying The Hidden Grill for local favourites and grilled meats.",
            },
            {
              q: "Is there parking?",
              a: "Yes, free parking is available on-site for all guests.",
            },
            {
              q: "How do I book?",
              a: "You can book through our website, send us a message on WhatsApp, or simply walk in. For camping and special events, we recommend booking ahead.",
            },
            {
              q: "Is the park child-friendly?",
              a: "Absolutely. Sundays are dedicated Family Day with activities for kids of all ages, including the Kids Zone, horse riding, and a traditional buffet.",
            },
            {
              q: "Do you host private events?",
              a: "Yes! We host corporate retreats, weddings, birthdays, and private parties. Contact us to discuss your event and we'll put together a package for you.",
            },
            {
              q: "Is there WiFi?",
              a: "Limited WiFi is available around the restaurant area. But honestly, we encourage you to disconnect and enjoy the nature around you.",
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group bg-white rounded-xl border border-border overflow-hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer p-5 text-sm font-bold text-dark hover:text-accent transition">
                {faq.q}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0 ml-4 transition-transform group-open:rotate-180"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Park Map */}
      <section className="py-24 px-[5%] bg-bg-alt">
        <SectionHeader tag="FIND YOUR WAY" title="Park Map" />
        <div className="max-w-[900px] mx-auto">
          <div className="bg-white rounded-2xl border border-border p-8 sm:p-12 text-center">
            <span className="text-5xl block mb-4">🗺️</span>
            <h3 className="font-display text-xl font-bold text-primary mb-2">
              Site Map Coming Soon
            </h3>
            <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">
              We&apos;re putting together a detailed map of the park grounds showing
              camping areas, the pool, restaurant, event spaces, trails, and more.
              It will be available to view and download here shortly.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition"
            >
              Ask Us for Directions on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Contact Numbers */}
      <section className="py-24 px-[5%]">
        <SectionHeader tag="REACH US" title="Contact Numbers" />
        <div className="max-w-[900px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href={`tel:${PHONE_TEL}`}
            className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
          >
            <span className="text-3xl block mb-2">📞</span>
            <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
              Main Line
            </p>
            <p className="text-sm font-bold text-dark">{PHONE_DISPLAY}</p>
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
          >
            <span className="text-3xl block mb-2">🍽️</span>
            <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
              Kitchen Line
            </p>
            <p className="text-sm font-bold text-dark">{PHONE_DISPLAY}</p>
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
          >
            <span className="text-3xl block mb-2">🎧</span>
            <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
              Customer Service
            </p>
            <p className="text-sm font-bold text-dark">{PHONE_DISPLAY}</p>
          </a>
          <a
            href={`tel:${PHONE_TEL}`}
            className="bg-white rounded-2xl border border-border p-6 text-center hover:shadow-md transition-shadow"
          >
            <span className="text-3xl block mb-2">🚨</span>
            <p className="text-xs font-semibold tracking-wider text-accent uppercase mb-1">
              24hr Hotline
            </p>
            <p className="text-sm font-bold text-dark">{PHONE_DISPLAY}</p>
          </a>
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
