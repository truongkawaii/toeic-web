import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

type PageHeroProps = {
  eyebrow: string;
  /** Tiêu đề chia 3 phần: trước – nhấn mạnh (màu primary) – sau */
  title: [string, string?, string?];
  description: string;
  icon: LucideIcon;
};

/** Hero dùng chung cho các trang kỹ năng: nền xanh nhạt, badge, tiêu đề nhấn màu và ô icon brand. */
export function PageHero({ eyebrow, title, description, icon: Icon }: PageHeroProps) {
  const [before, accent, after] = title;
  return (
    <section className="relative animate-fade-up overflow-hidden rounded-[var(--radius-hero)] border border-hero-line bg-hero px-5 py-7 sm:px-10 sm:py-10">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.16),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 size-80 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.7),transparent_70%)]" />
      <div className="relative flex items-center gap-6">
        <div className="min-w-0 flex-1">
          <span className="badge badge-primary bg-white/80 py-1 text-[13px]">
            <Sparkles className="size-3.5" /> {eyebrow}
          </span>
          <h1 className="mt-3 text-balance text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[40px]">
            {before}
            {accent && <span className="text-gradient-brand"> {accent}</span>}
            {after && ` ${after}`}
          </h1>
          <p className="mt-3 max-w-2xl text-pretty text-[15px] leading-relaxed text-[#5b6b82] sm:text-[17px]">{description}</p>
        </div>
        <div className="hidden size-24 shrink-0 place-items-center rounded-[22px] bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white shadow-[var(--shadow-brand)] transition-transform duration-500 hover:-rotate-3 hover:scale-105 sm:grid lg:size-[120px] lg:rounded-[26px]">
          <Icon className="size-11 lg:size-14" strokeWidth={1.75} />
        </div>
      </div>
    </section>
  );
}
