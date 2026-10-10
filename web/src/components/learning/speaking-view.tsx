"use client";

import { ArrowLeft, ArrowRight, BookOpen, Check, ExternalLink, Mic, Pause, Play, Search, SearchX, Star } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/learning/page-hero";
import { EmptyState } from "@/components/ui/primitives";
import { ChipGroup, SegTabs } from "@/components/ui/tabs";
import { useQueryParam } from "@/lib/use-query-param";
import { useSpeakingProgress } from "@/lib/use-speaking-progress";
import { SPEAKING_ACCENTS, SPEAKING_CATEGORIES, SPEAKING_VIDEOS, filterSpeakingVideos, formatVideoTime, isVideoPracticed, practiceSegments, youtubeVideoId, type SpeakingEntry, type SpeakingVideo } from "@/lib/speaking";
import type { MediaCategory } from "@/types/domain";
import { SpeakingPlayer, type PlaybackRequest } from "./speaking-player";
import { SpeakingRecorder } from "./speaking-recorder";
import { SpeakingThumbnail } from "./speaking-thumbnail";

const MODES = [{id: "shadow", label: "Shadowing"}, {id: "dictation", label: "Nghe chép"}, {id: "watch", label: "Chỉ xem"}] as const;

export function SpeakingView() {
  const [category, setCategory] = useQueryParam<MediaCategory>("cat", "pronunciation", SPEAKING_CATEGORIES.map(item => item.id));
  const [level, setLevel] = useQueryParam("level", "all", ["all", "A2", "B1", "B2"]);
  const [duration, setDuration] = useQueryParam<string>("duration", "15", ["5", "10", "15"]);
  const [videoId, setVideoId] = useQueryParam<string>("video", "");
  const [query, setQuery] = useState("");
  const {data, update, persistent} = useSpeakingProgress();
  const videos = filterSpeakingVideos({category, level, maxMinutes: Number(duration), accent: "all", collection: "all", status: "all", query}, data);
  const current = SPEAKING_VIDEOS.find(video => video.id === videoId && video.category === category);
  const open = (video: SpeakingVideo) => setVideoId(video.id, {cat: video.category});
  const descriptor = SPEAKING_CATEGORIES.find(item => item.id === category)!;
  const youtubeQuery = youtubeVideoId(query);

  return <div className="container-app space-y-6 pb-10">
    <PageHero eyebrow="Luyện nói tiếng Anh" title={["Nghe rõ", "nói từng đoạn", "với video theo chủ đề"]}
      description={`${SPEAKING_VIDEOS.length} video đã chọn theo mục tiêu luyện nói. Chọn thời lượng phù hợp, nghe lại đoạn ngắn và thu âm để tự so sánh.`} icon={Mic} />
    <SegTabs label="Chủ đề video" items={SPEAKING_CATEGORIES} value={category}
      onChange={value => {setCategory(value, {list: null, accent: null, video: null}); setQuery("");}} />
    {!persistent && <p role="alert" className="rounded-xl bg-warning-soft p-4 text-sm text-warning-ink">Trình duyệt chưa lưu được bài luyện. Nội dung vẫn còn trong phiên này; sao chép bài nghe chép và ghi chú trước khi đóng trang.</p>}
    {videoId ? current ? <VideoPractice key={current.id} video={current} entry={data.entries[current.id] ?? {}} update={patch => update(current.id, patch)}
      back={() => setVideoId("")} siblings={SPEAKING_VIDEOS.filter(video => video.collection === current.collection)} open={open} /> :
      <EmptyState icon={SearchX} title="Không tìm thấy video trong nhóm này" description="Chọn một video từ thư viện để bắt đầu luyện." action={<button className="btn btn-primary" onClick={() => setVideoId("")}>Về danh sách</button>} /> : <>
      <div className="flex flex-wrap items-center gap-3">
        <ChipGroup label="Trình độ video" value={level} onChange={value => setLevel(value, {accent: null, list: null, status: null})}
          items={[{id: "all", label: "Mọi trình độ"}, {id: "A2", label: "A2"}, {id: "B1", label: "B1"}, {id: "B2", label: "B2"}]} />
        <label className="flex items-center gap-2 text-sm text-muted">Thời lượng<select className="input w-36 rounded-2xl" value={duration} onChange={event => setDuration(event.target.value)}>
          <option value="5">Dưới 5 phút</option><option value="10">Dưới 10 phút</option><option value="15">Dưới 15 phút</option>
        </select></label>
        <label className="relative w-full sm:ml-auto sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" /><span className="sr-only">Tìm video trong thư viện</span>
          <input className="input rounded-2xl pl-10" type="search" placeholder="Tìm video… hoặc dán link YouTube" value={query} onChange={event => setQuery(event.target.value)} /></label>
      </div>
      <p className="text-sm text-muted">{descriptor.label} · {videos.length} video · dưới {duration} phút</p>
      {videos.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{videos.map(video => <VideoCard key={video.id} video={video} entry={data.entries[video.id]} open={() => open(video)} bookmark={() => update(video.id, {bookmarked: !data.entries[video.id]?.bookmarked})} />)}</div> :
        <EmptyState icon={SearchX} title="Chưa có video phù hợp" description={youtubeQuery ? "Link này chưa có trong nhóm đang chọn. Thư viện chỉ nhận video đã kiểm tra thời lượng; chưa tự nhập video mới." : "Thử tìm từ khóa khác, chọn mọi trình độ hoặc đổi chủ đề."}
          action={<button className="btn btn-outline" onClick={() => {setQuery(""); setLevel("all", {list: null, status: null, accent: null, duration: null});}}>Xóa bộ lọc</button>} />}
      <p className="text-sm text-muted">Danh sách biên tập từ nguồn YouTube. Mức A2–B2 là gợi ý luyện tập; dấu tự luyện do em đánh dấu sau khi luyện.</p>
    </>}
  </div>;
}

