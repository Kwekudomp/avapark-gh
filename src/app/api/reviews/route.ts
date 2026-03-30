import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

// GET — fetch approved reviews (public)
export async function GET() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, guest_name, experience_name, rating, comment, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
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

  const supabase = await createServerSupabase();
  const { error } = await supabase.from("reviews").insert({
    guest_name,
    guest_email,
    experience_name,
    rating: Number(rating),
    comment,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 201 });
}
