import { describe, expect, it } from "vitest";
import { attemptIdFor, ETS_INDEX, READING_LOADERS, estimateReading, examMinutesFor, gradeSession } from "@/lib/ets";
import type { EtsTest, ExamSession } from "@/types/domain";

const test: EtsTest = {
  id: "t",
  year: 2026,
  number: 1,
  title: "T",
  source: "x",
  groups: [{ id: "g131", from: 131, to: 132, kind: "notice", part: 6, passage: "..." }],
  questions: [
    { number: 101, part: 5, groupId: null, stem: "a", options: [], answer: "A", explanation: null },
    { number: 102, part: 5, groupId: null, stem: "b", options: [], answer: "B", explanation: null },
    { number: 131, part: 6, groupId: "g131", stem: "", options: [], answer: "C", explanation: null },
    { number: 132, part: 6, groupId: "g131", stem: "", options: [], answer: "D", explanation: null },
  ],
};

const session = (answers: Record<number, string>, nums = [101, 102, 131, 132]): ExamSession => ({
  id: "s1",
  testId: "t",
  mode: "exam",
  questionNumbers: nums,
  answers,
  flagged: [132],
  current: 0,
  startedAt: 0,
  deadline: null,
  status: "active",
});

describe("gradeSession", () => {
  it("chấm đúng / sai / bỏ trống và theo Part", () => {
    const a = gradeSession(test, session({ 101: "A", 102: "C", 131: "C" }), 10 * 60_000);
    expect(a.correct).toBe(2);
    expect(a.total).toBe(4);
    expect(a.wrong).toEqual([102]);
    expect(a.blank).toEqual([132]);
    expect(a.byPart).toEqual({ 5: { correct: 1, total: 2 }, 6: { correct: 1, total: 2 } });
    expect(a.minutes).toBe(10);
    expect(a.flagged).toEqual([132]);
  });

  it("chỉ chấm các câu trong phiên (luyện lại câu sai)", () => {
    const a = gradeSession(test, session({ 102: "B" }, [102, 132]));
    expect(a.total).toBe(2);
    expect(a.correct).toBe(1);
    expect(a.blank).toEqual([132]);
  });

  it("id kết quả cố định theo phiên → nộp lại không nhân bản", () => {
    const s = session({ 101: "A" });
    expect(gradeSession(test, s).id).toBe(gradeSession(test, s).id);
    expect(gradeSession(test, s).id).toBe(attemptIdFor("s1"));
  });
});

describe("điểm & thời gian", () => {
  it("estimateReading nằm trong 5–495, bội số 5, đơn điệu", () => {
    expect(estimateReading(0, 100)).toBe(5);
    expect(estimateReading(100, 100)).toBe(495);
    let prev = 0;
    for (let c = 0; c <= 100; c++) {
      const s = estimateReading(c, 100);
      expect(s % 5).toBe(0);
      expect(s).toBeGreaterThanOrEqual(prev);
      prev = s;
    }
  });
  it("75 phút cho 100 câu", () => {
    expect(examMinutesFor(100)).toBe(75);
    expect(examMinutesFor(2)).toBe(5);
  });
});

describe("dữ liệu ETS đã parse", () => {
  it.each(ETS_INDEX.map((t) => t.id))("%s: mọi câu có 4 lựa chọn, đáp án hợp lệ, nhóm hợp lệ", async (id) => {
    const t = await READING_LOADERS[id]();
    expect(t.questions.length).toBeGreaterThanOrEqual(95);
    for (const q of t.questions) {
      expect(q.options.map((o) => o.key)).toEqual(["A", "B", "C", "D"]);
      expect(["A", "B", "C", "D"]).toContain(q.answer);
      if (q.part >= 6) {
        const g = t.groups.find((x) => x.id === q.groupId);
        expect(g, `câu ${q.number} thiếu đoạn văn`).toBeTruthy();
        expect(q.number).toBeGreaterThanOrEqual(g!.from);
        expect(q.number).toBeLessThanOrEqual(g!.to);
        expect(g!.passage.length).toBeGreaterThan(20);
      }
      if (q.part === 5 || q.part === 7) expect(q.stem.length, `câu ${q.number} thiếu đề`).toBeGreaterThan(3);
    }
  });
});
