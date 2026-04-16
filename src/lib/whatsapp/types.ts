// --- Meta WhatsApp Cloud API types ---

export interface WhatsAppWebhookPayload {
  object: "whatsapp_business_account";
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: "whatsapp";
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: "text" | "image" | "audio" | "document" | "interactive" | "button";
          text?: { body: string };
        }>;
        statuses?: Array<{
          id: string;
          status: "sent" | "delivered" | "read" | "failed";
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: "messages";
    }>;
  }>;
}

export interface WhatsAppIncomingMessage {
  messageId: string;
  from: string;
  customerName: string;
  text: string;
  timestamp: string;
  phoneNumberId: string;
}

// --- ParkPilot domain types ---

export type Intent = "faq" | "booking" | "complaint" | "order_status" | "availability" | "other";
export type Language = "en" | "tw" | "ee" | "ga" | "fr" | "pid";
export type MessageDirection = "inbound" | "outbound";
export type MessageSender = "customer" | "ai" | "staff";
export type EscalationStatus = "pending" | "assigned" | "resolved";
export type ConversationStatus = "active" | "closed";

export interface ClassificationResult {
  intent: Intent;
  confidence: number;
  category: string;
  language: Language;
}

export interface ResolvedContext {
  facts: Array<{ key: string; value: string }>;
  source: string;
  isEmpty: boolean;
}

export interface Venue {
  id: string;
  name: string;
  phone_number_id: string;
  timezone: string;
  supported_languages: Language[];
  brand_voice: string;
  is_active: boolean;
}

export interface Conversation {
  id: string;
  venue_id: string;
  customer_phone: string;
  customer_name: string | null;
  language: string;
  status: ConversationStatus;
  started_at: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: MessageDirection;
  body: string;
  intent: Intent | null;
  language: string | null;
  confidence: number | null;
  category: string | null;
  sent_by: MessageSender;
  wa_message_id: string | null;
  sent_at: string;
}

export interface Escalation {
  id: string;
  message_id: string;
  venue_id: string;
  status: EscalationStatus;
  assigned_to: string | null;
  draft_reply: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface FAQ {
  id: string;
  venue_id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
}

export interface Closure {
  id: string;
  venue_id: string;
  closure_date: string;
  reason: string;
}
