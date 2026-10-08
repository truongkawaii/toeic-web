"use client";

import { CalendarDays, Gauge, RotateCcw, Save, Settings, Target, User } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/learning/page-hero";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { SCORE_MAX, SCORE_MIN } from "@/lib/mock/fixtures";
import { useDemoStore } from "@/lib/store";

export function SettingsView() {
  const { hydrated } = useDemoStore();
  return (
    <div className="container-app space-y-7">
      <PageHero
        eyebrow="Tài khoản demo"
        title={["Cài đặt", "học tập"]}
        description="Điều chỉnh mục tiêu, ngày thi và nhịp học từ vựng. Dữ liệu được lưu trên trình duyệt của bạn."
        icon={Settings}
      />
      {/* remount sau khi store đọc xong localStorage để form nhận giá trị đúng */}
      <SettingsForm key={String(hydrated)} />
    </div>
  );
}

function SettingsForm() {
  const { profile, vocabGoal, updateProfile, setVocabGoal, resetDemo } = useDemoStore();
  const { toast } = useToast();
  const [name, setName] = useState(profile.name);
  const [current, setCurrent] = useState(String(profile.currentScore));
  const [target, setTarget] = useState(String(profile.targetScore));
  const [examDate, setExamDate] = useState(profile.examDate);
  const [perDay, setPerDay] = useState(vocabGoal.newPerDay);
  const [confirmReset, setConfirmReset] = useState(false);

  const cur = Number(current);
  const tgt = Number(target);
  const errors: Record<string, string> = {};
  if (!name.trim()) errors.name = "Vui lòng nhập tên hiển thị.";
  const scoreErr = (v: number) =>
    !Number.isInteger(v) || v < SCORE_MIN || v > SCORE_MAX ? `Điểm từ ${SCORE_MIN} đến ${SCORE_MAX}.`
    : v % 5 !== 0 ? "Điểm TOEIC là bội số của 5." : "";
  if (scoreErr(cur)) errors.current = scoreErr(cur);
  if (scoreErr(tgt)) errors.target = scoreErr(tgt);
  else if (!errors.current && tgt <= cur) errors.target = "Mục tiêu nên cao hơn điểm hiện tại.";
  if (!examDate) errors.examDate = "Chọn ngày thi dự kiến.";
  const valid = Object.keys(errors).length === 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    updateProfile({ name: name.trim(), currentScore: cur, targetScore: tgt, examDate });
    setVocabGoal({ newPerDay: perDay });
    toast("Đã lưu cài đặt", { description: "Tổng quan và Từ vựng đã cập nhật theo thiết lập mới." });
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <fieldset className="card space-y-5 p-5 sm:p-6">
          <legend className="sr-only">Hồ sơ</legend>
          <h2 className="flex items-center gap-2 font-semibold text-ink"><User className="size-[18px] text-primary" /> Hồ sơ</h2>
          <Field id="name" label="Tên hiển thị" error={errors.name}>
            <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
          </Field>
        </fieldset>

        <fieldset className="card space-y-5 p-5 sm:p-6">
          <legend className="sr-only">Mục tiêu</legend>
          <h2 className="flex items-center gap-2 font-semibold text-ink"><Target className="size-[18px] text-primary" /> Mục tiêu TOEIC</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="current" label="Điểm hiện tại" error={errors.current}>
              <input id="current" type="number" inputMode="numeric" step={5} min={SCORE_MIN} max={SCORE_MAX} className="input" value={current} onChange={(e) => setCurrent(e.target.value)} aria-invalid={!!errors.current} aria-describedby={errors.current ? "current-err" : undefined} />
            </Field>
            <Field id="target" label="Điểm mục tiêu" error={errors.target}>
              <input id="target" type="number" inputMode="numeric" step={5} min={SCORE_MIN} max={SCORE_MAX} className="input" value={target} onChange={(e) => setTarget(e.target.value)} aria-invalid={!!errors.target} aria-describedby={errors.target ? "target-err" : undefined} />
            </Field>
          </div>
          <Field id="examDate" label="Ngày thi dự kiến" error={errors.examDate} icon={CalendarDays}>
            <input id="examDate" type="date" className="input" value={examDate} onChange={(e) => setExamDate(e.target.value)} aria-invalid={!!errors.examDate} aria-describedby={errors.examDate ? "examDate-err" : undefined} />
          </Field>
        </fieldset>

        <fieldset className="card space-y-4 p-5 sm:p-6">
          <legend className="sr-only">Từ vựng</legend>
          <h2 className="flex items-center gap-2 font-semibold text-ink"><Gauge className="size-[18px] text-primary" /> Nhịp học từ vựng</h2>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="perDay" className="label mb-0">Từ mới mỗi ngày</label>
              <span className="badge badge-primary text-sm">{perDay} từ</span>
            </div>
            <input id="perDay" type="range" min={5} max={50} step={5} value={perDay} onChange={(e) => setPerDay(Number(e.target.value))} className="mt-3 w-full accent-[var(--color-primary)]" />
            <div className="mt-1 flex justify-between text-xs text-muted"><span>5 · nhẹ nhàng</span><span>50 · cấp tốc</span></div>
          </div>
        </fieldset>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <p className="text-sm text-muted">Khoảng cách cần chinh phục</p>
          <p className="mt-1 text-3xl font-bold text-primary">{valid ? `+${tgt - cur}` : "—"} <span className="text-base font-medium text-muted">điểm</span></p>
          <button type="submit" disabled={!valid} className="btn btn-primary btn-lg mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50">
            <Save className="size-[18px]" /> Lưu thay đổi
          </button>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-ink">Dữ liệu demo</h2>
          <p className="mt-1 text-sm text-muted">Xoá toàn bộ thao tác đã lưu và quay về dữ liệu mẫu ban đầu.</p>
          <button type="button" className="btn btn-danger mt-4 w-full" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="size-4" /> Khôi phục dữ liệu demo
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemo();
          toast("Đã khôi phục dữ liệu demo");
        }}
        title="Khôi phục dữ liệu demo?"
        description="Mục tiêu, tiến độ, bộ thẻ và học phần bạn tạo sẽ bị xoá."
        confirmLabel="Khôi phục"
        danger
      />
    </form>
  );
}

function Field({ id, label, error, icon: Icon, children }: { id: string; label: string; error?: string; icon?: typeof CalendarDays; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="label flex items-center gap-1.5">
        {Icon && <Icon className="size-4 text-muted" />} {label}
      </label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}
