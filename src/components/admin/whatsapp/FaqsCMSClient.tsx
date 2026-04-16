"use client";

import { useState } from "react";
import { ArrowLeft, Plus, HelpCircle, Pencil, Trash2, Save, X } from "lucide-react";
import type { FAQ } from "@/lib/whatsapp/types";

export default function FaqsCMSClient({ initialFaqs }: { initialFaqs: FAQ[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [editing, setEditing] = useState<Partial<FAQ> | null>(null);

  const handleSave = async () => {
    if (!editing?.question || !editing?.answer) return;

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
    }
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/whatsapp/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: false }),
    });
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin/whatsapp/inbox" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h1 className="font-semibold text-lg">FAQs</h1>
          </div>
          <button
            onClick={() => setEditing({ question: "", answer: "", category: "general" })}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add FAQ
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-3 pb-8">
        {editing && (
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 space-y-3">
            <input
              value={editing.question ?? ""}
              onChange={(e) => setEditing({ ...editing, question: e.target.value })}
              placeholder="Question (e.g., Is the park pet-friendly?)"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <textarea
              value={editing.answer ?? ""}
              onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
              placeholder="Answer..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              value={editing.category ?? "general"}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              placeholder="Category (e.g., general, rules, amenities)"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700"
              >
                <Save className="w-3 h-3" /> Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        )}

        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">{faq.question}</p>
                <p className="text-sm text-gray-500 mt-1">{faq.answer}</p>
                <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full mt-2 inline-block">
                  {faq.category}
                </span>
              </div>
              <div className="flex gap-1 ml-3 shrink-0">
                <button
                  onClick={() => setEditing(faq)}
                  className="p-1.5 text-gray-400 hover:text-emerald-600"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {faqs.length === 0 && !editing && (
          <div className="text-center py-16 text-gray-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No FAQs yet. Add some to teach the AI agent.</p>
          </div>
        )}
      </div>
    </div>
  );
}
