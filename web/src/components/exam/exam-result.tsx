"use client";

import {
  BookOpenText, ChartColumn, Check, ChevronDown, CircleAlert, Clock, Flag, Library, Minus, RotateCcw, Sparkles, Target, X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ListeningMaterial } from "@/components/exam/listening-material";
import { Explanation, OptionList, Passage, Stem } from "@/components/exam/shared";
import { ReadingTools, useReadingPreferences } from "@/components/exam/reading-tools";
import { testLabel } from "@/components/tests/tests-views";
import { EmptyState } from "@/components/ui/primitives";
import { attemptSkillLabel, examDurationMinutes, useEtsTest } from "@/lib/ets";
import { useDemoStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import type { Attempt, EtsQuestion, EtsTest } from "@/types/domain";

type Filter = "all" | "wrong" | "blank" | "flagged" | "correct";

export function ExamResult({ sessionId }: { sessionId: string }) {
  const { attempts, sessions, hydrated } = useDemoStore();
  const attempt = attempts.find((a) => a.sessionId === sessionId);
  const load = useEtsTest(attempt?.testId);

  if (!hydrated || (attempt && load.status === "loading")) return <ResultSkeleton />;
  if (!attempt) {
    const active = sessions[sessionId]?.status === "active";
    return (
      <div className="container-app">
        <EmptyState
          icon={CircleAlert}
          title={active ? "Bài này chưa được nộp" : "Không tìm thấy kết quả"}
          description={active ? "Quay lại phòng thi để hoàn thành và nộp bài." : "Kết quả có thể đã bị xoá khi khôi phục dữ liệu demo."}
          action={<Link href={active ? `/exam/${sessionId}` : "/tests"} className="btn btn-primary">{active ? "Tiếp tục làm bài" : "Về thư viện đề"}</Link>}
        />
      </div>
    );
  }
  if (load.status === "error")
    return (
      <div className="container-app">
        <EmptyState icon={CircleAlert} title="Không tải được đề" description={load.message} action={<button type="button" className="btn btn-primary" onClick={load.retry}><RotateCcw className="size-4" /> Thử lại</button>} />
      </div>
    );
  if (load.status !== "ready") return <ResultSkeleton />;
  return <Result attempt={attempt} test={load.test} />;
}

function ResultSkeleton() {
  return (
    <div className="container-app space-y-6" aria-busy="true">
      <div className="skeleton h-64 rounded-[var(--radius-hero)]" />
      <div className="skeleton h-40 rounded-[var(--radius-card)]" />
      <div className="skeleton h-96 rounded-[var(--radius-card)]" />
    </div>
  );
}

const verdict = (acc: number) =>
  acc >= 85 ? { title: "Xuất sắc! 🎉", msg: "Phong độ rất ổn định — tiếp tục luyện đều nhé." }
  : acc >= 70 ? { title: "Làm tốt lắm! 👏", msg: "Xem lại câu sai để lấp lỗ hổng, điểm sẽ còn lên nữa." }
  : acc >= 50 ? { title: "Tiến bộ rồi đấy! 💪", msg: "Tập trung vào Part có tỉ lệ đúng thấp nhất trước." }
  : { title: "Khởi đầu là quan trọng nhất!", msg: "Luyện lại câu sai ngay khi kiến thức còn mới." };

function Result({ attempt, test }: { attempt: Attempt; test: EtsTest }) {
  const { startSession } = useDemoStore();
  const router = useRouter();
  const acc = attempt.total ? Math.round((attempt.correct / attempt.total) * 100) : 0;
  const v = verdict(acc);
  const wrong = attempt.wrong ?? [];
  const blank = attempt.blank ?? [];
  const flagged = attempt.flagged ?? [];
  const retryList = [...wrong, ...blank].sort((a, b) => a - b);
  const xp = attempt.correct * 2 + (attempt.mode === "exam" ? 20 : 0);

  const retry = () => {
    const id = startSession({ testId: attempt.testId, mode: "practice", questionNumbers: retryList, deadline: null, label: `Luyện lại ${retryList.length} câu sai` });
    router.push(`/exam/${id}`);
  };
  const redo = () => {
    const nums = attempt.questionNumbers ?? test.questions.map((q) => q.number);
    const timedListening = attempt.mode === "exam" && nums.some(n => n <= 100);
    const id = startSession({
      testId: attempt.testId,
      mode: attempt.mode,
      questionNumbers: nums,
      deadline: attempt.mode === "exam" && !timedListening ? Date.now() + examDurationMinutes(test, nums) * 60_000 : null,
      phase: timedListening ? "listening" : attempt.mode === "exam" ? "reading" : undefined,
      label: attempt.mode === "exam" ? "Thi thử" : "Luyện tập",
    });
    router.push(`/exam/${id}`);
  };

  return (
    <div className="container-app space-y-7">
      {/* Tổng kết */}
      <section className="relative animate-fade-up overflow-hidden rounded-[var(--radius-hero)] border border-hero-line bg-[linear-gradient(120deg,#e9f0ff_0%,#eef4ff_45%,#e6eeff_100%)] p-5 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.18),transparent_70%)]" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr_auto]">
          <ScoreRing value={attempt.estimatedScore} max={attempt.scoreMax ?? 495} label={attemptSkillLabel(attempt)} />
          <div className="min-w-0">
            <span className="badge badge-primary bg-white/80">{testLabel(attempt.testId)} · {attempt.mode === "exam" ? "Thi thử" : "Luyện tập"}</span>
            <h1 className="mt-3 text-[28px] font-bold tracking-tight text-ink sm:text-4xl">{v.title}</h1>
            <p className="mt-2 max-w-xl text-[15px] text-[#5b6b82] sm:text-base">{v.msg}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "Đúng", v: `${attempt.correct}/${attempt.total}`, icon: Check, c: "text-success" },
                { k: "Sai", v: `${wrong.length}`, icon: X, c: "text-danger" },
                { k: "Bỏ trống", v: `${blank.length}`, icon: Minus, c: "text-ink-soft" },
                { k: "Thời gian", v: `${attempt.minutes} phút`, icon: Clock, c: "text-ink" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-white bg-white/80 px-3.5 py-3 backdrop-blur">
                  <dt className="flex items-center gap-1.5 text-xs text-muted"><s.icon className="size-3.5" /> {s.k}</dt>
                  <dd className={`mt-0.5 text-xl font-bold tabular-nums ${s.c}`}>{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative hidden size-40 lg:block">
            <Image src="/demo/mascot.jpg" alt="" fill sizes="160px" className="animate-float object-contain mix-blend-multiply" />
            <span className="absolute -top-2 right-0 rounded-full bg-white px-3 py-1 text-sm font-bold text-primary shadow"><Sparkles className="mr-1 inline size-3.5" />+{xp} XP</span>
          </div>
        </div>
        <div className="relative mt-6 flex flex-wrap gap-2">
          {retryList.length > 0 && (
            <button type="button" className="btn btn-primary" onClick={retry}><RotateCcw className="size-4" /> Luyện lại {retryList.length} câu sai</button>
          )}
          <button type="button" className="btn btn-outline" onClick={redo}><Target className="size-4" /> Làm lại {attempt.mode === "exam" ? "đề" : "phiên này"}</button>
          <Link href="/tests/progress" className="btn btn-outline"><ChartColumn className="size-4" /> Xem tiến độ</Link>
          <Link href="/tests" className="btn btn-ghost"><Library className="size-4" /> Thư viện đề</Link>
        </div>
        {attempt.sectionScores && <div className="relative mt-4 flex flex-wrap gap-2">{Object.entries(attempt.sectionScores).map(([section,score])=><span key={section} className="badge bg-white text-primary">{section === "listening" ? "Listening" : "Reading"}: {score}/495</span>)}</div>}
        <p className="relative mt-4 text-xs text-muted">* Điểm quy đổi minh hoạ, không phải điểm TOEIC chính thức.</p>
      </section>

      {/* Theo Part */}
      <section className="grid gap-4 sm:grid-cols-3">
        {Object.entries(attempt.byPart ?? {}).map(([part, s], i) => {
          const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
          return (
            <div key={part} className="card animate-fade-up p-5" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-semibold text-ink">Part {part}</h2>
                <span className={`text-2xl font-bold tabular-nums ${pct >= 70 ? "text-success" : pct >= 50 ? "text-warning-ink" : "text-danger"}`}>{pct}%</span>
              </div>
              <p className="text-sm text-muted">{s.correct}/{s.total} câu đúng</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-line-soft">
                <div className={`h-full rounded-full transition-[width] duration-700 ${pct >= 70 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-danger"}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </section>

      <Review attempt={attempt} test={test} counts={{ wrong: wrong.length, blank: blank.length, flagged: flagged.length }} />
    </div>
  );
}

function ScoreRing({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 70, c = 2 * Math.PI * r;
  const pct = value / max;
  return (
    <div className="relative mx-auto size-44 shrink-0 sm:size-48" role="img" aria-label={`Điểm quy đổi ${value} trên ${max}`}>
      <svg viewBox="0 0 160 160" className="size-full -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#fff" strokeWidth="14" />
        <circle
          cx="80" cy="80" r={r} fill="none" stroke="url(#ring)" strokeWidth="14" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}*</span>
        <span className="text-5xl font-bold tracking-tight text-ink tabular-nums">{value}</span>
        <span className="text-sm text-muted">/ {max}</span>
      </div>
    </div>
  );
}

function Review({ attempt, test, counts }: { attempt: Attempt; test: EtsTest; counts: { wrong: number; blank: number; flagged: number } }) {
  const reading = useReadingPreferences();
  const [filter, setFilter] = useQueryParam<Filter>("filter", "all", ["all", "wrong", "blank", "flagged", "correct"]);
  const answers = attempt.answers ?? {};
  const qs = useMemo(
    () => (attempt.questionNumbers ?? []).map((n) => test.questions.find((q) => q.number === n)).filter((q): q is EtsQuestion => !!q),
    [attempt.questionNumbers, test.questions],
  );
  const status = (q: EtsQuestion) => (!answers[q.number] ? "blank" : answers[q.number] === q.answer ? "correct" : "wrong");
  const list = qs.filter((q) => filter === "all" || (filter === "flagged" ? attempt.flagged?.includes(q.number) : status(q) === filter));
  const FILTERS: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "Tất cả", count: qs.length },
    { id: "wrong", label: "Sai", count: counts.wrong },
    { id: "blank", label: "Bỏ trống", count: counts.blank },
    { id: "flagged", label: "Đã đánh dấu", count: counts.flagged },
    { id: "correct", label: "Đúng", count: attempt.correct },
  ];

  return (
    <section aria-labelledby="review-title" className="reading-review space-y-4" style={reading.style}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="border-l-[3px] border-primary pl-3">
          <h2 id="review-title" className="text-lg font-bold text-ink sm:text-xl">Xem lại đáp án</h2>
          <p className="text-sm text-muted">Đáp án đúng tô xanh, lựa chọn sai tô đỏ, kèm giải thích nhanh.</p>
        </div>
        <ReadingTools preferences={reading.preferences} onChange={reading.update} />
      </div>
      <div role="radiogroup" aria-label="Lọc câu hỏi" className="chip-row">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" role="radio" aria-checked={filter === f.id} data-active={filter === f.id} className="chip" onClick={() => setFilter(f.id)}>
            {f.label} <span className="opacity-80">({f.count})</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={Check} title="Không có câu nào" description="Không có câu hỏi nào khớp bộ lọc này." />
      ) : (
        <div className="space-y-3">
          {list.map((q, i) => (
            <ReviewItem key={q.number} q={q} test={test} selected={answers[q.number]} flagged={!!attempt.flagged?.includes(q.number)} delay={Math.min(i, 8) * 30} />
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewItem({ q, test, selected, flagged, delay }: { q: EtsQuestion; test: EtsTest; selected?: string; flagged: boolean; delay: number }) {
  const [showPassage, setShowPassage] = useState(false);
  const group = q.groupId ? test.groups.find((g) => g.id === q.groupId) : undefined;
  const st = !selected ? "blank" : selected === q.answer ? "correct" : "wrong";
  const badge = {
    correct: "bg-success-soft text-success",
    wrong: "bg-danger-soft text-danger",
    blank: "bg-canvas text-ink-soft",
  }[st];

  return (
    <article className="card animate-fade-up p-4 sm:p-6" style={{ animationDelay: `${delay}ms` }}>
      <div className="mb-3 flex flex-wrap items-start gap-3">
        <span className="grid h-8 min-w-10 place-items-center rounded-lg bg-primary-soft px-2 text-sm font-bold text-primary">{q.number}</span>
        <p className="reading-stem min-w-0 flex-1 pt-1">
          {q.stem ? <Stem text={q.stem} /> : <span className="text-muted">{q.part <= 2 ? "Nghe audio và chọn đáp án." : `Chỗ trống (${q.number}) trong đoạn văn.`}</span>}
        </p>
        <div className="flex items-center gap-1.5">
          {flagged && <span className="badge bg-warning-soft text-warning-ink"><Flag className="size-3 fill-current" /> Đánh dấu</span>}
          <span className={`badge ${badge}`}>{st === "correct" ? "Đúng" : st === "wrong" ? "Sai" : "Bỏ trống"}</span>
        </div>
      </div>
      {group && (
        <div className="mb-3">
          <button type="button" className="btn btn-ghost btn-sm -ml-2" aria-expanded={showPassage} onClick={() => setShowPassage((s) => !s)}>
            <BookOpenText className="size-4" /> {group.listening ? "Audio & transcript" : "Đoạn văn"} · Questions {group.from}–{group.to}
            <ChevronDown className={`size-4 transition-transform ${showPassage ? "rotate-180" : ""}`} />
          </button>
          {showPassage && (
            <div className="reading-paper mt-2 max-h-[600px] animate-fade-up overflow-y-auto">
              {group.listening ? <ListeningMaterial group={group} reveal testId={test.id} /> : <Passage group={group} current={q.number} />}
            </div>
          )}
        </div>
      )}
      <OptionList q={q} selected={selected} reveal disabled />
      <div className="mt-3"><Explanation q={q} selected={selected} /></div>
    </article>
  );
}
