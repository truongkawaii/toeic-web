"use client";
import { useEffect, useState, type CSSProperties } from "react";

type Preferences = { size: number; font: "serif" | "sans" };
const DEFAULT: Preferences = { size: 19, font: "serif" };
export function useReadingPreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("toeic.reading.preferences") ?? "null");
      if (stored && [17, 19, 21, 23].includes(stored.size) && ["serif", "sans"].includes(stored.font)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only preference
        setPreferences(stored);
      }
    } catch { /* Keep the readable default if saved data is invalid. */ }
  }, []);
  const update = (value: Preferences) => {
    setPreferences(value);
    try { localStorage.setItem("toeic.reading.preferences", JSON.stringify(value)); } catch { /* storage optional */ }
  };
  const style = {
    "--reading-size": `${preferences.size}px`,
    "--reading-font": preferences.font === "serif" ? 'Georgia, "Times New Roman", serif' : 'Arial, "Helvetica Neue", sans-serif',
  } as CSSProperties;
  return { preferences, update, style };
}

export function ReadingTools({ preferences, onChange }: { preferences: Preferences; onChange: (p: Preferences) => void }) {
  return <div className="reading-tools flex items-center gap-2">
    <label className="flex items-center gap-1.5 text-xs text-ink-soft"><span className="hidden sm:inline">Chữ</span>
      <select aria-label="Kiểu chữ bài đọc" value={preferences.font} onChange={e => onChange({...preferences, font: e.target.value as Preferences["font"]})} className="focus-ring min-h-10 rounded-lg border border-line bg-white px-2 text-sm">
        <option value="serif">Serif · sách</option><option value="sans">Sans · rõ nét</option>
      </select>
    </label>
    <select aria-label="Cỡ chữ bài đọc" value={preferences.size} onChange={e => onChange({...preferences, size: Number(e.target.value)})} className="focus-ring min-h-10 rounded-lg border border-line bg-white px-2 text-sm">
      {[17,19,21,23].map(n => <option key={n} value={n}>{n}px</option>)}
    </select>
  </div>;
}
