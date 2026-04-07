import SectionHeader from "@/components/SectionHeader";

export const metadata = {
  title: "Blog | Hidden Paradise Nature Park",
  description:
    "Stories, tips, and updates from Hidden Paradise Nature Park. Your guide to Ghana's best nature retreat.",
};

export default function BlogPage() {
  return (
    <main className="pt-28 pb-24 px-[5%]">
      <SectionHeader
        tag="OUR BLOG"
        title="Stories & Updates"
        description="Stay tuned! We're working on sharing stories, tips, and behind-the-scenes moments from Hidden Paradise."
      />
      <div className="max-w-2xl mx-auto text-center mt-8">
        <div className="bg-bg-alt rounded-2xl border border-border p-12">
          <p className="text-5xl mb-4">Coming Soon</p>
          <p className="text-text-secondary">
            Our blog is launching soon with travel guides, event recaps, and
            nature stories from 300 acres of paradise.
          </p>
        </div>
      </div>
    </main>
  );
}
