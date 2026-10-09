"use client";

import {
  BookOpen, ChartColumn, Check, FileText, History, NotebookPen, Play, RotateCcw, SignalHigh, SignalLow, SignalMedium,
  Trash2, Trophy, TriangleAlert, X, ArrowRight, Hourglass,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { YtsNotebook } from "@/components/exam/yts-notebook";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { EmptyState, ProgressBar } from "@/components/ui/primitives";
import { ChipGroup, SegTabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { EXAM_LOADERS } from "@/lib/ets";
import { MOCK_TESTS, TEST_COLLECTIONS } from "@/lib/mock/fixtures";
import { useDemoStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import type { Attempt, Difficulty, ExamSession, MockTest, TestProgress } from "@/types/domain";

export function TestTabs() {
  const pathname = usePathname();
  return (
    <SegTabs
      label="Mục đề thi"
      value={pathname.startsWith("/tests/progress") ? "progress" : "learn"}
      items={[
        { id: "learn", label: "Học", icon: BookOpen, href: "/tests" },
        { id: "progress", label: "Tiến độ", icon: ChartColumn, href: "/tests/progress" },
      ]}
    />
  );
}

const DIFF: Record<Difficulty, { label: string; cls: string; icon: typeof SignalHigh }> = {
  easy: { label: "Dễ", cls: "text-success", icon: SignalLow },
  medium: { label: "Trung bình", cls: "text-warning-ink", icon: SignalMedium },
  hard: { label: "Khó", cls: "text-danger", icon: SignalHigh },
};

/** Tên hiển thị đề: "ETS 2026 · Test 3" / "Crack TOEIC Vol 1 · Test 2". */
export function testLabel(testId: string) {
  const t = MOCK_TESTS.find((x) => x.id === testId);
  if (!t) return testId;
  const col = TEST_COLLECTIONS.find((c) => c.id === t.collectionId)?.label.replace(" · Reading", "") ?? "";
  return `${col} · Test ${t.testNo}`;
}

const activeSessionFor = (sessions: Record<string, ExamSession>, testId: string) =>
  Object.values(sessions).find((s) => s.testId === testId && s.status === "active");

/** Câu đã làm sai ở lần gần nhất (theo `results` trong tiến độ). */
const wrongNumbersOf = (p?: TestProgress) =>
  p?.results ? Object.entries(p.results).filter(([, ok]) => !ok).map(([n]) => Number(n)).sort((a, b) => a - b) : [];

export function TestsLibraryView() {
  const { testProgress, sessions, hydrated } = useDemoStore();
  const [col, setCol] = useQueryParam("set", "ybm-2025", TEST_COLLECTIONS.map((c) => c.id));
  const chips = TEST_COLLECTIONS.map((c) => ({ ...c, count: MOCK_TESTS.filter((t) => t.collectionId === c.id).length }));
  const tests = useMemo(() => MOCK_TESTS.filter((t) => t.collectionId === col), [col]);
  const [prepare, setPrepare] = useState<{ test: MockTest; mode: "exam" | "practice" } | null>(null);
  const playable = tests.some((t) => t.playable);
  if (!hydrated) return <div className="skeleton h-96 rounded-2xl" aria-busy="true" aria-label="Đang tải thư viện đề" />;

  return (
    <div className="space-y-6">
      <ChipGroup label="Bộ đề" items={chips} value={col} onChange={(v) => setCol(v)} />
      {col.startsWith("yts-") && <div className="rounded-2xl border border-hero-line bg-primary-tint px-5 py-4"><h2 className="font-semibold text-ink">YTS {col.slice(4)} — 10 đề {tests[0]?.parts?.includes(5) ? "Listening + Reading" : "Listening"}</h2><p className="mt-1 text-sm leading-relaxed text-ink-soft">{tests[0]?.parts?.includes(5) ? "200 câu mỗi đề · Part 1–7. Chọn thi riêng Listening, Reading hoặc toàn bài." : "100 câu mỗi đề · Part 1–4 · Audio đầy đủ cho cả 10 test."} Có chấm bài, giải thích tiếng Việt và nghe chép từng câu.</p></div>}
      {col === "ybm-2025" && <div className="rounded-2xl border border-hero-line bg-primary-tint px-5 py-4"><h2 className="font-semibold text-ink">YBM 2025 · 10 đề Listening + Reading</h2><p className="mt-1 text-sm leading-relaxed text-ink-soft">Cả 10 test có đủ 200 câu Part 1–7. Thi toàn bài hoặc từng kỹ năng, phát audio ngắn theo câu/nhóm câu.</p></div>}
      {!playable && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-[#fcdcab] bg-warning-soft px-4 py-3 text-sm text-warning-ink">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          Bộ đề này mới có thông tin tổng quan; nội dung (kèm audio Part 1–4) sẽ được bổ sung sau. Hãy thử bộ ETS Reading để làm bài thật.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tests.map((t, i) => (
          <TestCard
            key={t.id}
            test={t}
            progress={testProgress[t.id]}
            active={activeSessionFor(sessions, t.id)}
            delay={i * 30}
            onStart={(mode) => setPrepare({ test: t, mode })}
          />
        ))}
      </div>
      <PrepareDialog state={prepare} onClose={() => setPrepare(null)} />
    </div>
  );
}

function TestCard({
  test, progress, active, delay, onStart,
}: { test: MockTest; progress?: TestProgress; active?: ExamSession; delay: number; onStart: (m: "exam" | "practice") => void }) {
  const { resetTest, startSession } = useDemoStore();
  const { toast, comingSoon } = useToast();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [notebook, setNotebook] = useState(false);
  const d = DIFF[test.difficulty];
  const started = !!progress;
  const wrongs = wrongNumbersOf(progress);
  const wrongCount = test.playable ? wrongs.length : progress?.wrong ?? 0;

  const retryWrong = () => {
    if (!test.playable) return comingSoon("Luyện lại câu sai");
    const id = startSession({ testId: test.id, mode: "practice", questionNumbers: wrongs, deadline: null, label: `Luyện lại ${wrongs.length} câu sai` });
    router.push(`/exam/${id}`);
  };

  return (
    <article className="card card-hover flex animate-fade-up flex-col p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-semibold text-ink">Test {test.testNo}</h3>
        <div className="-mr-2 flex items-center">
          <button type="button" disabled={!started} onClick={() => setConfirm(true)} className={`icon-btn size-8 ${started ? "text-danger hover:bg-danger-soft hover:text-danger" : ""}`} title="Xoá tiến độ" aria-label={`Xoá tiến độ Test ${test.testNo}`}>
            <Trash2 className="size-4" />
          </button>
          <Link href="/tests/progress" className="icon-btn size-8" title="Lịch sử làm bài" aria-label="Lịch sử làm bài"><History className="size-4" /></Link>
          <button type="button" disabled={!wrongCount} onClick={retryWrong} className={`icon-btn relative size-8 ${wrongCount ? "text-danger" : ""}`} title="Luyện lại câu sai" aria-label={`Luyện lại ${wrongCount} câu sai`}>
            <RotateCcw className="size-4" />
            {wrongCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">{wrongCount}</span>
            )}
          </button>
          <button type="button" onClick={() => comingSoon("Ghi chú đề thi")} className="icon-btn size-8" title="Ghi chú" aria-label="Ghi chú"><FileText className="size-4" /></button>
          <button type="button" onClick={() => test.collectionId.startsWith("yts-") ? setNotebook(true) : toast(started ? `${progress.savedWords} từ đã lưu từ đề này` : "Chưa lưu từ nào từ đề này", { tone: "info" })} className="icon-btn size-8" title={test.collectionId.startsWith("yts-") ? "Từ vựng & paraphrase" : "Từ đã lưu"} aria-label={test.collectionId.startsWith("yts-") ? `Từ vựng và paraphrase Test ${test.testNo}` : "Từ đã lưu"}><NotebookPen className="size-4" /></button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2.5">
        <span className={`inline-flex items-center gap-1 text-[15px] font-semibold ${d.cls}`}><d.icon className="size-4" /> {d.label}</span>
        {test.playable ? (
          <span className="badge badge-primary">Part {test.parts?.[0]}–{test.parts?.at(-1)} · {test.questions} câu</span>
        ) : (
          <span className="badge border border-[#fcdcab] bg-warning-soft text-warning-ink"><Trophy className="size-3.5" /> Điểm số</span>
        )}
      </div>
      {active ? (
        <div className="mt-3 rounded-xl bg-primary-tint px-3 py-2 text-sm text-primary">
          <p className="flex items-center gap-1.5 font-semibold"><Hourglass className="size-4" /> Đang làm dở</p>
          <p className="text-[13px] text-ink-soft">{Object.keys(active.answers).length}/{active.questionNumbers.length} câu · {active.mode === "exam" ? "Thi thử" : "Luyện tập"}</p>
        </div>
      ) : started ? (
        <div className="mt-3">
          <p className="flex items-center gap-3 text-[15px] font-semibold">
            <span className="text-success">{progress.done}/{test.questions}</span>
            <span className="inline-flex items-center gap-0.5 text-success"><Check className="size-4" /> {progress.correct}</span>
            <span className="inline-flex items-center gap-0.5 text-danger"><X className="size-4" /> {progress.wrong}</span>
          </p>
          <ProgressBar value={(progress.done / test.questions) * 100} tone="success" className="mt-2 h-1.5" />
        </div>
      ) : (
        <p className="mt-3 text-[15px] text-muted">Chưa luyện tập</p>
      )}
      {test.readingIssue && <p className="mt-2 text-sm text-warning-ink">Reading đang chờ sửa dữ liệu nguồn bị trùng câu; hiện có Listening.</p>}
      {test.incomplete && !test.missingAudio && <p className="mt-2 text-xs text-muted">Đề nguồn thiếu {100 - test.questions} câu — đã bỏ qua khi chấm.</p>}
      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        {active ? (
          <Link href={`/exam/${active.id}`} className="btn btn-primary col-span-2"><ArrowRight className="size-4" /> Tiếp tục làm bài</Link>
        ) : (
          <>
            <button type="button" className="btn btn-outline" onClick={() => onStart("exam")}><Play className="size-4" /> Thi thử</button>
            <button type="button" className={`btn ${started ? "btn-primary" : "btn-outline-primary"}`} onClick={() => onStart("practice")}>
              <BookOpen className="size-4" /> Luyện tập
            </button>
          </>
        )}
      </div>
      {test.collectionId.startsWith("yts-") && <button type="button" className="mt-3 text-left text-xs font-semibold text-primary hover:underline" onClick={() => setNotebook(true)}>Từ vựng & paraphrase →</button>}
      <YtsNotebook testId={notebook ? test.id : null} onClose={() => setNotebook(false)} />
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => { resetTest(test.id); toast(`Đã xoá tiến độ Test ${test.testNo}`); }}
        title={`Xoá tiến độ Test ${test.testNo}?`}
        description="Đáp án đã làm và danh sách câu sai của đề này sẽ bị xoá. Lịch sử thi thử vẫn được giữ."
        confirmLabel="Xoá tiến độ"
        danger
      />
    </article>
  );
}

