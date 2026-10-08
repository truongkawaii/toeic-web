"use client";

import {
  BookA, BookOpenText, CalendarDays, CalendarClock, ChevronDown, CirclePlay, Clock, FileQuestion, Flame, Headphones,
  Mic, Minus, PartyPopper, PenTool, Plus, Rocket, Target, ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ContinueCard } from "@/components/dashboard/continue-card";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { activityStats, SCORE_MAX, SCORE_MIN, SCORE_PRESETS, toISODate } from "@/lib/mock/fixtures";
import { useDemoStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import type { ActivityStat, Period } from "@/types/domain";

const TIPS = [
  "TOEIC không khó, chỉ cần bạn không bỏ cuộc!",
  "Mỗi ngày 20 từ mới, 3 tháng là 1.800 từ đó!",
  "Part 5 nhanh tay — để dành thời gian cho Part 7 nhé.",
  "Nghe chép 10 phút mỗi sáng giúp tai quen tốc độ thật.",
];

const useMounted = () => useSyncExternalStore(() => () => {}, () => true, () => false);

const clampScore = (n: number) => Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(n / 5) * 5));

export function DashboardView() {
  const { profile, hydrated } = useDemoStore();
  const [tip, setTip] = useState(0);
  const firstName = profile.name;

  return (
    <div className="container-app space-y-8 sm:space-y-10">
      {/* Hero */}
      <section className="relative animate-fade-up overflow-hidden rounded-[var(--radius-hero)] border border-hero-line bg-[linear-gradient(120deg,#e9f0ff_0%,#eef4ff_45%,#e6eeff_100%)] px-5 py-7 sm:px-12 sm:py-10">
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-28 size-80 rounded-full bg-[radial-gradient(circle,rgb(255_255_255/0.9),transparent_65%)]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-10 size-72 rounded-full bg-[radial-gradient(circle,rgb(96_165_250/0.18),transparent_70%)]" />
        <div className="relative grid items-center gap-6 md:grid-cols-[1.15fr_auto_1fr]">
          <div>
            <span className="badge badge-primary bg-white/70 py-1 text-[13px] uppercase tracking-wide">
              <Rocket className="size-3.5" /> Đậu TOEIC cùng bạn
            </span>
            <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-[42px]">
              {hydrated ? firstName : <span className="skeleton inline-block h-9 w-64 align-middle" />}, luyện tiếp thôi! 💪
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#5b6b82] sm:text-[17px]">
              Mỗi ngày một chút, điểm số sẽ tự nói lên sự nỗ lực của bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTip((t) => (t + 1) % TIPS.length)}
            aria-label="Đổi lời nhắn của mascot"
            className="focus-ring group relative mx-auto size-36 shrink-0 cursor-pointer rounded-full sm:size-44"
          >
            <span aria-hidden className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.25),transparent_70%)] blur-xl" />
            <Image
              src="/demo/mascot.jpg"
              alt="Mascot mèo xanh TOEIC Practice"
              fill
              sizes="176px"
              className="animate-float object-contain mix-blend-multiply transition-transform group-hover:scale-105"
              priority
            />
          </button>
          <div className="relative md:pl-2">
            <div aria-live="polite" className="relative rounded-2xl border border-[#cfdcf8] bg-white px-5 py-4 text-[15px] font-medium text-ink shadow-[0_10px_30px_-14px_rgb(37_99_235/0.45)] sm:text-base">
              <span aria-hidden className="absolute -top-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-l border-t border-[#cfdcf8] bg-white md:-left-2 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:border-b md:border-t-0" />
              <span key={tip} className="block animate-fade-up">{TIPS[tip]}</span>
            </div>
          </div>
        </div>
      </section>

      <ContinueCard />
      <GoalPanel />
      <ActivitySection />
    </div>
  );
}

/* ------------------------------------------------------------------------ */

