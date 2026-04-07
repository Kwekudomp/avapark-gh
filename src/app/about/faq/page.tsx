import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "FAQ | Hidden Paradise Nature Park",
  description:
    "Frequently asked questions about Hidden Paradise. Opening hours, entry fees, booking, parking, kids, private events, and more.",
};

const FAQS = [
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
];

export default function FaqPage() {
  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader tag="GOT QUESTIONS?" title="Frequently Asked Questions" />
      <div className="max-w-[900px] mx-auto space-y-4">
        {FAQS.map((faq) => (
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
    </main>
  );
}
