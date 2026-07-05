import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { reviews } from "@/db/schema";

// GET — fetch approved reviews (public)
export async function GET() {
  try {
    const data = await getDb()
      .select({
        id: reviews.id,
        guest_name: reviews.guest_name,
        experience_name: reviews.experience_name,
        rating: reviews.rating,
        comment: reviews.comment,
        created_at: reviews.created_at,
      })
      .from(reviews)
      .where(eq(reviews.status, "approved"))
      .orderBy(desc(reviews.created_at));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Fetch reviews error:", err);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST — submit a review (public)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { guest_name, guest_email, experience_name, rating, comment } = body;

  if (!guest_name || !guest_email || !experience_name || !rating || !comment) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  try {
    await getDb().insert(reviews).values({
      guest_name,
      guest_email,
      experience_name,
      rating: Number(rating),
      comment,
      status: "pending",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Submit review error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
