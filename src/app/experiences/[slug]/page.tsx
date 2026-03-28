import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCMSExperienceBySlug, getCMSExperiences } from "@/lib/cms";
import { WHATSAPP_NUMBER } from "@/data/constants";
import SectionHeader from "@/components/SectionHeader";
import ExperienceCard from "@/components/ExperienceCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getCMSExperienceBySlug(slug);
  if (!experience) return { title: "Experience Not Found" };
  return {
    title: experience.name,
    description: experience.description,
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experience = await getCMSExperienceBySlug(slug);
  if (!experience) notFound();

  const {
    name,
    description,
    schedule,
    time,
    package_includes,
    activities,
    cover_image_url,
    images,
    deposit_amount,
  } = experience;

  // Build WA link for this experience
  const waMessage = encodeURIComponent(
    `Hi! I'm interested in booking the ${name} experience at Hidden Paradise.`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  // Fetch 3 other experiences for the "Explore More" section
  const allExperiences = await getCMSExperiences();
  const otherExperiences = allExperiences.filter((e) => e.slug !== slug).slice(0, 3);

  return (
    <>
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="pt-28 pb-4 px-[5%]" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-text-secondary">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/experiences" className="hover:text-primary transition-colors">
              Experiences
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-primary font-medium truncate">{name}</li>
        </ol>
      </nav>

      {/* ── Hero section ────────────────────────────────────────────────── */}
      {cover_image_url ? (
        <section className="relative w-full aspect-[21/9] overflow-hidden">
          <Image
            src={cover_image_url}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center px-[5%] text-center">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight">
              {name}
            </h1>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {schedule && (
                <span className="bg-accent/90 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  {schedule}
                </span>
              )}
              {time && (
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm">
                  {time}
                </span>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-bg-alt py-20 px-[5%] text-center">
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary">
            {name}
          </h1>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {schedule && (
              <span className="bg-accent/90 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                {schedule}
              </span>
            )}
            {time && <span className="text-text-secondary text-sm">{time}</span>}
          </div>
        </section>
      )}

      {/* ── Content section ─────────────────────────────────────────────── */}
      <section className="py-16 px-[5%]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left column (3/5 = 60%) */}
          <div className="lg:col-span-3 space-y-12">
            <p className="text-lg text-text-secondary leading-relaxed">{description}</p>

            {package_includes.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-primary mb-4">
                  What&apos;s Included
                </h2>
                <ul className="space-y-3">
                  {package_includes.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg
                        className="mt-1 h-5 w-5 flex-shrink-0 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-text-secondary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activities.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold text-primary mb-4">
                  Activities
                </h2>
                <div className="flex flex-wrap gap-3">
                  {activities.map((activity) => (
                    <span
                      key={activity}
                      className="bg-bg-alt text-text-secondary px-4 py-2 rounded-full text-sm"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — sticky booking card (2/5 = 40%) */}
          <div className="lg:col-span-2">
            <div className="sticky top-28 bg-white border border-border rounded-2xl p-6 shadow-sm">
              {schedule && (
                <div className="flex items-center gap-3 text-primary">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span className="font-medium">{schedule}</span>
                </div>
              )}
              {time && (
                <div className="flex items-center gap-3 text-primary mt-4">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{time}</span>
                </div>
              )}

              <hr className="my-6 border-border" />

              <Link
                href={`/book/${slug}`}
                className="block w-full text-center bg-primary text-white py-4 rounded-full font-medium hover:bg-primary-light transition-all"
              >
                {deposit_amount ? `Book Now — GHC ${deposit_amount} deposit` : "Reserve Your Spot"}
              </Link>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-accent text-white py-4 rounded-full font-medium hover:bg-accent-dark transition-all mt-3"
              >
                Book via WhatsApp
              </a>

              <Link
                href="/contact"
                className="block w-full text-center border-2 border-primary text-primary py-4 rounded-full font-medium hover:bg-primary hover:text-white transition-all mt-3"
              >
                Send an Inquiry
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Image gallery ───────────────────────────────────────────────── */}
      {images && images.length > 1 && (
        <section className="py-16 px-[5%]">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="font-display text-2xl font-semibold text-primary mb-8">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((src) => (
                <div key={src} className="relative rounded-xl overflow-hidden aspect-square">
                  <Image
                    src={src}
                    alt={`${name} gallery`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Other Experiences ───────────────────────────────────────────── */}
      {otherExperiences.length > 0 && (
        <section className="bg-bg-alt py-24 px-[5%]">
          <SectionHeader tag="EXPLORE MORE" title="Other Experiences" />
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherExperiences.map((exp, i) => (
              <ExperienceCard key={exp.slug} experience={exp} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
