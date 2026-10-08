import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LISTENING_LOADERS } from "@/data/listening/loaders";
import { EXAM_LOADERS, YTS_EXAM_INDEX, gradeSession } from "@/lib/ets";
import type { ExamSession } from "@/types/domain";

describe("YTS Listening catalog and assets", () => {
  it("provides all forty complete papers with working media and grading", async () => {
    expect(YTS_EXAM_INDEX).toHaveLength(40);
    for (const year of [2023, 2024, 2025, 2026]) {
      expect(YTS_EXAM_INDEX.filter(t => t.year === year)).toHaveLength(10);
    }
    const checkAsset = (url: string) => {
      expect(url.startsWith("/listening/")).toBe(true);
      expect(fs.statSync(path.join(process.cwd(), "public", url)).size).toBeGreaterThan(0);
    };
    for (const entry of YTS_EXAM_INDEX) {
      const test = await LISTENING_LOADERS[entry.id]();
      expect(test.questions.map(q => q.number)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
      expect([1, 2, 3, 4].map(p => test.questions.filter(q => q.part === p).length)).toEqual([6, 25, 39, 30]);
      expect(test.listening?.missingPhotos).toBe(0);
      checkAsset(test.listening!.fullAudio);
      for (const part of Object.values(test.listening!.parts)) {
        checkAsset(part.fullAudio);
        checkAsset(part.directionsAudio);
      }
      for (const group of test.groups) {
        const item = group.listening!;
        checkAsset(item.audio);
        checkAsset(item.conversationAudio);
        if (group.part === 1) expect(item.image).toBeTruthy();
        if (item.image) checkAsset(item.image);
        expect(item.imagePending).toBe(false);
        expect(item.clips.length).toBeGreaterThan(0);
        for (const clip of item.clips) { checkAsset(clip.audio); expect(clip.text).toBeTruthy(); }
      }
      const session: ExamSession = { id: "qa", testId: test.id, mode: "exam", questionNumbers: test.questions.map(q => q.number), answers: Object.fromEntries(test.questions.map(q => [q.number, q.answer!])), flagged: [], current: 0, startedAt: 0, deadline: null, status: "active" };
      const result = gradeSession(test, session);
      expect(result.correct).toBe(100);
      expect(result.skill).toBe("listening");
      expect(result.estimatedScore).toBe(495);
      const combined = await EXAM_LOADERS[entry.id]();
      expect(combined.questions).toHaveLength(entry.hasReading ? 200 : 100);
      expect(new Set(combined.questions.map(q => q.number)).size).toBe(combined.questions.length);
    }
  }, 60000);
});
