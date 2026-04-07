import SectionHeader from "@/components/SectionHeader";
import HowToGetHere from "@/components/HowToGetHere";
import { WHATSAPP_URL, PHONE_TEL, PHONE_DISPLAY, EMAIL, INSTAGRAM_URL, TIKTOK_URL } from "@/data/constants";

export const metadata = {
  title: "How to Get Here | Hidden Paradise Nature Park",
  description:
    "Directions to Hidden Paradise Nature Park on Akuse Road, Okwenya. About an hour east of Accra. Self-drive, bus, or airport transfer options.",
};

export default function DirectionsPage() {
  return (
    <main className="pt-28 pb-24">
      <section className="px-[5%] mb-12">
        <SectionHeader tag="VISIT US" title="How to Get Here" />
        <div className="max-w-[900px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="text-text-secondary leading-relaxed space-y-6">
            <p>
              Hidden Paradise, Akuse Road
              <br />
              Okwenya, Eastern/Volta Region
              <br />
              Ghana
            </p>
            <p>
              About an hour&apos;s drive east of Accra. Self-drive is recommended.
              Bus options are available at a fee, so contact us for details.
            </p>
            <p>
              For visitors from abroad: We&apos;re easily accessible from Kotoka
              International Airport. You can arrange transport through Uber, Bolt,
              or contact us directly and we&apos;ll help arrange your transfer.
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-[3px] uppercase font-semibold mb-4">
              CONTACT
            </h3>
            <ul className="space-y-3 text-text-secondary">
              <li>
                <a href={`tel:${PHONE_TEL}`} className="hover:text-accent transition">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`} className="hover:text-accent transition">
                  {EMAIL}
                </a>
              </li>
              <li>
                <a href="https://www.hiddenparadisegh.com" className="hover:text-accent transition">
                  www.hiddenparadisegh.com
                </a>
              </li>
            </ul>

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

      <HowToGetHere />
    </main>
  );
}
