"use client";

import { useCallback, useSyncExternalStore } from "react";
import { EMPTY_SPEAKING, parseSpeakingProgress, type SpeakingEntry, type SpeakingProgress } from "./speaking";

const KEY = "toeic-speaking-v1";
const EVENT = "toeic-speaking-update";
type Snapshot = {data: SpeakingProgress; persistent: boolean};
const EMPTY: Snapshot = {data: EMPTY_SPEAKING, persistent: true};
const UNAVAILABLE: Snapshot = {data: EMPTY_SPEAKING, persistent: false};
let cache: {raw: string | null; snapshot: Snapshot} | undefined;
function read(): Snapshot {
  let raw: string | null;
  try {raw = localStorage.getItem(KEY);} catch {return cache?.snapshot ?? UNAVAILABLE;}
  if (cache?.raw === raw) return cache.snapshot;
  const snapshot = {data: parseSpeakingProgress(raw), persistent: true};
  cache = {raw, snapshot};
  return snapshot;
}
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(EVENT, notify);
  return () => {window.removeEventListener("storage", notify); window.removeEventListener(EVENT, notify);};
}
export function useSpeakingProgress() {
  const snapshot = useSyncExternalStore(subscribe, read, () => EMPTY);
  const update = useCallback((id: string, patch: Partial<SpeakingEntry>) => {
    const current = read().data;
    const data = {entries: {...current.entries, [id]: {...current.entries[id], ...patch}}};
    const raw = JSON.stringify(data);
    let stored: string | null = null;
    let persistent = true;
    try {localStorage.setItem(KEY, raw); stored = raw;} catch {
      persistent = false;
      try {stored = localStorage.getItem(KEY);} catch {}
    }
    cache = {raw: stored, snapshot: {data, persistent}};
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return {...snapshot, update};
}
