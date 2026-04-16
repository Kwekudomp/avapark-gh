import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendWhatsAppMessage, buildTextPayload } from "@/lib/whatsapp/sender";

global.fetch = vi.fn();

describe("buildTextPayload", () => {
  it("builds a valid WhatsApp text message payload", () => {
    const payload = buildTextPayload("233241234567", "Hello there!");
    expect(payload).toEqual({
      messaging_product: "whatsapp",
      to: "233241234567",
      type: "text",
      text: { body: "Hello there!" },
    });
  });
});

describe("sendWhatsAppMessage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("calls Meta API with correct headers and body", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ messages: [{ id: "wamid.resp123" }] }),
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    const result = await sendWhatsAppMessage(
      "233241234567",
      "Hello!",
      "phone-123",
      "test-token"
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "https://graph.facebook.com/v21.0/phone-123/messages",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: "233241234567",
          type: "text",
          text: { body: "Hello!" },
        }),
      }
    );

    expect(result).toEqual({ messageId: "wamid.resp123" });
  });

  it("throws on API error", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    await expect(
      sendWhatsAppMessage("233241234567", "Hello!", "phone-123", "bad-token")
    ).rejects.toThrow("WhatsApp API error 401");
  });
});
