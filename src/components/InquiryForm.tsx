"use client";

import { useMemo, useState, FormEvent } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { experiences } from "@/data/experiences";
import { parseLocalDate } from "@/lib/dates";

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function InquiryForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const searchParams = useSearchParams();
  const eventName = searchParams.get("event") ?? "";
  const eventDate = searchParams.get("date") ?? "";
  const eventImage = searchParams.get("image") ?? "";

  const hasEventContext = Boolean(eventName);

  const formattedDate = useMemo(() => {
    if (!eventDate) return "";
    try {
      return parseLocalDate(eventDate).toLocaleDateString("en-GH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return eventDate;
    }
  }, [eventDate]);

  const defaultMessage = hasEventContext
    ? `Hi! I'd like to enquire about ${eventName}${
        formattedDate ? ` on ${formattedDate}` : ""
      }. Please send me more information.`
    : "";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const experience = formData.get("experience") as string;
    const dates = formData.get("dates") as string;
    const message = formData.get("message") as string;

    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, experience, dates, message }),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const inputStyles =
    "w-full px-4 py-3 rounded-xl border border-border bg-white text-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

  return (
    <form onSubmit={handleSubmit}>
      {/* Event context banner */}
      {hasEventContext && (
        <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/5 p-4 flex gap-4 items-start">
          {eventImage ? (
            <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-black">
              <Image
                src={eventImage}
                alt={eventName}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold tracking-wider uppercase text-accent">
              Enquiring about
            </p>
            <p className="font-display text-lg font-semibold text-primary mt-0.5 leading-tight">
              {eventName}
            </p>
            {formattedDate && (
              <p className="text-sm text-text-secondary mt-1">{formattedDate}</p>
            )}
          </div>
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5 mb-5">
        <label htmlFor="name" className="block text-sm font-medium text-primary">
          Name <span className="text-accent">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className={inputStyles}
          placeholder="Your full name"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5 mb-5">
        <label htmlFor="email" className="block text-sm font-medium text-primary">
          Email <span className="text-accent">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className={inputStyles}
          placeholder="you@example.com"
        />
      </div>

      {/* Phone */}
      <div className="space-y-1.5 mb-5">
        <label htmlFor="phone" className="block text-sm font-medium text-primary">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={inputStyles}
          placeholder="+233..."
        />
      </div>

      {/* Experience / Event of interest */}
      <div className="space-y-1.5 mb-5">
        <label htmlFor="experience" className="block text-sm font-medium text-primary">
          {hasEventContext ? "Event" : "Experience Interest"}
        </label>
        {hasEventContext ? (
          <input
            type="text"
            id="experience"
            name="experience"
            readOnly
            value={eventName}
            className={`${inputStyles} bg-bg-alt cursor-not-allowed`}
          />
        ) : (
          <select
            id="experience"
            name="experience"
            className={`${inputStyles} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat pr-10`}
            defaultValue=""
          >
            <option value="">General Inquiry</option>
            {experiences.map((exp) => (
              <option key={exp.slug} value={exp.name}>
                {exp.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Preferred Dates */}
      <div className="space-y-1.5 mb-5">
        <label htmlFor="dates" className="block text-sm font-medium text-primary">
          Preferred Dates
        </label>
        <input
          type="text"
          id="dates"
          name="dates"
          defaultValue={formattedDate}
          className={inputStyles}
          placeholder="e.g. March 15-17, 2026"
        />
      </div>

      {/* Message */}
      <div className="space-y-1.5 mb-5">
        <label htmlFor="message" className="block text-sm font-medium text-primary">
          Message <span className="text-accent">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          defaultValue={defaultMessage}
          className={`${inputStyles} resize-none`}
          placeholder="Tell us about your plans or questions..."
        />
      </div>

      {/* Status messages */}
      {status === "success" && (
        <div className="mb-5 rounded-xl bg-green-50 border border-green-200 p-4 text-green-800 text-sm">
          Thank you! We&apos;ve received your inquiry and will get back to you within 24 hours.
        </div>
      )}

      {status === "error" && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
          Something went wrong. Please try WhatsApp instead.
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-accent text-white py-4 rounded-full font-medium text-lg hover:bg-accent-dark hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending..." : "Send Inquiry"}
      </button>
    </form>
  );
}
