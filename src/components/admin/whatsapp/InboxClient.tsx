"use client";

import { useEffect, useRef, useState } from "react";
import { Inbox, RefreshCw } from "lucide-react";
import EscalationCard from "./EscalationCard";
import WhatsAppTabs from "./WhatsAppTabs";
import { useToast } from "../ui/Toast";
import { ConfirmDialog } from "../ui/ConfirmDialog";
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
  const { toast } = useToast();
  const [escalations, setEscalations] = useState(initialEscalations);
  const [filter, setFilter] = useState<"pending" | "resolved">("pending");
  const [confirmResolve, setConfirmResolve] = useState<EscalationWithContext | null>(null);
  const [resolving, setResolving] = useState(false);
  const escalationsRef = useRef(escalations);

  useEffect(() => {
    escalationsRef.current = escalations;
  }, [escalations]);

  useEffect(() => {
    const poll = async () => {
      try {
        const newest = escalationsRef.current.reduce<string | null>(
          (max, e) => (!max || e.created_at > max ? e.created_at : max),
          null
        );
        const params = new URLSearchParams({ venueId });
        if (newest) params.set("after", newest);

        const res = await fetch(`/api/whatsapp/escalations?${params.toString()}`);
        if (!res.ok) return;

        const data = await res.json();
        const incoming: EscalationWithContext[] = data.escalations ?? [];
        if (incoming.length === 0) return;

        setEscalations((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const fresh = incoming.filter((e) => !existingIds.has(e.id));
          if (fresh.length === 0) return prev;
          return [...fresh, ...prev];
        });
      } catch {
        // Ignore polling errors; next tick will retry.
      }
    };

    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, [venueId]);

  const markResolved = (escalationId: string) => {
    setEscalations((prev) =>
      prev.map((e) =>
        e.id === escalationId
          ? { ...e, status: "resolved" as const, resolved_at: new Date().toISOString() }
          : e
      )
    );
  };

  const handleSend = async (escalationId: string, reply: string) => {
    try {
      const res = await fetch("/api/whatsapp/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escalationId, reply }),
      });

      if (res.ok) {
        markResolved(escalationId);
        toast("success", "Reply sent to the guest.");
      } else {
        toast("error", "Could not send the reply — please try again.");
      }
    } catch {
      toast("error", "Could not send the reply — check your connection and try again.");
    }
  };

  const handleResolve = async (escalationId: string) => {
    setResolving(true);
    try {
      const res = await fetch("/api/whatsapp/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ escalationId }),
      });

      if (res.ok) {
        markResolved(escalationId);
        toast("success", "Escalation resolved without a reply.");
      } else {
        toast("error", "Could not resolve the escalation — please try again.");
      }
    } catch {
      toast("error", "Could not resolve the escalation — check your connection and try again.");
    } finally {
      setResolving(false);
      setConfirmResolve(null);
    }
  };

  const filtered = escalations.filter((e) => {
    if (filter === "pending") return e.status === "pending" || e.status === "assigned";
    return e.status === "resolved";
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark">WhatsApp Inbox</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Escalated messages that need a human reply.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          aria-label="Refresh inbox"
          className="flex items-center justify-center min-h-11 min-w-11 rounded-xl border border-border bg-white text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4" aria-hidden />
        </button>
      </div>

      <WhatsAppTabs />

      <div className="flex gap-2 mb-4">
        {(["pending", "resolved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`inline-flex items-center gap-1.5 min-h-11 px-4 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
              filter === f
                ? "bg-dark text-white"
                : "bg-white border border-border text-text-secondary hover:border-primary"
            }`}
          >
            {f}
            {f === "pending" && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">
                {escalations.filter((e) => e.status === "pending" || e.status === "assigned").length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3 pb-8">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-text-secondary bg-white rounded-2xl border border-border">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden />
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
            onResolve={() => setConfirmResolve(esc)}
          />
        ))}
      </div>

      <ConfirmDialog
        open={confirmResolve !== null}
        title="Resolve without replying?"
        message={
          confirmResolve
            ? `The escalation from ${confirmResolve.conversation.customer_name ?? confirmResolve.conversation.customer_phone} will be marked as resolved and the guest will NOT receive a reply.`
            : ""
        }
        confirmLabel="Resolve"
        danger
        busy={resolving}
        onConfirm={() => {
          if (confirmResolve) handleResolve(confirmResolve.id);
        }}
        onCancel={() => setConfirmResolve(null)}
      />
    </div>
  );
}
