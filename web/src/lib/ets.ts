import { useCallback, useEffect, useState } from "react";
import YBM_INDEX_JSON from "@/data/ybm/index.json";
import { YBM_LOADERS } from "@/data/ybm/loaders";
import { toISODate } from "@/lib/mock/fixtures";
import type { Attempt, EtsIndexEntry, EtsQuestion, EtsTest, ExamSession } from "@/types/domain";

/** Danh mục các bộ đề có dữ liệu trong dự án. */
export const ETS_INDEX = YBM_INDEX_JSON.filter(t => t.hasReading) as EtsIndexEntry[];
export const LISTENING_EXAM_INDEX = YBM_INDEX_JSON as EtsIndexEntry[];
export const EXAM_INDEX = YBM_INDEX_JSON as EtsIndexEntry[];
export const EXAM_LOADERS = YBM_LOADERS;
export const READING_LOADERS: Record<string, () => Promise<EtsTest>> = Object.fromEntries(
  ETS_INDEX.map(entry => [entry.id, async () => {
    const test = await YBM_LOADERS[entry.id]();
    return { ...test, groups: test.groups.filter(g => g.part >= 5), questions: test.questions.filter(q => q.part >= 5), listening: undefined };
  }]),
);

/** Thời lượng Reading thật: 75 phút / 100 câu. */
export const READING_MINUTES = 75;
export const examMinutesFor = (count: number) => Math.max(5, Math.round((READING_MINUTES * count) / 100));

export const PART_INFO: Record<number, { title: string; hint: string }> = {
  1: { title: "Part 1 · Photographs", hint: "Nhìn ảnh, nghe bốn mô tả và chọn A–D." },
  2: { title: "Part 2 · Question–Response", hint: "Nghe câu hỏi/phát ngôn và chọn một phản hồi A–C." },
  3: { title: "Part 3 · Conversations", hint: "Nghe hội thoại và trả lời ba câu hỏi; xem graphic nếu có." },
  4: { title: "Part 4 · Talks", hint: "Nghe bài nói và trả lời ba câu hỏi; xem graphic nếu có." },
  5: { title: "Part 5 · Incomplete Sentences", hint: "Chọn từ/cụm từ phù hợp để hoàn thành câu." },
  6: { title: "Part 6 · Text Completion", hint: "Đọc đoạn văn, chọn từ hoặc câu phù hợp cho mỗi chỗ trống." },
  7: { title: "Part 7 · Reading Comprehension", hint: "Đọc một hoặc nhiều đoạn văn và trả lời câu hỏi." },
};

type LoadState = { status: "loading" } | { status: "ready"; test: EtsTest } | { status: "error"; message: string };

export function useEtsTest(id: string | null | undefined) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    const loader = EXAM_LOADERS[id];
    if (!loader) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- id không tồn tại: báo lỗi ngay
      setState({ status: "error", message: "Không tìm thấy đề thi này." });
      return;
    }
    setState({ status: "loading" });
    loader()
      .then((test) => alive && setState({ status: "ready", test }))
      .catch(() => alive && setState({ status: "error", message: "Không tải được nội dung đề. Kiểm tra kết nối và thử lại." }));
    return () => {
      alive = false;
    };
  }, [id, nonce]);

  const retry = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, retry } as LoadState & { retry: () => void };
}

/** Điểm Reading quy đổi minh hoạ (thang 5–495), không phải bảng quy đổi chính thức. */
export function estimateReading(correct: number, total: number) {
  if (total === 0) return 5;
  const r = correct / total;
  return Math.min(495, Math.max(5, Math.round((5 + 490 * Math.pow(r, 1.1)) / 5) * 5));
}

/** Chấm một phiên: câu bỏ trống tính sai riêng; trả về Attempt (id cố định theo phiên → nộp lại không nhân kết quả). */
export function gradeSession(test: EtsTest, session: ExamSession, now = Date.now()): Attempt {
  const qs = session.questionNumbers
    .map((n) => test.questions.find((q) => q.number === n))
    .filter((q): q is EtsQuestion => !!q && !!q.answer);
  const wrong: number[] = [];
  const blank: number[] = [];
  const byPart: Record<number, { correct: number; total: number }> = {};
  let correct = 0;
  const listeningQs = qs.filter(q => q.part <= 4);
  const readingQs = qs.filter(q => q.part >= 5);
  for (const q of qs) {
    const p = (byPart[q.part] ??= { correct: 0, total: 0 });
    p.total++;
    const a = session.answers[q.number];
    if (!a) blank.push(q.number);
    else if (a === q.answer) {
      correct++;
      p.correct++;
    } else wrong.push(q.number);
  }
  const sectionScore = (items: EtsQuestion[]) => estimateReading(items.filter(q => session.answers[q.number] === q.answer).length, items.length);
  const skill = listeningQs.length ? (readingQs.length ? "combined" : "listening") : "reading";
  const sectionScores = { ...(listeningQs.length ? { listening: sectionScore(listeningQs) } : {}), ...(readingQs.length ? { reading: sectionScore(readingQs) } : {}) };
  return {
    id: attemptIdFor(session.id),
    sessionId: session.id,
    testId: session.testId,
    mode: session.mode,
    date: toISODate(new Date(now)),
    correct,
    total: qs.length,
    minutes: Math.max(1, Math.round((now - session.startedAt) / 60000)),
    estimatedScore: (sectionScores.listening ?? 0) + (sectionScores.reading ?? 0) || 5,
    scoreMax: skill === "combined" ? 990 : 495,
    skill, sectionScores,
    questionNumbers: qs.map((q) => q.number),
    answers: session.answers,
    flagged: session.flagged,
    wrong,
    blank,
    byPart,
  };
}

export const attemptIdFor = (sessionId: string) => `att-${sessionId}`;

export const etsTitle = (testId: string) => EXAM_INDEX.find((t) => t.id === testId)?.title ?? testId;

export const attemptSkillLabel = (attempt: Attempt) => attempt.skill === "combined" || attempt.scoreMax === 990 ? "Listening + Reading" : attempt.skill === "listening" ? "Listening" : "Reading";

export function examDurationMinutes(test: EtsTest, numbers: number[]) {
  const questions = test.questions.filter(q => numbers.includes(q.number));
  const listeningCount = questions.filter(q => q.part <= 4).length;
  const readingCount = questions.length - listeningCount;
  return Math.ceil((listeningCount ? (test.listening?.duration ?? 2700) / 60 * listeningCount / 100 : 0) + (readingCount ? READING_MINUTES * readingCount / 100 : 0));
}
