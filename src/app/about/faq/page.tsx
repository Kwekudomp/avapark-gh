import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "FAQ | Hidden Paradise Nature Park",
  description:
    "Frequently asked questions about Hidden Paradise Nature Park. Location, hours, entry fees, food, parking, camping, parties, pets, and more.",
};

const FAQS = [
  {
    q: "How do I locate Hidden Paradise Nature Park?",
    a: "Go to the location icon on the website for directions and a map. We're on Akuse Road in Okwenya, about an hour's drive east of Accra.",
  },
  {
    q: "What are the hours of operation?",
    a: "All visitor areas are closed from 12 midnight to 6am, seven days a week. Outside of those hours, the park is open for recreational use.",
  },
  {
    q: "Is there a charge to get into the park?",
    a: "There is no admission fee to enter the park during regular park hours.",
  },
  {
    q: "Can I take an Uber, Bolt, Taxi, or Yango to the park?",
    a: "Yes! We welcome ride-share vehicles, taxi cabs, and private cars into the park.",
  },
  {
    q: "Is food available?",
    a: "Yes! We have a variety of food, snack, and refreshment options in the park. Menus can vary seasonally. The Hidden Paradise Food Court has a range of food vendors you can choose from.",
  },
  {
    q: "What forms of payment do you accept?",
    a: "We accept Visa, MasterCard, MTN MoMo, and VodaCash. On park, we also accept cash payments.",
  },
  {
    q: "Can I take pictures at the park?",
    a: "Yes, personal photography is welcome. However, commercial photography, videotaping, and sound recording devices are only allowed with prior permission from management.",
  },
  {
    q: "How can I make a campground reservation?",
    a: "To make a campground reservation, please call 0230 555 500 between 7:00 AM and 6:00 PM.",
  },
  {
    q: "Are the attractions open year-round?",
    a: "Hidden Paradise is open year-round. However, some attractions may not be available at certain times. Please visit the Event Calendar page for attraction availability on the date of your visit.",
  },
  {
    q: "How do I reserve a park facility?",
    a: "Please call 0230 555 500 for all park facility bookings. Reservations can also be made in person at the Hidden Paradise Nature Park Office in Okwenya.",
  },
  {
    q: "Where can I find a list of upcoming festivals and concerts?",
    a: "Check out the Festivals & Concerts page under the Explore menu, or visit our Event Calendar for the latest listings.",
  },
  {
    q: "Can I play music in the park?",
    a: "Loud music, speakers, and amplifiers are not allowed except at events approved by management. Personal music devices kept at a reasonable volume and not disturbing others are permitted.",
  },
  {
    q: "Where can I report or find a lost item?",
    a: "For lost items, please call 0230 555 500 or visit the front office. We'll do our best to help you locate your belongings.",
  },
  {
    q: "Do you offer free WiFi?",
    a: "Yes, we have free WiFi in our camping area.",
  },
  {
    q: "What's the minimum age to be in the park without supervision?",
    a: "Guests under 18 need an accompanying adult after 10pm. The accompanying adult should ideally be a chaperone or guardian. Security may question someone who is 19 and claiming to be the adult for a group of minors.",
  },
  {
    q: "Do you have locker facilities?",
    a: "Yes, we offer guests unlimited access to lockers during the course of the day. Lockers are available on a first come, first served basis. For pricing and details, call 0230 555 500.",
  },
  {
    q: "How do I book a group visit to the park?",
    a: "Visit the Event Calendar on this website to learn more about our programmes and bookings, or call 0230 555 500.",
  },
  {
    q: "What happens if it rains during my visit?",
    a: "Some attractions may close in bad weather until conditions allow safe operation. Feel free to enjoy a meal or browse the vendors until the weather passes. We do not issue rain checks or refunds for weather.",
  },
  {
    q: "Am I allowed to bring my own food and beverages into the park?",
    a: "No outside food, beverages, or coolers are allowed. Exceptions are made for guests with special dietary needs, food allergies, and baby food or formula. Guests with dietary needs should stop at the Front Gate office on arrival.",
  },
  {
    q: "How do I re-enter the park if I need to leave?",
    a: "If you need to leave and come back the same day, get your hand stamped at the Front Gate. If you're driving out, present your parking receipt to the attendant when you return.",
  },
  {
    q: "Do you allow pets?",
    a: "Only service animals are permitted in the park. We do not have pet care facilities on site.",
  },
  {
    q: "How early can I arrive for my party?",
    a: "We start setting up your party 15 minutes before the scheduled time, so feel free to arrive around then. If you arrive earlier, your room or table may not be ready due to other events before yours.",
  },
  {
    q: "What am I allowed to bring to a party?",
    a: "With a paid birthday party, feel free to bring single-serve cupcakes or cookies, candles, and presents. All other items can be purchased through the park. We do not allow outside food and drinks.",
  },
  {
    q: "Do you do parties on weekdays?",
    a: "Yes! We do parties 7 days a week. Weekdays are great for families who want the park to themselves. You can book a party any time online or through our customer service.",
  },
  {
    q: "How far in advance should I book a party?",
    a: "We recommend booking at least 2 weeks before your party to get the time and date you want. The easiest way is to book online through our website or call our customer service centre.",
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
