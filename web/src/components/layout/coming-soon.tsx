import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Construction, LayoutDashboard } from "lucide-react";
import Link from "next/link";

/** Trạng thái "đang xây dựng" rõ ràng cho các mục ngoài phạm vi giai đoạn hiện tại. */
export function ComingSoon({
  icon: Icon, title, description, phase,
}: { icon: LucideIcon; title: string; description: string; phase: string }) {
  return (
    <div className="container-app">
      <section className="relative mx-auto max-w-2xl animate-fade-up overflow-hidden rounded-[var(--radius-hero)] border border-hero-line bg-hero px-6 py-14 text-center sm:px-12 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.18),transparent_70%)]" />
        <span className="relative mx-auto grid size-20 place-items-center rounded-[22px] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white shadow-[var(--shadow-brand)] animate-float">
          <Icon className="size-10" strokeWidth={1.75} />
        </span>
        <span className="badge relative mt-6 bg-warning-soft text-warning-ink">
          <Construction className="size-3.5" /> Đang xây dựng · {phase}
        </span>
        <h1 className="relative mt-3 text-[28px] font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="relative mx-auto mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-muted sm:text-base">{description}</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary"><LayoutDashboard className="size-4" /> Về Tổng quan</Link>
          <Link href="/listening" className="btn btn-outline"><ArrowLeft className="size-4" /> Tiếp tục luyện nghe</Link>
        </div>
      </section>
    </div>
  );
}
