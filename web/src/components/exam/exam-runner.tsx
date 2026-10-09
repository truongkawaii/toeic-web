"use client";

import {
  ArrowLeft, ArrowRight, BookOpenText, CircleAlert, Clock, Flag, LayoutGrid, ListChecks, LogOut, RotateCcw, Send, Timer,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Explanation, GroupInstructions, OptionList, Passage, Stem } from "@/components/exam/shared";
import { ReadingTools, useReadingPreferences } from "@/components/exam/reading-tools";
import { ListeningMaterial } from "@/components/exam/listening-material";
import { testLabel } from "@/components/tests/tests-views";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { PART_INFO, useEtsTest } from "@/lib/ets";
import { useDemoStore } from "@/lib/store";
import type { EtsQuestion, EtsTest, ExamSession } from "@/types/domain";

/** Vỏ phòng thi: chờ store đọc localStorage, tải nội dung đề, xử lý không tìm thấy / lỗi / đã nộp. */
export function ExamRunner({ sessionId }: { sessionId: string }) {
  const { sessions, hydrated } = useDemoStore();
  const session = sessions[sessionId];
  const router = useRouter();
  const load = useEtsTest(session?.testId);

  useEffect(() => {
    if (session?.status === "submitted") router.replace(`/exam/${sessionId}/result`);
  }, [session?.status, sessionId, router]);

  if (!hydrated || (session && load.status === "loading") || session?.status === "submitted") return <ExamSkeleton />;
  if (!session)
    return (
      <div className="container-app">
        <EmptyState
          icon={CircleAlert}
          title="Không tìm thấy bài làm"
          description="Phiên làm bài có thể đã bị xoá hoặc dữ liệu demo vừa được khôi phục."
          action={<Link href="/tests" className="btn btn-primary">Về thư viện đề</Link>}
        />
      </div>
    );
  if (load.status === "error")
    return (
      <div className="container-app">
        <EmptyState
          icon={CircleAlert}
          title="Không tải được đề"
          description={load.message}
          action={<button type="button" className="btn btn-primary" onClick={load.retry}><RotateCcw className="size-4" /> Thử lại</button>}
        />
      </div>
    );
  if (load.status !== "ready") return <ExamSkeleton />;
  return <Room session={session} test={load.test} />;
}

function ExamSkeleton() {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-canvas" aria-busy="true" aria-label="Đang tải phòng thi">
      <div className="h-16 border-b border-line bg-white" />
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-5 p-4 sm:p-6 lg:grid-cols-2">
        <div className="skeleton rounded-[var(--radius-card)]" />
        <div className="skeleton hidden rounded-[var(--radius-card)] lg:block" />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------- */

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

const fmtClock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
};

