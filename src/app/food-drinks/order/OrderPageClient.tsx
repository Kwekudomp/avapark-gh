"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Flame,
  Fish,
  Info,
  ArrowLeft,
  CheckCircle2,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MEAL_LABELS, type MealTime, type DietTag } from "@/data/menu";
import type { MenuItemRow } from "@/lib/supabase";

type OrderType = "dine-in" | "pickup" | "delivery";

interface CartLine {
  id: string;
  name: string;
  subnote?: string;
  price: number;
  quantity: number;
}

const MEAL_FILTERS: { key: MealTime | "all"; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "supper", label: "Supper" },
  { key: "all-day", label: "All Day" },
];

const TAG_STYLES: Record<DietTag, { label: string; Icon: LucideIcon; className: string }> = {
  spicy: { label: "Spicy", Icon: Flame, className: "bg-red-100 text-red-700" },
  seafood: { label: "Seafood", Icon: Fish, className: "bg-blue-100 text-blue-700" },
};

function formatPrice(n: number) {
  return `GHC ${n.toFixed(2)}`;
}

export default function OrderPageClient({ items }: { items: MenuItemRow[] }) {
  const [mealFilter, setMealFilter] = useState<MealTime | "all">("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>("pickup");
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    scheduled_time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ orderId: string; whatsappUrl: string } | null>(null);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (mealFilter !== "all" && item.meal !== mealFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.subnote?.toLowerCase().includes(q) ||
        false
      );
    });
  }, [mealFilter, search, items]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<string, MenuItemRow[]>();
    for (const item of filteredItems) {
      const key = `${MEAL_LABELS[item.meal]} · ${item.category}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries());
  }, [filteredItems]);

  const cartLines = Object.values(cart);
  const itemCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotal = cartLines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  function addToCart(item: MenuItemRow) {
    if (item.price == null) return; // can't order unpriced items
    setCart((prev) => {
      const existing = prev[item.id];
      return {
        ...prev,
        [item.id]: existing
          ? { ...existing, quantity: existing.quantity + 1 }
          : {
              id: item.id,
              name: item.name,
              subnote: item.subnote ?? undefined,
              price: item.price!,
              quantity: 1,
            },
      };
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const next = existing.quantity + delta;
      if (next <= 0) {
        const clone = { ...prev };
        delete clone[id];
        return clone;
      }
      return { ...prev, [id]: { ...existing, quantity: next } };
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => {
      const clone = { ...prev };
      delete clone[id];
      return clone;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          order_type: orderType,
          items: cartLines,
          subtotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit order");
      setSubmitted({ orderId: data.orderId, whatsappUrl: data.whatsappUrl });
      // Auto-open WhatsApp in a new tab
      if (typeof window !== "undefined" && data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function startNewOrder() {
    setCart({});
    setForm({
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      scheduled_time: "",
      notes: "",
    });
    setSubmitted(null);
    setSubmitError(null);
    setShowCart(false);
  }

  /* ── Confirmation view ────────────────────────────── */
  if (submitted) {
    return (
      <main className="pt-28 pb-24 px-[5%] min-h-screen">
        <div className="max-w-xl mx-auto text-center bg-white rounded-2xl border border-border p-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-primary mb-3">
            Order Received
          </h1>
          <p className="text-sm text-text-secondary mb-2">
            Your order is saved and the kitchen has been notified.
          </p>
          <p className="text-xs text-text-secondary/70 mb-6">
            Reference: <span className="font-mono">#{submitted.orderId.slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="text-sm text-text-secondary mb-6">
            If WhatsApp didn&apos;t open automatically, tap the button below and send the pre-filled message to confirm your order.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href={submitted.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-full text-sm font-semibold hover:brightness-95 transition"
            >
              <Phone className="w-4 h-4" strokeWidth={2.5} />
              Send via WhatsApp
            </a>
            <button
              onClick={startNewOrder}
              className="inline-flex items-center px-6 py-3 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary hover:text-white transition"
            >
              Place Another Order
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-32 px-[5%] relative">
      {/* Back link */}
      <div className="max-w-[1200px] mx-auto mb-6">
        <Link
          href="/food-drinks"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to full menu
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-[1200px] mx-auto mb-6 text-center">
        <p className="text-xs font-bold tracking-[4px] text-accent uppercase mb-2">Order Online</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary">
          Build Your Order
        </h1>
        <p className="text-sm text-text-secondary mt-3 max-w-xl mx-auto">
          Pick your items, add to cart, and send your order to the kitchen on WhatsApp. Dine-in, pickup, or delivery.
        </p>
      </div>

      {/* Price disclaimer */}
      <div className="max-w-[1200px] mx-auto mb-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-xs text-yellow-900 leading-relaxed">
          <span className="font-semibold">Items without a price cannot be ordered online yet.</span> The
          kitchen is still finalising prices — those items show as &ldquo;Price on request&rdquo; and
          can be ordered directly on WhatsApp. No payment is taken on this page.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="max-w-[1200px] mx-auto mb-8 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the menu..."
          className="w-full bg-white border border-border rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
        <div className="flex flex-wrap gap-2">
          {MEAL_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setMealFilter(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition ${
                mealFilter === f.key
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-text-secondary hover:border-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      <div className="max-w-[1200px] mx-auto pb-24">
        {groupedByCategory.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <p className="text-base">No items match your search.</p>
          </div>
        ) : (
          groupedByCategory.map(([group, items]) => (
            <div key={group} className="mb-10">
              <h2 className="font-display text-xl font-bold text-primary mb-4">{group}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item) => {
                  const inCart = cart[item.id];
                  const hasPrice = item.price != null;
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border border-border p-4 flex flex-col ${
                        hasPrice ? "" : "opacity-80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-dark text-sm leading-tight">
                            {item.name}
                          </p>
                          {item.subnote && (
                            <p className="text-xs text-text-secondary/70 mt-0.5 italic">
                              ({item.subnote})
                            </p>
                          )}
                        </div>
                        {hasPrice ? (
                          <p className="text-sm font-bold text-accent whitespace-nowrap">
                            {formatPrice(item.price!)}
                          </p>
                        ) : (
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary/60 whitespace-nowrap">
                            On request
                          </p>
                        )}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.tags.map((t) => {
                            const style = TAG_STYLES[t];
                            return (
                              <span
                                key={t}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.className}`}
                              >
                                <style.Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
                                {style.label}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-border">
                        {!hasPrice ? (
                          <p className="text-[11px] text-center text-text-secondary/70 py-1.5">
                            Order via WhatsApp
                          </p>
                        ) : inCart ? (
                          <div className="flex items-center justify-between gap-2">
                            <button
                              onClick={() => updateQty(item.id, -1)}
                              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition"
                              aria-label="Decrease"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-semibold text-sm text-dark">
                              {inCart.quantity} in cart
                            </span>
                            <button
                              onClick={() => updateQty(item.id, 1)}
                              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition"
                              aria-label="Increase"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full bg-primary/5 hover:bg-primary hover:text-white text-primary text-xs font-semibold py-2 rounded-full transition flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                            Add to Order
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating cart button */}
      {itemCount > 0 && !showCart && (
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 hover:-translate-y-0.5 transition-all z-40"
        >
          <ShoppingCart className="w-5 h-5" strokeWidth={2} />
          <span className="font-semibold text-sm">
            View Cart · {itemCount} item{itemCount > 1 ? "s" : ""}
          </span>
          <span className="font-bold text-sm">{formatPrice(subtotal)}</span>
        </button>
      )}

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowCart(false)}
            aria-hidden
          />
          <div className="relative ml-auto w-full max-w-lg h-full bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="font-display text-xl font-bold text-primary">Your Order</h2>
              <button
                onClick={() => setShowCart(false)}
                className="w-9 h-9 rounded-full hover:bg-bg-alt flex items-center justify-center transition"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {cartLines.length === 0 ? (
                <div className="text-center py-12 text-text-secondary">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-text-secondary/40" strokeWidth={1.5} />
                  <p className="text-sm">Your cart is empty.</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 text-primary text-sm font-semibold underline"
                  >
                    Browse the menu
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cartLines.map((line) => (
                      <div key={line.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-dark">{line.name}</p>
                          {line.subnote && (
                            <p className="text-xs text-text-secondary/70 italic">({line.subnote})</p>
                          )}
                          <p className="text-xs text-text-secondary mt-0.5">
                            {formatPrice(line.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => updateQty(line.id, -1)}
                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:border-primary transition"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
                          <button
                            onClick={() => updateQty(line.id, 1)}
                            className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition"
                            aria-label="Increase"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromCart(line.id)}
                            className="ml-2 text-text-secondary/60 hover:text-red-600 transition"
                            aria-label="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">
                        Order Type *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["dine-in", "pickup", "delivery"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setOrderType(t)}
                            className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                              orderType === t
                                ? "bg-primary text-white"
                                : "bg-white border border-border text-text-secondary hover:border-primary"
                            }`}
                          >
                            {t === "dine-in" ? "Dine-in" : t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">
                        Your Name *
                      </label>
                      <input
                        required
                        value={form.customer_name}
                        onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                        placeholder="Full name"
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">
                        Phone *
                      </label>
                      <input
                        required
                        type="tel"
                        value={form.customer_phone}
                        onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                        placeholder="+233 ..."
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.customer_email}
                        onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                        placeholder="you@email.com (optional)"
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">
                        {orderType === "dine-in" ? "Dining Time" : orderType === "pickup" ? "Pickup Time" : "Delivery Time"}
                      </label>
                      <input
                        type="text"
                        value={form.scheduled_time}
                        onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                        placeholder={orderType === "delivery" ? "Address + preferred time" : "e.g. 7:00 PM"}
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">
                        Notes for the Kitchen
                      </label>
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Allergies, cooking preferences, delivery instructions..."
                        className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
                      />
                    </div>

                    {submitError && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {submitError}
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>

            {/* Footer */}
            {cartLines.length > 0 && (
              <div className="border-t border-border px-6 py-4 bg-bg-alt">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
                    Estimated Total
                  </span>
                  <span className="font-display text-xl font-bold text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    const formEl = document.querySelector("form");
                    if (formEl) formEl.requestSubmit();
                    else handleSubmit(e as unknown as React.FormEvent);
                  }}
                  disabled={submitting}
                  className="w-full bg-accent text-white py-3 rounded-full text-sm font-semibold hover:bg-accent-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? "Sending..." : "Send Order to Kitchen"}
                </button>
                <p className="text-[10px] text-text-secondary/60 text-center mt-2">
                  Submits to the kitchen and opens WhatsApp with your order summary.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