function VideoCard({video, entry, open, bookmark}: {video: SpeakingVideo; entry?: SpeakingEntry; open: () => void; bookmark: () => void}) {
  return <article className="card card-hover group flex flex-col overflow-hidden">
    <button className="relative aspect-video overflow-hidden bg-slate-900 text-white" onClick={open} aria-label={`Luyện ${video.title}`}>
      <SpeakingThumbnail video={video} />
      <span aria-hidden="true" className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/15 group-hover:opacity-100 group-focus-within:opacity-100"><span className="grid size-12 place-items-center rounded-full bg-white/95 text-primary shadow-lg"><Play className="ml-1 size-5 fill-current" /></span></span>
      <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-xs font-semibold tabular-nums">{formatVideoTime(video.durationSeconds)}</span>
    </button>
    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-2"><h3 className="line-clamp-3 font-semibold leading-snug">{video.title}</h3><button className="icon-btn shrink-0" onClick={bookmark} aria-pressed={!!entry?.bookmarked} aria-label={`${entry?.bookmarked ? "Bỏ lưu" : "Lưu"} ${video.title}`}><Star className={`size-4 ${entry?.bookmarked ? "fill-warning text-warning" : ""}`} /></button></div>
      <p className="line-clamp-2 text-sm text-muted">{video.goal}</p>
      <p className="text-xs text-muted">{video.level} · {SPEAKING_ACCENTS.find(item => item.id === video.accent)?.label} · {practiceSegments(video.durationSeconds).length} đoạn luyện</p>
      <div className="mt-auto flex items-center justify-between gap-2"><button className="btn btn-primary btn-sm" onClick={open}>Luyện nói</button><a className="text-xs text-primary" href={video.sourceUrl} target="_blank" rel="noopener noreferrer">Nguồn <ExternalLink className="inline size-3" /></a></div>
      {isVideoPracticed(video, entry) && <p className="text-xs text-success">✓ Đã tự luyện mọi đoạn</p>}
    </div>
  </article>;
}

