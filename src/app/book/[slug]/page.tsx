import { notFound } from "next/navigation";
import { getCMSExperienceBySlug } from "@/lib/cms";
import BookingForm from "@/components/BookingForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getCMSExperienceBySlug(slug);
  if (!experience) return {};
  return { title: `Book ${experience.name}` };
}

export default async function BookPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const experience = await getCMSExperienceBySlug(slug);
  if (!experience) notFound();

  return (
    <main className="min-h-screen bg-bg pt-28 pb-20 px-[5%]">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs tracking-[3px] uppercase text-accent font-semibold mb-2">
          BOOKING
        </p>
        <h1 className="font-display text-4xl font-semibold text-primary mb-2">
          {experience.name}
        </h1>
        <p className="text-text-secondary mb-8">{experience.schedule} · {experience.time}</p>

        {experience.deposit_amount ? (
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <span className="text-secondary text-xl">🔒</span>
            <p className="text-sm text-text">
              <strong>Deposit to secure your spot:</strong> GHC {experience.deposit_amount} per person.
              Remaining balance is paid at the venue.
            </p>
          </div>
        ) : (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-8">
            <p className="text-sm text-text">Free entry — just let us know you&apos;re coming!</p>
          </div>
        )}

        <BookingForm experience={experience} />
      </div>
    </main>
  );
}
