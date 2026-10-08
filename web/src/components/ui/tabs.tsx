"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export type TabItem<T extends string> = { id: T; label: string; icon?: LucideIcon; count?: number; href?: string };

type SegTabsProps<T extends string> = {
  items: readonly TabItem<T>[];
  value: T;
  onChange?: (v: T) => void;
  label: string;
  className?: string;
};

/** Tab dạng pill như ảnh tham chiếu. Hỗ trợ href (điều hướng route) hoặc onChange (query state). */
export function SegTabs<T extends string>({ items, value, onChange, label, className = "" }: SegTabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className={`seg ${className}`}>
      {items.map((it) => {
        const active = it.id === value;
        const content = (
          <>
            {it.icon && <it.icon className="size-[18px]" strokeWidth={1.9} />}
            {it.label}
            {typeof it.count === "number" && (
              <span
                className={`grid min-w-6 place-items-center rounded-full px-1.5 text-xs font-bold leading-6 ${
                  active ? "bg-white text-primary" : "bg-white text-primary shadow-sm"
                }`}
              >
                {it.count}
              </span>
            )}
          </>
        );
        return it.href ? (
          <Link key={it.id} href={it.href} role="tab" aria-selected={active} data-active={active} className="seg-item" scroll={false}>
            {content}
          </Link>
        ) : (
          <button key={it.id} type="button" role="tab" aria-selected={active} data-active={active} className="seg-item" onClick={() => onChange?.(it.id)}>
            {content}
          </button>
        );
      })}
    </div>
  );
}

type ChipsProps<T extends string> = {
  items: readonly { id: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  children?: React.ReactNode;
};

export function ChipGroup<T extends string>({ items, value, onChange, label, children }: ChipsProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="chip-row">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="radio"
          aria-checked={it.id === value}
          data-active={it.id === value}
          className="chip"
          onClick={() => onChange(it.id)}
        >
          {it.label}
          {typeof it.count === "number" && <span className="opacity-80">({it.count})</span>}
        </button>
      ))}
      {children}
    </div>
  );
}
