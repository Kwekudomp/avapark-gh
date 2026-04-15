import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { WHATSAPP_NUMBER } from "@/data/constants";

interface CartItemPayload {
  id: string;
  name: string;
  subnote?: string;
  price: number;
  quantity: number;
}

interface OrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: "dine-in" | "pickup" | "delivery";
  scheduled_time?: string;
  notes?: string;
  items: CartItemPayload[];
  subtotal: number;
}

function formatPrice(n: number) {
  return `GHC ${n.toFixed(2)}`;
}

function buildWhatsAppMessage(order: OrderPayload, orderId: string) {
  const lines: string[] = [];
  lines.push("Hi Hidden Paradise! I'd like to place an order.");
  lines.push("");
  lines.push(`*Order #${orderId.slice(0, 8).toUpperCase()}*`);
  lines.push(`Type: ${order.order_type.toUpperCase()}`);
  lines.push(`Name: ${order.customer_name}`);
  lines.push(`Phone: ${order.customer_phone}`);
  if (order.customer_email) lines.push(`Email: ${order.customer_email}`);
  if (order.scheduled_time) lines.push(`Time: ${order.scheduled_time}`);
  lines.push("");
  lines.push("*Items:*");
  for (const it of order.items) {
    const sub = it.subnote ? ` (${it.subnote})` : "";
    lines.push(`• ${it.quantity}× ${it.name}${sub} — ${formatPrice(it.price * it.quantity)}`);
  }
  lines.push("");
  lines.push(`*Estimated total: ${formatPrice(order.subtotal)}*`);
  lines.push("_Prices are estimates pending kitchen confirmation._");
  if (order.notes) {
    lines.push("");
    lines.push(`Notes: ${order.notes}`);
  }
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  let body: OrderPayload;
  try {
    body = (await req.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { customer_name, customer_phone, order_type, items, subtotal } = body;

  if (!customer_name?.trim() || !customer_phone?.trim()) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }
  if (!["dine-in", "pickup", "delivery"].includes(order_type)) {
    return NextResponse.json({ error: "Invalid order type" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      customer_email: body.customer_email?.trim() || null,
      order_type,
      scheduled_time: body.scheduled_time?.trim() || null,
      items,
      subtotal,
      notes: body.notes?.trim() || null,
      status: "new",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[POST /api/orders] Supabase error:", error?.message);
    return NextResponse.json(
      { error: error?.message ?? "Failed to save order" },
      { status: 500 },
    );
  }

  const message = buildWhatsAppMessage(body, data.id);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return NextResponse.json(
    { success: true, orderId: data.id, whatsappUrl },
    { status: 201 },
  );
}
