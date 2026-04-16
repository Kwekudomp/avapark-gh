import Anthropic from "@anthropic-ai/sdk";
import type { ResolvedContext, Language } from "./types";

export const GENERATOR_SYSTEM_PROMPT = `You are a WhatsApp customer service agent for a leisure venue.

RULES:
1. Reply in the customer's language (specified below).
2. You must never invent facts, prices, times, or availability. Only use the FACTS provided below.
3. If FACTS are empty or don't answer the question, respond with exactly: "ESCALATE"
4. Keep responses short — 1-3 sentences max. This is WhatsApp, not email.
5. Be warm and helpful. Use the brand voice specified below.
6. Never mention that you are an AI. Respond as "we" (the venue team).
7. Include relevant prices in local currency (GHC) when answering pricing questions.
8. For booking requests, always respond with "ESCALATE" — never confirm bookings yourself.`;

export function buildGeneratorPrompt(
  message: string,
  conversationHistory: Array<{ role: "customer" | "agent"; text: string }>,
  context: ResolvedContext,
  language: Language | string,
  brandVoice: string
): string {
  const historyBlock = conversationHistory.length > 0
    ? "\nCONVERSATION HISTORY:\n" +
      conversationHistory
        .slice(-5)
        .map((m) => `${m.role === "customer" ? "Customer" : "Agent"}: ${m.text}`)
        .join("\n") + "\n"
    : "";

  const factsBlock = context.isEmpty
    ? "\nFACTS: None available. You must respond with ESCALATE."
    : "\nFACTS:\n" +
      context.facts
        .map((f) => `- ${f.key}: ${f.value}`)
        .join("\n");

  return `BRAND VOICE: ${brandVoice}
REPLY LANGUAGE: ${language}
${historyBlock}${factsBlock}

CUSTOMER MESSAGE: "${message}"`;
}

export async function generateResponse(
  message: string,
  conversationHistory: Array<{ role: "customer" | "agent"; text: string }>,
  context: ResolvedContext,
  language: Language | string,
  brandVoice: string,
  apiKey: string
): Promise<{ text: string; shouldEscalate: boolean }> {
  if (context.isEmpty) {
    return { text: "", shouldEscalate: true };
  }

  const client = new Anthropic({ apiKey });

  const prompt = buildGeneratorPrompt(
    message,
    conversationHistory,
    context,
    language,
    brandVoice
  );

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: GENERATOR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    return { text: "", shouldEscalate: true };
  }

  const text = content.text.trim();
  if (text === "ESCALATE" || text.includes("ESCALATE")) {
    return { text: "", shouldEscalate: true };
  }

  return { text, shouldEscalate: false };
}
