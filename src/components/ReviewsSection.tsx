"use client";

import { useState, useEffect } from "react";
import { Review } from "@/lib/supabase";

const EXPERIENCES = [
  "Friday – Party in the Woods",
  "Saturday – Smoke & Cinema",
  "Sunday – Family Day",
  "Game Night (Thursday)",
  "Weekday Sanctuary",
  "Boat Cruise",
  "Sip & Paint",
  "Treasure Hunt",
  "Biking",
  "ATV Ride",
  "Other",
];

function StarRating({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`text-2xl transition ${
            n <= (hovered || value) ? "text-yellow-400" : "text-gray-300"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ initialReviews }: { initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    experience_name: EXPERIENCES[0],
    rating: 5,
    comment: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubmitted(true);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const inputClass = "w-full border border-border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";

  return (
    <section className="py-24 px-[5%] bg-bg-alt">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-3">Guest Reviews</p>
            <h2 className="font-display text-4xl font-semibold text-primary">
              What Our Guests Say
            </h2>
            {avgRating && (
              <div className="flex items-center gap-3 mt-3">
                <StarRating value={Math.round(Number(avgRating))} />
                <span className="text-primary font-bold text-xl">{avgRating}</span>
                <span className="text-text-secondary text-sm">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </div>
            )}
          </div>
          {!submitted ? (
            <button
              onClick={() => setShowForm(prev => !prev)}
              className="shrink-0 bg-accent text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-accent-dark transition"
            >
              {showForm ? "Cancel" : "Write a Review"}
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3 text-sm text-green-700 font-medium">
              ✓ Review submitted, pending approval
            </div>
          )}
        </div>

        {/* Submission form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 mb-10 space-y-5">
            <h3 className="font-display text-xl text-primary">Share Your Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">Your Name *</label>
                <input name="guest_name" value={form.guest_name} onChange={handleChange}
                  required placeholder="Full name" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">Email Address *</label>
                <input name="guest_email" type="email" value={form.guest_email} onChange={handleChange}
                  required placeholder="you@email.com" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">Experience *</label>
              <select name="experience_name" value={form.experience_name} onChange={handleChange} className={inputClass}>
                {EXPERIENCES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">Rating *</label>
              <StarRating value={form.rating} onChange={n => setForm(prev => ({ ...prev, rating: n }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">Your Review *</label>
              <textarea name="comment" value={form.comment} onChange={handleChange}
                required rows={4} placeholder="Tell us about your experience..."
                className={inputClass + " resize-none"} />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
            )}
            <button type="submit" disabled={loading}
              className="bg-primary text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Review"}
            </button>
            <p className="text-xs text-text-secondary">Reviews are published after admin approval.</p>
          </form>
        )}

        {/* Reviews grid */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <p className="text-lg mb-2">No reviews yet</p>
            <p className="text-sm">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-dark">{review.guest_name}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{review.experience_name}</p>
                  </div>
                  <StarRating value={review.rating} />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">"{review.comment}"</p>
                <p className="text-xs text-text-secondary/60 mt-4">
                  {new Date(review.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
