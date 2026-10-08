"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function EmptyState({
  icon: Icon, title, description, action,
}: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="card flex animate-fade-up flex-col items-center px-6 py-14 text-center sm:py-16">
      <span className="grid size-16 place-items-center rounded-2xl bg-canvas text-[#a3b1c6]">
        <Icon className="size-9" strokeWidth={1.5} />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-ink sm:text-xl">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[15px] text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionTitle({ title, meta, accent = true, right }: { title: string; meta?: string; accent?: boolean; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className={accent ? "border-l-[3px] border-primary pl-3" : ""}>
        <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
        {meta && <p className="mt-0.5 text-sm text-muted">{meta}</p>}
      </div>
      {right}
    </div>
  );
}

export type MenuItem = { label: string; icon?: LucideIcon; onSelect: () => void; danger?: boolean };

/** Dropdown menu nhẹ: click ngoài / Esc để đóng, điều hướng bằng phím mũi tên. */
export function Menu({
  trigger, items, align = "right", label,
}: { trigger: (p: { open: boolean; toggle: () => void }) => React.ReactNode; items: MenuItem[]; align?: "left" | "right"; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
        const i = nodes.indexOf(document.activeElement as HTMLElement);
        const next = e.key === "ArrowDown" ? (i + 1) % nodes.length : (i - 1 + nodes.length) % nodes.length;
        nodes[next]?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          aria-label={label}
          className={`absolute top-[calc(100%+6px)] z-50 min-w-48 animate-pop-in rounded-2xl border border-line bg-white p-1.5 shadow-[var(--shadow-pop)] ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              className={`focus-ring flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium transition ${
                it.danger ? "text-danger hover:bg-danger-soft focus:bg-danger-soft" : "text-ink-soft hover:bg-canvas focus:bg-canvas"
              }`}
              onClick={() => { setOpen(false); it.onSelect(); }}
            >
              {it.icon && <it.icon className="size-4 shrink-0" />}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Avatar({ name, color, size = 40, ring }: { name: string; color: string; size?: number; ring?: string }) {
  const initials = name.split(" ").filter(Boolean).slice(-2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color} 70%, #000))`,
        boxShadow: ring ? `0 0 0 3px #fff, 0 0 0 6px ${ring}` : undefined,
      }}
    >
      {initials}
    </span>
  );
}

export function ProgressBar({ value, tone = "primary", className = "" }: { value: number; tone?: "primary" | "success"; className?: string }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-[#e6edf8] ${className}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${tone === "success" ? "bg-success" : "bg-gradient-to-r from-[#3b82f6] to-primary"}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
