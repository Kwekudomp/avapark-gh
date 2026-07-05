import { and, asc, desc, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import { conversations, escalations, messages, venues } from "@/db/schema";
import { classifyMessage } from "./classifier";
import { resolveContext } from "./resolver";
import { generateResponse } from "./generator";
import { sendWhatsAppMessage } from "./sender";
import type {
  WhatsAppIncomingMessage,
  ClassificationResult,
  Venue,
  Conversation,
} from "./types";

const CONFIDENCE_THRESHOLD = 0.6;
const AUTO_RESPOND_INTENTS = new Set(["faq", "availability", "order_status"]);

export function shouldAutoRespond(classification: ClassificationResult): boolean {
  return (
    AUTO_RESPOND_INTENTS.has(classification.intent) &&
    classification.confidence >= CONFIDENCE_THRESHOLD
  );
}

export function shouldEscalate(classification: ClassificationResult): boolean {
  return !shouldAutoRespond(classification);
}

async function getOrCreateConversation(
  venueId: string,
  customerPhone: string,
  customerName: string,
  language: string
): Promise<Conversation> {
  const db = getDb();

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [existing] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.venue_id, venueId),
        eq(conversations.customer_phone, customerPhone),
        eq(conversations.status, "active"),
        gte(conversations.last_message_at, twentyFourHoursAgo)
      )
    )
    .orderBy(desc(conversations.last_message_at))
    .limit(1);

  if (existing) {
    await db
      .update(conversations)
      .set({ last_message_at: new Date().toISOString(), language })
      .where(eq(conversations.id, existing.id));
    return existing as Conversation;
  }

  const [created] = await db
    .insert(conversations)
    .values({
      venue_id: venueId,
      customer_phone: customerPhone,
      customer_name: customerName,
      language,
      status: "active",
    })
    .returning();

  if (!created) throw new Error("Failed to create conversation");
  return created as Conversation;
}

async function getConversationHistory(
  conversationId: string
): Promise<Array<{ role: "customer" | "agent"; text: string }>> {
  const db = getDb();
  const rows = await db
    .select({
      direction: messages.direction,
      body: messages.body,
      sent_by: messages.sent_by,
    })
    .from(messages)
    .where(eq(messages.conversation_id, conversationId))
    .orderBy(asc(messages.sent_at))
    .limit(10);

  return rows.map((m) => ({
    role: m.direction === "inbound" ? ("customer" as const) : ("agent" as const),
    text: m.body,
  }));
}

export async function handleIncomingMessage(
  incoming: WhatsAppIncomingMessage
): Promise<void> {
  const db = getDb();
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN!;

  // 1. Look up venue by phone_number_id
  const [venue] = await db
    .select()
    .from(venues)
    .where(
      and(
        eq(venues.phone_number_id, incoming.phoneNumberId),
        eq(venues.is_active, true)
      )
    )
    .limit(1);

  if (!venue) {
    console.error(`No active venue found for phone_number_id: ${incoming.phoneNumberId}`);
    return;
  }

  const typedVenue = venue as unknown as Venue;

  // 2. Get or create conversation
  const conversation = await getOrCreateConversation(
    typedVenue.id,
    incoming.from,
    incoming.customerName,
    "en"
  );

  // 3. Get conversation history
  const history = await getConversationHistory(conversation.id);

  // 4. Classify the message
  const classification = await classifyMessage(incoming.text, history, apiKey);

  // 5. Save the inbound message
  const [savedMessage] = await db
    .insert(messages)
    .values({
      conversation_id: conversation.id,
      direction: "inbound",
      body: incoming.text,
      intent: classification.intent,
      language: classification.language,
      confidence: classification.confidence,
      category: classification.category,
      sent_by: "customer",
      wa_message_id: incoming.messageId,
    })
    .returning();

  // Update conversation language
  await db
    .update(conversations)
    .set({ language: classification.language })
    .where(eq(conversations.id, conversation.id));

  // 6. Route by intent
  if (shouldAutoRespond(classification)) {
    const context = await resolveContext(
      classification.intent,
      classification.category,
      typedVenue.id
    );

    const response = await generateResponse(
      incoming.text,
      history,
      context,
      classification.language,
      typedVenue.brand_voice,
      apiKey
    );

    if (response.shouldEscalate) {
      await createEscalation(savedMessage!.id, typedVenue.id, null);
      return;
    }

    const sent = await sendWhatsAppMessage(
      incoming.from,
      response.text,
      incoming.phoneNumberId,
      waToken
    );

    await db.insert(messages).values({
      conversation_id: conversation.id,
      direction: "outbound",
      body: response.text,
      sent_by: "ai",
      wa_message_id: sent.messageId,
    });
  } else {
    let draftReply: string | null = null;

    if (classification.intent === "booking") {
      const context = await resolveContext("faq", classification.category, typedVenue.id);
      const draft = await generateResponse(
        incoming.text,
        history,
        context,
        classification.language,
        typedVenue.brand_voice,
        apiKey
      );
      if (!draft.shouldEscalate) {
        draftReply = draft.text;
      }
    }

    await createEscalation(savedMessage!.id, typedVenue.id, draftReply);
  }
}

async function createEscalation(
  messageId: string,
  venueId: string,
  draftReply: string | null
): Promise<void> {
  await getDb().insert(escalations).values({
    message_id: messageId,
    venue_id: venueId,
    status: "pending",
    draft_reply: draftReply,
  });
}
