import { describe, expect, it } from "vitest";
import { YTS_LOADERS } from "@/data/yts/loaders";
import { ETS_LOADERS } from "@/data/ets/loaders";
import YTS_INDEX from "@/data/yts/index.json";
import YTS_2024_INDEX from "@/data/yts2024/index.json";
import { YTS_LOADERS as YTS_2024_LOADERS } from "@/data/yts2024/loaders";
import { gradeSession } from "@/lib/ets";
import type { ExamSession } from "@/types/domain";

describe("YTS 2024 and 2026 editorial integrity", () => {
  it("contains ten full tests and original sentences/passages", async () => {
    expect(YTS_INDEX).toHaveLength(10);
    expect(YTS_2024_INDEX).toHaveLength(10);
    const loaders = {...YTS_LOADERS, ...YTS_2024_LOADERS};
    const original = await Promise.all(Object.values(ETS_LOADERS).map(load => load()));
    const etsSentences = new Set(original.flatMap(t => t.questions.filter(q => q.part === 5).map(q => q.stem)));
    const etsPassages = new Set(original.flatMap(t => t.groups.map(g => g.passage)));
    const sentences = new Set<string>(), passages = new Set<string>();
    for (const entry of [...YTS_INDEX, ...YTS_2024_INDEX]) {
      const t = await loaders[entry.id]();
      expect(t.questions.map(q => q.number)).toEqual(Array.from({length: 100}, (_, i) => i + 101));
      const key=t.questions.map(q=>q.answer).join("");
      expect(new Set(Array.from({length:95},(_,i)=>key.slice(i,i+6))).size).toBeGreaterThan(70);
      for(const letter of ["A","B","C","D"]) expect(t.questions.filter(q=>q.answer===letter)).toHaveLength(25);
      expect([5,6,7].map(p => t.questions.filter(q => q.part === p).length)).toEqual([30,16,54]);
      expect(t.groups.filter(g => g.part === 6).map(g => g.to - g.from + 1)).toEqual([4,4,4,4]);
      const multi = t.groups.filter(g => g.part === 7 && (g.documents?.length ?? 0) > 1);
      expect(multi.map(g => g.documents!.length)).toEqual([2,2,3,3,3]);
      for (const q of t.questions) {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options.map(o => o.text)).size).toBe(4);
        expect(q.options.some(o => o.key === q.answer)).toBe(true);
        expect(q.explanation!.length).toBeGreaterThan(70);
        if(q.part === 5) { expect(etsSentences.has(q.stem)).toBe(false); expect(sentences.has(q.stem)).toBe(false); sentences.add(q.stem); }
        if(q.groupId) {
          const group = t.groups.find(g => g.id === q.groupId)!;
          expect(group).toBeTruthy();
          expect(q.number >= group.from && q.number <= group.to).toBe(true);
          if(q.part === 6) expect(group.passage).toContain(`(${q.number})`);
        }
      }
      for(const g of t.groups) {
        expect(etsPassages.has(g.passage)).toBe(false);
        expect(passages.has(g.passage)).toBe(false);
        passages.add(g.passage);
        expect(g.passage.split(/\s+/).length).toBeGreaterThan(90);
      }
      const session: ExamSession = {id:'qa',testId:t.id,mode:'exam',questionNumbers:t.questions.map(q=>q.number),answers:Object.fromEntries(t.questions.map(q=>[q.number,q.answer!])),flagged:[],current:0,startedAt:0,deadline:null,status:'active'};
      expect(gradeSession(t,session).correct).toBe(100);
      expect(gradeSession(t,session).byPart).toEqual({5:{correct:30,total:30},6:{correct:16,total:16},7:{correct:54,total:54}});
    }
    expect(sentences.size).toBe(600);
    expect(passages.size).toBe(380);
  });
});
