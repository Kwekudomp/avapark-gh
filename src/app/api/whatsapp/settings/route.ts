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

  const { data: venue } = await supabase
    .from("venues")
    .select("*")
    .eq("id", staffRecord.venue_id)
    .single();

  return NextResponse.json(venue);
}

export async function PATCH(request: NextRequest) {
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
    .from("venues")
    .update({
      supported_languages: body.supported_languages,
      brand_voice: body.brand_voice,
      updated_at: new Date().toISOString(),
    })
    .eq("id", staffRecord.venue_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
