"use client";
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, Check, ChevronDown, Eye, FileText, Grid2X2, Headphones, LockKeyhole, Plus, RotateCcw, X } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { DictationPlayer } from './dictation-player';
import { ChipGroup, SegTabs } from '@/components/ui/tabs';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/primitives';
import { useEtsTest } from '@/lib/ets';
import { useQueryParam } from '@/lib/use-query-param';
import { checkGaps, gapIndexes, normalizeDictation, sentenceTokens, type SentenceProgress } from '@/lib/dictation';
import { useDictationProgress } from '@/lib/use-dictation-progress';
import { vocabularyFor } from '@/lib/dictation-vocabulary';
import type { EtsGroup, EtsTest, ListeningClip } from '@/types/domain';
export { normalizeDictation } from '@/lib/dictation';
const MODES = [{id: 'write', label: 'Nghe chép'}, {id: 'check', label: 'Nghe check'}, {id: 'full', label: 'Nghe full'}];

export function DictationView({testId}: {testId: string}) {
  const load = useEtsTest(testId);
  if(load.status === 'loading') return <div className="container-app skeleton h-96" aria-busy="true" />;
  if(load.status === 'error') return <div className="container-app"><EmptyState icon={Headphones} title="Không tải được bài nghe" description={load.message} action={<button className="btn btn-primary" onClick={load.retry}>Thử lại</button>} /></div>;
  if(!load.test.listening) return <div className="container-app"><EmptyState title="Đề này chưa có Listening" icon={Headphones} description="Chọn bộ YBM 2025 để nghe chép." action={<Link href="/listening" className="btn btn-primary">Thư viện Listening</Link>} /></div>;
  return <DictationPractice test={load.test} />;
}
function DictationPractice({test}: {test: EtsTest}) {
  const [part, setPart] = useQueryParam<string>('part', '3', ['1','2','3','4']);
  return <div className="container-app space-y-5 pb-24">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><Link className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-primary" href={`/listening?set=ybm-${test.year}&mode=dictation`}><ArrowLeft className="size-4" />Thư viện nghe chép</Link><h1 className="text-xl font-bold text-ink sm:text-2xl">{test.title} <span className="font-normal text-muted">· Nghe chép</span></h1></div><ChipGroup label="Part nghe chép" items={[1,2,3,4].map(p => ({id: String(p), label: `Part ${p}`}))} value={part} onChange={value => setPart(value, {clip: null})} /></div>
    <Clips key={`${test.id}-${part}`} test={test} part={Number(part)} />
  </div>;
}
type PracticeClip = ListeningClip & {group: EtsGroup};
function Clips({test, part}: {test: EtsTest; part: number}) {
  const groups = test.groups.filter(g => g.part === part && g.listening);
  const clips = groups.flatMap(group => group.listening!.clips.map(clip => ({...clip, group})));
  const [index, setIndex] = useQueryParam('clip', '0', clips.map((_, i) => String(i)));
  const [mode, setMode] = useQueryParam<string>('view', 'write', ['write','check','full']);
  const [level, setLevel] = useQueryParam<string>('level', '50', ['30','50','100']);
  const [listOpen, setListOpen] = useState(false);
  const [review, setReview] = useQueryParam<string>('review', 'all', ['all', 'bookmarked']);
  const reviewOnly = review === 'bookmarked';
  const setReviewOnly = (value: boolean) => setReview(value ? 'bookmarked' : 'all');
  const [autoPlay, setAutoPlay] = useState(false);
  const {data, update, saveWords} = useDictationProgress(test.id, part);
  const clip = clips[Number(index)];
  if(!clip) return <EmptyState title="Chưa có clip" description="Hãy chọn Part khác để luyện." icon={Headphones} />;
  const currentGroup = groups.findIndex(g => g.id === clip.group.id);
  const groupClips = clips.filter(c => c.group.id === clip.group.id);
  const completed = clips.filter(c => data.entries[c.id]?.completed).length;
  const bookmarked = clips.filter(c => data.entries[c.id]?.bookmarked).length;
  const move = (target: number, autoplay = false) => {setAutoPlay(autoplay); setIndex(String(target));};
  const eligible = clips.map((c, i) => ({c, i})).filter(({c}) => !reviewOnly || data.entries[c.id]?.bookmarked);
  const before = eligible.filter(({i}) => i < Number(index)).at(-1)?.i;
  const after = eligible.find(({i}) => i > Number(index))?.i;
  const previousGroup = currentGroup > 0 ? clips.findIndex(c => c.group.id === groups[currentGroup - 1].id) : undefined;
  const nextGroup = currentGroup < groups.length - 1 ? clips.findIndex(c => c.group.id === groups[currentGroup + 1].id) : undefined;
  const previous = mode === 'full' ? previousGroup : before;
  const next = mode === 'full' ? nextGroup : after;
  return <>
    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-3"><span className="text-sm text-muted">Part {part} · <b className="text-ink">Bài {currentGroup + 1}/{groups.length}</b> · Câu {groupClips.findIndex(c => c.id === clip.id) + 1}/{groupClips.length}</span><SegTabs label="Chế độ nghe chép" items={MODES} value={mode} onChange={value => {setAutoPlay(false); setMode(value);}} /><span className="text-sm font-semibold text-success">{completed}/{clips.length} đã xong</span></div>
    <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm text-muted">Nhóm câu<select aria-label="Chọn nhóm câu nghe" className="rounded-lg border border-line bg-white p-2 text-ink" value={clip.group.id} onChange={e => move(clips.findIndex(c => c.group.id === e.target.value))}>{groups.map((g, i) => <option key={g.id} value={g.id}>Bài {i+1} · Questions {g.from}{g.to !== g.from ? `–${g.to}` : ''}</option>)}</select></label><button className={`btn btn-sm ${reviewOnly ? 'btn-primary' : 'btn-outline'}`} aria-pressed={reviewOnly} onClick={() => {setReviewOnly(!reviewOnly); if(!reviewOnly) {const first = clips.findIndex(c => data.entries[c.id]?.bookmarked); if(first >= 0) move(first);}}}><Bookmark className="size-4" />Câu cần luyện lại ({bookmarked})</button></div>
    {reviewOnly && !bookmarked ? <EmptyState icon={Bookmark} title="Chưa có câu cần luyện lại" description="Nhấn biểu tượng đánh dấu ở câu khó để lưu vào danh sách này." action={<button className="btn btn-primary" onClick={() => setReviewOnly(false)}>Trở về bài luyện</button>} /> : <Exercise key={`${clip.id}-${mode}-${level}`} clip={clip} mode={mode} level={Number(level)} setLevel={setLevel} entry={data.entries[clip.id] ?? {}} update={patch => update(clip.id, patch)} questions={test.questions.filter(q => q.groupId === clip.group.id)} savedWords={data.savedWords} saveWords={saveWords} previous={previous === undefined ? undefined : () => move(previous)} next={next === undefined ? undefined : () => move(next)} autoNext={next === undefined ? undefined : () => move(next, true)} autoPlay={autoPlay} />}
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end sm:bottom-6 sm:right-8">
      {listOpen && <section className="mb-3 w-[min(370px,calc(100vw-40px))] overflow-hidden rounded-2xl border border-line bg-white shadow-xl" aria-label="Danh sách câu"><div className="flex items-center justify-between border-b border-line p-4"><div><h2 className="font-semibold text-ink">Danh sách câu</h2><p className="mt-1 text-xs text-muted"><span className="text-primary">● Đang học</span> · <span className="text-success">{completed} đã xong</span> · {clips.length-completed} chưa xong</p></div><button className="btn btn-ghost p-2" aria-label="Đóng danh sách câu" onClick={() => setListOpen(false)}><X className="size-4" /></button></div><div className="max-h-52 overflow-y-auto border-b border-line p-3"><div className="flex flex-wrap gap-2">{groups.map((g, i) => {const done = clips.filter(c => c.group.id === g.id).every(c => data.entries[c.id]?.completed); return <button key={g.id} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${g.id === clip.group.id ? 'border-primary bg-primary text-white' : done ? 'border-success/30 bg-success-soft text-success' : 'border-line text-muted'}`} onClick={() => move(clips.findIndex(c => c.group.id === g.id))}>{done ? '✓ ' : ''}Bài {i+1}</button>;})}</div></div><div className="max-h-48 overflow-y-auto p-3"><div className="grid grid-cols-6 gap-2">{groupClips.map((c, i) => <button key={c.id} aria-label={`Câu ${i+1}, ${data.entries[c.id]?.completed ? 'đã xong' : 'chưa xong'}`} aria-current={c.id === clip.id ? 'step' : undefined} className={`rounded-xl border py-2 text-sm font-semibold ${c.id === clip.id ? 'border-primary bg-primary text-white' : data.entries[c.id]?.completed ? 'border-success/30 bg-success-soft text-success' : 'border-line text-muted'}`} onClick={() => {move(clips.findIndex(item => item.id === c.id)); setListOpen(false);}}>{i+1}{data.entries[c.id]?.bookmarked ? '·' : ''}</button>)}</div></div></section>}
      <button className="btn btn-primary shadow-lg" aria-label="Mở danh sách câu" aria-expanded={listOpen} onClick={() => setListOpen(v => !v)}><Grid2X2 className="size-4" />{completed}/{clips.length}<ChevronDown className={`size-4 ${listOpen ? '' : 'rotate-180'}`} /></button>
    </div>
  </>;
}
function Exercise({clip, mode, level, setLevel, entry, update, questions, savedWords, saveWords, previous, next, autoNext, autoPlay}: {clip: PracticeClip; mode: string; level: number; setLevel: (value: string) => void; entry: SentenceProgress; update: (patch: Partial<SentenceProgress>) => void; questions: EtsTest['questions']; savedWords: Record<string, string>; saveWords: (words: Record<string, string>) => void; previous?: () => void; next?: () => void; autoNext?: () => void; autoPlay: boolean}) {
  const [revealed, setRevealed] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [wholeSentence, setWholeSentence] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [assisted, setAssisted] = useState(false);
  const inputs = useRef<Record<number, HTMLInputElement | null>>({});
  const tokens = sentenceTokens(clip.text), gaps = gapIndexes(clip.text, level), answers = entry.words ?? {};
  const correct = wholeSentence ? normalizeDictation(entry.draft ?? '') === normalizeDictation(clip.text) : checkGaps(clip.text, gaps, answers);
  const unlocked = mode === 'full' || entry.completed || correct && checked;
  const text = mode === 'full' ? clip.group.listening!.transcript : clip.text;
  const vocabulary = vocabularyFor(text);
  const reveal = (count: number) => {setAssisted(true); setRevealed(current => [...new Set([...current, ...gaps.filter(i => !current.includes(i)).slice(0, count)])]);};
  const check = () => {setChecked(true); if(correct && !assisted) update({completed: true});};
  const type = (index: number, value: string) => {
    const words = {...answers, [index]: value}; update({words}); setChecked(false);
    if(normalizeDictation(value) === normalizeDictation(tokens[index])) {const nextGap = gaps.find(i => i > index && normalizeDictation(words[i] ?? '') !== normalizeDictation(tokens[i])); if(nextGap !== undefined) inputs.current[nextGap]?.focus(); if(checkGaps(clip.text, gaps, words)) {setChecked(true); if(!assisted) update({words, completed: true});}}
  };
  return <><Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Gợi ý và giải thích bài nghe" description="Đối chiếu nội dung của nhóm câu trong bộ đề.">{unlocked ? <div className="space-y-4">{questions.map(q => <article key={q.number} className="rounded-xl border border-line p-4"><h3 className="font-semibold">Question {q.number}{q.stem ? ` · ${q.stem}` : ''}</h3><p className="mt-2 text-sm font-semibold text-primary">Đáp án: {q.answer}</p><p className="mt-2 text-sm leading-6 text-ink-soft">{q.explanation}</p></article>)}</div> : <p className="pb-4 text-sm leading-7 text-ink-soft">Nghe lại ở tốc độ 0.75x, chú ý từ được nhấn và âm cuối. Dùng nút con mắt để mở từng từ khó. Hoàn thành câu hoặc chuyển sang Nghe full để xem giải thích của nhóm câu.</p>}</Dialog><div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]">
    <div className="min-w-0 space-y-4">
      <DictationPlayer key={`${clip.id}-${mode}`} src={mode === 'full' ? clip.group.listening!.conversationAudio : clip.audio} title={mode === 'full' ? 'Nghe trọn đoạn hội thoại / bài nói' : `Câu nghe · ${clip.voice.replace('_', ' · ')}`} previous={previous} next={next ? () => {next();} : undefined} autoPlay={autoPlay} autoNext={autoNext} />
      <section className="card space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">{mode === 'full' ? <div className="seg"><button className={`seg-item ${showScript ? 'bg-primary text-white' : ''}`} onClick={() => setShowScript(true)}>Hiện script</button><button className={`seg-item ${!showScript ? 'bg-primary text-white' : ''}`} onClick={() => setShowScript(false)}>Ẩn script</button></div> : <SegTabs label="Mức độ khuyết từ" items={['30','50','100'].map(value => ({id: value, label: `${value}%`}))} value={String(level)} onChange={setLevel} />}
          <div className="flex items-center gap-2">{mode === 'write' && <button className="btn btn-outline btn-sm p-2" aria-label="Gợi ý một từ" onClick={() => reveal(1)}><Eye className="size-4" /></button>}<button className={`btn btn-sm p-2 ${entry.bookmarked ? 'btn-primary' : 'btn-outline'}`} aria-label="Đánh dấu cần luyện lại" aria-pressed={!!entry.bookmarked} onClick={() => update({bookmarked: !entry.bookmarked})}><Bookmark className="size-4" /></button><button className={`btn btn-sm p-2 ${noteOpen ? 'btn-primary' : 'btn-outline'}`} aria-label="Ghi chú câu nghe" aria-expanded={noteOpen} onClick={() => setNoteOpen(v => !v)}><FileText className="size-4" /></button><button className="btn btn-outline btn-sm" onClick={() => setHelpOpen(true)}>Hỏi bài</button></div>
        </div>
        {mode === 'full' ? <div className="rounded-xl bg-canvas p-4">{showScript ? <div className="space-y-3 text-lg leading-8 text-ink">{text.split('\n').filter(Boolean).map((line, i) => <p key={i}>{line}</p>)}</div> : <div className="py-8 text-center text-sm text-muted"><Headphones className="mx-auto mb-3 size-7 text-primary" />Nghe cả đoạn trước, rồi bật script để đối chiếu.</div>}</div> : <>
          {mode === 'write' && wholeSentence ? <div><label className="label" htmlFor="dictation-input">Viết lại câu bạn nghe được</label><textarea id="dictation-input" className="input min-h-28 resize-y text-lg leading-8" rows={3} autoComplete="off" spellCheck={false} value={entry.draft ?? ''} onChange={e => {update({draft: e.target.value}); setChecked(false);}} placeholder="Gõ câu tiếng Anh ở đây…" /></div> : <div className="flex flex-wrap items-baseline gap-x-2 gap-y-4 rounded-xl bg-canvas p-4 font-mono text-base leading-9 sm:text-lg" aria-label="Câu điền từ">{tokens.map((word, i) => {
            if(!gaps.includes(i)) return <span key={i}>{word}</span>;
            if(revealed.includes(i)) return <span key={i} className="rounded bg-primary-tint px-2 text-primary">{word}</span>;
            if(mode === 'check') return <button key={i} aria-label={`Lật từ ${i+1}`} className="h-9 rounded bg-slate-200 px-3 text-transparent hover:bg-slate-300 focus-visible:outline-2 focus-visible:outline-primary" style={{width: `${Math.max(4, Math.min(word.length + 1, 18))}ch`}} onClick={() => {setAssisted(true); setRevealed(v => [...v, i]);}}>?</button>;
            const right = normalizeDictation(answers[i] ?? '') === normalizeDictation(word);
            return <input key={i} ref={el => {inputs.current[i] = el;}} aria-label={`Từ ${i+1}`} autoComplete="off" autoCapitalize="none" spellCheck={false} value={answers[i] ?? ''} placeholder={'•'.repeat(Math.min(normalizeDictation(word).length, 12))} style={{width: `${Math.max(4, Math.min(word.length + 1, 20))}ch`, maxWidth: '100%'}} className={`min-w-0 border-b-2 bg-transparent px-1 text-center outline-none focus:border-primary ${right ? 'border-success text-success' : checked ? 'border-danger text-danger' : 'border-primary/30 text-ink'}`} onChange={e => type(i, e.target.value)} onKeyDown={e => {if(e.key === 'Enter') {e.preventDefault(); check();}}} />;
          })}</div>}
          {mode === 'check' ? <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-muted">LẬT TỪ</span>{[1,2,3,gaps.length].filter((n, i, a) => a.indexOf(n) === i).map(n => <button key={n} className="btn btn-outline btn-sm" onClick={() => reveal(n)}>{n === gaps.length ? 'Tất cả' : `${n} từ`}</button>)}<p className="w-full text-xs leading-5 text-muted">Nhẩm câu trả lời rồi lật từng từ để đối chiếu. Chế độ này không tính hoàn thành nghe chép.</p></div> : <>
            <p className="text-xs italic leading-5 text-muted">Điền đúng để tự chuyển ô. Bỏ qua viết hoa và dấu câu; giữ đúng dạng rút gọn.</p>
            <div className="flex flex-wrap gap-2"><button className="btn btn-primary btn-sm" onClick={check}><Check className="size-4" />Kiểm tra</button><button className="btn btn-outline btn-sm" onClick={() => {setWholeSentence(v => !v); setChecked(false);}}>{wholeSentence ? 'Điền từng từ' : 'Gõ cả câu'}</button><button className="btn btn-ghost btn-sm" onClick={() => {update({draft: '', words: {}}); setChecked(false); setRevealed([]); setAssisted(false);}}> <RotateCcw className="size-4" />Viết lại</button></div>
            {checked && <div role="status" className={`rounded-xl p-3 text-sm ${correct ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning-ink'}`}>{correct ? assisted ? 'Điền đúng. Thử viết lại không dùng gợi ý để hoàn thành câu.' : 'Chính xác! Đã lưu tiến độ câu này.' : 'Chưa chính xác. Nghe lại và sửa các ô được đánh dấu.'}</div>}
          </>}
        </>}
        {noteOpen && <div className="rounded-xl border border-line p-3"><label className="label" htmlFor="dictation-note">Ghi chú của bạn</label><textarea id="dictation-note" rows={3} className="input resize-y" value={entry.note ?? ''} placeholder="Từ khó, nối âm, điều cần nhớ…" onChange={e => update({note: e.target.value})} /><p className="mt-2 text-xs text-muted">Tự động lưu trên trình duyệt.</p></div>}
      </section>
      <nav className="flex items-center justify-between gap-3" aria-label="Chuyển câu nghe"><button className="btn btn-outline" disabled={!previous} onClick={previous}><ArrowLeft className="size-4" />Câu trước</button><button className="btn btn-primary" disabled={!next} onClick={autoPlay ? autoNext : next}>Câu tiếp<ArrowRight className="size-4" /></button></nav>
    </div>
    <aside className="card overflow-hidden"><div className="flex items-center gap-2 border-b border-line p-4 font-semibold text-ink"><BookOpen className="size-5 text-primary" />Từ vựng nên học</div>{!unlocked ? <div className="px-6 py-12 text-center"><span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-canvas text-muted"><LockKeyhole className="size-5" /></span><p className="font-semibold text-ink">Chép xong câu để mở từ vựng</p><p className="mt-3 text-sm leading-6 text-muted">Từ vựng nằm trong câu, hiện sớm sẽ lộ đáp án.</p></div> : <div className="space-y-3 p-4"><div className="flex items-center justify-between gap-2"><span className="text-sm text-muted">{vocabulary.length} từ trong {mode === 'full' ? 'đoạn' : 'câu'}</span>{vocabulary.length > 0 && <button className="btn btn-primary btn-sm" disabled={vocabulary.every(v => savedWords[v.word])} onClick={() => saveWords(Object.fromEntries(vocabulary.map(v => [v.word, v.meaning])))}><Plus className="size-4" />Thêm tất cả</button>}</div>{vocabulary.length ? vocabulary.map(v => <article key={v.word} className="rounded-xl border border-line p-3"><div className="flex items-center justify-between gap-2"><b className="text-lg text-ink">{v.word}</b><button className="btn btn-outline-primary btn-sm" disabled={!!savedWords[v.word]} onClick={() => saveWords({[v.word]: v.meaning})}>{savedWords[v.word] ? <><Check className="size-3" />Đã lưu</> : <><Plus className="size-3" />Thêm</>}</button></div><p className="mt-2 text-sm text-ink-soft">{v.meaning}</p></article>) : <p className="rounded-xl bg-canvas p-4 text-sm leading-6 text-muted">Chưa có mục từ được biên soạn cho câu này. Bạn có thể ghi từ cần học vào ghi chú.</p>}<details className="border-t border-line pt-3"><summary className="cursor-pointer text-sm font-semibold text-primary">Từ đã lưu trong Part này ({Object.keys(savedWords).length})</summary><div className="mt-3 space-y-2">{Object.entries(savedWords).map(([word, meaning]) => <p key={word} className="text-sm"><b>{word}</b> · {meaning}</p>)}{!Object.keys(savedWords).length && <p className="text-sm text-muted">Chưa lưu từ nào.</p>}</div></details></div>}</aside>
  </div></>;
}
