"use client";

import { useId, useState } from "react";
import { Plus, HelpCircle, Pencil, Trash2, Save, X } from "lucide-react";
import WhatsAppTabs from "./WhatsAppTabs";
import { useToast } from "../ui/Toast";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import type { FAQ } from "@/lib/whatsapp/types";

export default function FaqsCMSClient({ initialFaqs }: { initialFaqs: FAQ[] }) {
  const { toast } = useToast();
  const formId = useId();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [editing, setEditing] = useState<Partial<FAQ> | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!editing?.question || !editing?.answer) return;

    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editing.id) {
          setFaqs((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
        } else {
          setFaqs((prev) => [saved, ...prev]);
        }
        setEditing(null);
        toast("success", "FAQ saved.");
      } else {
        toast("error", "Could not save the FAQ — please try again.");
      }
    } catch {
      toast("error", "Could not save the FAQ — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch("/api/whatsapp/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: false }),
      });

      if (res.ok) {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        toast("success", "FAQ deleted.");
      } else {
        toast("error", "Could not delete the FAQ — please try again.");
      }
    } catch {
      toast("error", "Could not delete the FAQ — check your connection and try again.");
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-dark">FAQs</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Questions the AI agent can answer automatically.
          </p>
        </div>
        <button
          onClick={() => setEditing({ question: "", answer: "", category: "general" })}
          className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-light transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" aria-hidden />
          Add FAQ
        </button>
      </div>

      <WhatsAppTabs />

      <div className="space-y-3 pb-8">
        {editing && (
          <div className="bg-white border-2 border-primary/30 rounded-2xl p-4 space-y-3">
            <div>
              <label htmlFor={`${formId}-question`} className="block text-xs font-semibold text-text-secondary mb-1">
                Question
              </label>
              <input
                id={`${formId}-question`}
                value={editing.question ?? ""}
                onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                placeholder="e.g., Is the park pet-friendly?"
                className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-answer`} className="block text-xs font-semibold text-text-secondary mb-1">
                Answer
              </label>
              <textarea
                id={`${formId}-answer`}
                value={editing.answer ?? ""}
                onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                placeholder="Answer..."
                rows={3}
                className="w-full text-sm border border-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor={`${formId}-category`} className="block text-xs font-semibold text-text-secondary mb-1">
                Category
              </label>
              <input
                id={`${formId}-category`}
                value={editing.category ?? "general"}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="e.g., general, rules, amenities"
                className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" aria-hidden />
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="inline-flex items-center gap-1.5 min-h-11 px-4 bg-white border border-border text-text-secondary text-sm font-semibold rounded-full hover:border-primary transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden />
                Cancel
              </button>
            </div>
          </div>
        )}

        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm text-dark">{faq.question}</p>
                <p className="text-sm text-text-secondary mt-1">{faq.answer}</p>
                <span className="text-[10px] px-2 py-0.5 bg-bg-alt text-text-secondary rounded-full mt-2 inline-block">
                  {faq.category}
                </span>
              </div>
              <div className="flex gap-1 ml-3 shrink-0">
                <button
                  onClick={() => setEditing(faq)}
                  aria-label={`Edit FAQ: ${faq.question}`}
                  className="flex items-center justify-center min-h-11 min-w-11 rounded-xl text-text-secondary hover:text-primary hover:bg-bg-alt transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" aria-hidden />
                </button>
                <button
                  onClick={() => setConfirmDelete(faq)}
                  aria-label={`Delete FAQ: ${faq.question}`}
                  className="flex items-center justify-center min-h-11 min-w-11 rounded-xl text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        ))}

        {faqs.length === 0 && !editing && (
          <div className="text-center py-16 text-text-secondary bg-white rounded-2xl border border-border">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" aria-hidden />
            <p className="text-sm">No FAQs yet. Add some to teach the AI agent.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete this FAQ?"
        message={
          confirmDelete
            ? `"${confirmDelete.question}" will be removed and the AI agent will no longer use it to answer guests.`
            : ""
        }
        confirmLabel="Delete FAQ"
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
