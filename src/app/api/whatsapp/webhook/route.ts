import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, parseIncomingMessages } from "@/lib/whatsapp/webhook";
import { handleIncomingMessage } from "@/lib/whatsapp/agent";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256") ?? "";

  if (!verifyWebhookSignature(rawBody, signature, process.env.WHATSAPP_APP_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const incomingMessages = parseIncomingMessages(payload);

  for (const msg of incomingMessages) {
    handleIncomingMessage(msg).catch((err) => {
      console.error("Error handling WhatsApp message:", err);
    });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
