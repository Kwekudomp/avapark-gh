"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Review, ReviewStatus } from "@/lib/types";
import { useToast } from "./ui/Toast";
import { ConfirmDialog } from "./ui/ConfirmDialog";

const STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-yellow-400" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="w-4 h-4"
          fill={i < rating ? "currentColor" : "none"}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default function ReviewsCMSClient({ initialReviews }: { initialReviews: Review[] }) {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState<"all" | ReviewStatus>("pending");
  const [updating, setUpdating] = useState<string | null>(null);
  const [confirmReject, setConfirmReject] = useState<Review | null>(null);

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
        toast("success", `Review ${status === "approved" ? "approved" : "rejected"}.`);
      } else {
        toast("error", `Could not update review (${res.status}).`);
      }
    } catch {
      toast("error", "Could not update review — check your connection and try again.");
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
            aria-pressed={filter === s}
            className={`min-h-11 px-4 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
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
                  <p className="text-sm text-dark leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                  <p className="text-xs text-text-secondary mt-2">
                    {new Date(review.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(review.id, "approved")}
                      disabled={updating === review.id}
                      className="min-h-11 px-4 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => setConfirmReject(review)}
                      disabled={updating === review.id}
                      className="min-h-11 px-4 bg-red-100 text-red-700 rounded-full text-xs font-medium hover:bg-red-200 transition-colors cursor-pointer disabled:opacity-50"
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

      <ConfirmDialog
        open={confirmReject !== null}
        title="Reject this review?"
        message={confirmReject ? `${confirmReject.guest_name}'s review will be hidden from guests on the website.` : ""}
        confirmLabel="Reject review"
        danger
        busy={updating === confirmReject?.id}
        onConfirm={async () => {
          if (confirmReject) {
            await updateStatus(confirmReject.id, "rejected");
            setConfirmReject(null);
          }
        }}
        onCancel={() => setConfirmReject(null)}
      />
    </div>
  );
}
