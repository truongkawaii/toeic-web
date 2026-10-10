"use client";

import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { SegTabs } from "@/components/ui/tabs";
import { CHECKLISTS, WRITING_ESSAYS, WRITING_GRAMMAR, canComplete, orderingTokens, wordCount, type WritingEntry, type WritingLesson, type WritingPart, type WritingPicture } from "@/lib/writing";
import { checkGaps, gapIndexes, normalizeDictation, sentenceTokens } from "@/lib/dictation";
import { WRITING_ERRORS, WRITING_GAPS, WRITING_TRANSLATIONS } from "@/lib/writing-exercises";

const REFERENCE_TABS = [
  {id: "outline", label: "Dàn ý"}, {id: "sample", label: "Bài mẫu"},
  {id: "vocabulary", label: "Từ vựng"}, {id: "grammar", label: "Ngữ pháp"},
] as const;

export function WritingPractice({lesson, entry, update, persistent, back, navigate, siblings}: {
  lesson: WritingLesson; entry: WritingEntry; update: (patch: Partial<WritingEntry>) => void; persistent: boolean;
  back: () => void; navigate: (id: string) => void; siblings: WritingLesson[];
}) {
  const [reference, setReference] = useState<string | null>(null);
  const [review, setReview] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [mode, setMode] = useState("write");
  const index = siblings.findIndex(p => p.id === lesson.id);
  const count = wordCount(entry.draft ?? "");
  return <section className="space-y-5" aria-label={`Bài luyện ${lesson.id}`}>
    <div className="flex flex-wrap items-center justify-between gap-3"><button className="btn btn-outline" onClick={back}><ArrowLeft className="size-4" /> Danh sách</button><div className="flex items-center gap-2"><button className="icon-btn disabled:opacity-30" aria-label="Bài trước" disabled={index === 0} onClick={() => navigate(siblings[index - 1].id)}><ChevronLeft className="size-5" /></button><span className="text-sm">{index + 1}/{siblings.length} · {lesson.id}</span><button className="icon-btn disabled:opacity-30" aria-label="Bài tiếp theo" disabled={index === siblings.length - 1} onClick={() => navigate(siblings[index + 1].id)}><ChevronRight className="size-5" /></button></div></div>
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <article className="card p-5 sm:p-6">
          <p className="eyebrow">{lesson.part === "picture" ? "Viết một câu theo cảnh" : lesson.part === "email" ? "Trả lời email" : "Viết bài luận nêu quan điểm"}</p>
          {lesson.part === "picture" ? <>
            <div className="mt-4 rounded-xl border border-hero-line bg-hero p-6"><ImageIcon className="mb-4 size-9 text-primary" /><h2 className="text-lg font-semibold leading-relaxed">{lesson.scene}</h2><p className="mt-3 text-sm text-muted">Mô tả cảnh thay cho tranh trong giai đoạn này.</p></div>
            <div className="mt-4 flex gap-3">{lesson.words.map(w => <span key={w} className="chip bg-primary-tint font-mono text-primary">{w}</span>)}</div>
            <p className="mt-4 text-sm leading-relaxed">Viết đúng một câu hoàn chỉnh, dùng cả hai từ gợi ý. Có thể thay đổi dạng từ và thứ tự để phù hợp ngữ pháp.</p>
          </> : lesson.part === "email" ? <>
            <dl className="my-4 space-y-1 text-sm"><div><dt className="inline font-semibold">From: </dt><dd className="inline">{lesson.sender}</dd></div><div><dt className="inline font-semibold">To: </dt><dd className="inline">{lesson.recipient}</dd></div><div><dt className="inline font-semibold">Subject: </dt><dd className="inline">{lesson.subject}</dd></div></dl>
            <p className="whitespace-pre-line text-[15px] leading-8">{lesson.incoming}</p>
            <div className="mt-5 rounded-xl bg-primary-tint p-4 text-sm leading-relaxed"><strong>Yêu cầu: </strong>{lesson.task}</div>
          </> : <>
            <h2 className="mt-4 text-lg font-semibold leading-relaxed">{lesson.prompt}</h2><p className="mt-4 text-sm text-muted">{lesson.category} · {lesson.topic}</p>
            <p className="mt-4 text-sm leading-relaxed">Viết trong 30 phút. Nêu câu trả lời rõ ràng, phát triển lý do và ví dụ phù hợp; luyện khoảng 300–350 từ.</p>
          </>}
        </article>
        <button className="btn btn-outline" aria-expanded={noteOpen} onClick={() => setNoteOpen(!noteOpen)}>Ghi chú của tôi</button>
        {noteOpen && <label className="card block p-4"><span className="label">Ý tưởng và lỗi cần sửa</span><textarea className="input min-h-32 py-3" value={entry.note ?? ""} onChange={e => update({note: e.target.value})} placeholder="Ghi ý chính, từ vựng hoặc điều cần chú ý…" /></label>}
      </div>
      <div className="space-y-4">
        <SegTabs label="Chế độ luyện viết" value={mode} onChange={setMode} items={[
          {id: "write", label: lesson.part === "picture" ? "Viết câu" : "Viết bài"}, {id: "translate", label: "Dịch câu"}, {id: "gaps", label: "Điền từ"},
          lesson.part === "picture" ? {id: "order", label: "Sắp xếp"} : {id: "errors", label: "Sửa lỗi"},
        ]} />
        {mode !== "write" ? lesson.part === "picture" ? <PictureExercise key={mode} lesson={lesson} mode={mode} /> : <StructureExercise key={mode} part={lesson.part} mode={mode} /> : <>
          <article className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4 text-sm"><span>{count} từ{lesson.part === "essay" ? " · Mục tiêu luyện 300–350" : ""}</span><PracticeTimer part={lesson.part} deadline={entry.deadline ?? null} update={update} /></div>
            <label className="block p-4"><span className="sr-only">Bài viết của tôi</span><textarea className={`w-full resize-y bg-transparent text-[15px] leading-8 outline-none ${lesson.part === "picture" ? "min-h-48" : "min-h-80"}`} placeholder={lesson.part === "picture" ? "Write one sentence here…" : lesson.part === "email" ? "Write your reply here…" : "Write your essay here…"} value={entry.draft ?? ""} onChange={e => update({draft: e.target.value})} /></label>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4"><span className={`text-xs ${persistent ? "text-muted" : "text-warning-ink"}`} role="status">{persistent ? "Bản nháp tự lưu trên trình duyệt này" : "Chưa lưu được — hãy sao chép bài"}</span><button className="btn btn-primary btn-sm" disabled={!count} aria-expanded={review} onClick={() => setReview(!review)}><Check className="size-4" /> Tự kiểm bài viết</button></div>
          </article>
          {review && <div className="card space-y-3 p-5"><h3 className="font-semibold">Kiểm tra trước khi hoàn thành</h3><p className="text-sm text-muted">Đánh dấu sau khi đối chiếu bài của mình. Đây là tự đánh giá, không phải điểm TOEIC.</p>{CHECKLISTS[lesson.part].map((text, i) => <label key={text} className="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" className="mt-1 size-4 shrink-0 accent-primary" checked={entry.checks?.[i] ?? false} onChange={e => update({checks: CHECKLISTS[lesson.part].map((_, j) => j === i ? e.target.checked : !!entry.checks?.[j]), completed: false})} />{text}</label>)}
            <button className="btn btn-success w-full" disabled={!canComplete(lesson, entry)} onClick={() => update({completed: true})}>{entry.completed ? "Đã hoàn thành tự kiểm" : "Đánh dấu đã tự kiểm"}</button>{entry.completed && <p role="status" className="text-sm text-success">Đã lưu tiến độ. Khi sửa bài viết, hãy tự kiểm lại.</p>}
          </div>}
        </>}
        <div className="flex flex-wrap gap-2" aria-label="Tài liệu hỗ trợ">{REFERENCE_TABS.map(t => <button key={t.id} className={`btn btn-sm ${reference === t.id ? "btn-primary" : "btn-outline"}`} aria-expanded={reference === t.id} onClick={() => setReference(reference === t.id ? null : t.id)}>{t.label}</button>)}</div>
        {reference && <ReferencePanel key={`${lesson.id}-${reference}`} lesson={lesson} section={reference} />}
      </div>
    </div>
  </section>;
}

