"use client";

import { useState } from "react";
import { ArrowLeft, MessageSquare, Search, ChevronRight } from "lucide-react";
import MessageBubble from "./MessageBubble";
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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="font-medium text-sm">{selected.customer_name ?? selected.customer_phone}</p>
              <p className="text-xs text-gray-400">{selected.customer_phone}</p>
            </div>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full ml-auto">
              {LANGUAGE_LABELS[selected.language] ?? selected.language}
            </span>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-4">
          {selected.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/admin/whatsapp/inbox" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <h1 className="font-semibold text-lg">Conversations</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          {filtered.map((conv) => {
            const lastMsg = conv.messages[conv.messages.length - 1];
            return (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-emerald-200 transition text-left"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-medium text-sm shrink-0">
                  {(conv.customer_name ?? conv.customer_phone).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">{conv.customer_name ?? conv.customer_phone}</p>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                      {new Date(conv.last_message_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{lastMsg?.body ?? "No messages"}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
