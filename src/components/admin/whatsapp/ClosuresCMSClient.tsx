"use client";

import { useId, useState } from "react";
import { Plus, CalendarOff, Trash2, Save, X } from "lucide-react";
import WhatsAppTabs from "./WhatsAppTabs";
import { useToast } from "../ui/Toast";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import type { Closure } from "@/lib/whatsapp/types";

const fmtDate = (d: string) =>
  new Date(d + "T00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

export default function ClosuresCMSClient({ initialClosures }: { initialClosures: Closure[] }) {
  const { toast } = useToast();
  const formId = useId();
  const [closures, setClosures] = useState(initialClosures);
  const [adding, setAdding] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Closure | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async () => {
    if (!newDate || !newReason) return;

    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp/closures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closure_date: newDate, reason: newReason }),
      });

      if (res.ok) {
        const saved = await res.json();
        setClosures((prev) => [...prev, saved].sort((a, b) => a.closure_date.localeCompare(b.closure_date)));
        setAdding(false);
        setNewDate("");
        setNewReason("");
        toast("success", "Closure added.");
      } else {
        toast("error", "Could not add the closure — please try again.");
      }
    } catch {
      toast("error", "Could not add the closure — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch("/api/whatsapp/closures", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setClosures((prev) => prev.filter((c) => c.id !== id));
        toast("success", "Closure removed.");
      } else {
        toast("error", "Could not remove the closure — please try again.");
      }
    } catch {
      toast("error", "Could not remove the closure — check your connection and try again.");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = closures.filter((c) => c.closure_date >= today);
  const past = closures.filter((c) => c.closure_date < today);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Closures</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Dates the AI agent should tell guests the park is closed.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-light transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Add Closure
        </button>
      </div>

      <WhatsAppTabs />

      <div className="space-y-3 pb-8">
        {adding && (
          <div className="bg-white border-2 border-primary/30 rounded-2xl p-4 space-y-3">
            <div>
              <label htmlFor={`${formId}-date`} className="block text-xs font-semibold text-text-secondary mb-1">
                Date
              </label>
              <input
                id={`${formId}-date`}
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={today}
                className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-reason`} className="block text-xs font-semibold text-text-secondary mb-1">
                Reason
              </label>
              <input
                id={`${formId}-reason`}
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g., Private event, Maintenance"
                className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving}
                className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" aria-hidden />
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setAdding(false)}
                className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-white border border-border text-text-secondary text-sm font-semibold rounded-full hover:border-primary transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden />
                Cancel
              </button>
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider pt-2">Upcoming</h2>
            {upcoming.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-dark">{fmtDate(c.closure_date)}</p>
                  <p className="text-sm text-text-secondary">{c.reason}</p>
                </div>
                <button
                  onClick={() => setConfirmDelete(c)}
                  aria-label={`Remove closure on ${fmtDate(c.closure_date)}`}
                  className="flex items-center justify-center min-h-11 min-w-11 rounded-xl text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" aria-hidden />
                </button>
              </div>
            ))}
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider pt-4">Past</h2>
            {past.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-border p-4 opacity-50">
                <p className="font-medium text-sm text-dark">{fmtDate(c.closure_date)}</p>
                <p className="text-sm text-text-secondary">{c.reason}</p>
              </div>
            ))}
          </>
        )}

        {closures.length === 0 && !adding && (
          <div className="text-center py-16 text-text-secondary bg-white rounded-2xl border border-border">
            <CalendarOff className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden />
            <p className="text-sm">No closures scheduled.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Remove this closure?"
        message={
          confirmDelete
            ? `${fmtDate(confirmDelete.closure_date)} — ${confirmDelete.reason}. The AI agent will stop telling guests the park is closed on this date.`
            : ""
        }
        confirmLabel="Remove closure"
        danger
        busy={deleting}
        onConfirm={() => {
          if (confirmDelete) handleDelete(confirmDelete.id);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