function GoalPanel() {
  const { profile, updateProfile, hydrated } = useDemoStore();
  const { toast } = useToast();
  const mounted = useMounted();
  const [editing, setEditing] = useState<null | "score" | "date">(null);

  const remaining = Math.max(0, profile.targetScore - profile.currentScore);
  const pct = Math.min(100, Math.round((profile.currentScore / profile.targetScore) * 100));
  const reached = profile.currentScore >= profile.targetScore;

  const days = useMemo(() => {
    if (!mounted) return null;
    const today = new Date(toISODate(new Date()));
    const exam = new Date(profile.examDate);
    return Math.round((exam.getTime() - today.getTime()) / 86_400_000);
  }, [mounted, profile.examDate]);

  const step = (key: "currentScore" | "targetScore", delta: number) => updateProfile({ [key]: clampScore(profile[key] + delta) });

  return (
    <section aria-labelledby="goal-title" className="card animate-fade-up p-3 [animation-delay:80ms] sm:p-5">
      <h2 id="goal-title" className="sr-only">Mục tiêu của bạn</h2>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {/* Điểm số */}
        <article className="rounded-2xl border border-line-soft bg-white p-5 sm:p-6">
          <h3 className="eyebrow">Điểm số của bạn</h3>
          <ScoreStepper
            label="Điểm thi thử hiện tại"
            value={profile.currentScore}
            tone="text-primary"
            loading={!hydrated}
            onMinus={() => step("currentScore", -5)}
            onPlus={() => step("currentScore", 5)}
            onEdit={() => setEditing("score")}
          />
          <p className="mt-2 text-[13px] leading-snug text-muted">Bạn tự đánh giá — làm đề thi thử để tự cập nhật</p>
          <hr className="my-4 border-line-soft" />
          <ScoreStepper
            label="Điểm mục tiêu"
            value={profile.targetScore}
            tone="text-success"
            loading={!hydrated}
            onMinus={() => step("targetScore", -5)}
            onPlus={() => step("targetScore", 5)}
            onEdit={() => setEditing("score")}
          />
          <button type="button" onClick={() => setEditing("score")} className="focus-ring mt-3 w-full rounded-lg text-center text-sm font-semibold text-primary hover:underline">
            Đặt bằng preset ({SCORE_PRESETS.join("/")}) →
          </button>
        </article>

        {/* Ring */}
        <article className="flex flex-col items-center rounded-2xl border border-line-soft bg-white p-5 sm:p-6">
          <h3 className="eyebrow self-start">{reached ? "Mục tiêu" : "Điểm còn thiếu"}</h3>
          <ProgressRing pct={pct} reached={reached}>
            {reached ? (
              <>
                <PartyPopper className="mx-auto size-8 text-success" />
                <p className="mt-1 text-xl font-bold text-success">Đã đạt!</p>
              </>
            ) : (
              <>
                <p className="text-[40px] font-extrabold leading-none tracking-tight text-primary">+{remaining}</p>
                <p className="mt-2 text-sm font-medium text-muted">điểm cần đạt thêm</p>
              </>
            )}
          </ProgressRing>
          <p className="mt-auto text-sm text-muted">Hoàn thành <b className="text-ink">{pct}%</b> mục tiêu</p>
        </article>

        {/* Ngày thi */}
        <article className="flex flex-col rounded-2xl border border-line-soft bg-white p-5 sm:p-6">
          <h3 className="eyebrow">Số ngày đến ngày thi</h3>
          <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
            {days === null ? (
              <div className="skeleton h-12 w-16" />
            ) : days < 0 ? (
              <>
                <p className="text-5xl font-extrabold text-danger">{Math.abs(days)}</p>
                <p className="mt-1 text-lg font-semibold text-danger">ngày đã qua</p>
              </>
            ) : (
              <>
                <p className="text-5xl font-extrabold text-primary">{days}</p>
                <p className="mt-1 text-lg font-semibold text-primary">{days === 0 ? "Hôm nay thi — cố lên!" : "ngày nữa"}</p>
              </>
            )}
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-sm font-medium text-ink-soft">
              <CalendarDays className="size-4 text-muted" />
              {profile.examDate.split("-").reverse().join("/")}
            </span>
            <button type="button" onClick={() => setEditing("date")} className="focus-ring mt-3 rounded-lg text-sm font-semibold text-primary hover:underline">
              {days !== null && days < 0 ? "Đặt lại ngày thi →" : "Đổi ngày thi →"}
            </button>
          </div>
        </article>

        {/* Động lực */}
        <article className="flex flex-col rounded-2xl border border-line-soft bg-white p-5 sm:p-6">
          <h3 className="eyebrow">Động lực học</h3>
          <div className="flex flex-1 flex-col justify-center gap-5 py-4">
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-warning-soft text-warning">
                <Flame className="size-7" />
              </span>
              <div>
                <p className="text-sm text-muted">Chuỗi ngày</p>
                <p className="text-ink"><b className="text-3xl font-extrabold text-warning">{profile.streak}</b> ngày</p>
                <p className="text-sm text-muted">Dài nhất: {profile.longestStreak} ngày</p>
              </div>
            </div>
            <hr className="border-line-soft" />
            <div className="flex items-center gap-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Target className="size-7" />
              </span>
              <div>
                <p className="text-sm text-muted">XP trọn đời</p>
                <p className="text-ink"><b className="text-3xl font-extrabold text-primary">{profile.xp.toLocaleString("vi-VN")}</b> XP</p>
                <p className="text-sm text-muted">Tích luỹ từ khi bắt đầu</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <ScoreDialog
        open={editing === "score"}
        onClose={() => setEditing(null)}
        initial={{ current: profile.currentScore, target: profile.targetScore }}
        onSave={(current, target) => {
          updateProfile({ currentScore: current, targetScore: target });
          toast("Đã cập nhật mục tiêu điểm");
        }}
      />
      <DateDialog
        open={editing === "date"}
        onClose={() => setEditing(null)}
        initial={profile.examDate}
        onSave={(d) => {
          updateProfile({ examDate: d });
          toast("Đã đặt ngày thi mới");
        }}
      />
    </section>
  );
}

