import { describe, expect, it } from 'vitest';
import { ETS_INDEX, READING_LOADERS } from '@/lib/ets';
import { MOCK_TESTS, READING_COLLECTIONS, TEST_COLLECTIONS } from '@/lib/mock/fixtures';

describe('available reading catalog', () => {
  it('offers ten complete YBM Reading papers', async () => {
    expect(ETS_INDEX).toHaveLength(10);
    expect(READING_LOADERS['ybm2025-t10']).toBeTypeOf('function');
    for (const entry of ETS_INDEX) {
      const test = await READING_LOADERS[entry.id]();
      expect(test.questions.map(q=>q.number)).toEqual(Array.from({length:100},(_,i)=>i+101));
      expect([5,6,7].map(p=>test.questions.filter(q=>q.part===p).length)).toEqual([30,16,54]);
      expect(test.groups.every(g=>g.part>=5)).toBe(true);
    }
    expect(READING_COLLECTIONS.some(c=>c.id==='ybm-2025')).toBe(true);
    expect(TEST_COLLECTIONS.some(c=>c.id==='ybm-2025')).toBe(true);
    expect(MOCK_TESTS.filter(t=>t.collectionId==='ybm-2025')).toHaveLength(10);
  });
});
