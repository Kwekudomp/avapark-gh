import Link from "next/link";
import { WHATSAPP_URL } from "@/data/constants";

export default function DiasporaCTA() {
  return (
    <section className="tropical-gradient py-24 px-[5%]">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs tracking-[3px] uppercase text-accent font-semibold">
          VISITING GHANA?
        </p>

        <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary mt-4 leading-tight">
          Make Ava Park Part of Your Itinerary
        </h2>

        <p className="text-text-secondary text-lg mt-6 leading-relaxed">
          Whether you&apos;re visiting family, exploring the motherland, or
          celebrating a milestone &mdash; we&apos;ll create an unforgettable
          experience just an hour from Accra. Camping, hiking, pool parties, and
          more await.
        </p>

        <div className="flex gap-4 justify-center mt-10 flex-wrap">
          <Link
            href="/contact"
            className="bg-accent text-white px-8 py-4 rounded-full font-medium hover:bg-accent-dark hover:-translate-y-0.5 transition-all"
          >
            Send an Inquiry
          </Link>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-primary text-primary px-8 py-4 rounded-full font-medium hover:bg-primary hover:text-white transition-all"
          >
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}
