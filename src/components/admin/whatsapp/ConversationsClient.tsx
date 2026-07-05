"use client";

import { useState } from "react";
import { ArrowLeft, Search, ChevronRight, MessageSquare } from "lucide-react";
import MessageBubble from "./MessageBubble";
import WhatsAppTabs from "./WhatsAppTabs";
import type { Conversation, Message } from "@/lib/whatsapp/types";

interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English", tw: "Twi", ee: "Ewe", ga: "Ga", fr: "French", pid: "Pidgin",
};

export default function ConversationsClient({
  conversations,
}: {
  conversations: ConversationWithMessages[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ConversationWithMessages | null>(null);

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.customer_name ?? "").toLowerCase().includes(q) ||
      c.customer_phone.includes(q)
    );
  });

  if (selected) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelected(null)}
            aria-label="Back to conversations"
            className="flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-border bg-white text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-dark">
              {selected.customer_name ?? selected.customer_phone}
            </h1>
            <p className="text-sm text-text-secondary">{selected.customer_phone}</p>
          </div>
          <span className="text-xs px-2 py-0.5 bg-white border border-border text-text-secondary rounded-full ml-auto">
            {LANGUAGE_LABELS[selected.language] ?? selected.language}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-border p-4">
          {selected.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-dark">Conversations</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Full WhatsApp chat history with guests.
        </p>
      </div>

      <WhatsAppTabs />

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          aria-label="Search conversations by name or phone"
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      <div className="space-y-2 pb-8">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-secondary bg-white rounded-2xl border border-border">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden />
            <p className="text-sm">No conversations found.</p>
          </div>
        )}
        {filtered.map((conv) => {
          const lastMsg = conv.messages[conv.messages.length - 1];
          return (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className="w-full flex items-center gap-3 min-h-11 p-3 bg-white rounded-2xl border border-border hover:border-primary transition-colors cursor-pointer text-left"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm shrink-0" aria-hidden>
                {(conv.customer_name ?? conv.customer_phone).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-dark truncate">
                    {conv.customer_name ?? conv.customer_phone}
                  </p>
                  <span className="text-[10px] text-text-secondary shrink-0 ml-2">
                    {new Date(conv.last_message_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-text-secondary truncate mt-0.5">
                  {lastMsg?.body ?? "No messages"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-secondary shrink-0" aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
