"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import { Inbox, RefreshCw, ArrowLeft } from "lucide-react";
import EscalationCard from "./EscalationCard";
import type { Escalation, Message, Conversation } from "@/lib/whatsapp/types";

interface EscalationWithContext extends Escalation {
  message: Message;
  conversation: Conversation;
}

export default function InboxClient({
  initialEscalations,
  venueId,
}: {
  initialEscalations: EscalationWithContext[];
  venueId: string;
}) {
  const [escalations, setEscalations] = useState(initialEscalations);
  const [filter, setFilter] = useState<"pending" | "resolved">("pending");
  const supabase = createBrowserSupabase();

  useEffect(() => {
    const channel = supabase
      .channel("escalations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "escalations",
          filter: `venue_id=eq.${venueId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from("escalations")
            .select("*, message:messages(*), conversation:messages(conversation:conversations(*))")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setEscalations((prev) => [data as unknown as EscalationWithContext, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, venueId]);

  const handleSend = async (escalationId: string, reply: string) => {
    const res = await fetch("/api/whatsapp/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ escalationId, reply }),
    });

    if (res.ok) {
      setEscalations((prev) =>
        prev.map((e) =>
          e.id === escalationId
            ? { ...e, status: "resolved" as const, resolved_at: new Date().toISOString() }
            : e
        )
      );
    }
  };

  const handleResolve = async (escalationId: string) => {
    await fetch("/api/whatsapp/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ escalationId }),
    });

    setEscalations((prev) =>
      prev.map((e) =>
        e.id === escalationId
          ? { ...e, status: "resolved" as const, resolved_at: new Date().toISOString() }
          : e
      )
    );
  };

  const filtered = escalations.filter((e) => {
    if (filter === "pending") return e.status === "pending" || e.status === "assigned";
    return e.status === "resolved";
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <Inbox className="w-5 h-5 text-emerald-600" />
            <h1 className="font-semibold text-lg">WhatsApp Inbox</h1>
            {filter === "pending" && (
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                {filtered.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-4">
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              filter === "pending" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("resolved")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              filter === "resolved" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
            }`}
          >
            Resolved
          </button>
        </div>

        <div className="space-y-3 pb-8">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {filter === "pending" ? "No pending escalations" : "No resolved escalations"}
              </p>
            </div>
          )}
          {filtered.map((esc) => (
            <EscalationCard
              key={esc.id}
              escalation={esc}
              onSend={handleSend}
              onResolve={handleResolve}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
