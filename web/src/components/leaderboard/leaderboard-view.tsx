"use client";

import { ChevronDown, Clock, Crown, Flame, Megaphone, Share2, Sparkles, TrendingUp, Trophy, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/learning/page-hero";
import { Avatar } from "@/components/ui/primitives";
import { SegTabs } from "@/components/ui/tabs";
import { HALL_OF_FAME, leaderboard, RECENT_FEED } from "@/lib/mock/fixtures";
import { useDemoStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import type { LeaderEntry, LeaderMetric, LeaderPeriod } from "@/types/domain";

const METRICS: { id: LeaderMetric; label: string; icon: LucideIcon }[] = [
  { id: "xp", label: "Kinh nghiệm", icon: Zap },
  { id: "time", label: "Thời gian học", icon: Clock },
  { id: "streak", label: "Chuỗi ngày", icon: Flame },
  { id: "share", label: "Chia sẻ", icon: Share2 },
];

const PERIODS: { id: LeaderPeriod; label: string }[] = [
  { id: "today", label: "Hôm nay" },
  { id: "week", label: "Tuần này" },
  { id: "month", label: "Tháng này" },
  { id: "all", label: "Tất cả" },
];

/** Định dạng số kiểu vi-VN thủ công để server/client luôn khớp (tránh hydration mismatch). */
const num = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

function formatValue(metric: LeaderMetric, v: number) {
  switch (metric) {
    case "xp":
      return `${num(v)} XP`;
    case "time": {
      const h = Math.floor(v / 60);
      return h ? `${num(h)}h ${v % 60}p` : `${v} phút`;
    }
    case "streak":
      return `${v} ngày`;
    case "share":
      return `${num(v)} bạn`;
  }
}

const PODIUM = [
  { ring: "#f59e0b", bg: "from-[#fff7e0] to-white", medal: "bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]", h: "sm:pt-0", label: "Hạng 1" },
  { ring: "#94a3b8", bg: "from-[#f1f5f9] to-white", medal: "bg-gradient-to-br from-[#cbd5e1] to-[#94a3b8]", h: "sm:pt-8", label: "Hạng 2" },
  { ring: "#d97706", bg: "from-[#fdf0e3] to-white", medal: "bg-gradient-to-br from-[#f0a868] to-[#c2410c]", h: "sm:pt-12", label: "Hạng 3" },
];

export function LeaderboardView() {
  const [metric, setMetric] = useQueryParam<LeaderMetric>("metric", "xp", METRICS.map((m) => m.id));
  const [period, setPeriod] = useQueryParam<LeaderPeriod>("period", "week", PERIODS.map((p) => p.id));
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const key = `${metric}-${period}`;
  const expanded = expandedKey === key;
  const rows = useMemo(() => leaderboard(metric, period), [metric, period]);
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3, expanded ? rows.length : 10);
  const metricLabel = METRICS.find((m) => m.id === metric)!.label;

  return (
    <div className="container-app space-y-7">
      <PageHero
        eyebrow="Vinh danh nỗ lực mỗi ngày"
        title={["Bảng", "xếp hạng", "học viên"]}
        description="Mỗi phút luyện tập đều được ghi nhận. Giữ chuỗi ngày học, tích luỹ kinh nghiệm và cùng cộng đồng tiến bộ."
        icon={Trophy}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegTabs label="Tiêu chí xếp hạng" items={METRICS} value={metric} onChange={(v) => setMetric(v)} className="max-w-full overflow-x-auto" />
        <div role="radiogroup" aria-label="Khoảng thời gian" className="chip-row">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={p.id === period}
              data-active={p.id === period}
              className="chip"
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {/* Podium */}
          <section aria-label="Top 3" className="card relative overflow-hidden p-5 sm:p-8">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(251_191_36/0.18),transparent)]" />
            <ol key={key} className="relative grid gap-4 sm:grid-cols-3 sm:items-end">
              {[1, 0, 2].map((idx) => {
                const u = top3[idx];
                const p = PODIUM[idx];
                if (!u) return null;
                return (
                  <li
                    key={u.id}
                    className={`animate-fade-up ${p.h} ${idx === 0 ? "order-first sm:order-none" : ""}`}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className={`flex flex-col items-center rounded-2xl border border-line bg-gradient-to-b ${p.bg} px-4 pb-5 pt-6 text-center`}>
                      <div className="relative">
                        {idx === 0 && <Crown aria-hidden className="absolute -top-7 left-1/2 size-7 -translate-x-1/2 fill-[#fbbf24] text-[#f59e0b] animate-float" />}
                        <Avatar name={u.name} color={u.color} size={idx === 0 ? 76 : 64} ring={p.ring} />
                        <span className={`absolute -bottom-2 left-1/2 grid size-7 -translate-x-1/2 place-items-center rounded-full text-xs font-bold text-white shadow ${p.medal}`}>
                          {idx + 1}
                        </span>
                      </div>
                      <p className="mt-5 line-clamp-1 font-semibold text-ink">{u.name}</p>
                      <p className="text-xs text-muted">Cấp {u.level}</p>
                      <p className="mt-2 text-lg font-bold text-primary">{formatValue(metric, u.value)}</p>
                      <span className="sr-only">{p.label}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Bảng xếp hạng chi tiết */}
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-semibold text-ink">Xếp hạng theo {metricLabel.toLowerCase()}</h2>
              <span className="text-sm text-muted">{rows.length} học viên</span>
            </div>
            <ol className="divide-y divide-line">
              {rest.map((u, i) => (
                <Row key={u.id} u={u} rank={i + 4} metric={metric} delay={Math.min(i, 10) * 25} />
              ))}
            </ol>
            {!expanded && rows.length > 10 && (
              <div className="border-t border-line p-3">
                <button type="button" className="btn btn-ghost w-full" onClick={() => setExpandedKey(key)}>
                  Xem thêm {rows.length - 10} học viên khác <ChevronDown className="size-4" />
                </button>
              </div>
            )}
          </section>

          <MyPosition metric={metric} period={period} />
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <Sparkles className="size-[18px] text-warning" /> Đại sảnh danh vọng
            </h2>
            <ul className="mt-4 space-y-3">
              {HALL_OF_FAME.map((h) => {
                const Icon = h.icon === "trophy" ? Trophy : h.icon === "flame" ? Flame : Megaphone;
                const tone = {
                  amber: "bg-[#fff7e0] text-[#d97706]",
                  orange: "bg-[#fff1e8] text-[#ea580c]",
                  emerald: "bg-success-soft text-success",
                }[h.tone];
                return (
                  <li key={h.id} className="flex items-center gap-3 rounded-xl border border-line p-3 transition-colors hover:bg-canvas">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted">{h.title}</p>
                      <p className="truncate font-semibold text-ink">{h.name}</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-ink">{h.value}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <TrendingUp className="size-[18px] text-primary" /> Hoạt động học tập gần đây
            </h2>
            <ul className="mt-4 space-y-1">
              {RECENT_FEED.map((f, i) => (
                <li key={f.id} className="flex animate-fade-up items-start gap-3 rounded-xl p-2" style={{ animationDelay: `${i * 40}ms` }}>
                  <Avatar name={f.who} color={f.kind === "xp" ? "#2563eb" : "#7c3aed"} size={36} />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-ink">
                      <span className="font-semibold">{f.who}</span> {f.text}{" "}
                      {f.tag && (
                        <span className={`badge ml-0.5 py-0 ${f.kind === "xp" ? "badge-primary" : "bg-[#f3e8ff] text-[#7c3aed]"}`}>{f.tag}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">{f.meta}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ u, rank, metric, delay }: { u: LeaderEntry; rank: number; metric: LeaderMetric; delay: number }) {
  return (
    <li className="flex animate-fade-up items-center gap-3 px-5 py-3 transition-colors hover:bg-canvas sm:gap-4" style={{ animationDelay: `${delay}ms` }}>
      <span className="w-7 text-center text-sm font-bold tabular-nums text-muted">{rank}</span>
      <Avatar name={u.name} color={u.color} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{u.name}</p>
        <p className="text-xs text-muted">Cấp {u.level}</p>
      </div>
      <span className="shrink-0 text-sm font-bold tabular-nums text-ink sm:text-base">{formatValue(metric, u.value)}</span>
    </li>
  );
}

function MyPosition({ metric, period }: { metric: LeaderMetric; period: LeaderPeriod }) {
  const { profile } = useDemoStore();
  const scale = { today: 0.03, week: 0.2, month: 0.7, all: 1 }[period];
  const value =
    metric === "xp" ? Math.round(profile.xp * scale)
    : metric === "time" ? Math.round(1840 * scale)
    : metric === "streak" ? profile.streak
    : 3;
  const rank = { xp: 128, time: 204, streak: 96, share: 517 }[metric];

  return (
    <section aria-label="Vị trí của bạn" className="flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] border border-[#bbf0d0] bg-gradient-to-r from-success-soft to-white p-5">
      <span className="grid size-12 place-items-center rounded-full bg-success text-lg font-bold text-white shadow">#{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted">Vị trí của bạn</p>
        <p className="truncate text-lg font-semibold text-ink">{profile.name}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-success">{formatValue(metric, value)}</p>
        <p className="text-xs text-muted">Dữ liệu demo</p>
      </div>
    </section>
  );
}
