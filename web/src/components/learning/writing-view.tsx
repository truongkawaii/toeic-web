"use client";

import { ImageIcon, Mail, PenTool, Reply } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import { PageHero } from "@/components/learning/page-hero";
import { ChipGroup, SegTabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { EMAIL_PROMPTS, PICTURE_PROMPTS, PICTURE_STRUCTURES } from "@/lib/mock/fixtures";
import { useQueryParam } from "@/lib/use-query-param";
import type { EmailPrompt, PicturePrompt } from "@/types/domain";

const PARTS = [
  { id: "picture", label: "Part 1 · Picture", icon: ImageIcon },
  { id: "email", label: "Part 2 · Email", icon: Mail },
] as const;

const STRUCT_CHIPS = [
  { id: "all", label: "All", count: PICTURE_STRUCTURES.reduce((s, x) => s + x.count, 0) },
  ...PICTURE_STRUCTURES,
];

export function WritingView() {
  const [part, setPart] = useQueryParam<"picture" | "email">("part", "picture", ["picture", "email"]);

  return (
    <div className="container-app space-y-7">
      <PageHero
        eyebrow="Luyện viết TOEIC"
        title={["Rèn luyện", "TOEIC Writing", "từ câu đến bài luận"]}
        description="Luyện viết dịch Việt–Anh, tạo thẻ từ vựng nhanh và bài mẫu đa dạng."
        icon={PenTool}
      />
      <SegTabs label="Dạng bài viết" items={PARTS} value={part} onChange={(v) => setPart(v, { s: null })} />
      {part === "picture" ? <PictureSection /> : <EmailSection />}
    </div>
  );
}

function PictureSection() {
  const [s, setS] = useQueryParam("s", "all", STRUCT_CHIPS.map((c) => c.id));
  const list = useMemo(() => PICTURE_PROMPTS.filter((p) => s === "all" || p.structure === s), [s]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <ChipGroup
          label="Cấu trúc câu"
          items={STRUCT_CHIPS.map((c) => ({ ...c, label: c.label }))}
          value={s}
          onChange={(v) => setS(v)}
        />
      </div>
      {list.length === 0 ? (
        <div className="card px-6 py-12 text-center text-muted">
          Bản demo chưa có ảnh cho cấu trúc này — chọn “All” để xem các đề mẫu.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {list.map((p, i) => <PictureCard key={p.id} prompt={p} delay={i * 30} />)}
        </div>
      )}
    </div>
  );
}

function PictureCard({ prompt, delay }: { prompt: PicturePrompt; delay: number }) {
  const { comingSoon } = useToast();
  return (
    <article className="card card-hover group flex animate-fade-up flex-col overflow-hidden p-3" style={{ animationDelay: `${delay}ms` }}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-canvas">
        {prompt.image ? (
          <Image
            src={prompt.image}
            alt={`Ảnh đề bài: ${prompt.scene}`}
            fill
            sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          // Placeholder đồng nhất — thay bằng ảnh thật trong public/demo/writing
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(135deg,#eef3fb,#e3ebf8)] text-[#9aabc4]">
            <ImageIcon className="size-10" strokeWidth={1.4} />
            <span className="text-sm font-medium">{prompt.scene}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-1 pb-1 pt-3">
        {prompt.words.map((w) => (
          <span key={w} className="rounded-lg border border-line bg-canvas px-2.5 py-1 font-mono text-[13px] text-ink-soft">{w}</span>
        ))}
        <button type="button" className="btn btn-primary btn-sm ml-auto" onClick={() => comingSoon("Bài viết Picture")}>
          Học
        </button>
      </div>
    </article>
  );
}

function EmailSection() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {EMAIL_PROMPTS.map((m, i) => <EmailCard key={m.id} mail={m} delay={i * 40} />)}
    </div>
  );
}

function EmailCard({ mail, delay }: { mail: EmailPrompt; delay: number }) {
  const { comingSoon } = useToast();
  return (
    <article className="card card-hover flex animate-fade-up flex-col p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-tint text-primary">
          <Mail className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] text-muted">{mail.from}</p>
          <h3 className="truncate font-semibold text-ink">{mail.subject}</h3>
        </div>
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{mail.summary}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {mail.tasks.map((t) => (
          <li key={t} className="badge border border-line bg-canvas font-medium text-ink-soft">{t}</li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-sm text-muted">10 phút · ≥ 50 từ</span>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => comingSoon("Viết email")}>
          <Reply className="size-4" /> Trả lời
        </button>
      </div>
    </article>
  );
}