function ScoreStepper({
  label, value, tone, onMinus, onPlus, onEdit, loading,
}: { label: string; value: number; tone: string; onMinus: () => void; onPlus: () => void; onEdit: () => void; loading: boolean }) {
  return (
    <div className="mt-4">
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <button type="button" aria-label={`Giảm ${label}`} onClick={onMinus} disabled={value <= SCORE_MIN} className="focus-ring grid size-11 cursor-pointer place-items-center rounded-full border border-line text-muted transition hover:border-primary/40 hover:text-primary active:scale-90 disabled:opacity-40">
          <Minus className="size-4" />
        </button>
        <button type="button" onClick={onEdit} aria-label={`Nhập ${label}`} className={`focus-ring cursor-text rounded-lg px-2 text-[44px] font-extrabold leading-none tracking-tight tabular-nums transition hover:bg-canvas ${tone}`}>
          {loading ? <span className="skeleton inline-block h-10 w-24 align-middle" /> : value}
        </button>
        <button type="button" aria-label={`Tăng ${label}`} onClick={onPlus} disabled={value >= SCORE_MAX} className="focus-ring grid size-11 cursor-pointer place-items-center rounded-full border border-line text-muted transition hover:border-primary/40 hover:text-primary active:scale-90 disabled:opacity-40">
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function ProgressRing({ pct, reached, children }: { pct: number; reached: boolean; children: React.ReactNode }) {
  const r = 84;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative my-4 size-[200px]">
      <svg viewBox="0 0 200 200" className="size-full -rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={reached ? "#10b981" : "#60a5fa"} />
            <stop offset="100%" stopColor={reached ? "#059669" : "#2563eb"} />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={r} fill="none" stroke="#eef2f7" strokeWidth="14" />
        <circle
          cx="100" cy="100" r={r} fill="none" stroke="url(#ring-grad)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>{children}</div>
      </div>
    </div>
  );
}

function ScoreDialog({
  open, onClose, initial, onSave,
}: { open: boolean; onClose: () => void; initial: { current: number; target: number }; onSave: (c: number, t: number) => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Cập nhật điểm số" description="Điểm TOEIC từ 10 đến 990, làm tròn theo bước 5.">
      {open && <ScoreForm initial={initial} onSave={(c, t) => { onSave(c, t); onClose(); }} onCancel={onClose} />}
    </Dialog>
  );
}

function ScoreForm({ initial, onSave, onCancel }: { initial: { current: number; target: number }; onSave: (c: number, t: number) => void; onCancel: () => void }) {
  const [current, setCurrent] = useState(String(initial.current));
  const [target, setTarget] = useState(String(initial.target));
  const c = Number(current);
  const t = Number(target);
  const err = (v: number) => (!Number.isFinite(v) || v < SCORE_MIN || v > SCORE_MAX ? `Nhập số từ ${SCORE_MIN} đến ${SCORE_MAX}` : null);
  const ce = err(c);
  const te = err(t);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!ce && !te) onSave(clampScore(c), clampScore(t));
      }}
      className="space-y-4 pb-2"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cur-score" className="label">Điểm hiện tại</label>
          <input id="cur-score" inputMode="numeric" className="input text-lg font-semibold" value={current} onChange={(e) => setCurrent(e.target.value.replace(/\D/g, ""))} aria-invalid={!!ce} aria-describedby="cur-err" />
          {ce && <p id="cur-err" className="mt-1 text-[13px] text-danger">{ce}</p>}
        </div>
        <div>
          <label htmlFor="tgt-score" className="label">Điểm mục tiêu</label>
          <input id="tgt-score" inputMode="numeric" className="input text-lg font-semibold" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))} aria-invalid={!!te} aria-describedby="tgt-err" />
          {te && <p id="tgt-err" className="mt-1 text-[13px] text-danger">{te}</p>}
        </div>
      </div>
      <div>
        <p className="label">Preset mục tiêu</p>
        <div className="flex flex-wrap gap-2">
          {SCORE_PRESETS.map((p) => (
            <button key={p} type="button" data-active={t === p} className="chip" onClick={() => setTarget(String(p))}>{p}</button>
          ))}
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Huỷ</button>
        <button type="submit" className="btn btn-primary" disabled={!!ce || !!te}>Lưu mục tiêu</button>
      </div>
    </form>
  );
}

