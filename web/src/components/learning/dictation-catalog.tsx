"use client";
import Link from 'next/link';
import { ArrowRight, Bookmark, CheckCircle2, Headphones } from 'lucide-react';
import { useEtsTest } from '@/lib/ets';
import { useDictationProgress } from '@/lib/use-dictation-progress';
import { useQueryParam } from '@/lib/use-query-param';
import type { EtsIndexEntry, EtsTest } from '@/types/domain';
export function DictationCatalog({tests}: {tests: EtsIndexEntry[]}) {
  const [review, setReview] = useQueryParam<string>('review', 'all', ['all', 'bookmarked']);
  const reviewOnly = review === 'bookmarked';
  return <div className="space-y-7"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted">{reviewOnly ? 'Chỉ hiện Part có câu đã đánh dấu. Đánh dấu câu khó trong bài luyện để thêm vào đây.' : 'Nghe chép từng câu · tiến độ được lưu riêng cho từng Part.'}</p><button className={`btn btn-sm ${reviewOnly ? 'btn-primary' : 'btn-outline'}`} aria-pressed={reviewOnly} onClick={() => setReview(reviewOnly ? 'all' : 'bookmarked')}><Bookmark className="size-4" />Câu cần luyện lại</button></div>{tests.map(test => <DictationTestCard key={test.id} id={test.id} number={test.number} reviewOnly={reviewOnly} />)}</div>;
}
export function DictationTestCard({id, number, reviewOnly = false}: {id: string; number: number; reviewOnly?: boolean}) {
  const load = useEtsTest(id);
  const progress1 = useDictationProgress(id, 1).data;
  const progress2 = useDictationProgress(id, 2).data;
  const progress3 = useDictationProgress(id, 3).data;
  const progress4 = useDictationProgress(id, 4).data;
  if (reviewOnly && ![progress1, progress2, progress3, progress4].some(data => Object.values(data.entries).some(entry => entry.bookmarked))) return null;
  return <section className="space-y-3"><h3 className="border-l-4 border-primary pl-3 font-semibold text-ink">Test {number}</h3>{load.status === 'ready' ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map(part => <DictationPartCard key={part} test={load.test} part={part} reviewOnly={reviewOnly} />)}</div> : load.status === 'loading' ? <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{[1,2,3,4].map(p => <div key={p} className="skeleton h-44 rounded-xl" />)}</div> : <button className="btn btn-outline" onClick={load.retry}>Không tải được bài · Thử lại</button>}</section>;
}
function DictationPartCard({test, part, reviewOnly}: {test: EtsTest; part: number; reviewOnly: boolean}) {
  const {data} = useDictationProgress(test.id, part);
  const clips = test.groups.filter(g => g.part === part).flatMap(g => g.listening?.clips ?? []);
  const complete = clips.filter(c => data.entries[c.id]?.completed).length;
  const bookmarks = clips.filter(c => data.entries[c.id]?.bookmarked).length;
  const finished = clips.length > 0 && complete === clips.length;
  const resume = Math.max(0, clips.findIndex(c => reviewOnly ? data.entries[c.id]?.bookmarked : !data.entries[c.id]?.completed));
  if(reviewOnly && !bookmarks) return null;
  return <article className={`card relative overflow-hidden p-4 ${finished ? 'border-success/40 bg-success-soft/30' : ''}`}><div className={`absolute inset-x-0 top-0 h-1 ${finished ? 'bg-success' : 'bg-primary'}`} /><div className="flex items-center justify-between"><span className="badge badge-primary">Part {part}</span>{finished ? <CheckCircle2 className="size-4 text-success" /> : <span className="inline-flex items-center gap-1 text-xs text-muted"><Bookmark className="size-3" />{bookmarks}</span>}</div><div className="my-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-primary-tint text-primary"><Headphones className="size-5" /></span><p className="text-lg font-semibold text-ink">{clips.length} <span className="font-normal text-muted">câu</span></p></div><div className="h-1 overflow-hidden rounded-full bg-canvas" role="progressbar" aria-label={`Tiến độ Test ${test.number} Part ${part}`} aria-valuemin={0} aria-valuemax={clips.length} aria-valuenow={complete}><div className="h-full bg-success" style={{width: `${complete / Math.max(1, clips.length) * 100}%`}} /></div><div className="mt-3 flex items-center justify-between gap-2"><span className="text-sm font-semibold text-ink-soft">{complete}/{clips.length}</span><Link href={`/listening/${test.id}/dictation?part=${part}&clip=${resume}${reviewOnly ? '&review=bookmarked' : ''}`} className="btn btn-primary btn-sm">{complete && !finished ? 'Tiếp tục' : 'Luyện tập'}<ArrowRight className="size-3" /></Link></div></article>;
}
