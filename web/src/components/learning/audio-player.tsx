"use client";

import { Headphones, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

export function AudioPlayer({ src, title, persistKey, examStartedAt, onPlay, onEnded, compact = false, practice = false }: {
  src: string; title: string; persistKey?: string; examStartedAt?: number;
  onPlay?: () => void; onEnded?: () => void; compact?: boolean; practice?: boolean;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const lastSaved = useRef(0);
  const [error, setError] = useState(false);
  const [rate, setRate] = useState("1");
  return <div className={`rounded-2xl border border-hero-line bg-primary-tint ${compact ? "p-3" : "p-4 sm:p-5"}`}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink"><Headphones className="size-4 shrink-0 text-primary" />{title}</p>
      {practice && <label className="flex items-center gap-2 text-xs text-muted">Tốc độ
        <select aria-label="Tốc độ audio" className="rounded-lg border border-line bg-white px-2 py-1 text-ink" value={rate} onChange={e => {setRate(e.target.value); if(audio.current) audio.current.playbackRate=Number(e.target.value);}}>
          {[0.75,0.9,1,1.1,1.25].map(n => <option key={n} value={n}>{n}×</option>)}
        </select>
      </label>}
    </div>
    <audio ref={audio} key={src} src={src} controls preload="metadata" className="block h-11 w-full min-w-0" aria-label={title}
      onError={() => setError(true)} onCanPlay={() => setError(false)}
      onLoadedMetadata={e => {
        const el=e.currentTarget; el.playbackRate=Number(rate);
        try {
          const saved=examStartedAt ? (Date.now()-examStartedAt)/1000 : persistKey ? Number(localStorage.getItem(persistKey)||0) : 0;
          if(saved>0 && Number.isFinite(el.duration)) el.currentTime=Math.min(saved, Math.max(0,el.duration-0.1));
        } catch {}
      }}
      onPlay={() => {
        if(examStartedAt && audio.current) audio.current.currentTime=Math.min((Date.now()-examStartedAt)/1000,audio.current.duration||Infinity);
        onPlay?.();
      }}
      onTimeUpdate={e => {
        if(!persistKey || Date.now()-lastSaved.current<1000) return;
        lastSaved.current=Date.now(); try {localStorage.setItem(persistKey,String(e.currentTarget.currentTime));} catch {}
      }} onEnded={onEnded}>
      Trình duyệt không hỗ trợ audio. <a href={src}>Tải audio</a>
    </audio>
    {error && <p role="alert" className="mt-2 text-sm text-danger">Không tải được audio. <button type="button" className="inline-flex items-center gap-1 font-semibold underline" onClick={() => {setError(false); audio.current?.load();}}><RotateCcw className="size-3" />Thử lại</button></p>}
  </div>;
}
