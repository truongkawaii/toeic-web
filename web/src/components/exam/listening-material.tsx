"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AudioPlayer } from "@/components/learning/audio-player";
import type { EtsGroup } from "@/types/domain";

export function ListeningMaterial({ group, reveal = false, play = true, testId, persistKey, onPlay, practice = true }: { group: EtsGroup; reveal?: boolean; play?: boolean; testId?: string; persistKey?: string; onPlay?: () => void; practice?: boolean }) {
  const item=group.listening;
  if(!item) return null;
  return <div className="space-y-4 p-4 sm:p-6">
    <p className="text-xs font-bold uppercase tracking-wider text-primary">{group.from===group.to ? `Question ${group.from}` : `Questions ${group.from}–${group.to}`}</p>
    {play && !item.audio && <p className="rounded-xl bg-warning-soft p-3 text-sm text-warning-ink">Audio nhóm câu này chưa có trong dữ liệu nguồn.</p>}
    {play && !!item.audio && <AudioPlayer src={item.audio} title={group.part<=2 ? `Audio câu ${group.from}` : `Audio câu ${group.from}–${group.to}`} persistKey={persistKey} onPlay={onPlay} practice={practice} />}
    {item.image && <Image src={item.image} alt={`Photograph for question ${group.from}`} width={900} height={600} unoptimized className="max-h-[480px] w-full rounded-xl border border-line object-contain" />}
    {item.imagePending && <div className="grid min-h-52 place-content-center gap-3 rounded-xl border border-dashed border-line bg-canvas p-5 text-center">
      <ImageOff className="mx-auto size-8 text-muted" /><p className="font-semibold text-ink">Ảnh câu {group.from} đang được bổ sung</p>
      <p className="max-w-xs text-sm leading-relaxed text-muted">Audio đã sẵn sàng. Câu mô tả tranh này cần có ảnh để làm bài đầy đủ.</p>
    </div>}
    {item.graphic && <div className="overflow-hidden rounded-xl border border-line bg-white">
      <h3 className="border-b border-line bg-canvas px-4 py-3 font-semibold text-ink">{item.graphic.title}</h3>
      <div className="overflow-x-auto"><table className="w-full text-left text-[15px]" aria-label={item.graphic.title}>
        <thead><tr>{item.graphic.headers.map(h=><th key={h} className="border-b border-line bg-primary-tint px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{item.graphic.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j} className="border-b border-line-soft px-4 py-3">{cell}</td>)}</tr>)}</tbody>
      </table></div>
    </div>}
    {reveal && <section className="rounded-xl border border-line bg-white p-4">
      <h3 className="mb-3 font-semibold text-ink">Transcript</h3>
      <div className="space-y-2 text-[16px] leading-7 text-ink-soft">{item.transcript.split("\n").map((line,i)=>{
        const match=line.match(/^([A-Z]+):\s*(.*)$/);
        return <p key={i}>{match ? <><span className="font-semibold text-primary">{item.speakers[match[1]] || match[1]}: </span>{match[2]}</> : line}</p>;
      })}</div>
      {testId && <Link href={`/listening/${testId}/dictation?part=${group.part}`} className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Luyện nghe chép từng câu →</Link>}
    </section>}
  </div>;
}
