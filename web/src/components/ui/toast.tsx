"use client";

import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Tone = "success" | "info" | "warning";
type Toast = { id: number; title: string; description?: string; tone: Tone };

type ToastApi = {
  toast: (title: string, opts?: { description?: string; tone?: Tone }) => void;
  /** Dùng cho CTA trỏ tới màn ở giai đoạn sau: phản hồi rõ ràng, không làm nút giả. */
  comingSoon: (feature: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const ICON = { success: CircleCheck, info: Info, warning: TriangleAlert };
const TONE = {
  success: "text-success bg-success-soft",
  info: "text-primary bg-primary-soft",
  warning: "text-warning-ink bg-warning-soft",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((t) => t.id !== id)), []);

  const toast = useCallback<ToastApi["toast"]>(
    (title, opts) => {
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs.slice(-2), { id, title, description: opts?.description, tone: opts?.tone ?? "success" }]);
      setTimeout(() => dismiss(id), 3600);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      comingSoon: (feature) =>
        toast(`${feature} đang được xây dựng`, {
          tone: "info",
          description: "Màn này thuộc giai đoạn 3 (luồng học lõi) trong kế hoạch build.",
        }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end sm:p-6"
      >
        {items.map((t) => {
          const Icon = ICON[t.tone];
          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-2xl border border-line bg-white p-3.5 pr-2 shadow-[var(--shadow-pop)]"
            >
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${TONE[t.tone]}`}>
                <Icon className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-ink">{t.title}</p>
                {t.description && <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.description}</p>}
              </div>
              <button type="button" aria-label="Đóng thông báo" className="icon-btn size-8" onClick={() => dismiss(t.id)}>
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