const PARTS = [
  { id: 1, label: "Part 1", q: 6 }, { id: 2, label: "Part 2", q: 25 }, { id: 3, label: "Part 3", q: 39 }, { id: 4, label: "Part 4", q: 30 },
  { id: 5, label: "Part 5", q: 30 }, { id: 6, label: "Part 6", q: 16 }, { id: 7, label: "Part 7", q: 54 },
];

/** Màn chuẩn bị: số câu, thời lượng, phạm vi Part lấy từ metadata đề (plan §3 Đề thi). */
function PrepareDialog({ state, onClose }: { state: { test: MockTest; mode: "exam" | "practice" } | null; onClose: () => void }) {
  return (
    <Dialog
      open={!!state}
      onClose={onClose}
      title={state ? `${state.mode === "exam" ? "Thi thử" : "Luyện tập"} · Test ${state.test.testNo}` : ""}
      description={state?.mode === "exam" ? "Tính giờ như thi thật, chỉ xem đáp án sau khi nộp bài." : "Chọn Part muốn luyện. Xem giải thích ngay sau mỗi câu."}
    >
      {state && <PrepareForm key={state.test.id + state.mode} state={state} onClose={onClose} />}
    </Dialog>
  );
}

function PrepareForm({ state, onClose }: { state: { test: MockTest; mode: "exam" | "practice" }; onClose: () => void }) {
  const { comingSoon, toast } = useToast();
  const { startSession } = useDemoStore();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { test } = state;
  const exam = state.mode === "exam";
  const available = test.parts ? PARTS.filter((p) => test.parts!.includes(p.id)).map((p) => ({ ...p, q: test.partCounts?.[p.id] ?? p.q })) : PARTS;
  const hasListening = available.some(p => p.id <= 4);
  const hasReading = available.some(p => p.id >= 5);
  const [scope, setScope] = useState<"full" | "listening" | "reading">(hasListening && hasReading ? "full" : hasListening ? "listening" : "reading");
  const [parts, setParts] = useState<number[]>(available.map((p) => p.id));
  const scoped = available.filter(p => scope === "full" || (scope === "listening" ? p.id <= 4 : p.id >= 5));
  const changeScope = (value: "full" | "listening" | "reading") => {setScope(value);setParts(available.filter(p => value === "full" || (value === "listening" ? p.id <= 4 : p.id >= 5)).map(p => p.id));};
  const minutes = scope === "full" ? test.minutes : scope === "reading" ? (hasListening ? 75 : test.minutes) : test.minutes - (hasReading ? 75 : 0);
  const q = available.filter((p) => parts.includes(p.id)).reduce((s, p) => s + p.q, 0);
  const toggle = (id: number) => setParts((xs) => (xs.includes(id) ? xs.filter((x) => x !== id) : [...xs, id].sort()));
  const range = `Part ${scoped[0].id}–${scoped[scoped.length - 1].id}`;

  const start = async () => {
    if (exam && test.missingAudio && scope !== "reading") return;
    if (!test.playable) {
      onClose();
      comingSoon(exam ? "Phòng thi" : "Workspace luyện đề");
      return;
    }
    // Lấy danh sách số câu từ nội dung đề để phiên lưu chính xác các câu được chọn.
    setBusy(true);
    let data;
    try {
      data = await EXAM_LOADERS[test.id]();
    } catch {
      setBusy(false);
      toast("Không tải được nội dung đề", { tone: "warning", description: "Kiểm tra kết nối rồi thử lại." });
      return;
    }
    const chosen = data.questions.filter((x) => parts.includes(x.part));
    const timedListening = exam && chosen.some(x => x.part <= 4);
    const id = startSession({
      testId: test.id,
      mode: state.mode,
      questionNumbers: chosen.map((x) => x.number),
      deadline: exam && !timedListening ? Date.now() + minutes * 60_000 : null,
      phase: timedListening ? "listening" : exam ? "reading" : undefined,
      label: `${exam ? "Thi thử" : "Luyện tập"} · ${scope === "full" ? "Listening + Reading" : scope === "listening" ? "Listening" : "Reading"}`,
    });
    onClose();
    router.push(`/exam/${id}`);
  };

  return (
    <div className="space-y-5 pb-2">
      {hasListening && hasReading && <fieldset><legend className="label">Kỹ năng</legend><div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Kỹ năng làm bài">{([{id:"full",label:"Listening + Reading"},{id:"listening",label:"Listening"},{id:"reading",label:"Reading"}] as const).map(item => <button key={item.id} type="button" role="radio" aria-checked={scope===item.id} data-active={scope===item.id} className="chip" onClick={() => changeScope(item.id)}>{item.label}</button>)}</div></fieldset>}
      <dl className="grid grid-cols-3 gap-3">
        {[
          ["Số câu", `${q}`],
          ["Thời gian", exam ? `${minutes} phút` : "Không giới hạn"],
          ["Phạm vi", exam ? range : `${parts.length} Part`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-canvas p-3 text-center">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="mt-0.5 font-bold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      {!exam && (
        <fieldset>
          <legend className="label">Chọn Part</legend>
          <div className="flex flex-wrap gap-2">
            {scoped.map((p) => (
              <button key={p.id} type="button" role="checkbox" aria-checked={parts.includes(p.id)} data-active={parts.includes(p.id)} className="chip" onClick={() => toggle(p.id)}>
                {p.label} <span className="opacity-75">· {p.q}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {!!test.missingAudio && <p className="rounded-xl bg-warning-soft p-3 text-sm text-warning-ink">Thiếu audio {test.missingAudio} câu trong dữ liệu nguồn. Thi thử chỉ mở cho Reading; Listening vẫn có thể luyện tập.</p>}
      {!!test.missingPhotos && parts.includes(1) && <p className="rounded-xl border border-[#fcdcab] bg-warning-soft px-3.5 py-3 text-sm text-warning-ink">6 ảnh Part 1 đang được bổ sung. Audio đã có; các câu mô tả tranh cần ảnh để làm đầy đủ. Bạn có thể chọn Reading hoặc luyện Part 2–4 trước.</p>}
      {exam && hasListening && scope !== "reading" && <p className="text-sm leading-relaxed text-ink-soft">Nhấn Play trong phòng thi để bắt đầu đồng hồ Listening. Mỗi câu/nhóm câu có audio ngắn riêng. {hasReading && scope === "full" && "Hoàn tất Listening, chọn Chuyển sang Reading để bắt đầu 75 phút riêng."} Tạm dừng hoặc rời trang không dừng đồng hồ.</p>}
      {exam && test.playable && (
        <ul className="space-y-1.5 text-sm text-ink-soft">
          <li>• Bài làm tự lưu — tải lại trang hoặc quay lại sau vẫn tiếp tục đúng chỗ, đồng hồ vẫn chạy.</li>
          <li>• Hết giờ hệ thống tự nộp bài. Phím tắt: A–D chọn đáp án, ← → chuyển câu.</li>
        </ul>
      )}
      <p className="rounded-xl bg-warning-soft px-3.5 py-2.5 text-[13px] leading-snug text-warning-ink">
        Điểm quy đổi chỉ mang tính minh hoạ, không phải điểm TOEIC chính thức.
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-outline" onClick={onClose}>Huỷ</button>
        <button type="button" className="btn btn-primary" disabled={busy || (!exam && parts.length === 0) || (exam && !!test.missingAudio && scope !== "reading")} aria-busy={busy} onClick={start}>
          {exam ? <><Play className="size-4" /> Bắt đầu thi</> : <><BookOpen className="size-4" /> Bắt đầu luyện</>}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Progress -------------------------------- */

export function TestsProgressView() {
  const { attempts, hydrated } = useDemoStore();
  const skillOf = (attempt: Attempt) => attempt.skill ?? ((attempt.scoreMax ?? 990) === 990 ? "combined" : "reading");
  const [scaleSel, setScale] = useState<"reading" | "listening" | "combined" | null>(null);
  const scale = scaleSel ?? (attempts.length ? skillOf(attempts.filter(a => a.sessionId).at(-1) ?? attempts.at(-1)!) : "reading");
  const inScale = (a: Attempt) => skillOf(a) === scale;
  const series = attempts.filter((a) => inScale(a) && a.mode === "exam");
  const scoped = attempts.filter(inScale);
  const best = series.length ? Math.max(...series.map((a) => a.estimatedScore)) : null;
  const last = series.at(-1);
  const avgAcc = scoped.length ? Math.round((scoped.reduce((s, a) => s + a.correct / Math.max(1, a.total), 0) / scoped.length) * 100) : null;

  if (!hydrated) return <div className="skeleton h-96 rounded-[var(--radius-card)]" aria-busy="true" />;

  return (
    <div className="space-y-6">
      <SegTabs
        label="Thang điểm"
        value={scale}
        onChange={(v) => setScale(v)}
        items={[
          { id: "listening", label: "Listening (495)", count: attempts.filter(a => skillOf(a) === "listening").length },
          { id: "reading", label: "Reading (495)", count: attempts.filter(a => skillOf(a) === "reading").length },
          { id: "combined", label: "Toàn bài (990)", count: attempts.filter(a => skillOf(a) === "combined").length },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Lượt làm đề", `${scoped.length}`, "text-ink"],
          ["Điểm gần nhất*", last ? `${last.estimatedScore}` : "—", "text-primary"],
          ["Điểm cao nhất*", best !== null ? `${best}` : "—", "text-success"],
          ["Độ chính xác TB", avgAcc !== null ? `${avgAcc}%` : "—", "text-ink"],
        ].map(([k, v, c], i) => (
          <div key={k} className="card animate-fade-up p-5" style={{ animationDelay: `${i * 40}ms` }}>
            <p className="text-sm text-muted">{k}</p>
            <p className={`mt-1 text-3xl font-bold tracking-tight ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      {series.length >= 2 ? (
        <section className="card animate-fade-up p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-ink">Biểu đồ tiến bộ</h2>
              <p className="text-sm text-muted">Điểm quy đổi minh hoạ theo từng lượt thi thử</p>
            </div>
            <span className={`badge ${last!.estimatedScore >= series[0].estimatedScore ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
              {last!.estimatedScore >= series[0].estimatedScore ? "+" : ""}{last!.estimatedScore - series[0].estimatedScore} điểm
            </span>
          </div>
          <ScoreChart points={series.map((a) => ({ label: a.date.slice(5).split("-").reverse().join("/"), value: a.estimatedScore }))} />
        </section>
      ) : (
        <EmptyState
          icon={ChartColumn}
          title="Chưa đủ dữ liệu vẽ biểu đồ"
          description="Hoàn thành ít nhất 2 lượt thi thử ở thang điểm này để xem đường tiến bộ."
          action={<Link href="/tests" className="btn btn-primary"><Play className="size-4" /> Làm đề ngay</Link>}
        />
      )}

      {scoped.length > 0 && (
        <section className="card animate-fade-up overflow-hidden">
          <h2 className="px-5 pt-5 text-lg font-semibold text-ink sm:px-6">Lịch sử làm bài</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[15px]">
              <thead className="border-y border-line-soft bg-canvas/60 text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 sm:px-6">Ngày</th>
                  <th className="px-3 py-3">Đề</th>
                  <th className="px-3 py-3">Chế độ</th>
                  <th className="px-3 py-3">Đúng</th>
                  <th className="px-3 py-3">Thời gian</th>
                  <th className="px-3 py-3 text-right">Điểm*</th>
                  <th className="px-5 py-3 sm:px-6"><span className="sr-only">Xem lại</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {[...scoped].reverse().map((a) => (
                  <tr key={a.id} className="transition hover:bg-primary-tint/50">
                    <td className="px-5 py-3.5 text-muted sm:px-6">{a.date.split("-").reverse().join("/")}</td>
                    <td className="px-3 py-3.5 font-medium text-ink">{testLabel(a.testId)}</td>
                    <td className="px-3 py-3.5">
                      <span className={`badge ${a.mode === "exam" ? "bg-primary-soft text-primary" : "bg-canvas text-ink-soft"}`}>{a.mode === "exam" ? "Thi thử" : "Luyện tập"}</span>
                    </td>
                    <td className="px-3 py-3.5 tabular-nums">{a.correct}/{a.total}</td>
                    <td className="px-3 py-3.5 tabular-nums text-muted">{a.minutes} phút</td>
                    <td className="px-3 py-3.5 text-right font-bold tabular-nums text-ink">{a.estimatedScore}</td>
                    <td className="px-5 py-3.5 text-right sm:px-6">
                      {a.sessionId ? (
                        <Link href={`/exam/${a.sessionId}/result`} className="btn btn-ghost btn-sm">Xem lại <ArrowRight className="size-3.5" /></Link>
                      ) : (
                        <span className="text-xs text-muted">Dữ liệu mẫu</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line-soft px-5 py-3 text-[13px] text-muted sm:px-6">* Điểm quy đổi minh hoạ, không phải điểm TOEIC chính thức.</p>
        </section>
      )}
    </div>
  );
}

function ScoreChart({ points }: { points: { label: string; value: number }[] }) {
  const W = 720, H = 240, P = { l: 40, r: 16, t: 20, b: 32 };
  const min = Math.max(0, Math.floor((Math.min(...points.map((p) => p.value)) - 40) / 50) * 50);
  const max = Math.ceil((Math.max(...points.map((p) => p.value)) + 40) / 50) * 50;
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / Math.max(1, points.length - 1);
  const y = (v: number) => P.t + ((max - v) * (H - P.t - P.b)) / (max - min);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const area = `${line} L${x(points.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;
  const ticks = Array.from({ length: (max - min) / 50 + 1 }, (_, i) => min + i * 50);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={`Điểm từ ${points[0].value} lên ${points[points.length - 1].value}`}>
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#edf1f7" />
          <text x={P.l - 8} y={y(t) + 4} textAnchor="end" className="fill-[#94a3b8] text-[11px]">{t}</text>
        </g>
      ))}
      <path d={area} fill="url(#area)" />
      <path d={line} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r="5.5" fill="#fff" stroke="#2563eb" strokeWidth="3" />
          <text x={x(i)} y={y(p.value) - 12} textAnchor="middle" className="fill-[#1f2937] text-[12px] font-semibold">{p.value}</text>
          <text x={x(i)} y={H - 10} textAnchor="middle" className="fill-[#94a3b8] text-[11px]">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}
