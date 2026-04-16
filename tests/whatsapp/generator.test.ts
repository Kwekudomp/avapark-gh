import { describe, it, expect } from "vitest";
import { buildGeneratorPrompt, GENERATOR_SYSTEM_PROMPT } from "@/lib/whatsapp/generator";
import type { ResolvedContext } from "@/lib/whatsapp/types";

describe("GENERATOR_SYSTEM_PROMPT", () => {
  it("instructs to never invent facts", () => {
    expect(GENERATOR_SYSTEM_PROMPT).toContain("never invent");
  });

  it("instructs to reply in the customer's language", () => {
    expect(GENERATOR_SYSTEM_PROMPT).toContain("language");
  });
});

describe("buildGeneratorPrompt", () => {
  it("includes facts in the prompt", () => {
    const context: ResolvedContext = {
      facts: [
        { key: "Friday Night", value: "Every Friday, 5pm-3am, GHC 150" },
        { key: "Location", value: "Akuse Road, Okwenya, Eastern Region" },
      ],
      source: "experiences",
      isEmpty: false,
    };

    const prompt = buildGeneratorPrompt(
      "How much is Friday night?",
      [],
      context,
      "en",
      "Friendly and warm"
    );

    expect(prompt).toContain("Friday Night");
    expect(prompt).toContain("GHC 150");
    expect(prompt).toContain("Friendly and warm");
    expect(prompt).toContain("en");
  });

  it("signals escalation when context is empty", () => {
    const context: ResolvedContext = { facts: [], source: "database", isEmpty: true };

    const prompt = buildGeneratorPrompt(
      "Can I get a discount?",
      [],
      context,
      "en",
      "Friendly"
    );

    expect(prompt).toContain("ESCALATE");
  });
});
