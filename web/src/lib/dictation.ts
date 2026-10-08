export const normalizeDictation = (text: string) => text.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'\s]/g, " ").replace(/\s+/g, " ").trim();
export function sentenceTokens(text: string) { return text.match(/\S+/g) ?? []; }
/** Evenly distributed, stable gaps: switching views never changes the exercise. */
export function gapIndexes(text: string, percentage: number) {
  const words = sentenceTokens(text).map((word, index) => ({word, index})).filter(({word}) => normalizeDictation(word));
  const count = Math.ceil(words.length * percentage / 100);
  return Array.from({length: count}, (_, i) => words[Math.floor((i + .5) * words.length / count)].index);
}
export function checkGaps(text: string, gaps: number[], answers: Record<number, string>) {
  const tokens = sentenceTokens(text);
  return gaps.length > 0 && gaps.every(i => normalizeDictation(answers[i] ?? '') === normalizeDictation(tokens[i]));
}
export type SentenceProgress = { draft?: string; words?: Record<number, string>; completed?: boolean; bookmarked?: boolean; note?: string };
export type DictationProgress = { entries: Record<string, SentenceProgress>; savedWords: Record<string, string> };
export const EMPTY_DICTATION: DictationProgress = {entries: {}, savedWords: {}};
export function parseDictationProgress(raw: string | null): DictationProgress {
  try {
    const value = JSON.parse(raw ?? '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_DICTATION;
    const entries: Record<string, SentenceProgress> = {};
    const source = value.entries && typeof value.entries === 'object' ? value.entries : value;
    for (const [id, entry] of Object.entries(source)) {
      if (typeof entry === 'string') entries[id] = {draft: entry};
      else if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const item = entry as Record<string, unknown>;
        entries[id] = {
          draft: typeof item.draft === 'string' ? item.draft : undefined,
          note: typeof item.note === 'string' ? item.note : undefined,
          completed: item.completed === true,
          bookmarked: item.bookmarked === true,
          words: item.words && typeof item.words === 'object' && !Array.isArray(item.words) ? Object.fromEntries(Object.entries(item.words).filter(([key, value]) => /^\d+$/.test(key) && typeof value === 'string')) : undefined,
        };
      }
    }
    return {entries, savedWords: value.savedWords && typeof value.savedWords === 'object' && !Array.isArray(value.savedWords) ? Object.fromEntries(Object.entries(value.savedWords).filter(([, meaning]) => typeof meaning === 'string')) as Record<string, string> : {}};
  } catch { return EMPTY_DICTATION; }
}
