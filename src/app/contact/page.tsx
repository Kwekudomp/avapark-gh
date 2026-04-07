import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { WHATSAPP_URL, PHONE_TEL, PHONE_DISPLAY, EMAIL, INSTAGRAM_URL, TIKTOK_URL } from "@/data/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Hidden Paradise. Send an inquiry, call us, or reach out via WhatsApp. Located on Akuse Road, about an hour east of Accra, Ghana.",
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
                      href={`tel:${PHONE_TEL}`}
                      className="text-sm text-text hover:text-accent transition-colors"
                    >
                      {PHONE_DISPLAY}
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
                      href={`mailto:${EMAIL}`}
                      className="text-sm text-text hover:text-accent transition-colors"
                    >
                      {EMAIL}
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
                      Hidden Paradise, Akuse Road, Okwenya
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
                  href={WHATSAPP_URL}
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
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Instagram"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-all hover:border-[#E1306C] hover:bg-[#E1306C] hover:text-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                  <a
                    href={TIKTOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on TikTok"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-all hover:border-dark hover:bg-dark hover:text-white"
                  >
                    <svg width="16" height="18" viewBox="0 0 448 512" fill="currentColor"><path d="M448 209.9a210.1 210.1 0 01-122.8-39.3v178.8A162.6 162.6 0 11185 188.3v89.9a74.6 74.6 0 1052.2 71.2V0h88a121 121 0 00122.8 120.1v89.8z"/></svg>
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary transition-all hover:border-[#25D366] hover:bg-[#25D366] hover:text-white"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
