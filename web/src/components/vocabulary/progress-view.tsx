"use client";

import { BookOpen, CalendarClock, CircleCheck, Clock, Library, Settings, Target, Trophy } from "lucide-react";
import { useState } from "react";
import { ProgressBar } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { DailyGoalDialog, WordListDialog } from "@/components/vocabulary/shared";
import { VOCAB_STATS } from "@/lib/mock/fixtures";
import { useDemoStore } from "@/lib/store";

export function VocabProgressView() {
  const { vocabGoal } = useDemoStore();
  const { comingSoon } = useToast();
  const [goalOpen, setGoalOpen] = useState(false);
  const [list, setList] = useState<null | { title: string; count: number }>(null);
  const s = VOCAB_STATS;
  const newPct = (s.newToday / vocabGoal.newPerDay) * 100;

  return (
    <div className="space-y-6">
      <section className="animate-fade-up rounded-[20px] border border-hero-line bg-hero p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink"><Target className="size-5 text-primary" /> Mục tiêu hôm nay</h2>
          <button type="button" className="icon-btn text-ink-soft" aria-label="Cài đặt mục tiêu" onClick={() => setGoalOpen(true)}>
            <Settings className="size-5" />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#cfdcf8] bg-white/70 p-5 text-center">
            <p className="flex items-center gap-1.5 text-left font-medium text-primary"><Clock className="size-4" /> Ôn tập</p>
            <p className="mt-3 text-primary"><b className="text-5xl font-extrabold">{s.reviewedToday}</b> <span className="text-lg">từ</span></p>
            <p className="mt-2 text-sm text-primary/80">Không giới hạn</p>
          </div>
          <div className="rounded-2xl border border-[#cfdcf8] bg-white/70 p-5 text-center">
            <p className="flex items-center gap-1.5 text-left font-medium text-primary"><BookOpen className="size-4" /> Từ mới</p>
            <p className="mt-3 text-primary"><b className="text-5xl font-extrabold">{s.newToday}</b><span className="text-2xl font-semibold text-primary/60">/{vocabGoal.newPerDay}</span> <span className="text-lg">từ</span></p>
            <ProgressBar value={newPct} className="mx-auto mt-4 max-w-xl" />
            <p className="mt-2 text-sm font-medium text-primary">{Math.round(newPct)}% hoàn thành</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tổng thẻ", value: s.total, icon: Library, tile: "bg-primary-soft text-primary" },
          { label: "Đã học", value: s.learned, icon: BookOpen, tile: "bg-warning-soft text-warning" },
          { label: "Thành thạo", value: s.mastered, icon: CircleCheck, tile: "bg-success-soft text-success" },
          { label: "Cần ôn", value: s.due, icon: Clock, tile: "bg-primary-soft text-primary" },
        ].map((x, i) => (
          <div key={x.label} className="card flex animate-fade-up items-center gap-4 p-5" style={{ animationDelay: `${i * 40}ms` }}>
            <span className={`grid size-12 place-items-center rounded-xl ${x.tile}`}><x.icon className="size-6" /></span>
            <div>
              <p className="text-sm text-muted">{x.label}</p>
              <p className="text-3xl font-bold tracking-tight text-ink tabular-nums">{x.value.toLocaleString("vi-VN")}</p>
            </div>
          </div>
        ))}
      </div>

      <StatusRow
        icon={Clock}
        label="Từ cần ôn ngay"
        value={`${s.due} từ đến hạn`}
        actions={
          <>
            <button type="button" className="btn btn-outline" onClick={() => setList({ title: "Từ đến hạn ôn", count: s.due })}>Xem từ</button>
            <button type="button" className="btn btn-primary" onClick={() => comingSoon("Phiên ôn tập")}>Ôn tập ngay</button>
          </>
        }
      />
      <StatusRow
        icon={CalendarClock}
        label="Từ chưa đến hạn"
        value={`${s.waiting.toLocaleString("vi-VN")} từ đang chờ`}
        actions={<button type="button" className="btn btn-outline" onClick={() => setList({ title: "Từ đang chờ", count: s.waiting })}>Xem chi tiết</button>}
      />
      <StatusRow
        icon={Trophy}
        tone="success"
        label="Từ đã thành thạo"
        value={`${s.mastered} từ`}
        actions={<button type="button" className="btn btn-outline" onClick={() => setList({ title: "Từ đã thành thạo", count: s.mastered })}>Xem chi tiết</button>}
      />

      <DailyGoalDialog open={goalOpen} onClose={() => setGoalOpen(false)} />
      <WordListDialog open={!!list} onClose={() => setList(null)} title={list?.title ?? ""} count={list?.count} />
    </div>
  );
}

function StatusRow({
  icon: Icon, label, value, actions, tone = "primary",
}: { icon: typeof Clock; label: string; value: string; actions: React.ReactNode; tone?: "primary" | "success" }) {
  const success = tone === "success";
  return (
    <section className={`flex animate-fade-up flex-col gap-4 rounded-[20px] border p-5 sm:flex-row sm:items-center sm:p-6 ${success ? "border-[#bfe8d6] bg-success-soft/60" : "border-hero-line bg-primary-tint"}`}>
      <Icon className={`size-9 shrink-0 ${success ? "text-success" : "text-primary"}`} strokeWidth={1.7} />
      <div className="flex-1">
        <p className="text-[15px] font-medium text-ink">{label}</p>
        <p className={`text-[28px] font-bold leading-tight tracking-tight ${success ? "text-success" : "text-primary"}`}>{value}</p>
      </div>
      <div className="flex gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div>
    </section>
  );
}
