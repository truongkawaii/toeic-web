"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";
import type { SpeakingVideo } from "@/lib/speaking";
import { SpeakingThumbnail } from "./speaking-thumbnail";

type Player = {
  playVideo: () => void; pauseVideo: () => void; seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number; getPlayerState: () => number; setPlaybackRate: (rate: number) => void;
  getAvailablePlaybackRates: () => number[]; destroy: () => void;
};
type YouTube = {Player: new (element: HTMLElement, options: {
  videoId: string; host: string; width: string; height: string; playerVars: Record<string, string | number>;
  events: {onReady: (event: {target: Player}) => void; onError: (event: {data: number}) => void};
}) => Player};
declare global {interface Window {YT?: YouTube; onYouTubeIframeAPIReady?: () => void;}}
let apiPromise: Promise<YouTube> | undefined;
function loadAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTube>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => reject(new Error("Không kết nối được trình phát YouTube.")), 15000);
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout);
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => {clearTimeout(timeout); reject(new Error("Không tải được trình phát YouTube."));};
    document.head.appendChild(script);
  }).catch(error => {apiPromise = undefined; throw error;});
  return apiPromise;
}

export type PlaybackRequest = {serial: number; start: number; end: number; repeats: number; rate: number; pause?: boolean};

export function SpeakingPlayer({video, request, onReady}: {video: SpeakingVideo; request: PlaybackRequest | null; onReady: (ready: boolean) => void}) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<Player | null>(null);
  const loop = useRef<{request: PlaybackRequest; remaining: number; waitingForSeek: boolean} | null>(null);
  const [started, setStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const readyCallback = useRef(onReady);
  useEffect(() => {readyCallback.current = onReady;}, [onReady]);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    let instance: Player | undefined;
    const container = host.current;
    const element = document.createElement("div");
    container?.appendChild(element);
    const timeout = window.setTimeout(() => {if (!cancelled) setError("Trình phát tải quá lâu. Anh có thể mở video trực tiếp trên YouTube.");}, 20000);
    loadAPI().then(api => {
      if (cancelled) return;
      instance = new api.Player(element, {
        videoId: video.videoId, host: "https://www.youtube-nocookie.com", width: "100%", height: "100%",
        playerVars: {playsinline: 1, rel: 0, origin: window.location.origin, cc_lang_pref: "en"},
        events: {
          onReady: event => {
            if (cancelled) return;
            clearTimeout(timeout);
            player.current = event.target;
            setError(""); setReady(true); readyCallback.current(true);
          },
          onError: event => {
            if (cancelled) return;
            clearTimeout(timeout);
            setError(`YouTube chưa phát được video này (mã ${event.data}). Hãy mở nguồn bên dưới hoặc chọn video khác.`);
            setReady(false); readyCallback.current(false);
          },
        },
      });
    }).catch(cause => {if (!cancelled) {clearTimeout(timeout); setError(cause instanceof Error ? cause.message : "Không kết nối được YouTube.");}});
    const interval = window.setInterval(() => {
      const current = player.current;
      const active = loop.current;
      if (!current || !active) return;
      const time = current.getCurrentTime();
      const state = current.getPlayerState();
      if (state !== 1 && state !== 0) return;
      if (active.waitingForSeek) {
        if (Math.abs(time - active.request.start) > 2) return;
        active.waitingForSeek = false;
      }
      if (time >= active.request.end - 0.05 || (state === 0 && time >= active.request.end - 1 && time > active.request.start)) {
        if (active.remaining > 1) {
          active.remaining -= 1;
          active.waitingForSeek = true;
          current.seekTo(active.request.start, true); current.playVideo();
          setStatus(`Còn ${active.remaining} lượt nghe đoạn này.`);
        } else {
          current.pauseVideo(); loop.current = null;
          setStatus("Đã nghe xong đoạn. Bây giờ nói lại hoặc thu âm để tự so sánh.");
        }
      }
    }, 100);
    return () => {
      cancelled = true; clearTimeout(timeout); clearInterval(interval);
      loop.current = null; player.current = null; instance?.destroy(); element.remove();
      readyCallback.current(false);
    };
  }, [started, video.videoId]);

  useEffect(() => {
    const current = player.current;
    if (!ready || !current || !request) return;
    if (request.pause) {current.pauseVideo(); loop.current = null; return;}
    const rates = current.getAvailablePlaybackRates();
    const rate = rates.includes(request.rate) ? request.rate : 1;
    current.setPlaybackRate(rate);
    loop.current = {request, remaining: request.repeats, waitingForSeek: true};
    current.seekTo(request.start, true); current.playVideo();
    const notice = rate !== request.rate ? "Video này dùng tốc độ 1× vì không hỗ trợ tốc độ đã chọn. " : "";
    const timeout = window.setTimeout(() => setStatus(`${notice}Nghe ${request.repeats} lượt, sau đó luyện lại bằng giọng của em.`), 0);
    return () => clearTimeout(timeout);
  }, [request, ready]);

  return <div className="space-y-3">
    <div className="relative aspect-video min-h-[210px] overflow-hidden rounded-2xl bg-slate-900">
      {started ? <div ref={host} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" /> :
        <button className="group flex size-full flex-col items-center justify-center gap-4 p-6 text-white" onClick={() => setStarted(true)}>
          <SpeakingThumbnail video={video} />
          <span aria-hidden="true" className="absolute inset-0 bg-black/30 transition group-hover:bg-black/40" />
          <span className="relative grid size-16 place-items-center rounded-full bg-primary shadow-lg transition group-hover:scale-105"><Play className="ml-1 size-7 fill-current" /></span>
          <span className="relative text-center text-lg font-semibold">Mở video · {video.source}</span>
          <span className="relative text-sm text-white/85">Video phát trực tiếp từ YouTube</span>
        </button>}
    </div>
    {started && !ready && !error && <p role="status" className="text-sm text-muted">Đang kết nối trình phát YouTube…</p>}
    {error && <p role="alert" className="rounded-xl bg-warning-soft p-3 text-sm text-warning-ink">{error}</p>}
    {status && <p aria-live="polite" className="text-sm text-muted">{status}</p>}
    <a className="inline-flex items-center gap-2 text-sm text-primary" href={video.sourceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /> Mở nguồn trên YouTube</a>
  </div>;
}
