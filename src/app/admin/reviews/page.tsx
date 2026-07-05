import { redirect } from "next/navigation";
import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { reviews as reviewsTable } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";
import type { Review } from "@/lib/types";
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">Guest Reviews</h1>
        <p className="text-sm text-text-secondary mt-0.5">Approve reviews to publish them on the website. Rejected reviews are hidden from guests.</p>
      </div>
      <ReviewsCMSClient initialReviews={reviews} />
    </div>
  );
}
