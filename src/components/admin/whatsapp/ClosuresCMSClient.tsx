"use client";

import { useState } from "react";
import { ArrowLeft, Plus, CalendarOff, Trash2, Save, X } from "lucide-react";
import type { Closure } from "@/lib/whatsapp/types";

export default function ClosuresCMSClient({ initialClosures }: { initialClosures: Closure[] }) {
  const [closures, setClosures] = useState(initialClosures);
  const [adding, setAdding] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  const handleAdd = async () => {
    if (!newDate || !newReason) return;

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
    }
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/whatsapp/closures", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setClosures((prev) => prev.filter((c) => c.id !== id));
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = closures.filter((c) => c.closure_date >= today);
  const past = closures.filter((c) => c.closure_date < today);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin/whatsapp/inbox" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <CalendarOff className="w-5 h-5 text-emerald-600" />
            <h1 className="font-semibold text-lg">Closures</h1>
          </div>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add Closure
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-4 space-y-3 pb-8">
        {adding && (
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 space-y-3">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={today}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Reason (e.g., Private event, Maintenance)"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
                <Save className="w-3 h-3" /> Save
              </button>
              <button onClick={() => setAdding(false)} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">Upcoming</h2>
            {upcoming.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{new Date(c.closure_date + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                  <p className="text-sm text-gray-500">{c.reason}</p>
                </div>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-4">Past</h2>
            {past.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4 opacity-50">
                <p className="font-medium text-sm">{new Date(c.closure_date + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
                <p className="text-sm text-gray-500">{c.reason}</p>
              </div>
            ))}
          </>
        )}

        {closures.length === 0 && !adding && (
          <div className="text-center py-16 text-gray-400">
            <CalendarOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No closures scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
}