function DateDialog({ open, onClose, initial, onSave }: { open: boolean; onClose: () => void; initial: string; onSave: (d: string) => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Đặt ngày thi" description="Chọn ngày bạn dự định thi TOEIC để theo dõi đếm ngược." size="sm">
      {open && <DateForm initial={initial} onCancel={onClose} onSave={(d) => { onSave(d); onClose(); }} />}
    </Dialog>
  );
}

function DateForm({ initial, onSave, onCancel }: { initial: string; onSave: (d: string) => void; onCancel: () => void }) {
  const today = toISODate(new Date());
  const [value, setValue] = useState(initial < today ? "" : initial);
  const invalid = !value || value < today;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!invalid) onSave(value); }} className="space-y-4 pb-2">
      <div>
        <label htmlFor="exam-date" className="label">Ngày thi</label>
        <div className="relative">
          <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input id="exam-date" type="date" min={today} className="input pl-11" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        {value && value < today && <p className="mt-1 text-[13px] text-danger">Ngày thi phải từ hôm nay trở đi</p>}
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Huỷ</button>
        <button type="submit" className="btn btn-primary" disabled={invalid}>Lưu ngày thi</button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------ */

const PERIODS = [
  { id: "today", label: "Hôm nay" },
  { id: "week", label: "Tuần" },
  { id: "month", label: "Tháng" },
  { id: "all", label: "Tất cả" },
  { id: "custom", label: "Tuỳ chỉnh" },
] as const satisfies readonly { id: Period; label: string }[];