function VideoPractice({video, entry, update, back, siblings, open}: {video: SpeakingVideo; entry: SpeakingEntry; update: (patch: Partial<SpeakingEntry>) => void; back: () => void; siblings: SpeakingVideo[]; open: (video: SpeakingVideo) => void}) {
  const [mode, setMode] = useState<'shadow' | 'dictation' | 'watch'>("shadow");
  const segments = practiceSegments(video.durationSeconds);
  const [index, setIndex] = useState(0);
  const segment = segments[index];
  const [start, setStart] = useState(segment.start);
  const [end, setEnd] = useState(segment.end);
  const [rate, setRate] = useState(1);
  const [repeats, setRepeats] = useState(1);
  const [ready, setReady] = useState(false);
  const [request, setRequest] = useState<PlaybackRequest | null>(null);
  const issue = (settings: Omit<PlaybackRequest, 'serial'>) => setRequest(previous => ({...settings, serial: (previous?.serial ?? 0) + 1}));
  const pause = () => issue({start, end, repeats: 1, rate, pause: true});
  const select = (next: number) => {pause(); setIndex(next); setStart(segments[next].start); setEnd(segments[next].end);};
  const played = entry.practiced?.includes(segment.id) ?? false;
  const ordinal = siblings.findIndex(item => item.id === video.id);
  const validRange = Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end <= video.durationSeconds && end > start;

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><button className="btn btn-ghost btn-sm" onClick={back}><ArrowLeft className="size-4" /> Danh sách video</button>
      <p className="text-sm text-muted">{video.collection} · {ordinal + 1}/{siblings.length}</p></div>
    <div><h2 className="text-xl font-semibold leading-snug">{video.title}</h2><p className="mt-2 text-sm text-muted">{video.source} · {formatVideoTime(video.durationSeconds)} · {video.level}</p></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><SegTabs label="Chế độ luyện video" items={MODES} value={mode} onChange={next => {pause(); setMode(next);}} />
      <button className="btn btn-outline btn-sm" aria-pressed={!!entry.bookmarked} onClick={() => update({bookmarked: !entry.bookmarked})}><Star className={`size-4 ${entry.bookmarked ? 'fill-warning text-warning' : ''}`} />{entry.bookmarked ? 'Đã lưu' : 'Lưu video'}</button></div>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        <SpeakingPlayer video={video} request={request} onReady={setReady} />
        <div className="card space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">Tốc độ<select className="input w-24" value={rate} onChange={event => setRate(Number(event.target.value))}>{[0.5, 0.75, 1, 1.25].map(value => <option key={value} value={value}>{value}×</option>)}</select></label>
            {mode !== 'watch' && <label className="flex items-center gap-2 text-sm">Nghe lặp<select className="input w-24" value={repeats} onChange={event => setRepeats(Number(event.target.value))}>{[1, 2, 3, 5].map(value => <option key={value} value={value}>{value} lượt</option>)}</select></label>}
            <button disabled={!ready} className="btn btn-outline btn-sm" onClick={() => issue({start: 0, end: video.durationSeconds, repeats: 1, rate})}><Play className="size-4" /> Xem cả video</button>
            <button disabled={!ready} className="btn btn-ghost btn-sm" onClick={pause}><Pause className="size-4" /> Dừng</button>
          </div>
          <p className="text-sm text-muted">Bật CC trong trình phát nếu video có phụ đề. Khi nghe chép, có thể tắt CC để nghe trước rồi bật lại để tự đối chiếu.</p>
        </div>
        {mode !== 'watch' && <div className="card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Đoạn luyện {index + 1}/{segments.length}</h3><span className="text-sm tabular-nums text-muted">{formatVideoTime(segment.start)}–{formatVideoTime(segment.end)}</span></div>
          <p className="text-sm text-ink-soft">{video.goal}</p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">Bắt đầu (giây)<input className="input mt-1 w-28" type="number" min={0} max={video.durationSeconds - 1} step="0.5" value={Number.isNaN(start) ? '' : start} onChange={event => setStart(event.target.valueAsNumber)} /></label>
            <label className="text-sm">Kết thúc (giây)<input className="input mt-1 w-28" type="number" min={1} max={video.durationSeconds} step="0.5" value={Number.isNaN(end) ? '' : end} onChange={event => setEnd(event.target.valueAsNumber)} /></label>
            <button className="btn btn-primary" disabled={!ready || !validRange} onClick={() => issue({start, end, repeats, rate})}><Play className="size-4" /> Nghe đoạn này</button>
          </div>
          {!validRange && <p role="alert" className="text-sm text-warning-ink">Chọn khoảng thời gian hợp lệ trong video; điểm kết thúc phải sau điểm bắt đầu.</p>}
          <p className="text-xs text-muted">Các đoạn chia theo thời gian, có thể cắt giữa câu. Điều chỉnh hai mốc để nghe trọn câu muốn luyện.</p>
          {mode === 'dictation' ? <label className="block text-sm font-medium">Bài nghe chép của em<textarea className="input mt-2 min-h-40 w-full resize-y font-normal leading-relaxed" placeholder="Nghe rồi ghi lại điều em nghe được. Bật CC của nguồn để tự đối chiếu nếu có." value={entry.drafts?.[segment.id] ?? ''} onChange={event => update({drafts: {...entry.drafts, [segment.id]: event.target.value}})} /></label> :
            <SpeakingRecorder key={segment.id} name={`speaking-${video.id}-${index + 1}`} onStart={pause} />}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={played} onChange={event => update({practiced: event.target.checked ? [...(entry.practiced ?? []), segment.id] : entry.practiced?.filter(id => id !== segment.id) ?? []})} /> Tôi đã luyện và tự đối chiếu đoạn này</label>
          <div className="flex justify-between gap-3"><button className="btn btn-outline btn-sm" disabled={index === 0} onClick={() => select(index - 1)}><ArrowLeft className="size-4" /> Đoạn trước</button><button className="btn btn-outline btn-sm" disabled={index === segments.length - 1} onClick={() => select(index + 1)}>Đoạn sau <ArrowRight className="size-4" /></button></div>
        </div>}
        <div className="card space-y-3 p-5"><h3 className="flex items-center gap-2 font-semibold"><BookOpen className="size-5 text-primary" /> Áp dụng sau khi xem</h3><p className="text-sm leading-relaxed">{video.practicePrompt}</p>
          <label className="block text-sm font-medium">Ghi chú hoặc câu tự nói<textarea className="input mt-2 min-h-28 w-full resize-y font-normal" value={entry.note ?? ''} onChange={event => update({note: event.target.value})} placeholder="Ghi cụm cần luyện, chỗ ngắt câu hoặc ý để nói lại…" /></label>
          <p className="text-xs text-muted">Tự kiểm: câu rõ nghĩa · trọng âm dễ nghe · giữ âm cuối · ý đúng với nhiệm vụ.</p></div>
      </div>
      <aside className="card overflow-hidden lg:sticky lg:top-24">
        <div className="border-b border-line p-4"><h3 className="font-semibold">Danh sách đoạn luyện</h3><p className="mt-1 text-xs text-muted">Đã tự luyện {entry.practiced?.length ?? 0}/{segments.length} đoạn · không phải danh sách phụ đề</p></div>
        <div className="max-h-[560px] overflow-y-auto">{segments.map((item, position) => <button key={item.id} className={`flex w-full items-center gap-3 border-b border-line-soft px-4 py-3 text-left text-sm ${position === index ? 'bg-hero text-primary' : 'hover:bg-canvas'}`} aria-current={position === index ? 'true' : undefined} onClick={() => select(position)}>
          <span className={`grid size-7 shrink-0 place-items-center rounded-full ${entry.practiced?.includes(item.id) ? 'bg-success-soft text-success' : 'bg-canvas'}`}>{entry.practiced?.includes(item.id) ? <Check className="size-4" /> : position + 1}</span>
          <span>Đoạn {position + 1}<span className="mt-0.5 block text-xs tabular-nums text-muted">{formatVideoTime(item.start)}–{formatVideoTime(item.end)}</span></span>
        </button>)}</div>
        <div className="space-y-3 p-4"><p className="text-xs font-semibold text-muted">VIDEO TRONG DANH SÁCH NÀY</p>{siblings.map(item => <button key={item.id} className={`block w-full text-left text-sm leading-snug ${item.id === video.id ? 'font-semibold text-primary' : 'text-ink-soft hover:text-primary'}`} onClick={() => open(item)}>{item.title}<span className="mt-1 block text-xs text-muted">{formatVideoTime(item.durationSeconds)}</span></button>)}</div>
      </aside>
    </div>
  </section>;
}