function Room({ session, test }: { session: ExamSession; test: EtsTest }) {
  const { answerQuestion, toggleFlag, setCurrent, submitSession, beginListening, finishListening } = useDemoStore();
  const { toast } = useToast();
  const router = useRouter();
  const practice = session.mode === "practice";

  const questions = useMemo(
    () => session.questionNumbers.map((n) => test.questions.find((q) => q.number === n)).filter((q): q is EtsQuestion => !!q),
    [session.questionNumbers, test.questions],
  );
  const idx = Math.min(session.current, questions.length - 1);
  const q = questions[idx];
  const group = q?.groupId ? test.groups.find((g) => g.id === q.groupId) : undefined;
  const listening = q?.part <= 4;
  const timedListening = !practice && session.phase === "listening";
  const phaseStart = session.phase === "reading" ? Math.max(0, questions.findIndex(x => x.part >= 5)) : 0;
  const phaseEnd = timedListening ? questions.filter(x => x.part <= 4).length - 1 : questions.length - 1;
  const groupQs = group ? questions.filter((x) => x.groupId === group.id) : q ? [q] : [];
  const answered = questions.filter((x) => session.answers[x.number]).length;

  const now = useNow(true);
  const remaining = session.deadline ? session.deadline - now : null;
  const elapsed = now - session.startedAt;

  const [confirmListening, setConfirmListening] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteVisible, setPaletteVisible] = useState(false);
  const reading = useReadingPreferences();
  const [mobilePane, setMobilePane] = useState<"passage" | "questions">(q?.part <= 4 ? "passage" : "questions");
  const submitted = useRef(false);

  const go = useCallback(
    (i: number) => setCurrent(session.id, Math.max(phaseStart, Math.min(phaseEnd, i))),
    [phaseStart, phaseEnd, session.id, setCurrent],
  );
  const jumpTo = useCallback((n: number) => go(questions.findIndex((x) => x.number === n)), [go, questions]);

  const submit = useCallback(
    (auto = false) => {
      if (submitted.current) return;
      submitted.current = true;
      submitSession(session.id, test);
      if (auto) toast("Hết giờ — bài đã được nộp tự động", { tone: "warning" });
      router.replace(`/exam/${session.id}/result`);
    },
    [router, session.id, submitSession, test, toast],
  );

  const endListening = useCallback(() => {
    if (!timedListening) return;
    if (questions.some(x => x.part >= 5)) {
      finishListening(session.id);
      toast("Listening hoàn tất — bắt đầu 75 phút Reading", { tone: "info" });
    } else submit();
  }, [timedListening, questions, finishListening, session.id, toast, submit]);

  // Hết giờ → tự nộp (cũng chạy khi mở lại tab sau hạn chót).
  useEffect(() => {
    if (remaining !== null && remaining <= 0) {if (timedListening) endListening(); else submit(true);}
  }, [remaining, timedListening, endListening, submit]);

  // Khoá cuộn trang nền khi ở phòng thi toàn màn hình.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Phím tắt: A–D chọn, ←/→ chuyển câu, F đánh dấu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || confirmSubmit || confirmExit || paletteOpen) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, [contenteditable=true]")) return;
      const k = e.key.toUpperCase();
      if (q && q.options.some(o => o.key === k)) {
        if (practice && session.answers[q.number]) return;
        answerQuestion(session.id, q.number, k);
      } else if (e.key === "ArrowRight") go(idx + 1);
      else if (e.key === "ArrowLeft") go(idx - 1);
      else if (k === "F" && q) toggleFlag(session.id, q.number);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answerQuestion, confirmExit, confirmSubmit, go, idx, paletteOpen, q, session.id, session.answers, practice, toggleFlag]);

  // Đưa câu hiện tại vào tầm nhìn khi nhóm có nhiều câu.
  const qRefs = useRef<Record<number, HTMLElement | null>>({});
  useEffect(() => {
    if (q) qRefs.current[q.number]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [q]);

  if (!q) return null;
  const lowTime = remaining !== null && remaining < 5 * 60_000;
  const criticalTime = remaining !== null && remaining < 60_000;
  const flagged = session.flagged.includes(q.number);
  const unanswered = questions.length - answered;

  return (
    <div className="reading-room fixed inset-0 z-[60] flex flex-col" style={reading.style}>
      {/* Thanh trên */}
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1680px] items-center gap-2 px-3 sm:gap-3 sm:px-6">
          <button type="button" className="icon-btn" onClick={() => setConfirmExit(true)} aria-label="Thoát phòng thi" title="Thoát (bài được lưu)">
            <LogOut className="size-5 -scale-x-100" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink sm:text-base">{testLabel(session.testId)}</p>
            <p className="truncate text-xs text-muted">{session.label ?? (practice ? "Luyện tập" : "Thi thử")} · {answered}/{questions.length} câu</p>
          </div>
          <div
            role="timer"
            aria-live={criticalTime ? "assertive" : "off"}
            aria-label={remaining !== null ? `Còn lại ${fmtClock(remaining)}` : `Đã làm ${fmtClock(elapsed)}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums transition-colors sm:text-[15px] ${
              criticalTime ? "animate-pulse bg-danger text-white" : lowTime ? "bg-warning-soft text-warning-ink" : "bg-canvas text-ink"
            }`}
          >
            {remaining !== null ? <Timer className="size-4" /> : <Clock className="size-4" />}
            {timedListening && !session.audioStartedAt ? "Chờ phát audio" : fmtClock(remaining ?? elapsed)}
          </div>
          <button type="button" className="icon-btn lg:hidden" onClick={() => setPaletteOpen(true)} aria-label="Danh sách câu hỏi">
            <LayoutGrid className="size-5" />
          </button>
          <button type="button" className="btn btn-outline btn-sm hidden lg:inline-flex" aria-pressed={paletteVisible} onClick={() => setPaletteVisible(v => !v)}><LayoutGrid className="size-4" /> {paletteVisible ? "Ẩn bảng câu" : "Bảng câu"}</button>
          <button type="button" className="btn btn-primary btn-sm hidden sm:inline-flex" onClick={() => setConfirmSubmit(true)}>
            <Send className="size-4" /> {practice ? "Kết thúc" : "Nộp bài"}
          </button>
        </div>
        <div className="h-1 bg-line-soft">
          <div className="h-full bg-gradient-to-r from-[#3b82f6] to-primary transition-[width] duration-500" style={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
      </header>

      {/* Nội dung */}
      <div className="mx-auto flex min-h-0 w-full max-w-[1680px] flex-1 gap-5 px-3 py-4 sm:px-6 sm:py-5">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-base font-bold text-ink sm:text-lg">{PART_INFO[q.part]?.title ?? `Part ${q.part}`}</h1>
              <p className="hidden text-sm text-muted sm:block">{PART_INFO[q.part]?.hint}</p>
            </div>
            {!listening && <ReadingTools preferences={reading.preferences} onChange={reading.update} />}
            {group && (
              <div className="seg lg:hidden" role="tablist" aria-label="Chế độ xem">
                <button type="button" role="tab" aria-selected={mobilePane === "passage"} data-active={mobilePane === "passage"} className="seg-item" onClick={() => setMobilePane("passage")}>
                  <BookOpenText className="size-4" /> {listening ? "Audio & hình" : "Đoạn văn"}
                </button>
                <button type="button" role="tab" aria-selected={mobilePane === "questions"} data-active={mobilePane === "questions"} className="seg-item" onClick={() => setMobilePane("questions")}>
                  <ListChecks className="size-4" /> Câu hỏi
                </button>
              </div>
            )}
          </div>

          <div className={`reading-spread grid min-h-0 flex-1 gap-4 ${group ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]" : ""}`}>
            {group && (
              <section
                aria-label={listening ? "Audio và hình Listening" : "Đoạn văn"}
                className={`reading-paper min-h-0 overflow-y-auto overscroll-contain ${mobilePane === "passage" ? "block" : "hidden"} lg:block`}
              >
                {listening ? <ListeningMaterial key={group.id} group={group} play reveal={practice && groupQs.every(x => !!session.answers[x.number])} testId={test.id} persistKey={`ybm-item-${session.id}-${group.id}`} practice={practice} onPlay={timedListening ? () => beginListening(session.id, Math.max(2700, test.listening?.duration ?? 2700)) : undefined} /> : <Passage group={group} current={q.number} answers={session.answers} onJump={(n) => { jumpTo(n); setMobilePane("questions"); }} />}
              </section>
            )}
            <section
              aria-label="Câu hỏi"
              className={`min-h-0 min-w-0 flex-col ${group && mobilePane === "passage" ? "hidden lg:flex" : "flex"} ${group ? "" : "mx-auto w-full max-w-3xl"}`}
            >
              {group && (listening ? <p className="reading-question-directions mb-4 shrink-0">{group.listening?.instructions || `Question ${group.from} · Nghe audio và chọn đáp án.`}</p> : <GroupInstructions group={group} className="reading-question-directions mb-4 shrink-0" />)}
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-2">
              {groupQs.map((x) => {
                const active = x.number === q.number;
                const sel = session.answers[x.number];
                const reveal = practice && !!sel;
                return (
                  <article
                    key={x.number}
                    ref={(el) => { qRefs.current[x.number] = el; }}
                    onClick={() => !active && jumpTo(x.number)}
                    className={`reading-question scroll-m-4 ${active ? "reading-question-active" : "cursor-pointer"}`}
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <span className={`grid h-8 min-w-10 shrink-0 place-items-center rounded-lg px-2 text-sm font-bold ${active ? "bg-primary text-white" : "bg-primary-soft text-primary"}`}>{x.number}</span>
                      <p className="reading-stem min-w-0 flex-1 pt-1">
                        {x.stem ? <Stem text={x.stem} /> : <span className="text-muted">{x.part <= 2 ? "Nghe audio và chọn đáp án." : `Chọn đáp án phù hợp cho chỗ trống (${x.number}).`}</span>}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleFlag(session.id, x.number); }}
                        aria-pressed={session.flagged.includes(x.number)}
                        aria-label={`Đánh dấu câu ${x.number}`}
                        title="Đánh dấu xem lại (F)"
                        className={`icon-btn size-8 shrink-0 ${session.flagged.includes(x.number) ? "bg-warning-soft text-warning" : ""}`}
                      >
                        <Flag className={`size-4 ${session.flagged.includes(x.number) ? "fill-current" : ""}`} />
                      </button>
                    </div>
                    <OptionList
                      q={x}
                      selected={sel}
                      reveal={reveal}
                      hideText={x.part <= 2 && !reveal}
                      disabled={reveal}
                      onSelect={(k) => { if (!active) jumpTo(x.number); answerQuestion(session.id, x.number, k); }}
                    />
                    {reveal && <div className="mt-3"><Explanation q={x} selected={sel} /></div>}
                  </article>
                );
              })}
              </div>
            </section>
          </div>

          {/* Điều hướng dưới */}
          <nav aria-label="Chuyển câu" className="mt-3 flex items-center gap-2 border-t border-line pt-3">
            <button type="button" className="btn btn-outline" onClick={() => go(idx - 1)} disabled={idx <= phaseStart}>
              <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Câu trước</span>
            </button>
            <button
              type="button"
              className={`btn ${flagged ? "bg-warning-soft text-warning-ink" : "btn-ghost"}`}
              onClick={() => toggleFlag(session.id, q.number)}
              aria-pressed={flagged}
            >
              <Flag className={`size-4 ${flagged ? "fill-current" : ""}`} /> <span className="hidden sm:inline">{flagged ? "Đã đánh dấu" : "Đánh dấu"}</span>
            </button>
            <span className="flex-1 text-center text-sm tabular-nums text-muted">{idx + 1} / {questions.length}</span>
            {timedListening && idx === phaseEnd ? (
              <button type="button" className="btn btn-primary" onClick={() => setConfirmListening(true)}>{questions.some(x => x.part >= 5) ? "Chuyển sang Reading" : "Nộp Listening"}<ArrowRight className="size-4" /></button>
            ) : idx < questions.length - 1 ? (
              <button type="button" className="btn btn-primary" disabled={idx >= phaseEnd} onClick={() => go(idx + 1)}>
                <span className="hidden sm:inline">Câu tiếp</span> <ArrowRight className="size-4" />
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => setConfirmSubmit(true)}>
                <Send className="size-4" /> {practice ? "Kết thúc" : "Nộp bài"}
              </button>
            )}
          </nav>
        </main>

        <aside className={`${paletteVisible ? "hidden lg:block" : "hidden"} w-[240px] shrink-0 overflow-y-auto`}>
          <div className="card p-4">
            <Palette questions={questions} session={session} current={q.number} onJump={jumpTo} />
            <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => setConfirmSubmit(true)}>
              <Send className="size-4" /> {practice ? "Kết thúc & xem kết quả" : "Nộp bài"}
            </button>
          </div>
        </aside>
      </div>

      <Dialog open={paletteOpen} onClose={() => setPaletteOpen(false)} title="Danh sách câu hỏi" description={`Đã làm ${answered}/${questions.length} câu`}>
        <Palette questions={questions} session={session} current={q.number} onJump={(n) => { jumpTo(n); setPaletteOpen(false); }} />
        <button type="button" className="btn btn-primary mb-2 mt-5 w-full" onClick={() => { setPaletteOpen(false); setConfirmSubmit(true); }}>
          <Send className="size-4" /> {practice ? "Kết thúc" : "Nộp bài"}
        </button>
      </Dialog>

      <ConfirmDialog open={confirmListening} onClose={() => setConfirmListening(false)} onConfirm={() => { setConfirmListening(false); endListening(); }} title="Hoàn tất Listening?" description={questions.some(x => x.part >= 5) ? "Sau khi chuyển sang Reading, bạn có 75 phút và không thể quay lại Listening." : "Bài Listening sẽ được chấm. Câu bỏ trống được tính là sai."} />
      <ConfirmDialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        onConfirm={() => submit()}
        title={practice ? "Kết thúc phiên luyện tập?" : "Nộp bài thi?"}
        description={
          unanswered > 0
            ? `Còn ${unanswered} câu chưa làm${session.flagged.length ? ` và ${session.flagged.length} câu đang đánh dấu` : ""}. Câu bỏ trống được tính là sai.`
            : session.flagged.length
              ? `Bạn đã làm hết, còn ${session.flagged.length} câu đang đánh dấu xem lại.`
              : "Bạn đã hoàn thành tất cả câu hỏi."
        }
        confirmLabel={practice ? "Xem kết quả" : "Nộp bài"}
      />
      <ConfirmDialog
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        onConfirm={() => router.push("/tests")}
        title="Tạm rời phòng thi?"
        description={
          remaining !== null
            ? "Bài làm đã được lưu. Lưu ý: đồng hồ vẫn tiếp tục chạy như thi thật."
            : "Bài làm đã được lưu, bạn có thể tiếp tục bất cứ lúc nào từ thư viện đề."
        }
        confirmLabel="Rời phòng"
      />
    </div>
  );
}

