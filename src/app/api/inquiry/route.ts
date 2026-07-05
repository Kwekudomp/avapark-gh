import { NextRequest, NextResponse } from "next/server";
import { sendEnquiryNotification } from "@/lib/email";
import { getDb } from "@/db";
import { inquiries } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, experience, dates, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    // Persist to DB. If this fails we still try to email so the inquiry
    // isn't lost.
    try {
      await getDb().insert(inquiries).values({
        name,
        email,
        phone: phone || null,
        experience: experience || null,
        dates: dates || null,
        message,
      });
    } catch (dbError) {
      console.error("Inquiry DB insert failed:", dbError);
    }

    // Email notification to info@ (non-blocking)
    sendEnquiryNotification({ name, email, phone, experience, dates, message }).catch(
      (err) => console.error("Enquiry notification email failed:", err)
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process inquiry" },
      { status: 500 }
    );
  }
}
