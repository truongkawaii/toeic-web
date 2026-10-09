"use client";

import { ArrowRight, Hourglass, Play, RotateCcw, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { testLabel } from "@/components/tests/tests-views";
import { attemptSkillLabel } from "@/lib/ets";
import { toISODate } from "@/lib/mock/fixtures";
import { useDemoStore } from "@/lib/store";

/** Khối "Tiếp tục học" trên Tổng quan: phiên dở dang, kết quả gần nhất, số câu hôm nay (dữ liệu thật từ phòng thi). */
export function ContinueCard() {
  const { sessions, attempts, hydrated, profile } = useDemoStore();
  const [now] = useState(() => Date.now());
  if (!hydrated) return <div className="skeleton h-36 rounded-[var(--radius-card)]" aria-busy="true" />;

  const active = Object.values(sessions)
    .filter((s) => s.status === "active")
    .sort((a, b) => b.startedAt - a.startedAt)[0];
  const real = attempts.filter((a) => a.sessionId);
  const last = real.at(-1);
  const today = toISODate(new Date());
  const todays = real.filter((a) => a.date === today);
  const todayQ = todays.reduce((s, a) => s + a.total, 0);
  const todayC = todays.reduce((s, a) => s + a.correct, 0);

  if (!active && !last)
    return (
      <section className="card flex animate-fade-up flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#3b82f6] to-primary text-white shadow-[var(--shadow-brand)]">
          <Play className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-ink">Làm đề TOEIC đầu tiên</h2>
          <p className="text-sm text-muted">10 test YBM 2025 đã có trong thư viện. Cả 10 test có đủ Listening và Reading.</p>
        </div>
        <Link href="/tests" className="btn btn-primary">Bắt đầu <ArrowRight className="size-4" /></Link>
      </section>
    );

  const remaining = active?.deadline ? Math.max(0, Math.round((active.deadline - now) / 60000)) : null;
  const retry = last ? (last.wrong?.length ?? 0) + (last.blank?.length ?? 0) : 0;

  return (
    <section aria-label="Tiếp tục học" className="grid animate-fade-up gap-4 md:grid-cols-[1.3fr_1fr]">
      {active ? (
        <div className="card relative overflow-hidden p-5 sm:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/0.14),transparent_70%)]" />
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary"><Hourglass className="size-4" /> Bài đang làm dở</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{testLabel(active.testId)}</h2>
          <p className="text-sm text-muted">
            {active.label ?? (active.mode === "exam" ? "Thi thử" : "Luyện tập")} · {Object.keys(active.answers).length}/{active.questionNumbers.length} câu
            {remaining !== null && ` · còn ${remaining} phút`}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line-soft">
            <div className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-primary" style={{ width: `${(Object.keys(active.answers).length / active.questionNumbers.length) * 100}%` }} />
          </div>
          <Link href={`/exam/${active.id}`} className="btn btn-primary mt-4">Tiếp tục làm bài <ArrowRight className="size-4" /></Link>
        </div>
      ) : (
        last && (
          <div className="card p-5 sm:p-6">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-success"><Trophy className="size-4" /> Kết quả gần nhất</p>
            <h2 className="mt-1 text-xl font-bold text-ink">{testLabel(last.testId)}</h2>
            <p className="text-sm text-muted">
              {last.correct}/{last.total} câu đúng · {attemptSkillLabel(last)}* <b className="text-ink">{last.estimatedScore}</b>/{last.scoreMax ?? 495}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/exam/${last.sessionId}/result`} className="btn btn-outline">Xem lại</Link>
              {retry > 0 && (
                <Link href={`/exam/${last.sessionId}/result?filter=wrong`} className="btn btn-outline-primary"><RotateCcw className="size-4" /> {retry} câu cần ôn</Link>
              )}
            </div>
          </div>
        )
      )}
      <div className="card flex flex-col justify-between p-5 sm:p-6">
        <div>
          <p className="text-sm text-muted">Hôm nay bạn đã làm</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-ink tabular-nums">
            {todayQ} <span className="text-base font-medium text-muted">câu</span>
          </p>
          <p className="text-sm text-muted">{todayQ ? `Đúng ${Math.round((todayC / todayQ) * 100)}%` : "Làm một đề ngắn để giữ chuỗi nhé!"}</p>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Sparkles className="size-4" /> {profile.xp.toLocaleString("vi-VN")} XP tích luỹ
        </p>
      </div>
    </section>
  );
}
