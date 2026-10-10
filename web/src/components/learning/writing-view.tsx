"use client";

import { BookOpen, FileText, ImageIcon, Mail, PenTool, Star } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/learning/page-hero";
import { ChipGroup, SegTabs } from "@/components/ui/tabs";
import { useQueryParam } from "@/lib/use-query-param";
import { useWritingProgress } from "@/lib/use-writing-progress";
import { WRITING_CATEGORIES, WRITING_LESSONS, WRITING_TOPICS, type WritingEntry, type WritingLesson, type WritingPart } from "@/lib/writing";
import { WritingPractice } from "./writing-practice";

const PARTS = [
  {id: "picture", label: "Part 1 · Picture", icon: ImageIcon},
  {id: "email", label: "Part 2 · Email", icon: Mail},
  {id: "essay", label: "Part 3 · Essay", icon: FileText},
] as const;
export const WRITING_DIFFICULTY: Record<string, string> = {CB: "Cơ bản", TB: "Trung bình", NC: "Nâng cao"};

export function WritingView() {
  const [part, setPart] = useQueryParam<WritingPart>("part", "picture", ["picture", "email", "essay"]);
  const [category, setCategory] = useQueryParam("s", "all", ["all", ...WRITING_CATEGORIES[part]]);
  const [topic, setTopic] = useQueryParam("topic", "all", ["all", ...WRITING_TOPICS]);
  const [level, setLevel] = useQueryParam<string>("level", "all", ["all", "CB", "TB", "NC"]);
  const [status, setStatus] = useQueryParam("status", "all", ["all", "todo", "done", "saved"]);
  const [lessonId, setLessonId] = useQueryParam<string>("lesson", "");
  const {data, update, persistent} = useWritingProgress();
  const [search, setSearch] = useState("");
  const lessons = WRITING_LESSONS.filter(p => p.part === part);
  const lesson = lessons.find(p => p.id === lessonId);
  const count = (state: string) => lessons.filter(p => state === "all" || (state === "done" ? data.entries[p.id]?.completed : state === "saved" ? data.entries[p.id]?.bookmarked : !data.entries[p.id]?.completed)).length;
  const filtered = lessons.filter(p =>
    (category === "all" || p.category === category) &&
    (p.part !== "essay" || ((topic === "all" || p.topic === topic) && (level === "all" || p.difficulty === level))) &&
    (status === "all" || (status === "done" ? data.entries[p.id]?.completed : status === "saved" ? data.entries[p.id]?.bookmarked : !data.entries[p.id]?.completed)) &&
    `${p.id} ${p.title} ${p.category} ${p.part === "essay" ? p.topic : ""}`.toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")),
  );

  return <div className="container-app space-y-6 pb-10">
    <PageHero eyebrow="Luyện viết TOEIC" title={["Rèn luyện", "TOEIC Writing", "từ câu đến bài luận"]}
      description="Luyện câu chính xác, trả lời email đủ ý và phát triển bài luận bằng lý do, ví dụ cụ thể." icon={PenTool} />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SegTabs label="Dạng bài viết" items={PARTS} value={part} onChange={v => {setPart(v, {s: null, topic: null, level: null, lesson: null}); setSearch("");}} />
      <a className="btn btn-outline btn-sm" href="/writing/TOEIC-Writing.html" target="_blank" rel="noopener noreferrer"><BookOpen className="size-4" /> Giáo trình đầy đủ</a>
    </div>
    {!persistent && <p role="alert" className="rounded-xl bg-warning-soft p-4 text-sm text-warning-ink">Trình duyệt chưa lưu được bản nháp. Bài viết vẫn còn trong phiên này; hãy sao chép bài trước khi đóng trang.</p>}
    {lessonId ? lesson ? <WritingPractice key={lesson.id} lesson={lesson} entry={data.entries[lesson.id] ?? {}} update={patch => update(lesson.id, patch)} persistent={persistent}
      back={() => setLessonId("")} navigate={setLessonId} siblings={lessons} /> :
      <div className="card p-8 text-center"><p>Không tìm thấy bài luyện trong phần đang chọn.</p><button className="btn btn-primary mt-4" onClick={() => setLessonId("")}>Về danh sách</button></div> : <>
      {part === "picture" && <p className="rounded-xl border border-hero-line bg-hero p-4 text-sm text-ink-soft">Luyện theo mô tả cảnh, dùng đủ hai từ gợi ý. Bộ này tạm chưa có tranh; phần quan sát ảnh sẽ được bổ sung sau.</p>}
      {part !== "email" && <ChipGroup label={part === "picture" ? "Nhóm từ gợi ý" : "Dạng đề essay"} value={category} onChange={setCategory}
        items={[{id: "all", label: "Tất cả", count: lessons.length}, ...WRITING_CATEGORIES[part].map(id => ({id, label: id, count: lessons.filter(p => p.category === id).length}))]} />}
      <div className="flex flex-wrap items-center gap-3">
        <SegTabs label="Tiến độ bài viết" value={status} onChange={setStatus} items={[
          {id: "all", label: "Tất cả", count: count("all")}, {id: "todo", label: "Chưa hoàn thành", count: count("todo")},
          {id: "done", label: "Đã tự kiểm", count: count("done")}, {id: "saved", label: "Đã lưu", count: count("saved")},
        ]} />
        {part === "essay" && <>
          <label className="flex items-center gap-2 text-sm">Chủ đề<select className="input max-w-64" value={topic} onChange={e => setTopic(e.target.value)}><option value="all">Mọi chủ đề</option>{WRITING_TOPICS.map(t => <option key={t}>{t}</option>)}</select></label>
          <label className="flex items-center gap-2 text-sm">Độ khó<select className="input w-40" value={level} onChange={e => setLevel(e.target.value)}><option value="all">Mọi độ khó</option>{Object.entries(WRITING_DIFFICULTY).map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label>
        </>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3"><label className="w-full sm:max-w-sm"><span className="sr-only">Tìm bài viết</span><input className="input" placeholder="Tìm theo mã bài, nội dung hoặc chủ đề…" value={search} onChange={e => setSearch(e.target.value)} /></label><p className="text-sm text-muted">{filtered.length} bài phù hợp</p></div>
      {filtered.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(p => <LessonCard key={p.id} lesson={p} entry={data.entries[p.id] ?? {}} open={() => setLessonId(p.id)} bookmark={() => update(p.id, {bookmarked: !data.entries[p.id]?.bookmarked})} />)}</div> :
        <div className="card p-10 text-center text-muted">Chưa có bài phù hợp. Thử đổi bộ lọc hoặc nội dung tìm kiếm.</div>}
      <p className="text-sm text-muted">Nội dung luyện tập biên soạn mới · Tiến độ và bản nháp được lưu trên trình duyệt này.</p>
    </>}
  </div>;
}

function LessonCard({lesson: p, entry, open, bookmark}: {lesson: WritingLesson; entry: WritingEntry; open: () => void; bookmark: () => void}) {
  return <article className="card card-hover flex flex-col p-5">
    <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-muted">{p.id} · {p.category}</span><button className="icon-btn" aria-label={`${entry.bookmarked ? "Bỏ lưu" : "Lưu"} ${p.id}`} aria-pressed={!!entry.bookmarked} onClick={bookmark}><Star className={`size-5 ${entry.bookmarked ? "fill-warning text-warning" : ""}`} /></button></div>
    {p.part === "picture" && <div className="my-3 flex min-h-36 items-center gap-3 rounded-xl bg-hero px-4 py-5"><ImageIcon className="size-8 shrink-0 text-primary" /><p className="text-sm leading-relaxed">{p.scene}</p></div>}
    <h2 className="mt-2 font-semibold leading-relaxed">{p.part === "picture" ? "Viết câu theo cảnh" : p.title}</h2>
    {p.part === "picture" ? <div className="mt-3 flex gap-2">{p.words.map(w => <span key={w} className="rounded-lg border border-line bg-canvas px-3 py-1 font-mono text-sm">{w}</span>)}</div> : p.part === "email" ? <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.task}</p> : <p className="mt-3 text-sm text-muted">{p.topic} · {WRITING_DIFFICULTY[p.difficulty]}</p>}
    <div className="mt-auto flex items-center justify-between gap-3 pt-5"><span className={`text-xs ${entry.completed ? "text-success" : "text-muted"}`}>{entry.completed ? "✓ Đã tự kiểm" : entry.draft?.trim() ? "Có bản nháp" : p.part === "picture" ? "Luyện một câu" : p.part === "email" ? "10 phút" : "30 phút"}</span><button className="btn btn-primary btn-sm" onClick={open}>{entry.draft?.trim() ? "Viết tiếp" : "Luyện tập"}</button></div>
  </article>;
}
