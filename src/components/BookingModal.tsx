"use client";

import { useState, useEffect, useRef } from "react";
import { WHATSAPP_NUMBER } from "@/data/constants";

interface LeadForm {
  full_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  interest: string;
  adults: number;
  children: number;
  message: string;
}

const INTEREST_OPTIONS = [
  "Camping",
  "Party In The Woods",
  "Saturday BBQ & Cinema",
  "Game Night",
  "Hiking Tours",
  "Picnic Packages",
  "Family Day",
  "Accommodation",
  "Private Event",
  "Other",
];

export default function BookingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<LeadForm>({
    full_name: "",
    email: "",
    phone: "",
    preferred_date: "",
    interest: "",
    adults: 1,
    children: 0,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setError("");
      }, 300);
    }
  }, [isOpen]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]:
          name === "adults" || name === "children" ? Number(value) : value,
      };
      if (name === "interest" && value === "Party In The Woods") {
        next.children = 0;
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experience_slug: form.interest.toLowerCase().replace(/\s+/g, "-"),
          experience_name: form.interest || "General Enquiry",
          guest_name: form.full_name,
          guest_email: form.email,
          guest_phone: form.phone,
          booking_date: form.preferred_date || null,
          group_size: form.adults + form.children,
          adults: form.adults,
          children: form.children,
          package_tier_id: null,
          package_tier_name: null,
          subtotal: 0,
          deposit_amount: 0,
          notes: form.message
            ? `[Lead from Book Now] Interest: ${form.interest}. ${form.message}`
            : `[Lead from Book Now] Interest: ${form.interest}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const inputClass =
    "w-full border border-border rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";
  const labelClass =
    "block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-bg rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-dark/10 transition z-10"
          aria-label="Close booking form"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4 4L14 14M14 4L4 14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {submitted ? (
            /* Success state */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-primary"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold text-primary mb-2">
                Booking Request Sent!
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Thank you, {form.full_name}! Our team will reach out to you
                shortly to confirm your reservation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I just submitted a booking request for ${form.interest}. My name is ${form.full_name}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1fb855] transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-dark/5 transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Form */
            <>
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-1">
                  Reserve Your Spot
                </p>
                <h2 className="font-display text-2xl font-bold text-primary">
                  Book Your Experience
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Fill in your details and we&apos;ll get back to you within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Full Name *</label>
                    <input
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@email.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+233 XX XXX XXXX"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Preferred Date</label>
                    <input
                      name="preferred_date"
                      type="date"
                      value={form.preferred_date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>What are you interested in? *</label>
                  <select
                    name="interest"
                    value={form.interest}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select an experience</option>
                    {INTEREST_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={form.interest === "Party In The Woods" ? "" : "grid grid-cols-2 gap-4"}>
                  <div>
                    <label className={labelClass}>Adults</label>
                    <select
                      name="adults"
                      value={form.adults}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    {form.interest === "Party In The Woods" && (
                      <p className="text-xs text-text-secondary/70 mt-1.5">
                        Party In The Woods is a strictly 18+ event.
                      </p>
                    )}
                  </div>
                  {form.interest !== "Party In The Woods" && (
                    <div>
                      <label className={labelClass}>Children</label>
                      <select
                        name="children"
                        value={form.children}
                        onChange={handleChange}
                        className={inputClass}
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any special requests, dietary needs, or questions..."
                    className={inputClass + " resize-none"}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent text-white py-3.5 rounded-full font-semibold text-base hover:bg-accent-dark hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading ? "Sending..." : "Send Booking Request"}
                </button>

                <p className="text-center text-xs text-text-secondary">
                  Prefer WhatsApp?{" "}
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent font-medium hover:underline"
                  >
                    Chat with us directly
                  </a>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
