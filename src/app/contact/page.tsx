import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Ava Park. Send an inquiry, call us, or reach out via WhatsApp. Located on Akuse Road, about an hour east of Accra, Ghana.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero banner */}
      <section className="py-32 pt-40 px-[5%] bg-bg-alt text-center">
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-primary">
          Get In Touch
        </h1>
        <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
          Have questions or ready to book? We&apos;d love to hear from you.
        </p>
      </section>

      {/* Content section */}
      <section className="py-24 px-[5%]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Left column — Form */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-2xl font-semibold text-primary mb-8">
              Send Us an Inquiry
            </h2>
            <InquiryForm />
          </div>

          {/* Right column — Sidebar */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28">
              {/* Contact card */}
              <div className="bg-white rounded-2xl border border-border p-8">
                <h3 className="text-xs tracking-[3px] font-semibold text-primary mb-6">
                  CONTACT INFO
                </h3>
                <div className="space-y-4">
                  {/* Phone */}
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-accent mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                      />
                    </svg>
                    <a
                      href="tel:+233540879700"
                      className="text-sm text-text hover:text-accent transition-colors"
                    >
                      +233 (0) 540 879 700
                    </a>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-accent mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                      />
                    </svg>
                    <a
                      href="mailto:info@avapark-gh.com"
                      className="text-sm text-text hover:text-accent transition-colors"
                    >
                      info@avapark-gh.com
                    </a>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-accent mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                    <p className="text-sm text-text">
                      Ava Park, Akuse Road, Okwenya
                      <br />
                      <span className="text-text-secondary">
                        (about an hour east of Accra)
                      </span>
                    </p>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-accent mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                    <p className="text-sm text-text">
                      Thursdays &ndash; Sundays + Special Events
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp card */}
              <div className="bg-whatsapp/10 rounded-2xl p-8 mt-6">
                <h3 className="font-semibold text-primary">Prefer WhatsApp?</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  For quick responses, message us directly on WhatsApp.
                </p>
                <a
                  href="https://wa.me/233540879700"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-whatsapp text-white w-full py-3 rounded-full font-medium mt-4 hover:bg-whatsapp/90 transition-all text-center block"
                >
                  Chat on WhatsApp
                </a>
              </div>

              {/* Social links */}
              <div className="mt-6">
                <h3 className="text-xs tracking-[3px] font-semibold text-primary mb-4">
                  FOLLOW US
                </h3>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/avapark_gh"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-xs font-semibold text-text-secondary transition-all hover:border-accent hover:bg-accent hover:text-white"
                  >
                    IG
                  </a>
                  <a
                    href="https://wa.me/233540879700"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-xs font-semibold text-text-secondary transition-all hover:border-whatsapp hover:bg-whatsapp hover:text-white"
                  >
                    WA
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
