import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "No reference provided" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();

    if (!data.status || data.data?.status !== "success") {
      return NextResponse.json({ verified: false, message: data.message }, { status: 400 });
    }

    return NextResponse.json({
      verified: true,
      reference: data.data.reference,
      amount: data.data.amount / 100, // convert pesewas to GHS
      email: data.data.customer?.email,
    });
  } catch (err) {
    console.error("Paystack verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
