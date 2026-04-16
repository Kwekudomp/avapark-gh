"use client";

import { useState } from "react";
import { Send, User, Clock, MessageCircle } from "lucide-react";
import type { Escalation, Message, Conversation } from "@/lib/whatsapp/types";

interface EscalationWithContext extends Escalation {
  message: Message;
  conversation: Conversation;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English", tw: "Twi", ee: "Ewe", ga: "Ga", fr: "French", pid: "Pidgin",
};

const INTENT_LABELS: Record<string, string> = {
  booking: "Booking Request",
  complaint: "Complaint",
  other: "Other",
  faq: "FAQ (low confidence)",
  availability: "Availability",
  order_status: "Order Status",
};

export default function EscalationCard({
  escalation,
  onSend,
  onResolve,
}: {
  escalation: EscalationWithContext;
  onSend: (escalationId: string, reply: string) => Promise<void>;
  onResolve: (escalationId: string) => Promise<void>;
}) {
  const [reply, setReply] = useState(escalation.draft_reply ?? "");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await onSend(escalation.id, reply);
    setSending(false);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-sm">
            {escalation.conversation.customer_name ?? escalation.conversation.customer_phone}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            {INTENT_LABELS[escalation.message.intent ?? "other"] ?? "Unknown"}
          </span>
          {escalation.conversation.language && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {LANGUAGE_LABELS[escalation.conversation.language] ?? escalation.conversation.language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          {new Date(escalation.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-800">{escalation.message.body}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply..."
          rows={2}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <div className="flex flex-col gap-1">
          <button
            onClick={handleSend}
            disabled={sending || !reply.trim()}
            className="px-3 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            Send
          </button>
          <button
            onClick={() => onResolve(escalation.id)}
            className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  );
}
