"use client";

import type { Message } from "@/lib/whatsapp/types";

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  tw: "Twi",
  ee: "Ewe",
  ga: "Ga",
  fr: "French",
  pid: "Pidgin",
};

export default function MessageBubble({ message }: { message: Message }) {
  const isInbound = message.direction === "inbound";

  return (
    <div className={`flex ${isInbound ? "justify-start" : "justify-end"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isInbound
            ? "bg-gray-100 text-gray-900 rounded-bl-md"
            : message.sent_by === "ai"
            ? "bg-emerald-50 text-emerald-900 rounded-br-md border border-emerald-200"
            : "bg-blue-50 text-blue-900 rounded-br-md border border-blue-200"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.body}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-400">
            {new Date(message.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isInbound && message.language && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full">
              {LANGUAGE_LABELS[message.language] ?? message.language}
            </span>
          )}
          {!isInbound && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              message.sent_by === "ai" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
            }`}>
              {message.sent_by === "ai" ? "Auto" : "Staff"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
