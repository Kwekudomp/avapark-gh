import { createAdminSupabase } from "@/lib/supabase-server";
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
  const supabase = createAdminSupabase();

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("venue_id", venueId)
    .eq("customer_phone", customerPhone)
    .eq("status", "active")
    .gte("last_message_at", twentyFourHoursAgo)
    .order("last_message_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), language })
      .eq("id", existing.id);
    return existing as Conversation;
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      venue_id: venueId,
      customer_phone: customerPhone,
      customer_name: customerName,
      language,
      status: "active",
    })
    .select()
    .single();

  if (error || !created) throw new Error(`Failed to create conversation: ${error?.message}`);
  return created as Conversation;
}

async function getConversationHistory(
  conversationId: string
): Promise<Array<{ role: "customer" | "agent"; text: string }>> {
  const supabase = createAdminSupabase();
  const { data: messages } = await supabase
    .from("messages")
    .select("direction, body, sent_by")
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true })
    .limit(10);

  if (!messages) return [];

  return messages.map((m) => ({
    role: m.direction === "inbound" ? "customer" as const : "agent" as const,
    text: m.body,
  }));
}

export async function handleIncomingMessage(
  incoming: WhatsAppIncomingMessage
): Promise<void> {
  const supabase = createAdminSupabase();
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN!;

  // 1. Look up venue by phone_number_id
  const { data: venue } = await supabase
    .from("venues")
    .select("*")
    .eq("phone_number_id", incoming.phoneNumberId)
    .eq("is_active", true)
    .single();

  if (!venue) {
    console.error(`No active venue found for phone_number_id: ${incoming.phoneNumberId}`);
    return;
  }

  const typedVenue = venue as Venue;

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
  const { data: savedMessage } = await supabase
    .from("messages")
    .insert({
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
    .select()
    .single();

  // Update conversation language
  await supabase
    .from("conversations")
    .update({ language: classification.language })
    .eq("id", conversation.id);

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
      await createEscalation(supabase, savedMessage!.id, typedVenue.id, null);
      return;
    }

    const sent = await sendWhatsAppMessage(
      incoming.from,
      response.text,
      incoming.phoneNumberId,
      waToken
    );

    await supabase.from("messages").insert({
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

    await createEscalation(supabase, savedMessage!.id, typedVenue.id, draftReply);
  }
}

async function createEscalation(
  supabase: ReturnType<typeof createAdminSupabase>,
  messageId: string,
  venueId: string,
  draftReply: string | null
): Promise<void> {
  await supabase.from("escalations").insert({
    message_id: messageId,
    venue_id: venueId,
    status: "pending",
    draft_reply: draftReply,
  });
}
