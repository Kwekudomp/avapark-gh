import Image from "next/image";
import { MessageCircle, Phone } from "lucide-react";
import { WHATSAPP_URL } from "@/data/constants";

export const metadata = {
  title: "We'll be right back",
  description: "Hidden Paradise is making some improvements. The website will be back online shortly.",
};

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="max-w-xl w-full text-center">
        <Image
          src="/hp-logo.png"
          alt="Hidden Paradise Nature Park"
          width={140}
          height={140}
          className="mx-auto"
          priority
        />

        <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary mt-8 leading-tight">
          We&apos;ll be right back
        </h1>

        <p className="text-text-secondary text-lg mt-5 leading-relaxed">
          We&apos;re making some improvements to the Hidden Paradise website. The full site will be back online shortly.
        </p>

        <p className="text-text-secondary mt-4 leading-relaxed">
          In the meantime, our team is still here. Reach us on WhatsApp to make a booking, ask about an event, or plan your visit.
        </p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-whatsapp text-white px-7 py-3.5 rounded-full font-medium text-base shadow-sm hover:shadow-md hover:scale-[1.02] transition-all mt-8"
        >
          <MessageCircle className="w-5 h-5" strokeWidth={2} />
          Chat on WhatsApp
        </a>

        <p className="text-text-secondary text-sm mt-6 flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          Or call us on{" "}
          <a
            href="tel:+233540879700"
            className="text-primary font-medium hover:text-primary-light transition"
          >
            +233 540 879 700
          </a>
        </p>

        <p className="text-text-secondary/60 text-xs mt-12">
          Thank you for your patience.
        </p>
      </div>
    </main>
  );
}
