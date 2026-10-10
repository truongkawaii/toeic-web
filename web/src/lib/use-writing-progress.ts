"use client";

import { useCallback, useSyncExternalStore } from "react";
import { EMPTY_WRITING, parseWritingProgress, patchWritingEntry, type WritingEntry, type WritingProgress } from "./writing";

const KEY = "toeic-writing-v1";
const EVENT = "toeic-writing-update";
type Snapshot = {data: WritingProgress; persistent: boolean};
const EMPTY: Snapshot = {data: EMPTY_WRITING, persistent: true};
let cache: {raw: string | null; snapshot: Snapshot} | undefined;
function read(): Snapshot {
  let raw: string | null;
  try { raw = localStorage.getItem(KEY); } catch {
    return cache?.snapshot ?? EMPTY;
  }
  if (cache?.raw === raw) return cache.snapshot;
  const snapshot = {data: parseWritingProgress(raw), persistent: true};
  cache = {raw, snapshot};
  return snapshot;
}
const subscribe = (notify: () => void) => {
  window.addEventListener("storage", notify);
  window.addEventListener(EVENT, notify);
  return () => {window.removeEventListener("storage", notify); window.removeEventListener(EVENT, notify);};
};

export function useWritingProgress() {
  const snapshot = useSyncExternalStore(subscribe, read, () => EMPTY);
  const update = useCallback((id: string, patch: Partial<WritingEntry>) => {
    const current = read().data;
    const data = {entries: {...current.entries, [id]: patchWritingEntry(current.entries[id] ?? {}, patch)}};
    const raw = JSON.stringify(data);
    let stored: string | null = null;
    let persistent = true;
    try { localStorage.setItem(KEY, raw); stored = raw; } catch {
      persistent = false;
      try { stored = localStorage.getItem(KEY); } catch {}
    }
    cache = {raw: stored, snapshot: {data, persistent}};
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return {...snapshot, update};
}
