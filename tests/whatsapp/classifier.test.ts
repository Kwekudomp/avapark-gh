import { describe, it, expect, vi } from "vitest";
import { classifyMessage, CLASSIFIER_SYSTEM_PROMPT, parseClassifierResponse } from "@/lib/whatsapp/classifier";

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn(),
      },
    })),
  };
});

describe("parseClassifierResponse", () => {
  it("parses valid JSON classification", () => {
    const raw = '{"intent":"faq","confidence":0.95,"category":"pricing","language":"en"}';
    const result = parseClassifierResponse(raw);
    expect(result).toEqual({
      intent: "faq",
      confidence: 0.95,
      category: "pricing",
      language: "en",
    });
  });

  it("extracts JSON from surrounding text", () => {
    const raw = 'Here is the result:\n{"intent":"booking","confidence":0.8,"category":"reservation","language":"tw"}\nDone.';
    const result = parseClassifierResponse(raw);
    expect(result.intent).toBe("booking");
    expect(result.language).toBe("tw");
  });

  it("defaults to 'other' intent on invalid JSON", () => {
    const raw = "I cannot classify this message";
    const result = parseClassifierResponse(raw);
    expect(result.intent).toBe("other");
    expect(result.confidence).toBe(0);
    expect(result.language).toBe("en");
  });
});

describe("CLASSIFIER_SYSTEM_PROMPT", () => {
  it("exists and contains intent categories", () => {
    expect(CLASSIFIER_SYSTEM_PROMPT).toContain("faq");
    expect(CLASSIFIER_SYSTEM_PROMPT).toContain("booking");
    expect(CLASSIFIER_SYSTEM_PROMPT).toContain("complaint");
    expect(CLASSIFIER_SYSTEM_PROMPT).toContain("order_status");
    expect(CLASSIFIER_SYSTEM_PROMPT).toContain("availability");
  });

  it("contains supported languages", () => {
    expect(CLASSIFIER_SYSTEM_PROMPT).toContain("tw");
    expect(CLASSIFIER_SYSTEM_PROMPT).toContain("ee");
    expect(CLASSIFIER_SYSTEM_PROMPT).toContain("ga");
    expect(CLASSIFIER_SYSTEM_PROMPT).toContain("pid");
  });
});
