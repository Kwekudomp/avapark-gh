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

  const { data: closures } = await supabase
    .from("closures")
    .select("*")
    .eq("venue_id", staffRecord.venue_id)
    .order("closure_date", { ascending: true });

  return NextResponse.json(closures ?? []);
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

  const { data, error } = await admin
    .from("closures")
    .insert({
      venue_id: staffRecord.venue_id,
      closure_date: body.closure_date,
      reason: body.reason,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const admin = createAdminSupabase();
  await admin.from("closures").delete().eq("id", id);

  return NextResponse.json({ status: "deleted" });
}
