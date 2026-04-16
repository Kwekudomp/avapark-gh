import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { escalationId } = await request.json();
  if (!escalationId) {
    return NextResponse.json({ error: "Missing escalationId" }, { status: 400 });
  }

  const admin = createAdminSupabase();
  await admin
    .from("escalations")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .eq("id", escalationId);

  return NextResponse.json({ status: "resolved" });
}
