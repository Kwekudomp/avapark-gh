import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

interface MenuItemCreate {
  id: string;
  name: string;
  subnote?: string | null;
  category: string;
  meal: "breakfast" | "lunch" | "supper" | "all-day";
  price?: number | null;
  tags?: ("spicy" | "seafood")[];
  available?: boolean;
  sort_order?: number;
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: MenuItemCreate;
  try {
    body = (await req.json()) as MenuItemCreate;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id?.trim() || !body.name?.trim() || !body.category?.trim() || !body.meal) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      id: body.id.trim(),
      name: body.name.trim(),
      subnote: body.subnote?.trim() || null,
      category: body.category.trim(),
      meal: body.meal,
      price: body.price ?? null,
      tags: body.tags ?? [],
      available: body.available ?? true,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
