import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { reviews as reviewsTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import type { Review } from "@/lib/supabase";
import ReviewsCMSClient from "@/components/admin/ReviewsCMSClient";

export default async function AdminReviewsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  let reviews: Review[] = [];
  try {
    reviews = (await getDb()
      .select()
      .from(reviewsTable)
      .orderBy(desc(reviewsTable.created_at))) as unknown as Review[];
  } catch (err) {
    console.error("Load reviews error:", err);
  }

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hp-logo.png" alt="" className="h-8 w-auto rounded" />
          <div>
            <h1 className="font-semibold text-sm">Hidden Paradise</h1>
            <p className="text-white/60 text-xs">Reviews Management</p>
          </div>
        </div>
        <a href="/admin/dashboard" className="text-xs text-white/80 hover:text-white border border-white/30 px-3 py-1.5 rounded-full transition">
          ← Dashboard
        </a>
      </header>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-primary">Guest Reviews</h2>
          <p className="text-text-secondary text-sm mt-1">Approve reviews to publish them on the website. Rejected reviews are hidden from guests.</p>
        </div>
        <ReviewsCMSClient initialReviews={reviews} />
      </div>
    </div>
  );
}
