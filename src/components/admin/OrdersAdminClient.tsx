"use client";

import { useMemo, useState } from "react";
import {
  UtensilsCrossed, ShoppingBag, Bike, Clock, Phone, StickyNote,
  ChevronRight, X,
} from "lucide-react";
import type { Order, OrderStatus, OrderType } from "@/lib/types";
import { useToast } from "./ui/Toast";
import { ConfirmDialog } from "./ui/ConfirmDialog";

// Active kitchen pipeline (excludes the two terminal states).
const PIPELINE: OrderStatus[] = ["new", "confirmed", "preparing", "ready"];
const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  new: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "delivered",
};
const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  new: "Accept",
  confirmed: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark delivered",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  new: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

const TYPE_ICON: Record<OrderType, typeof UtensilsCrossed> = {
  "dine-in": UtensilsCrossed,
  pickup: ShoppingBag,
  delivery: Bike,
};

const FILTERS = ["active", "new", "confirmed", "preparing", "ready", "delivered", "cancelled", "all"] as const;
type Filter = (typeof FILTERS)[number];

function money(n: number) {
  return `GHC ${n.toFixed(2)}`;
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-GH", { day: "numeric", month: "short" });
}

export default function OrdersAdminClient({ initialOrders }: { initialOrders: Order[] }) {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [filter, setFilter] = useState<Filter>("active");
  const [updating, setUpdating] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<Order | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { active: 0 };
    for (const o of orders) {
      c[o.status] = (c[o.status] ?? 0) + 1;
      if (PIPELINE.includes(o.status)) c.active++;
    }
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "active") return orders.filter(o => PIPELINE.includes(o.status));
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  async function setStatus(order: Order, status: OrderStatus) {
    setUpdating(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o));
        toast("success", status === "cancelled" ? "Order cancelled." : `Order marked ${status}.`);
        setPendingCancel(null);
      } else {
        const data = await res.json().catch(() => ({}));
        toast("error", `Could not update order: ${data.error ?? res.status}`);
      }
    } catch {
      toast("error", "Could not update order — check your connection and try again.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-dark">Online Orders</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Food &amp; drink orders placed on the website. Move each one through the kitchen as you work it.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => {
          const n = f === "all" ? orders.length : counts[f] ?? 0;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`min-h-11 px-4 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
                filter === f ? "bg-primary text-white" : "bg-white border border-border text-text-secondary hover:border-primary"
              }`}
            >
              {f}{n > 0 ? ` (${n})` : ""}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border text-center py-16 text-text-secondary">
          {filter === "active" ? "No orders in the kitchen right now." : "No orders here."}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visible.map(order => {
            const TypeIcon = TYPE_ICON[order.order_type];
            const next = NEXT_STATUS[order.status];
            const busy = updating === order.id;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-secondary">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STATUS_STYLE[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="font-semibold text-dark mt-1">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="inline-flex items-center gap-1 text-xs text-text-secondary capitalize">
                      <TypeIcon className="w-3.5 h-3.5" aria-hidden /> {order.order_type}
                    </p>
                    <p className="inline-flex items-center gap-1 text-xs text-text-secondary mt-0.5">
                      <Clock className="w-3.5 h-3.5" aria-hidden /> {timeAgo(order.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                  <a href={`tel:${order.customer_phone}`} className="inline-flex items-center gap-1 text-accent hover:underline">
                    <Phone className="w-3.5 h-3.5" aria-hidden /> {order.customer_phone}
                  </a>
                  {order.scheduled_time && (
                    <span className="text-text-secondary">for {order.scheduled_time}</span>
                  )}
                </div>

                <ul className="mt-3 border-t border-border pt-3 space-y-1">
                  {order.items.map((it, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-dark">{it.quantity}× {it.name}{it.subnote ? ` (${it.subnote})` : ""}</span>
                      <span className="text-text-secondary">{money(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between mt-2 pt-2 border-t border-border font-semibold text-sm">
                  <span className="text-dark">Estimated total</span>
                  <span className="text-primary">{money(order.subtotal)}</span>
                </div>

                {order.notes && (
                  <p className="mt-3 flex items-start gap-1.5 text-xs text-text-secondary bg-bg-alt rounded-lg px-3 py-2">
                    <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden /> {order.notes}
                  </p>
                )}

                {order.status !== "delivered" && order.status !== "cancelled" && (
                  <div className="flex gap-2 mt-4">
                    {next && (
                      <button
                        onClick={() => setStatus(order, next)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 min-h-11 px-4 bg-primary text-white rounded-full text-xs font-medium hover:bg-primary-light transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {busy ? "Saving…" : NEXT_LABEL[order.status]}
                        {!busy && <ChevronRight className="w-3.5 h-3.5" aria-hidden />}
                      </button>
                    )}
                    <button
                      onClick={() => setPendingCancel(order)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 min-h-11 px-4 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden /> Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={pendingCancel !== null}
        title="Cancel this order?"
        message={pendingCancel ? `Order #${pendingCancel.id.slice(0, 8).toUpperCase()} for ${pendingCancel.customer_name}. The customer is not notified automatically — call them if needed.` : ""}
        confirmLabel="Cancel order"
        danger
        busy={updating === pendingCancel?.id}
        onConfirm={() => { if (pendingCancel) setStatus(pendingCancel, "cancelled"); }}
        onCancel={() => setPendingCancel(null)}
      />
    </div>
  );
}
