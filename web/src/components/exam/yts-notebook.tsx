"use client";
import { Dialog } from "@/components/ui/dialog";
import { useEtsTest } from "@/lib/ets";

export function YtsNotebook({testId, onClose}: {testId: string | null; onClose: () => void}) {
  return <Dialog open={!!testId} onClose={onClose} title="Từ vựng & paraphrase" description="Sổ học theo từng đề. Dùng để ôn trước hoặc sau khi làm bài.">
    {testId && <Notes testId={testId} />}
  </Dialog>;
}
const categories: Record<string,string> = {
  'purpose':'Mục đích', 'detail':'Chi tiết', 'intent':'Ý định trong hội thoại', 'inference':'Suy luận', 'synonym':'Từ đồng nghĩa',
  'cross-document':'Đối chiếu tài liệu', 'cross-document-inference':'Suy luận nhiều tài liệu', 'sentence-completion':'Liên kết đoạn văn', 'table-inference':'Đọc bảng', 'paraphrase':'Diễn đạt tương đương',
};
function Notes({testId}: {testId: string}) {
  const load=useEtsTest(testId);
  if(load.status==='loading') return <div aria-busy="true" className="skeleton h-64" />;
  if(load.status==='error') return <div><p>{load.message}</p><button className="btn btn-outline mt-3" onClick={load.retry}>Thử lại</button></div>;
  const notes=load.test.questions.filter(q=>q.paraphrases?.length);
  const grammar=load.test.questions.filter(q=>q.part===5);
  return <div className="space-y-5 pb-3">
    <p className="text-sm font-semibold text-primary">{load.test.title}{load.test.editorialTrack ? ` · ${load.test.editorialTrack}` : ""}</p>
    {!!load.test.vocabularyFocus?.length && <section><h3 className="mb-2 font-semibold">Chủ đề từ vựng Listening</h3><ul className="flex flex-wrap gap-2">{load.test.vocabularyFocus.map(topic=><li key={topic} className="badge badge-primary">{topic}</li>)}</ul></section>}
    {!!notes.length && <section><h3 className="mb-3 font-semibold">Nhận diện cách diễn đạt tương đương</h3>
      <dl className="space-y-3">{notes.map(q=><div key={q.number} className="rounded-xl border border-line bg-canvas p-3.5">
        <p className="mb-1 text-xs text-muted">Câu {q.number} · {categories[q.skill??'']??'Từ vựng trong ngữ cảnh'}</p>
        {q.paraphrases!.map(p=><div key={p.source}><dt className="text-sm font-semibold">{p.source} <span className="px-1 text-primary">→</span> {p.target}</dt><dd className="mt-1 text-sm leading-relaxed text-ink-soft">{p.meaning}</dd></div>)}
      </div>)}</dl>
    </section>}
    {!!grammar.length && <details className="rounded-xl border border-line p-4"><summary className="cursor-pointer font-semibold">Cụm từ và điểm ngữ pháp Part 5</summary><dl className="mt-3 space-y-3">{grammar.map(q=><div key={q.number}><dt className="text-sm font-semibold">Câu {q.number} · {q.options.find(o=>o.key===q.answer)?.text}</dt><dd className="mt-1 text-sm leading-relaxed text-muted">{q.explanation}</dd></div>)}</dl></details>}
  </div>;
}