const ICONS: Record<ActivityStat["key"], { icon: typeof Clock; tile: string }> = {
  time: { icon: Clock, tile: "bg-primary-soft text-primary" },
  test: { icon: FileQuestion, tile: "bg-primary-soft text-primary" },
  reading: { icon: BookOpenText, tile: "bg-success-soft text-success" },
  listening: { icon: Headphones, tile: "bg-primary-soft text-primary" },
  speaking: { icon: Mic, tile: "bg-primary-soft text-primary" },
  writing: { icon: PenTool, tile: "bg-success-soft text-success" },
  vocabulary: { icon: BookA, tile: "bg-warning-soft text-warning" },
  video: { icon: CirclePlay, tile: "bg-warning-soft text-warning" },
};

function ActivitySection() {
  const [period, setPeriod] = useQueryParam<Period>("period", "today", PERIODS.map((p) => p.id));
  const [range, setRange] = useState({ from: "", to: "" });
  const stats = useMemo(() => activityStats(period), [period]);

  return (
    <section aria-labelledby="activity-title" className="animate-fade-up space-y-5 [animation-delay:140ms]">
      <h2 id="activity-title" className="sr-only">Hoạt động học tập</h2>
      <div role="tablist" aria-label="Khoảng thời gian" className="grid grid-cols-5 gap-1 overflow-x-auto rounded-2xl border border-line bg-[#eef2f8] p-1.5">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={period === p.id}
            onClick={() => setPeriod(p.id)}
            className={`focus-ring min-h-11 min-w-20 cursor-pointer rounded-xl px-2 text-sm font-medium transition sm:text-[15px] ${
              period === p.id ? "border border-[#cfdcf8] bg-white text-primary shadow-sm" : "text-[#5b6b82] hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === "custom" && (
        <div className="card flex animate-pop-in flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="from" className="label">Từ ngày</label>
            <input id="from" type="date" className="input" value={range.from} max={range.to || undefined} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
          </div>
          <div className="flex-1">
            <label htmlFor="to" className="label">Đến ngày</label>
            <input id="to" type="date" className="input" value={range.to} min={range.from || undefined} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          </div>
          <p className="text-[13px] text-muted sm:max-w-56">Số liệu demo áp dụng cho khoảng đã chọn.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <ActivityCard key={s.key} stat={s} delay={i * 35} />
        ))}
      </div>
    </section>
  );
}

function ActivityCard({ stat, delay }: { stat: ActivityStat; delay: number }) {
  const [open, setOpen] = useState(false);
  const { icon: Icon, tile } = ICONS[stat.key];
  return (
    <article className="card card-hover animate-fade-up overflow-hidden" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-4 p-5">
        <Link href={stat.href} className="focus-ring group flex min-w-0 flex-1 items-center gap-4 rounded-xl">
          <span className={`grid size-14 shrink-0 place-items-center rounded-2xl transition-transform group-hover:scale-105 ${tile}`}>
            <Icon className="size-6" strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span className="eyebrow flex items-center gap-1.5">
              {stat.label}
              {stat.highlight && <span className="size-1.5 rounded-full bg-primary" aria-label="có hoạt động mới" />}
            </span>
            <span className="mt-0.5 block truncate text-2xl font-bold tracking-tight text-ink">{stat.value}</span>
            <span className="block truncate text-sm text-muted">{stat.sub}</span>
          </span>
        </Link>
        {stat.breakdown && (
          <button
            type="button"
            className="icon-btn shrink-0"
            aria-expanded={open}
            aria-label={`${open ? "Thu gọn" : "Xem"} chi tiết ${stat.label}`}
            onClick={() => setOpen((o) => !o)}
          >
            <ChevronDown className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
      {open && stat.breakdown && (
        <div className="animate-pop-in border-t border-line-soft bg-canvas/60 px-5 py-3">
          <dl className="space-y-1.5">
            {stat.breakdown.map((b) => (
              <div key={b.label} className="flex justify-between text-sm">
                <dt className="text-muted">{b.label}</dt>
                <dd className="font-semibold text-ink">{b.value}</dd>
              </div>
            ))}
          </dl>
          <Link href={stat.href} className="focus-ring mt-2 inline-flex items-center gap-1 rounded text-sm font-semibold text-primary hover:underline">
            Đi tới {stat.label.toLowerCase()} <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </article>
  );
}
