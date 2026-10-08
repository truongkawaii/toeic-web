"use client";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
const time = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
const waves = new Map<string, number[]>();
const preferences = {rate: '1', repeat: false, automatic: false};
export function DictationPlayer({src, title, previous, next, autoPlay = false, onPlaying, autoNext}: {src: string; title: string; previous?: () => void; next?: () => void; autoPlay?: boolean; onPlaying?: () => void; autoNext?: () => void}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [rate, setRate] = useState(preferences.rate);
  const [repeat, setRepeat] = useState(preferences.repeat);
  const [automatic, setAutomatic] = useState(autoPlay || preferences.automatic);
  const [replays, setReplays] = useState(0);
  const [error, setError] = useState('');
  const [bars, setBars] = useState<number[]>([]);
  useEffect(() => {
    const controller = new AbortController(); let context: AudioContext | undefined;
    async function loadWave() {
      try {
        let values = waves.get(src);
        if (!values) {
          const response = await fetch(src, {signal: controller.signal});
          if (!response.ok) return;
          const bytes = await response.arrayBuffer(); if (controller.signal.aborted) return;
          context = new AudioContext(); const buffer = await context.decodeAudioData(bytes);
          const samples = buffer.getChannelData(0), step = Math.max(1, Math.floor(samples.length / 80));
          values = Array.from({length: 80}, (_, index) => {let sum = 0; let count = 0; for(let i = index * step; i < Math.min(samples.length, (index + 1) * step); i += 32) {sum += samples[i] * samples[i]; count++;} return Math.sqrt(sum / Math.max(count, 1));});
          const maximum = Math.max(...values, .001); values = values.map(v => Math.max(.07, v / maximum));
          if (waves.size > 100) waves.clear(); waves.set(src, values);
        }
        if (!controller.signal.aborted) setBars(values);
      } catch {} finally {if(context && context.state !== 'closed') await context.close();}
    }
    void loadWave(); return () => {controller.abort();};
  }, [src]);
  const play = () => {void audio.current?.play().catch(() => setError('Không phát được audio. Nhấn phát để thử lại.'));};
  const restart = () => {if(audio.current) audio.current.currentTime = 0; setReplays(v => v + 1); play();};
  const seek = (fraction: number) => {if(audio.current && duration) {audio.current.currentTime = Math.max(0, Math.min(duration, fraction * duration)); setPosition(audio.current.currentTime);}};
  return <section className="card p-4 sm:p-5" aria-label="Điều khiển audio nghe chép">
    <audio ref={audio} src={src} preload="metadata" aria-label={title} onLoadedMetadata={e => {setDuration(e.currentTarget.duration); e.currentTarget.playbackRate = Number(rate); if(autoPlay) play();}} onPlay={() => {setPlaying(true); setError(''); onPlaying?.();}} onPause={() => setPlaying(false)} onTimeUpdate={e => setPosition(e.currentTarget.currentTime)} onError={() => setError('Không tải được audio. Vui lòng thử lại.')} onEnded={() => {setPlaying(false); if(repeat) restart(); else if(automatic && autoNext) autoNext();}} />
    <div role="slider" aria-label="Vị trí audio" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(position)} aria-valuetext={`${time(position)} / ${time(duration)}`} tabIndex={0} className="flex h-16 cursor-pointer items-center gap-[3px] rounded-xl bg-canvas px-2 outline-primary" onClick={e => {const bounds = e.currentTarget.getBoundingClientRect(); seek((e.clientX - bounds.left) / bounds.width);}} onKeyDown={e => {if(e.key === 'ArrowRight' || e.key === 'ArrowLeft') {e.preventDefault(); seek((position + (e.key === 'ArrowRight' ? 2 : -2)) / Math.max(duration, 1));} else if(e.key === 'Home' || e.key === 'End') {e.preventDefault(); seek(e.key === 'Home' ? 0 : 1);}}}>
      {bars.length ? bars.map((bar, i) => <span key={i} className={`min-w-0 flex-1 rounded-full ${i / bars.length <= position / Math.max(duration, 1) ? 'bg-primary' : 'bg-slate-300'}`} style={{height: `${Math.max(4, bar * 44)}px`}} />) : <span className="w-full text-center text-xs text-muted">Đang tải sóng âm…</span>}
    </div>
    <div className="mt-2 flex justify-between text-xs tabular-nums text-muted"><span>{title}</span><span>{time(position)} / {time(duration)}</span></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <button className="btn btn-outline btn-sm" onClick={restart}><RotateCcw className="size-4" />Phát lại <span className="text-xs text-muted">{replays}</span></button>
      <div className="flex items-center gap-2"><button className="btn btn-outline p-2" aria-label="Audio câu trước" disabled={!previous} onClick={previous}><ChevronLeft className="size-4" /></button><button className="grid size-14 place-items-center rounded-full bg-primary text-white shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" aria-label={playing ? 'Tạm dừng' : 'Phát audio'} onClick={() => playing ? audio.current?.pause() : play()}>{playing ? <Pause className="size-5" /> : <Play className="size-5" />}</button><button className="btn btn-outline p-2" aria-label="Audio câu tiếp" disabled={!next} onClick={next}><ChevronRight className="size-4" /></button></div>
      <div className="flex items-center gap-2"><select className="rounded-lg border border-line bg-white px-2 py-2 text-sm" aria-label="Tốc độ audio" value={rate} onChange={e => {setRate(e.target.value); preferences.rate = e.target.value; if(audio.current) audio.current.playbackRate = Number(e.target.value);}}>{['0.75','0.9','1','1.1','1.25','1.5'].map(value => <option key={value} value={value}>{value}x</option>)}</select><button className={`btn btn-sm ${repeat ? 'btn-primary' : 'btn-outline'}`} aria-pressed={repeat} onClick={() => {preferences.repeat = !repeat; preferences.automatic = false; setRepeat(!repeat); setAutomatic(false);}}>Tự lặp</button><button className={`btn btn-sm ${automatic ? 'btn-primary' : 'btn-outline'}`} aria-pressed={automatic} onClick={() => {preferences.automatic = !automatic; preferences.repeat = false; setAutomatic(!automatic); setRepeat(false);}}>Tự phát</button></div>
    </div>
    {error && <div role="alert" className="mt-3 flex items-center justify-between gap-2 text-sm text-danger">{error}<button className="btn btn-outline btn-sm" onClick={() => {audio.current?.load(); setError('');}}>Thử lại</button></div>}
  </section>;
}
