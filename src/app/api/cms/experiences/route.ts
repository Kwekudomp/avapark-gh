import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { experiences } from "@/db/schema";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
  try {
    const data = await getDb()
      .select()
      .from(experiences)
      .orderBy(asc(experiences.sort_order));
    return NextResponse.json({ experiences: data });
  } catch (err) {
    console.error("Fetch experiences error:", err);
    return NextResponse.json({ error: "Failed to fetch experiences" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const [experience] = await getDb().insert(experiences).values(body).returning();
    return NextResponse.json({ experience });
  } catch (err) {
    console.error("Create experience error:", err);
    return NextResponse.json({ error: "Failed to create experience" }, { status: 500 });
  }
}
