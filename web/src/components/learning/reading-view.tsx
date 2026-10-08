"use client";

import { BookOpenText, Check, ChevronRight, FileText, RotateCcw, ShoppingBasket, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { READING_LOADERS } from "@/lib/ets";
import { PageHero } from "@/components/learning/page-hero";
import { ConfirmDialog } from "@/components/ui/dialog";
import { ProgressBar, SectionTitle } from "@/components/ui/primitives";
import { ChipGroup, SegTabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { GRAMMAR_GROUPS, GRAMMAR_TOPICS, READING_COLLECTIONS, MOCK_TESTS } from "@/lib/mock/fixtures";
import { useDemoStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import type { GrammarTopic } from "@/types/domain";

const MODES = [
  { id: "grammar", label: "Ngữ pháp" },
  { id: "part5", label: "Part 5" },
  { id: "part6", label: "Part 6" },
  { id: "part7", label: "Part 7" },
] as const;
type Mode = (typeof MODES)[number]["id"];

const GROUP_FILTER = [{ id: "all", label: "Tất cả" }, ...GRAMMAR_GROUPS] as const;
type GroupFilter = (typeof GROUP_FILTER)[number]["id"];

export function ReadingView() {
  const [mode, setMode] = useQueryParam<Mode>("mode", "part5", MODES.map((m) => m.id));

  return (
    <div className="container-app space-y-7">
      <PageHero
        eyebrow="Luyện đọc TOEIC"
        title={["Chinh phục", "TOEIC Reading", "từ dễ đến khó"]}
        description="Luyện Part 5–7 với bộ YTS 2024 và YTS 2026, giải thích chi tiết và giao diện đọc như tài liệu."
        icon={BookOpenText}
      />
      <SegTabs label="Chế độ luyện đọc" items={MODES} value={mode} onChange={(v) => setMode(v, { group: null, set: null })} />
      {mode === "grammar" ? <GrammarSection /> : <PartSection part={Number(mode.slice(4)) as 5 | 6 | 7} />}
    </div>
  );
}

function GrammarSection() {
  const [group, setGroup] = useQueryParam<GroupFilter>("group", "all", GROUP_FILTER.map((g) => g.id));
  const groups = GRAMMAR_GROUPS.filter((g) => group === "all" || g.id === group);

  return (
    <div className="space-y-8">
      <ChipGroup label="Nhóm ngữ pháp" items={GROUP_FILTER} value={group} onChange={(v) => setGroup(v)} />
      {groups.map((g, gi) => {
        const topics = GRAMMAR_TOPICS.filter((t) => t.group === g.id);
        const total = topics.reduce((s, t) => s + t.questions, 0);
        return (
          <section key={g.id} aria-label={g.label} className="animate-fade-up" style={{ animationDelay: `${gi * 50}ms` }}>
            <SectionTitle title={g.label} meta={`${topics.length} chủ điểm · ${total} câu`} accent={false} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {topics.map((t) => <TopicCard key={t.id} topic={t} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function TopicCard({ topic }: { topic: GrammarTopic }) {
  const { topicProgress, resetTopic } = useDemoStore();
  const { comingSoon, toast } = useToast();
  const [confirm, setConfirm] = useState(false);
  const p = topicProgress[topic.id];
  const started = !!p;

  return (
    <article className="card card-hover relative flex flex-col overflow-hidden p-5 pt-6">
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#3b82f6] to-primary" />
      <h3 className="text-lg font-semibold text-ink">{topic.title}</h3>
      {started ? (
        <div className="mt-2">
          <p className="flex items-center gap-3 text-sm font-semibold">
            <span className="text-success">{p.done}/{topic.questions}</span>
            <span className="inline-flex items-center gap-0.5 text-success"><Check className="size-3.5" /> {p.correct}</span>
            <span className="inline-flex items-center gap-0.5 text-danger"><X className="size-3.5" /> {p.wrong}</span>
          </p>
          <ProgressBar value={(p.done / topic.questions) * 100} tone="success" className="mt-2 h-1.5" />
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">Chưa luyện tập · {topic.questions} câu</p>
      )}
      <div className="mt-5 flex items-center justify-between gap-2">
        <div className="flex items-center rounded-full border border-line-soft bg-canvas/60 p-0.5">
          <button type="button" className="icon-btn size-8 rounded-full" title="Giỏ câu hỏi" aria-label="Giỏ câu hỏi" onClick={() => toast("Giỏ câu hỏi đang trống", { tone: "info" })}>
            <ShoppingBasket className="size-4" />
          </button>
          <button type="button" className="icon-btn size-8 rounded-full" title="Lý thuyết" aria-label={`Lý thuyết ${topic.title}`} onClick={() => comingSoon("Lý thuyết ngữ pháp")}>
            <FileText className="size-4" />
          </button>
          <button type="button" className="icon-btn size-8 rounded-full" title="Luyện lại câu sai" aria-label="Luyện lại câu sai" disabled={!started || p.wrong === 0} onClick={() => comingSoon("Luyện lại câu sai")}>
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            className={`icon-btn size-8 rounded-full ${started ? "text-danger hover:bg-danger-soft hover:text-danger" : ""}`}
            title="Xoá tiến độ"
            aria-label={`Xoá tiến độ ${topic.title}`}
            disabled={!started}
            onClick={() => setConfirm(true)}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        <button type="button" className={`btn btn-sm rounded-full px-4 ${started ? "btn-success" : "btn-soft-success"}`} onClick={() => comingSoon(`Học ${topic.title}`)}>
          {started ? "Học tiếp" : "Học ngay"}
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => { resetTopic(topic.id); toast(`Đã xoá tiến độ “${topic.title}”`); }}
        title="Xoá tiến độ chủ điểm?"
        description={`Kết quả ${p?.done ?? 0} câu đã làm của “${topic.title}” sẽ bị xoá. Không thể hoàn tác.`}
        confirmLabel="Xoá tiến độ"
        danger
      />
    </article>
  );
}

function PartSection({ part }: { part: 5 | 6 | 7 }) {
  const [set, setSet] = useQueryParam("set", "yts-2026", READING_COLLECTIONS.map((c) => c.id));
  const { toast } = useToast();
  const { startSession, sessions, testProgress } = useDemoStore();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const tests = useMemo(() => MOCK_TESTS.filter(t => t.collectionId === set && t.playable), [set]);
  const start = async (testId: string) => {
    const active = Object.values(sessions).find(s => s.testId === testId && s.status === "active" && s.mode === "practice" && s.questionNumbers.every(n => n >= (part === 5 ? 101 : part === 6 ? 131 : 147) && n <= (part === 5 ? 130 : part === 6 ? 146 : 200)));
    if (active) { router.push(`/exam/${active.id}`); return; }
    setBusy(testId);
    try {
      const data = await READING_LOADERS[testId]();
      const id = startSession({testId, mode: "practice", questionNumbers: data.questions.filter(q => q.part === part).map(q => q.number), deadline: null, label: `Luyện Part ${part}`});
      router.push(`/exam/${id}`);
    } catch { toast("Không tải được đề. Vui lòng thử lại.", {tone: "warning"}); }
    finally { setBusy(null); }
  };
  const desc = { 5: "Hoàn thành câu", 6: "Hoàn thành đoạn văn", 7: "Đọc hiểu đoạn văn" }[part];

  return (
    <div className="space-y-6">
      <ChipGroup label="Bộ đề" items={READING_COLLECTIONS} value={set} onChange={(v) => setSet(v)} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tests.map((t, i) => (
          <article key={t.id} className="card card-hover flex animate-fade-up flex-col p-5" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="badge badge-primary px-3 py-1 text-[13px]">Part {part}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">Test {t.testNo}</h3>
              </div>
            </div>
            <p className="mt-1 text-sm text-muted">{desc} · {t.partCounts?.[part]} câu</p>
            <div className="mt-5 flex items-center justify-between border-t border-line-soft pt-4">
              <span className="text-sm text-muted">{testProgress[t.id] ? "Đã có bài làm" : "Chưa bắt đầu"}</span>
              <button type="button" className="btn btn-primary btn-sm" disabled={busy !== null} onClick={() => start(t.id)}>
                {busy === t.id ? "Đang mở…" : "Luyện tập"} <ChevronRight className="size-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
