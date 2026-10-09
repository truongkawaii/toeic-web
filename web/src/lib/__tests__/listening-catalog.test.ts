import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { EXAM_INDEX, EXAM_LOADERS, gradeSession } from '@/lib/ets';
import type { ExamSession } from '@/types/domain';

describe('YBM 2025 catalog', () => {
  it('loads ten papers, source media, and grades each available question', async () => {
    expect(EXAM_INDEX).toHaveLength(10);
    const asset = (url: string) => path.join(process.cwd(), 'public', decodeURIComponent(url));
    for (const entry of EXAM_INDEX) {
      const test = await EXAM_LOADERS[entry.id]();
      expect(test.questions.map(q => q.number)).toEqual(Array.from({length: entry.hasReading ? 200 : 100}, (_, i) => i + 1));
      expect([1,2,3,4].map(p => test.questions.filter(q => q.part === p).length)).toEqual([6,25,39,30]);
      let missing = 0;
      for (const group of test.groups.filter(g => g.part <= 4)) {
        const item = group.listening!;
        if (!item.audio) { missing += group.to - group.from + 1; continue; }
        expect(fs.statSync(asset(item.audio)).size).toBeGreaterThan(0);
        execFileSync('ffmpeg', ['-v', 'error', '-xerror', '-i', asset(item.audio), '-f', 'null', '-']);
        if (group.part === 1) expect(item.image).toBeTruthy();
        if (item.image) expect(fs.statSync(asset(item.image)).size).toBeGreaterThan(0);
      }
      expect(missing).toBe(entry.missingAudio ?? 0);
      expect(test.listening).not.toHaveProperty('fullAudio');
      const session: ExamSession = { id:'qa', testId:test.id, mode:'exam', questionNumbers:test.questions.map(q=>q.number), answers:Object.fromEntries(test.questions.map(q=>[q.number,q.answer!])), flagged:[], current:0, startedAt:0, deadline:null, status:'active' };
      expect(gradeSession(test, session).correct).toBe(test.questions.length);
    }
    expect(EXAM_INDEX.find(t=>t.number===10)?.hasReading).toBe(true);
    expect(EXAM_INDEX.find(t=>t.number===6)?.missingAudio).toBe(0);
  }, 180000);
});
