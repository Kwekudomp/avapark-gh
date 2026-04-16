import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: staffRecord } = await supabase
    .from("staff_whatsapp")
    .select("venue_id")
    .eq("user_id", user.id)
    .single();

  if (!staffRecord) return NextResponse.json({ error: "No venue" }, { status: 403 });

  const { data: faqs } = await supabase
    .from("faqs")
    .select("*")
    .eq("venue_id", staffRecord.venue_id)
    .order("created_at", { ascending: false });

  return NextResponse.json(faqs ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: staffRecord } = await supabase
    .from("staff_whatsapp")
    .select("venue_id")
    .eq("user_id", user.id)
    .single();

  if (!staffRecord) return NextResponse.json({ error: "No venue" }, { status: 403 });

  const body = await request.json();
  const admin = createAdminSupabase();

  if (body.id) {
    const { data, error } = await admin
      .from("faqs")
      .update({
        question: body.question,
        answer: body.answer,
        category: body.category,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .eq("venue_id", staffRecord.venue_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await admin
    .from("faqs")
    .insert({
      venue_id: staffRecord.venue_id,
      question: body.question,
      answer: body.answer,
      category: body.category ?? "general",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
