import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center px-[5%] text-center">
      <div className="max-w-lg">
        <p className="text-xs tracking-[3px] uppercase text-accent font-semibold">
          PAGE NOT FOUND
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-semibold text-primary mt-4">
          Lost in the Wild?
        </h1>
        <p className="text-text-secondary text-lg mt-6 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you
          back on the trail.
        </p>
        <div className="flex gap-4 justify-center mt-10 flex-wrap">
          <Link
            href="/"
            className="bg-accent text-white px-8 py-4 rounded-full font-medium hover:bg-accent-dark hover:-translate-y-0.5 transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/experiences"
            className="border-2 border-primary text-primary px-8 py-4 rounded-full font-medium hover:bg-primary hover:text-white transition-all"
          >
            Explore Experiences
          </Link>
        </div>
      </div>
    </section>
  );
}
