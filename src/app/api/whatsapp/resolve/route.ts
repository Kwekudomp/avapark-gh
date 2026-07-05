import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { escalations } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { escalationId } = await request.json();
    if (!escalationId) {
      return NextResponse.json({ error: "Missing escalationId" }, { status: 400 });
    }

    await getDb()
      .update(escalations)
      .set({ status: "resolved", resolved_at: new Date().toISOString() })
      .where(eq(escalations.id, escalationId));

    return NextResponse.json({ status: "resolved" });
  } catch (err) {
    console.error("WhatsApp resolve error:", err);
    return NextResponse.json({ error: "Failed to resolve escalation" }, { status: 500 });
  }
}
