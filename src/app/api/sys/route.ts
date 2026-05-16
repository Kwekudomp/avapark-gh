import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";

const VALID = ["off", "maintenance", "lockdown"] as const;
type SiteState = (typeof VALID)[number];

export async function POST(req: Request) {
  const secret = process.env.MAINTENANCE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Control panel not configured" },
      { status: 503 }
    );
  }

  let body: { password?: string; state?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.password !== secret) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const admin = createAdminSupabase();

  // Apply a state change if one was requested.
  if (body.state !== undefined) {
    if (!VALID.includes(body.state as SiteState)) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }
    const update: { state: string; note?: string } = { state: body.state };
    if (typeof body.note === "string" && body.note.trim()) {
      update.note = body.note.trim();
    }
    const { error } = await admin
      .from("site_state")
      .update(update)
      .eq("id", "singleton");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Return the current state.
  const { data, error } = await admin
    .from("site_state")
    .select("state")
    .eq("id", "singleton")
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ state: data?.state ?? "off" });
}
