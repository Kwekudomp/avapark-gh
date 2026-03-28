import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      experience_slug, experience_name, guest_name, guest_email,
      guest_phone, booking_date, group_size, adults, children,
      package_tier_id, package_tier_name, subtotal, deposit_amount,
      paystack_reference, notes,
    } = body;

    if (!experience_slug || !guest_name || !guest_email || !guest_phone || !booking_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    // If paystack_reference provided, verify it hasn't already been used
    if (paystack_reference) {
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("paystack_reference", paystack_reference)
        .single();
      if (existing) {
        return NextResponse.json({ error: "Payment reference already used" }, { status: 409 });
      }
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert([{
        experience_slug, experience_name, guest_name, guest_email,
        guest_phone, booking_date, group_size: group_size || 1,
        adults: adults || 1, children: children || 0,
        package_tier_id: package_tier_id || null,
        package_tier_name: package_tier_name || null,
        subtotal: subtotal || 0, deposit_amount: deposit_amount || 0,
        paystack_reference: paystack_reference || null,
        paystack_status: paystack_reference ? "success" : null,
        status: paystack_reference ? "pending" : "pending",
        notes: notes || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ booking: data });
  } catch (err) {
    console.error("Create booking error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