function PracticeTimer({part, deadline, update}: {part: WritingPart; deadline: number | null; update: (patch: Partial<WritingEntry>) => void}) {
  const [now, setNow] = useState(0);
  useEffect(() => {if (!deadline) return; const interval = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(interval);}, [deadline]);
  const seconds = deadline && now ? Math.max(0, Math.ceil((deadline - now) / 1000)) : null;
  const duration = part === "picture" ? 90 : part === "email" ? 600 : 1800;
  return <div className="flex items-center gap-2"><Clock className="size-4 text-muted" />{deadline ? <><span role="timer" className={seconds === 0 ? "text-warning-ink" : "font-mono"}>{seconds === null ? "Đang khôi phục…" : seconds === 0 ? "Hết giờ — có thể viết tiếp" : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`}</span><button className="text-xs text-primary underline" onClick={() => update({deadline: null})}>Tắt hẹn giờ</button></> : <button className="text-sm text-primary underline" onClick={() => {const start = Date.now(); setNow(start); update({deadline: start + duration * 1000});}}>Luyện {part === "picture" ? "1:30 / câu" : part === "email" ? "10 phút" : "30 phút"}</button>}</div>;
}

function ReferencePanel({lesson, section}: {lesson: WritingLesson; section: string}) {
  const [sampleIndex, setSampleIndex] = useState(0);
  const grammar = WRITING_GRAMMAR[lesson.part];
  if (section === "grammar") return <div className="card overflow-hidden p-5"><h3 className="mb-4 font-semibold">Cấu trúc ngữ pháp ứng dụng</h3><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{grammar.headers.map(h => <th className="border-b border-line px-3 py-2" key={h}>{h}</th>)}</tr></thead><tbody>{grammar.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td className="min-w-40 border-b border-line-soft px-3 py-3 align-top leading-relaxed" key={j}>{cell}</td>)}</tr>)}</tbody></table></div></div>;
  if (section === "outline") return <div className="card space-y-4 p-5"><h3 className="font-semibold">{lesson.part === "picture" ? "Cách xây dựng câu" : "Phân tích và dàn ý"}</h3>{lesson.part === "picture" ? <ol className="list-decimal space-y-2 pl-5 text-sm"><li>Chọn người/vật chính trong cảnh.</li><li>Chọn hành động hoặc vị trí có căn cứ.</li><li>Đưa {lesson.words.join(" và ")} vào một câu.</li><li>Kiểm tra động từ chính, dạng từ và mạo từ.</li></ol> : <>{lesson.part === "essay" && <p className="text-sm leading-relaxed">{lesson.analysis || `Đề thuộc dạng ${lesson.category}. Trả lời trực tiếp câu hỏi; với đề ưu–nhược, cần phân tích cả hai mặt.`}</p>}{lesson.outline ? <ol className="list-decimal space-y-3 pl-5 text-sm">{lesson.outline.split("→").map((s, i) => <li key={i}>{s.trim()}</li>)}</ol> : lesson.part === "essay" && <><p className="text-sm font-medium">Hai hướng để phát triển ý:</p><ul className="list-disc space-y-2 pl-5 text-sm">{lesson.ideas.map(s => <li key={s}>{s}</li>)}</ul><p className="text-sm text-muted">Chọn lập trường, giải thích từng ý bằng một tình huống cụ thể rồi kết luận. Có thể chọn hướng khác nếu hợp lý.</p></>}</>}</div>;
  if (section === "vocabulary") return <div className="card space-y-3 p-5"><h3 className="font-semibold">Từ vựng và kết hợp từ</h3>{lesson.part === "picture" ? <><p className="font-mono text-primary">{lesson.words.join(" · ")}</p><p className="text-sm leading-relaxed">{lesson.explanation}</p><p className="text-sm text-muted">Kiểm tra từ loại và đổi dạng từ phù hợp với câu.</p></> : lesson.vocabulary ? <ul className="space-y-3 text-sm">{lesson.vocabulary.split(";").map((term, i) => <li key={i} className="rounded-lg bg-canvas p-3">{term.trim()}</li>)}</ul> : <p className="text-sm leading-relaxed">Chọn từ theo ý muốn diễn đạt: {lesson.part === "essay" ? lesson.ideas.join("; ") : lesson.title}. Xem bảng Ngữ pháp và giáo trình để luyện kết hợp từ.</p>}</div>;
  const samples = lesson.part === "picture" ? [lesson.answer] : lesson.samples;
  return <div className="card space-y-4 p-5"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Bài mẫu tham khảo</h3>{samples.length > 0 && <span className="text-xs text-muted">{wordCount(samples[sampleIndex])} từ</span>}</div>{samples.length > 1 && <SegTabs label="Chọn bài mẫu" items={samples.map((_, i) => ({id: String(i), label: `Bài ${i + 1}`}))} value={String(sampleIndex)} onChange={v => setSampleIndex(Number(v))} />}{samples.length ? <><p className="whitespace-pre-line text-[15px] leading-8">{samples[sampleIndex]}</p>{lesson.part === "essay" && <p className="rounded-xl bg-success-soft p-4 text-sm leading-relaxed"><strong>Tóm nghĩa: </strong>{lesson.summary}</p>}<p className="border-t border-line pt-4 text-sm leading-relaxed"><strong>Điểm học: </strong>{lesson.explanation}</p><p className="text-xs text-muted">Đây là một cách viết hợp lệ. Câu/bài khác vẫn có thể đúng nếu đáp ứng yêu cầu.</p></> : <><p className="text-sm leading-relaxed">Đề này dành cho luyện tự viết, chưa có bài mẫu riêng. Hãy dùng dàn ý để phát triển lập luận.</p><p className="text-sm text-muted">Bài mẫu đầy đủ theo dạng đề có trong:</p><ul className="space-y-2 text-sm">{WRITING_ESSAYS.filter(p => p.samples.length && p.category === lesson.category).map(p => <li key={p.id}><a className="text-primary underline" href={`/writing?part=essay&lesson=${p.id}`}>{p.id} · {p.topic}</a></li>)}</ul></>}</div>;
}

function PictureExercise({lesson, mode}: {lesson: WritingPicture; mode: string}) {
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [chosen, setChosen] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const tokens = sentenceTokens(lesson.answer);
  const gaps = gapIndexes(lesson.answer, 30);
  const shuffled = orderingTokens(lesson.answer);
  const arranged = chosen.map(id => tokens[id]).join(" ");
  const correct = mode === "gaps" ? checkGaps(lesson.answer, gaps, answers) : normalizeDictation(mode === "order" ? arranged : draft) === normalizeDictation(lesson.answer);
  return <div className="card space-y-4 p-5"><h3 className="font-semibold">{mode === "gaps" ? "Điền từ còn thiếu" : mode === "order" ? "Sắp xếp thành câu mẫu" : "Dịch cảnh sang một câu tiếng Anh"}</h3>
    <p className="text-sm text-muted">{mode === "translate" ? "Dịch câu có nhiều cách đúng. Hãy đối chiếu nghĩa, ngữ pháp và hai từ gợi ý với câu mẫu." : "Bài này luyện theo câu mẫu cố định; không phân biệt chữ hoa và dấu câu."}</p>
    {mode === "translate" ? <label className="block"><span className="label">Bản dịch của tôi</span><textarea className="input min-h-36 py-3" value={draft} onChange={e => {setDraft(e.target.value); setChecked(false);}} /></label> : mode === "gaps" ? <div className="flex flex-wrap items-center gap-2 leading-10">{tokens.map((token, i) => gaps.includes(i) ? <input key={i} className={`input max-w-32 ${checked ? normalizeDictation(answers[i] ?? "") === normalizeDictation(token) ? "border-success" : "border-danger" : ""}`} aria-label={`Từ còn thiếu ${gaps.indexOf(i) + 1}`} value={answers[i] ?? ""} onChange={e => {setAnswers({...answers, [i]: e.target.value}); setChecked(false);}} /> : <span key={i}>{token}</span>)}</div> : <><div className="min-h-20 rounded-xl border border-dashed border-line bg-canvas p-4" aria-live="polite">{arranged || "Chọn các từ bên dưới theo thứ tự…"}</div><div className="flex flex-wrap gap-2">{shuffled.map(token => <button key={token.id} className="btn btn-outline btn-sm" disabled={chosen.includes(token.id)} onClick={() => {setChosen([...chosen, token.id]); setChecked(false);}}>{token.text}</button>)}</div><button className="text-sm text-primary underline" disabled={!chosen.length} onClick={() => {setChosen(chosen.slice(0, -1)); setChecked(false);}}>Bỏ từ cuối</button></>}
    <div className="flex flex-wrap gap-2"><button className="btn btn-primary btn-sm" disabled={mode === "translate" ? !draft.trim() : mode === "gaps" ? !gaps.every(i => answers[i]?.trim()) : chosen.length !== tokens.length} onClick={() => setChecked(true)}>Kiểm tra</button><button className="btn btn-outline btn-sm" aria-expanded={revealed} onClick={() => setRevealed(!revealed)}>{revealed ? "Ẩn câu mẫu" : "Xem câu mẫu"}</button><button className="btn btn-ghost btn-sm" onClick={() => {setDraft(""); setAnswers({}); setChosen([]); setChecked(false); setRevealed(false);}}>Làm lại bài phụ</button></div>
    {checked && <p role="status" className={`rounded-xl p-3 text-sm ${correct ? "bg-success-soft text-success" : "bg-warning-soft text-warning-ink"}`}>{correct ? "Khớp câu mẫu." : mode === "translate" ? "Câu của bạn khác câu mẫu. Điều này chưa có nghĩa là sai — hãy đối chiếu nghĩa và ngữ pháp." : "Chưa khớp câu mẫu. Kiểm tra lại dạng từ hoặc thứ tự."}</p>}
    {revealed && <div className="space-y-2 rounded-xl bg-hero p-4"><p className="font-medium">{lesson.answer}</p><p className="text-sm">{lesson.explanation}</p></div>}
    <p className="text-xs text-muted">Bài phụ không thay thế phần Viết câu. Bản nháp chính được giữ khi đổi chế độ; câu trả lời bài phụ dùng trong lượt luyện này.</p>
  </div>;
}

function StructureExercise({part, mode}: {part: WritingPart; mode: string}) {
  const exercises = (mode === "translate" ? WRITING_TRANSLATIONS : mode === "errors" ? WRITING_ERRORS : WRITING_GAPS)[part];
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const title = mode === "translate" ? "Dịch câu theo cấu trúc" : mode === "errors" ? "Tìm lỗi và viết lại câu" : "Điền dạng từ hoặc cụm từ";
  return <div className="card space-y-5 p-5"><h3 className="font-semibold">{title}</h3><p className="text-sm text-muted">Bài hỗ trợ dùng chung cho {part === "email" ? "Part 2" : "Part 3"}. Luyện cấu trúc rồi áp dụng vào bài viết chính; câu trả lời bài phụ dùng trong lượt luyện này.</p>
    {exercises.map((exercise, i) => {
      const exact = (text: string) => text.trim().replace(/\s+/g, " ");
      const matches = mode === "gaps" ? normalizeDictation(answers[i] ?? "") === normalizeDictation(exercise.answer) : exact(answers[i] ?? "") === exact(exercise.answer);
      return <div key={i} className="space-y-3 rounded-xl border border-line p-4"><p className="text-sm leading-relaxed"><strong>{i + 1}. </strong>{exercise.prompt}</p>
        <label className="block"><span className="sr-only">Câu trả lời bài phụ {i + 1}</span><input className="input" value={answers[i] ?? ""} onChange={e => {setAnswers({...answers, [i]: e.target.value}); setChecked({...checked, [i]: false});}} placeholder={mode === "gaps" ? "Từ hoặc cụm từ còn thiếu…" : "Viết câu tiếng Anh hoàn chỉnh…"} /></label>
        <div className="flex flex-wrap gap-2"><button className="btn btn-primary btn-sm" disabled={!answers[i]?.trim()} onClick={() => setChecked({...checked, [i]: true})}>Kiểm tra câu {i + 1}</button><button className="btn btn-outline btn-sm" aria-expanded={!!revealed[i]} onClick={() => setRevealed({...revealed, [i]: !revealed[i]})}>{revealed[i] ? "Ẩn đáp án" : "Xem đáp án"}</button></div>
        {checked[i] && <p role="status" className={`text-sm ${matches ? "text-success" : "text-warning-ink"}`}>{matches ? "Khớp đáp án mẫu." : mode === "gaps" ? "Chưa khớp đáp án mẫu. Hãy xem lại cấu trúc." : "Câu khác đáp án mẫu. Hãy đối chiếu nghĩa, ngữ pháp, chữ hoa và dấu câu; cách diễn đạt khác vẫn có thể hợp lệ."}</p>}
        {revealed[i] && <div className="rounded-lg bg-hero p-3"><p className="text-sm font-medium">{exercise.answer}</p><p className="mt-2 text-sm text-ink-soft">{exercise.explanation}</p></div>}
      </div>;
    })}
  </div>;
}
