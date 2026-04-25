import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";
import { assertStaff } from "@/lib/auth/roles";

export async function GET() {
  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from("gallery_items")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const body = await req.json();
  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from("gallery_items")
    .insert([{ ...body, uploaded_by: auth.userId }])
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

/**
 * Soft-delete (sets is_active = false). Allowed for admin OR the item's uploader.
 * Marketing_sales who try to delete someone else's item get 403.
 */
export async function DELETE(req: NextRequest) {
  const auth = await assertStaff();
  if (!auth.ok) return NextResponse.json({ error: "Forbidden" }, { status: auth.status });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const admin = createAdminSupabase();

  // Ownership check (admin can override)
  if (auth.role !== "admin") {
    const { data: item } = await admin
      .from("gallery_items")
      .select("uploaded_by")
      .eq("id", id)
      .maybeSingle();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (item.uploaded_by !== auth.userId) {
      return NextResponse.json({ error: "Cannot delete items uploaded by others" }, { status: 403 });
    }
  }

  const { error } = await admin.from("gallery_items").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
