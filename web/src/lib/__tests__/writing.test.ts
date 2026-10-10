import { describe, expect, it } from "vitest";
import { CHECKLISTS, WRITING_CATEGORIES, WRITING_EMAILS, WRITING_ESSAYS, WRITING_GRAMMAR, WRITING_LESSONS, WRITING_PICTURES, WRITING_TOPICS, canComplete, orderingTokens, parseWritingProgress, patchWritingEntry, wordCount } from "../writing";
import { checkGaps, gapIndexes, sentenceTokens } from "../dictation";
import { WRITING_ERRORS, WRITING_GAPS, WRITING_TRANSLATIONS } from "../writing-exercises";

describe("original Writing curriculum", () => {
  it("covers every category and supplies real task-specific references", () => {
    expect(WRITING_PICTURES).toHaveLength(200);
    expect(WRITING_CATEGORIES.picture).toHaveLength(15);
    expect(WRITING_EMAILS).toHaveLength(50);
    expect(WRITING_ESSAYS).toHaveLength(100);
    expect(WRITING_CATEGORIES.essay).toHaveLength(5);
    expect(WRITING_TOPICS).toHaveLength(12);
    expect(new Set(WRITING_LESSONS.map(p => p.id)).size).toBe(350);
    expect(new Set(WRITING_PICTURES.map(p => p.answer)).size).toBe(200);
    expect(new Set(WRITING_ESSAYS.map(p => p.prompt)).size).toBe(100);
    expect(new Set(WRITING_EMAILS.map(p => p.incoming)).size).toBe(50);
    for (const essay of WRITING_ESSAYS) expect(essay.outline && essay.analysis && essay.explanation).toBeTruthy();
    for (const email of WRITING_EMAILS) {
      expect(email.task.length).toBeGreaterThan(20);
      expect(email.incoming).toContain(email.sender.split(",")[0]);
      expect(email.outline).not.toContain("Từ vựng:");
      expect(email.samples.length).toBeGreaterThan(0);
      expect(email.samples.every(s => /^(Dear|Hello) /.test(s) && !s.includes("**"))).toBe(true);
    }
    const samples = WRITING_ESSAYS.filter(p => p.samples.length);
    expect(samples).toHaveLength(5);
    expect(new Set(samples.map(p => p.category)).size).toBe(5);
    samples.forEach(p => {
      expect(wordCount(p.samples[0])).toBeGreaterThanOrEqual(300);
      expect(wordCount(p.samples[0])).toBeLessThanOrEqual(350);
      expect(p.outline && p.vocabulary && p.summary && p.explanation).toBeTruthy();
    });
    for (const table of Object.values(WRITING_GRAMMAR)) expect(table.rows.every(row => row.length === table.headers.length)).toBe(true);
  });
  it("does not lose repeated words when constructing fill and ordering exercises", () => {
    for (const lesson of WRITING_PICTURES) {
      const tokens = sentenceTokens(lesson.answer);
      const shuffled = orderingTokens(lesson.answer);
      expect(shuffled.map(t => t.id).sort((a, b) => a - b)).toEqual(tokens.map((_, i) => i));
      expect(shuffled.slice().sort((a, b) => a.id - b.id).map(t => t.text).join(" ")).toBe(lesson.answer);
      expect(orderingTokens(lesson.answer)).toEqual(shuffled);
      const gaps = gapIndexes(lesson.answer, 30);
      expect(checkGaps(lesson.answer, gaps, Object.fromEntries(gaps.map(i => [i, tokens[i]])))).toBe(true);
      expect(checkGaps(lesson.answer, gaps, {})).toBe(false);
    }
    for (const part of ["email", "essay"] as const) {
      expect(WRITING_TRANSLATIONS[part].length).toBeGreaterThan(0);
      expect(WRITING_GAPS[part].every(p => p.prompt.includes("___") && p.answer && p.explanation)).toBe(true);
      expect(WRITING_ERRORS[part].every(p => p.prompt !== p.answer && p.explanation)).toBe(true);
    }
  });
});

describe("Writing draft and review persistence", () => {
  it("restores drafts, notes, bookmarks and timer while rejecting damaged entries", () => {
    const valid = {entries: {E01: {draft: "Dear Nora, thank you.", note: "Ask application version", bookmarked: true, checks: [true, false, false, false, false], deadline: 1900000000000}}};
    expect(parseWritingProgress(JSON.stringify(valid)).entries.E01).toMatchObject(valid.entries.E01);
    for (const raw of [null, "{bad", "null", "42", "[]", '{"entries":[]}', '{"entries":{"E01":[]}}']) expect(parseWritingProgress(raw).entries).toEqual({});
    expect(parseWritingProgress('{"entries":{"E01":{"draft":42,"completed":true,"checks":"yes","deadline":"oops"},"unknown":{"draft":"hidden"}}}')).toEqual({entries: {E01: {draft: "", note: "", completed: false, bookmarked: false, checks: [false, false, false, false, false], deadline: null}}});
  });
  it("requires a draft and every review item; editing invalidates completion", () => {
    const lesson = WRITING_EMAILS[0];
    const checks = CHECKLISTS.email.map(() => true);
    expect(canComplete(lesson, {checks, draft: "  "})).toBe(false);
    expect(canComplete(lesson, {checks: [true], draft: "A reply"})).toBe(false);
    expect(canComplete(lesson, {checks, draft: "A reply"})).toBe(true);
    const original = {draft: "A reply", checks, completed: true, note: "Useful note", bookmarked: true};
    expect(patchWritingEntry(original, {draft: "An improved reply"})).toEqual({...original, draft: "An improved reply", checks: [], completed: false});
    expect(patchWritingEntry(original, {note: "New note"}).completed).toBe(true);
    expect(patchWritingEntry(original, {draft: "A reply"}).completed).toBe(true);
    expect(wordCount("  one\n two   three ")).toBe(3);
  });
});
