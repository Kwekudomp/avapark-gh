import { describe, it, expect } from "vitest";
import { verifyWebhookSignature, parseIncomingMessages } from "@/lib/whatsapp/webhook";
import crypto from "crypto";

const APP_SECRET = "test-app-secret";

function makeSignature(body: string, secret: string): string {
  return "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyWebhookSignature", () => {
  it("returns true for valid signature", () => {
    const body = '{"test":"data"}';
    const signature = makeSignature(body, APP_SECRET);
    expect(verifyWebhookSignature(body, signature, APP_SECRET)).toBe(true);
  });

  it("returns false for invalid signature", () => {
    const body = '{"test":"data"}';
    expect(verifyWebhookSignature(body, "sha256=invalid", APP_SECRET)).toBe(false);
  });

  it("returns false for missing signature", () => {
    expect(verifyWebhookSignature("{}", "", APP_SECRET)).toBe(false);
  });
});

describe("parseIncomingMessages", () => {
  it("parses a text message from webhook payload", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [{
        id: "entry-1",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "233540879700",
              phone_number_id: "phone-123",
            },
            contacts: [{ profile: { name: "Kwame" }, wa_id: "233241234567" }],
            messages: [{
              id: "wamid.abc123",
              from: "233241234567",
              timestamp: "1700000000",
              type: "text",
              text: { body: "How much is Friday night?" },
            }],
          },
          field: "messages",
        }],
      }],
    };

    const messages = parseIncomingMessages(payload);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual({
      messageId: "wamid.abc123",
      from: "233241234567",
      customerName: "Kwame",
      text: "How much is Friday night?",
      timestamp: "1700000000",
      phoneNumberId: "phone-123",
    });
  });

  it("ignores non-text messages", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [{
        id: "entry-1",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "233540879700", phone_number_id: "phone-123" },
            contacts: [{ profile: { name: "Ama" }, wa_id: "233241234567" }],
            messages: [{
              id: "wamid.img456",
              from: "233241234567",
              timestamp: "1700000001",
              type: "image",
            }],
          },
          field: "messages",
        }],
      }],
    };

    const messages = parseIncomingMessages(payload);
    expect(messages).toHaveLength(0);
  });

  it("returns empty array for status-only webhooks", () => {
    const payload = {
      object: "whatsapp_business_account",
      entry: [{
        id: "entry-1",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "233540879700", phone_number_id: "phone-123" },
            statuses: [{ id: "wamid.abc", status: "delivered", timestamp: "1700000002", recipient_id: "233241234567" }],
          },
          field: "messages",
        }],
      }],
    };

    const messages = parseIncomingMessages(payload);
    expect(messages).toHaveLength(0);
  });
});
