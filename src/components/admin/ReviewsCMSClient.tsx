"use client";

import { useState } from "react";
import { Review, ReviewStatus } from "@/lib/supabase";

const STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function ReviewsCMSClient({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState<"all" | ReviewStatus>("pending");
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(id: string, status: ReviewStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } finally {
      setUpdating(null);
    }
  }

  const filtered = reviews.filter(r => filter === "all" || r.status === filter);
  const counts = {
    pending: reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    rejected: reviews.filter(r => r.status === "rejected").length,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending", value: counts.pending, color: "text-yellow-600" },
          { label: "Approved", value: counts.approved, color: "text-green-600" },
          { label: "Rejected", value: counts.rejected, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-4 text-center">
            <p className="text-xs text-text-secondary uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {(["pending", "all", "approved", "rejected"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition ${
              filter === s ? "bg-primary text-white" : "bg-white border border-border text-text-secondary hover:border-primary"
            }`}>
            {s} {s !== "all" ? `(${counts[s] ?? reviews.length})` : `(${reviews.length})`}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-secondary bg-white rounded-2xl border border-border">
          <p>No {filter === "all" ? "" : filter} reviews</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <div key={review.id} className="bg-white rounded-2xl border border-border p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-dark">{review.guest_name}</p>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[review.status]}`}>
                      {review.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-1">{review.guest_email} · {review.experience_name}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <StarDisplay rating={review.rating} />
                    <span className="text-xs text-text-secondary">{review.rating}/5</span>
                  </div>
                  <p className="text-sm text-dark leading-relaxed">"{review.comment}"</p>
                  <p className="text-xs text-text-secondary mt-2">
                    {new Date(review.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(review.id, "approved")}
                      disabled={updating === review.id}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(review.id, "rejected")}
                      disabled={updating === review.id}
                      className="px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
