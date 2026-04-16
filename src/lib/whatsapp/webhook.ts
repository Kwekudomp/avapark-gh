import crypto from "crypto";
import type { WhatsAppWebhookPayload, WhatsAppIncomingMessage } from "./types";

export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  appSecret: string
): boolean {
  if (!signature || !rawBody) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

export function parseIncomingMessages(
  payload: WhatsAppWebhookPayload
): WhatsAppIncomingMessage[] {
  const results: WhatsAppIncomingMessage[] = [];

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      const { value } = change;
      const phoneNumberId = value.metadata.phone_number_id;
      const messages = value.messages ?? [];
      const contacts = value.contacts ?? [];

      for (const msg of messages) {
        if (msg.type !== "text" || !msg.text?.body) continue;

        const contact = contacts.find((c) => c.wa_id === msg.from);

        results.push({
          messageId: msg.id,
          from: msg.from,
          customerName: contact?.profile.name ?? msg.from,
          text: msg.text.body,
          timestamp: msg.timestamp,
          phoneNumberId,
        });
      }
    }
  }

  return results;
}
