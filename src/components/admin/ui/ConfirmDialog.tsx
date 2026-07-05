"use client";

import { useEffect } from "react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40 cursor-pointer"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
        <h2 className="font-semibold text-dark">{title}</h2>
        <p className="text-sm text-text-secondary mt-2">{message}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            autoFocus
            className="min-h-11 px-4 rounded-full text-sm font-semibold border border-border text-text-secondary hover:border-primary transition-colors cursor-pointer"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className={`min-h-11 px-4 rounded-full text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-50 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary-light"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
