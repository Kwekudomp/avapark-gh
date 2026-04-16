import Anthropic from "@anthropic-ai/sdk";
import type { ClassificationResult } from "./types";

export const CLASSIFIER_SYSTEM_PROMPT = `You are a message classifier for a leisure venue's WhatsApp booking agent.

Classify the customer's message into exactly one intent and detect the language.

INTENTS:
- "faq" — general information: pricing, hours, location, directions, amenities, what's included, activities, food menu, rules, policies
- "booking" — wants to make a reservation, book an experience, reserve a chalet, bring a group
- "complaint" — unhappy, bad experience, wants a refund, something went wrong
- "order_status" — asking about a food/drink order they already placed
- "availability" — asking if a specific date/event/experience has space
- "other" — doesn't fit any category above

LANGUAGES:
- "en" — English
- "tw" — Twi
- "ee" — Ewe
- "ga" — Ga
- "fr" — French
- "pid" — Pidgin English

Respond with ONLY a JSON object, no other text:
{"intent":"<intent>","confidence":<0.0-1.0>,"category":"<subcategory>","language":"<code>"}

The "category" field is a brief subcategory label (e.g., "pricing", "hours", "location", "menu", "reservation", "group_booking", "refund").`;

export function parseClassifierResponse(raw: string): ClassificationResult {
  try {
    const jsonMatch = raw.match(/\{[^}]+\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      intent: parsed.intent ?? "other",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
      category: parsed.category ?? "unknown",
      language: parsed.language ?? "en",
    };
  } catch {
    return { intent: "other", confidence: 0, category: "unknown", language: "en" };
  }
}

export async function classifyMessage(
  text: string,
  conversationHistory: Array<{ role: "customer" | "agent"; text: string }>,
  apiKey: string
): Promise<ClassificationResult> {
  const client = new Anthropic({ apiKey });

  const historyContext = conversationHistory.length > 0
    ? "\n\nRecent conversation:\n" +
      conversationHistory
        .slice(-5)
        .map((m) => `${m.role === "customer" ? "Customer" : "Agent"}: ${m.text}`)
        .join("\n")
    : "";

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 100,
    system: CLASSIFIER_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Classify this message:${historyContext}\n\nNew message: "${text}"`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    return { intent: "other", confidence: 0, category: "unknown", language: "en" };
  }

  return parseClassifierResponse(content.text);
}
