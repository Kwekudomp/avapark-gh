"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type ToastKind = "success" | "error";

interface ToastItem {
  id: number;
  kind: ToastKind;
  text: string;
}

interface ToastContextValue {
  toast: (kind: ToastKind, text: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((kind: ToastKind, text: string) => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, kind, text }]);
    setTimeout(() => dismiss(id), kind === "success" ? 4000 : 8000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg bg-white ${
              t.kind === "success"
                ? "border-green-200 text-green-800"
                : "border-red-200 text-red-800"
            }`}
          >
            {t.kind === "success"
              ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" aria-hidden />
              : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" aria-hidden />}
            <p className="flex-1">{t.text}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="p-1 -m-1 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
