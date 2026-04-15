import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

async function requireAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { supabase: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { supabase, error: null };
}

interface MenuItemUpdate {
  name?: string;
  subnote?: string | null;
  category?: string;
  meal?: "breakfast" | "lunch" | "supper" | "all-day";
  price?: number | null;
  tags?: ("spicy" | "seafood")[];
  available?: boolean;
  sort_order?: number;
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  let body: MenuItemUpdate;
  try {
    body = (await req.json()) as MenuItemUpdate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data, error: dbError } = await supabase!
    .from("menu_items")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const { supabase, error } = await requireAdmin();
  if (error) return error;

  const { error: dbError } = await supabase!.from("menu_items").delete().eq("id", id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
