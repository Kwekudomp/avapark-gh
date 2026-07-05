"use client";

import { useId, useState } from "react";
import { Send, User, Clock, MessageCircle, CheckCheck } from "lucide-react";
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
  onResolve: (escalationId: string) => void;
}) {
  const replyId = useId();
  const [reply, setReply] = useState(escalation.draft_reply ?? "");
  const [sending, setSending] = useState(false);

  const customerLabel =
    escalation.conversation.customer_name ?? escalation.conversation.customer_phone;

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await onSend(escalation.id, reply);
    setSending(false);
  };

  return (
    <div className="border border-border rounded-2xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <User className="w-4 h-4 text-text-secondary" aria-hidden />
          <span className="font-medium text-sm text-dark">{customerLabel}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            {INTENT_LABELS[escalation.message.intent ?? "other"] ?? "Unknown"}
          </span>
          {escalation.conversation.language && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-bg-alt text-text-secondary">
              {LANGUAGE_LABELS[escalation.conversation.language] ?? escalation.conversation.language}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Clock className="w-3 h-3" aria-hidden />
          {new Date(escalation.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="bg-bg-alt rounded-xl p-3 mb-3">
        <div className="flex items-start gap-2">
          <MessageCircle className="w-4 h-4 text-text-secondary mt-0.5 shrink-0" aria-hidden />
          <p className="text-sm text-dark">{escalation.message.body}</p>
        </div>
      </div>

      {escalation.status === "resolved" ? (
        <p className="flex items-center gap-1.5 text-xs text-green-600">
          <CheckCheck className="w-4 h-4" aria-hidden />
          Resolved
        </p>
      ) : (
        <div className="flex gap-2">
          <label htmlFor={replyId} className="sr-only">
            Reply to {customerLabel}
          </label>
          <textarea
            id={replyId}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply..."
            rows={2}
            className="flex-1 text-sm border border-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleSend}
              disabled={sending || !reply.trim()}
              className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 bg-primary text-white text-xs font-semibold rounded-full hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" aria-hidden />
              {sending ? "Sending…" : "Send"}
            </button>
            <button
              onClick={() => onResolve(escalation.id)}
              className="inline-flex items-center justify-center min-h-11 px-4 bg-white border border-border text-text-secondary text-xs font-semibold rounded-full hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              Resolve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
