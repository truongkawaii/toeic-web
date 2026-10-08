"use client";

import { Link2, Mic, Play, Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/learning/page-hero";
import { EmptyState } from "@/components/ui/primitives";
import { ChipGroup, SegTabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { MEDIA_CATEGORIES, MEDIA_LESSONS } from "@/lib/mock/fixtures";
import { useQueryParam } from "@/lib/use-query-param";
import type { Accent, MediaCategory, MediaLesson } from "@/types/domain";

const ACCENTS = [
  { id: "uk", label: "Anh – Anh" },
  { id: "us", label: "Anh – Mỹ" },
] as const;

const isYoutube = (q: string) => /(youtube\.com|youtu\.be)\//i.test(q);

export function SpeakingView() {
  const [cat, setCat] = useQueryParam<MediaCategory>("cat", "pronunciation", MEDIA_CATEGORIES.map((c) => c.id));
  const [accent, setAccent] = useQueryParam<Accent>("accent", "uk", ["uk", "us"]);
  const [q, setQ] = useState("");
  const { toast } = useToast();

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return MEDIA_LESSONS.filter(
      (m) => m.category === cat && m.accent === accent && (!term || isYoutube(term) || `${m.title} ${m.subtitle}`.toLowerCase().includes(term)),
    );
  }, [cat, accent, q]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isYoutube(q)) {
      toast("Chưa hỗ trợ nhập video từ link", {
        tone: "warning",
        description: "Bản demo chỉ mở các video đã có sẵn trong thư viện. Tính năng tách transcript tự động sẽ có ở bản sau.",
      });
    }
  };

  return (
    <div className="container-app space-y-7">
      <PageHero
        eyebrow="Luyện nói tiếng Anh"
        title={["Nói tự nhiên", "như người bản xứ", "từ từng câu ngắn"]}
        description="Shadowing theo video: nghe từng câu, nói theo, nhận phản hồi từng từ."
        icon={Mic}
      />
      <SegTabs label="Chủ đề video" items={MEDIA_CATEGORIES} value={cat} onChange={(v) => setCat(v)} />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <ChipGroup label="Giọng" items={ACCENTS} value={accent} onChange={(v) => setAccent(v)} />
        <form role="search" onSubmit={onSubmit} className="relative w-full md:max-w-sm">
          {isYoutube(q) ? (
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-primary" />
          ) : (
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
          )}
          <label htmlFor="media-search" className="sr-only">Tìm video hoặc dán link YouTube</label>
          <input
            id="media-search"
            type="search"
            className="input rounded-2xl pl-11"
            placeholder="Tìm video… hoặc dán link YouTube"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </form>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Không tìm thấy video phù hợp"
          description={q ? `Không có video nào khớp “${q}”. Thử từ khoá khác hoặc đổi giọng.` : "Chủ đề này chưa có video cho giọng đã chọn. Thử giọng còn lại nhé."}
          action={
            <button type="button" className="btn btn-outline" onClick={() => { setQ(""); setAccent(accent === "uk" ? "us" : "uk"); }}>
              Đổi sang {accent === "uk" ? "Anh – Mỹ" : "Anh – Anh"}
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((m, i) => <MediaCard key={m.id} media={m} delay={i * 30} />)}
        </div>
      )}
    </div>
  );
}

/** Thumbnail vẽ bằng CSS — không dùng ảnh bên thứ ba. Thay bằng asset thật khi có nguồn video. */
function MediaThumb({ media }: { media: MediaLesson }) {
  const isVowel = !!media.ipa;
  return (
    <div className={`relative aspect-video overflow-hidden bg-gradient-to-br ${media.tone}`}>
      <div aria-hidden className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_80%_20%,rgb(255_255_255/0.5),transparent_45%)]" />
      <div aria-hidden className="absolute -bottom-10 -right-6 size-40 rounded-full border-[14px] border-white/10" />
      <div className="relative flex h-full flex-col justify-between p-4 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">{isVowel ? "Pronunciation tips" : media.category}</p>
        {isVowel ? (
          <div className="flex items-end justify-between gap-2">
            <span className="rounded-xl bg-white px-3 py-1.5 font-serif text-[28px] font-semibold leading-none text-[#0f766e] shadow-lg">{media.ipa}</span>
            <span className="text-right text-lg font-bold leading-tight drop-shadow">{media.words.slice(0, 2).join("  ")}</span>
          </div>
        ) : (
          <p className="line-clamp-2 text-xl font-bold leading-tight drop-shadow">{media.title}</p>
        )}
      </div>
      <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/75 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-white">{media.duration}</span>
      <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition duration-300 group-hover:bg-black/20 group-hover:opacity-100">
        <span className="grid size-14 place-items-center rounded-full bg-white/95 text-primary shadow-xl">
          <Play className="ml-1 size-6 fill-current" />
        </span>
      </span>
    </div>
  );
}

function MediaCard({ media, delay }: { media: MediaLesson; delay: number }) {
  const { comingSoon } = useToast();
  return (
    <button
      type="button"
      onClick={() => comingSoon(`Shadowing “${media.title}”`)}
      className="card card-hover focus-ring group flex animate-fade-up cursor-pointer flex-col overflow-hidden text-left"
      style={{ animationDelay: `${delay}ms` }}
    >
      <MediaThumb media={media} />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug text-ink">{media.title}</h3>
        <p className="mt-1 line-clamp-1 text-sm text-muted">{media.subtitle}</p>
        <p className="mt-auto pt-3 text-sm text-muted">
          <b className="font-semibold text-ink-soft">{media.sentences} câu</b> · {media.source}
        </p>
      </div>
    </button>
  );
}
