import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { assertAdmin } from "@/lib/auth/roles";

/**
 * PATCH — upsert site settings (admin only).
 * Accepts { updates: [{ key, value }] } as sent by SettingsCMSClient.
 */
export async function PATCH(req: NextRequest) {
  const auth = await assertAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  try {
    const body = await req.json();
    const updates: unknown = body?.updates;
    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const db = getDb();
    const updated_at = new Date().toISOString();

    for (const entry of updates as Array<{ key?: unknown; value?: unknown }>) {
      if (typeof entry?.key !== "string" || typeof entry?.value !== "string") continue;
      await db
        .insert(siteSettings)
        .values({ key: entry.key, value: entry.value, updated_at })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value: entry.value, updated_at },
        });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update settings error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
