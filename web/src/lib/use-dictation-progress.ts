"use client";
import { useCallback, useSyncExternalStore } from 'react';
import { EMPTY_DICTATION, parseDictationProgress, type DictationProgress, type SentenceProgress } from './dictation';
const cache = new Map<string, {raw: string | null; value: DictationProgress}>();
const eventName = 'yts-dictation-progress';
function read(key: string) {
  let raw: string | null = null;
  try { raw = localStorage.getItem(key); } catch {}
  const previous = cache.get(key);
  if (previous && previous.raw === raw) return previous.value;
  const value = parseDictationProgress(raw); cache.set(key, {raw, value}); return value;
}
const subscribe = (notify: () => void) => { window.addEventListener('storage', notify); window.addEventListener(eventName, notify); return () => {window.removeEventListener('storage', notify); window.removeEventListener(eventName, notify);}; };
export function useDictationProgress(testId: string, part: number) {
  const key = `yts-dictation-${testId}-${part}`;
  const data = useSyncExternalStore(subscribe, useCallback(() => read(key), [key]), () => EMPTY_DICTATION);
  const write = (next: DictationProgress) => {
    const raw = JSON.stringify(next);
    try { localStorage.setItem(key, raw); } catch { cache.set(key, {raw: null, value: next}); }
    cache.set(key, {raw: (() => {try {return localStorage.getItem(key);} catch {return null;}})(), value: next});
    window.dispatchEvent(new Event(eventName));
  };
  return {data, update: (id: string, patch: Partial<SentenceProgress>) => {const current = read(key); write({...current, entries: {...current.entries, [id]: {...current.entries[id], ...patch}}});}, saveWords: (words: Record<string, string>) => {const current = read(key); write({...current, savedWords: {...current.savedWords, ...words}});} };
}
