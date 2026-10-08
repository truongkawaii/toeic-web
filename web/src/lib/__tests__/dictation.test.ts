import {describe, expect, it} from 'vitest';
import {checkGaps, gapIndexes, normalizeDictation, parseDictationProgress, sentenceTokens} from '../dictation';
import {vocabularyFor} from '../dictation-vocabulary';

describe('dictation exercises', () => {
  it('ignores case and incidental punctuation but preserves meaningful contractions', () => {
    expect(normalizeDictation('  WE’RE ready, now! ')).toBe("we're ready now");
    expect(normalizeDictation('were ready')).not.toBe(normalizeDictation("we're ready"));
    expect(checkGaps('She has an appointment.', [3], {3: 'Appointment'})).toBe(true);
    expect(checkGaps('She has an appointment.', [3], {3: 'appointments'})).toBe(false);
    expect(checkGaps('She has an appointment.', [3], {})).toBe(false);
  });
  it('builds unique and stable gaps at all three levels', () => {
    for (const text of ["She has an appointment tomorrow.", "We're ready to attach the label to the carton."]) {
      const tokens = sentenceTokens(text);
      const count = tokens.filter(w => normalizeDictation(w)).length;
      for (const level of [30,50,100]) {
        const gaps = gapIndexes(text, level);
        expect(gaps.length).toBe(Math.ceil(count * level / 100));
        expect(gaps).toEqual(gapIndexes(text, level));
        expect(new Set(gaps).size).toBe(gaps.length);
        expect(gaps.every(i => normalizeDictation(tokens[i]))).toBe(true);
        expect(checkGaps(text, gaps, Object.fromEntries(gaps.map(i => [i, tokens[i]])))).toBe(true);
      }
    }
  });
  it('migrates existing drafts without losing work, restores notes/progress and handles damaged storage', () => {
    expect(parseDictationProgress('{"old-clip":"Saved draft"}').entries['old-clip']).toEqual({draft: 'Saved draft'});
    const data = {entries: {clip: {words: {1: 'label'}, completed: true, bookmarked: true, note: 'linking'}}, savedWords: {label: 'nhãn'}};
    expect(parseDictationProgress(JSON.stringify(data))).toMatchObject(data);
    for(const bad of ['{bad', 'null', '[]', '42']) expect(parseDictationProgress(bad).entries).toEqual({});
  });
  it('only supplies curated vocabulary that actually occurs as a whole word', () => {
    expect(vocabularyFor('Attach the label to the carton.').map(v => v.word)).toEqual(['attach', 'label', 'carton']);
    expect(vocabularyFor('We are ordering the relabeled package.')).toEqual([]);
  });
});
