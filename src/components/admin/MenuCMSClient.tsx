"use client";

import { useMemo, useState } from "react";
import type { MenuItemRow, MenuItemMeal, MenuItemTag } from "@/lib/supabase";

const MEAL_OPTIONS: { key: MenuItemMeal | "all"; label: string }[] = [
  { key: "all", label: "All meals" },
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "supper", label: "Supper" },
  { key: "all-day", label: "All Day" },
];

const MEAL_LABEL: Record<MenuItemMeal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  supper: "Supper",
  "all-day": "All Day",
};

function formatPrice(n: number | null) {
  return n == null ? "—" : `GHC ${n.toFixed(2)}`;
}

interface Edit {
  price: string;
  available: boolean;
}

export default function MenuCMSClient({ initialItems }: { initialItems: MenuItemRow[] }) {
  const [items, setItems] = useState<MenuItemRow[]>(initialItems);
  const [mealFilter, setMealFilter] = useState<MenuItemMeal | "all">("all");
  const [search, setSearch] = useState("");
  const [showOnlyUnpriced, setShowOnlyUnpriced] = useState(false);
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (mealFilter !== "all" && i.meal !== mealFilter) return false;
      if (showOnlyUnpriced && i.price != null) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)
      );
    });
  }, [items, mealFilter, showOnlyUnpriced, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, MenuItemRow[]>();
    for (const item of filtered) {
      const key = `${MEAL_LABEL[item.meal]} · ${item.category}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  const stats = useMemo(() => {
    const total = items.length;
    const priced = items.filter((i) => i.price != null).length;
    const unavailable = items.filter((i) => !i.available).length;
    return { total, priced, unpriced: total - priced, unavailable };
  }, [items]);

  function getEdit(item: MenuItemRow): Edit {
    return (
      edits[item.id] ?? {
        price: item.price?.toString() ?? "",
        available: item.available,
      }
    );
  }

  function setEdit(id: string, patch: Partial<Edit>) {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { price: "", available: true }), ...patch },
    }));
  }

  function hasChanges(item: MenuItemRow) {
    const e = edits[item.id];
    if (!e) return false;
    const currentPrice = item.price?.toString() ?? "";
    return e.price !== currentPrice || e.available !== item.available;
  }

  async function saveItem(item: MenuItemRow) {
    const e = edits[item.id];
    if (!e) return;

    const parsedPrice = e.price.trim() === "" ? null : Number(e.price);
    if (parsedPrice != null && (Number.isNaN(parsedPrice) || parsedPrice < 0)) {
      alert("Price must be a valid positive number or empty");
      return;
    }

    setSaving(item.id);
    try {
      const res = await fetch(`/api/menu-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: parsedPrice, available: e.available }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, price: parsedPrice, available: e.available } : it)),
      );
      setEdits((prev) => {
        const clone = { ...prev };
        delete clone[item.id];
        return clone;
      });
      setSavedFlash(item.id);
      setTimeout(() => setSavedFlash(null), 1500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total items", value: stats.total, color: "text-primary" },
          { label: "Priced", value: stats.priced, color: "text-green-600" },
          { label: "Awaiting price", value: stats.unpriced, color: "text-yellow-600" },
          { label: "Hidden", value: stats.unavailable, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-4 text-center">
            <p className="text-xs text-text-secondary uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, category or ID..."
          className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
        <div className="flex flex-wrap gap-2 items-center">
          {MEAL_OPTIONS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMealFilter(m.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                mealFilter === m.key
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-text-secondary hover:border-primary"
              }`}
            >
              {m.label}
            </button>
          ))}
          <label className="ml-auto inline-flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyUnpriced}
              onChange={(e) => setShowOnlyUnpriced(e.target.checked)}
              className="rounded border-border"
            />
            Only items without a price
          </label>
        </div>
      </div>

      {/* List */}
      {grouped.length === 0 ? (
        <div className="text-center py-16 text-text-secondary bg-white rounded-2xl border border-border">
          <p>No items match your filters</p>
        </div>
      ) : (
        grouped.map(([group, groupItems]) => (
          <div key={group} className="mb-8">
            <h3 className="font-semibold text-primary mb-3">{group}</h3>
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-alt text-xs uppercase tracking-wider text-text-secondary">
                  <tr>
                    <th className="text-left px-4 py-3">Item</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Tags</th>
                    <th className="text-left px-4 py-3 w-40">Price (GHC)</th>
                    <th className="text-left px-4 py-3 w-28">Available</th>
                    <th className="text-right px-4 py-3 w-28">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupItems.map((item) => {
                    const edit = getEdit(item);
                    const changed = hasChanges(item);
                    const isSaving = saving === item.id;
                    const justSaved = savedFlash === item.id;
                    return (
                      <tr key={item.id} className="border-t border-border">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-dark">{item.name}</p>
                          {item.subnote && (
                            <p className="text-xs text-text-secondary italic">({item.subnote})</p>
                          )}
                          <p className="text-[10px] text-text-secondary/50 font-mono mt-0.5">{item.id}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((t: MenuItemTag) => (
                              <span
                                key={t}
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  t === "spicy"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={edit.price}
                            placeholder="—"
                            onChange={(e) => setEdit(item.id, { price: e.target.value })}
                            className="w-28 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={edit.available}
                              onChange={(e) => setEdit(item.id, { available: e.target.checked })}
                              className="rounded border-border"
                            />
                            <span className="text-xs text-text-secondary">
                              {edit.available ? "Visible" : "Hidden"}
                            </span>
                          </label>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => saveItem(item)}
                            disabled={!changed || isSaving}
                            className="px-4 py-1.5 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isSaving ? "Saving..." : justSaved ? "Saved" : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <p className="text-xs text-text-secondary/70 text-center mt-8">
        Leave the price blank to show &ldquo;Price on request&rdquo; on the public page. Items without a
        price cannot be added to an online order — guests order them directly on WhatsApp.
      </p>
    </div>
  );
}