function Palette({
  questions, session, current, onJump,
}: { questions: EtsQuestion[]; session: ExamSession; current: number; onJump: (n: number) => void }) {
  const practice = session.mode === "practice";
  const byPart = useMemo(() => {
    const m = new Map<number, EtsQuestion[]>();
    for (const q of questions) m.set(q.part, [...(m.get(q.part) ?? []), q]);
    return [...m.entries()];
  }, [questions]);

  return (
    <div className="space-y-4">
      {byPart.map(([part, qs]) => (
        <div key={part}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Part {part}</p>
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-6">
            {qs.map((x) => {
              const a = session.answers[x.number];
              const isCur = x.number === current;
              const flag = session.flagged.includes(x.number);
              const correct = practice && a ? a === x.answer : null;
              const cls =
                correct === true ? "border-success bg-success text-white"
                : correct === false ? "border-danger bg-danger text-white"
                : a ? "border-primary bg-primary text-white"
                : "border-line bg-white text-ink-soft hover:border-primary hover:text-primary";
              return (
                <button
                  key={x.number}
                  type="button"
                  disabled={session.phase === "listening" ? x.part >= 5 : session.phase === "reading" ? x.part <= 4 : false}
                  onClick={() => onJump(x.number)}
                  aria-current={isCur ? "step" : undefined}
                  aria-label={`Câu ${x.number}${a ? ", đã làm" : ", chưa làm"}${flag ? ", đã đánh dấu" : ""}`}
                  className={`focus-ring relative h-9 rounded-lg border text-[13px] font-semibold tabular-nums transition ${cls} ${isCur ? "ring-2 ring-primary ring-offset-2" : ""}`}
                >
                  {x.number}
                  {flag && <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-white bg-warning" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line-soft pt-3 text-xs text-muted">
        {practice ? (
          <>
            <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-success" /> Đúng</li>
            <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-danger" /> Sai</li>
          </>
        ) : (
          <li className="flex items-center gap-1.5"><span className="size-3 rounded bg-primary" /> Đã làm</li>
        )}
        <li className="flex items-center gap-1.5"><span className="size-3 rounded border border-line bg-white" /> Chưa làm</li>
        <li className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-warning" /> Đánh dấu</li>
      </ul>
    </div>
  );
}
