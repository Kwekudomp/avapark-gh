import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteState } from "@/db/schema";
import { isRateLimited, recordFailure, clearFailures } from "@/lib/rate-limit";

const VALID = ["off", "maintenance", "lockdown"] as const;
type SiteState = (typeof VALID)[number];

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request) {
  const secret = process.env.MAINTENANCE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Control panel not configured" },
      { status: 503 }
    );
  }

  const key = clientKey(req);
  if (isRateLimited(key)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: { password?: string; state?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (body.password !== secret) {
    recordFailure(key);
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  clearFailures(key);

  const db = getDb();

  // Apply a state change if one was requested.
  if (body.state !== undefined) {
    if (!VALID.includes(body.state as SiteState)) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    }
    const update: { state: string; note?: string; updated_at: string } = {
      state: body.state,
      updated_at: new Date().toISOString(),
    };
    if (typeof body.note === "string" && body.note.trim()) {
      update.note = body.note.trim();
    }
    try {
      await db
        .insert(siteState)
        .values({ id: "singleton", ...update })
        .onConflictDoUpdate({ target: siteState.id, set: update });
    } catch (err) {
      console.error("[POST /api/sys] DB write error:", err);
      return NextResponse.json({ error: "Failed to update site state" }, { status: 500 });
    }
  }

  // Return the current state.
  try {
    const [row] = await db
      .select({ state: siteState.state })
      .from(siteState)
      .where(eq(siteState.id, "singleton"))
      .limit(1);
    return NextResponse.json({ state: row?.state ?? "off" });
  } catch (err) {
    console.error("[POST /api/sys] DB read error:", err);
    return NextResponse.json({ error: "Failed to read site state" }, { status: 500 });
  }
}
