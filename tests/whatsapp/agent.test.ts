import { describe, it, expect } from "vitest";
import { shouldAutoRespond, shouldEscalate } from "@/lib/whatsapp/agent";
import type { ClassificationResult } from "@/lib/whatsapp/types";

describe("shouldAutoRespond", () => {
  it("returns true for high-confidence FAQ", () => {
    const classification: ClassificationResult = {
      intent: "faq",
      confidence: 0.9,
      category: "pricing",
      language: "en",
    };
    expect(shouldAutoRespond(classification)).toBe(true);
  });

  it("returns true for availability check", () => {
    const classification: ClassificationResult = {
      intent: "availability",
      confidence: 0.85,
      category: "date_check",
      language: "tw",
    };
    expect(shouldAutoRespond(classification)).toBe(true);
  });

  it("returns true for order status", () => {
    const classification: ClassificationResult = {
      intent: "order_status",
      confidence: 0.8,
      category: "tracking",
      language: "en",
    };
    expect(shouldAutoRespond(classification)).toBe(true);
  });

  it("returns false for booking intent", () => {
    const classification: ClassificationResult = {
      intent: "booking",
      confidence: 0.95,
      category: "reservation",
      language: "en",
    };
    expect(shouldAutoRespond(classification)).toBe(false);
  });

  it("returns false for complaint", () => {
    const classification: ClassificationResult = {
      intent: "complaint",
      confidence: 0.9,
      category: "refund",
      language: "en",
    };
    expect(shouldAutoRespond(classification)).toBe(false);
  });

  it("returns false for low confidence", () => {
    const classification: ClassificationResult = {
      intent: "faq",
      confidence: 0.5,
      category: "pricing",
      language: "en",
    };
    expect(shouldAutoRespond(classification)).toBe(false);
  });
});

describe("shouldEscalate", () => {
  it("returns true for booking", () => {
    expect(shouldEscalate({ intent: "booking", confidence: 0.9, category: "reservation", language: "en" })).toBe(true);
  });

  it("returns true for complaint", () => {
    expect(shouldEscalate({ intent: "complaint", confidence: 0.9, category: "refund", language: "en" })).toBe(true);
  });

  it("returns true for low confidence on any intent", () => {
    expect(shouldEscalate({ intent: "faq", confidence: 0.4, category: "pricing", language: "en" })).toBe(true);
  });

  it("returns true for 'other' intent", () => {
    expect(shouldEscalate({ intent: "other", confidence: 0.8, category: "unknown", language: "en" })).toBe(true);
  });
});
