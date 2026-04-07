import Link from "next/link";
import { PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "@/data/constants";

const DIRECTIONS = [
  { step: "1", label: "From Accra, take the N2 motorway heading east towards Tema." },
  { step: "2", label: "Continue past Tema and Ashaiman onto the Accra–Aflao highway." },
  { step: "3", label: "Drive through Akuse and look for the Hidden Paradise signage on Akuse Road." },
  { step: "4", label: "Turn onto Okwenya road. The park entrance is 500m ahead on your left." },
];

export default function HowToGetHere() {
  return (
    <section id="directions" className="py-24 px-[5%] bg-white">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[4px] uppercase text-accent mb-3">
            PLAN YOUR VISIT
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-dark">
            How to Get Here
          </h2>
          <p className="text-text-secondary mt-4 max-w-lg mx-auto">
            About an hour east of Accra. Easy to find, impossible to forget.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-border h-80 lg:h-full min-h-[320px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.0!2d0.079928!3d6.102123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMDYnMDcuNiJOIDDCsDA0JzQ3LjciRQ!5e0!3m2!1sen!2sgh!4v1234567890!5m2!1sen!2sgh"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "320px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Hidden Paradise Nature Park location"
            />
          </div>

          {/* Info panel */}
          <div className="flex flex-col gap-8">
            {/* Address */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-accent text-lg">📍</span>
              </div>
              <div>
                <h3 className="font-semibold text-dark mb-1">Address</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Akuse Road, Okwenya<br />
                  Eastern Region, Ghana<br />
                  <span className="text-xs text-accent font-medium">~1 hour east of Accra</span>
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-accent text-lg">🕒</span>
              </div>
              <div>
                <h3 className="font-semibold text-dark mb-1">Opening Hours</h3>
                <div className="text-sm text-text-secondary space-y-0.5">
                  <p><span className="text-dark font-medium">Weekdays:</span> 9:00 AM – 1:00 AM</p>
                  <p><span className="text-dark font-medium">Weekends:</span> 9:00 AM – 3:00 AM</p>
                </div>
              </div>
            </div>

            {/* Driving directions */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-accent text-lg">🚗</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dark mb-3">Driving from Accra</h3>
                <ol className="space-y-2">
                  {DIRECTIONS.map((d) => (
                    <li key={d.step} className="flex gap-3 text-sm text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {d.step}
                      </span>
                      {d.label}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://maps.google.com/?q=6.102123,0.079928"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-light transition-colors"
              >
                Open in Google Maps
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-border text-dark px-5 py-2.5 rounded-full text-sm font-medium hover:border-accent hover:text-accent transition-colors"
              >
                Need directions? WhatsApp us
              </a>
            </div>

            {/* Phone */}
            <p className="text-sm text-text-secondary">
              Or call us:{" "}
              <a href={`tel:${PHONE_TEL}`} className="text-accent font-medium hover:underline">
                {PHONE_DISPLAY}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
