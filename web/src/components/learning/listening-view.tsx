"use client";

import { ArrowRight, BookOpen, Headphones, NotebookPen, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DictationCatalog } from "@/components/learning/dictation-catalog";
import { PageHero } from "@/components/learning/page-hero";
import { ChipGroup, SegTabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { EXAM_COLLECTIONS } from '@/lib/mock/fixtures';
import { EXAM_LOADERS, LISTENING_EXAM_INDEX } from "@/lib/ets";
import { useDemoStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import type { EtsIndexEntry } from "@/types/domain";

const COLLECTIONS=[...EXAM_COLLECTIONS,{id:"ybm-2025",label:"YBM 2025"}];
const MODES=[{id:"full",label:"Listening"},{id:"dictation",label:"Nghe chép"},...([1,2,3,4] as const).map(part=>({id:`part${part}`,label:`Part ${part}`}))];
const PART_NAMES:Record<number,string>={1:"Mô tả tranh",2:"Hỏi – đáp",3:"Hội thoại",4:"Bài nói"};

export function ListeningView() {
  const [collection,setCollection]=useQueryParam("set","ybm-2025",COLLECTIONS.map(c=>c.id));
  const [mode,setMode]=useQueryParam("mode","full",MODES.map(m=>m.id));
  const availableModes = collection === "ybm-2025" ? MODES : MODES.filter(m => m.id !== "dictation");
  const visibleMode = availableModes.some(m => m.id === mode) ? mode : "full";
  const tests=LISTENING_EXAM_INDEX.filter(t=>t.collectionId===collection);
  return <div className="container-app space-y-7">
    <PageHero eyebrow="Luyện nghe TOEIC" title={["Lắng nghe,","hiểu sâu,","tiến bộ mỗi ngày"]} description="Luyện Part 1–4 và thi Listening với các bộ ETS, YBM và HACKER." icon={Headphones} />
    <div className="space-y-4"><SegTabs label="Chế độ luyện nghe" items={availableModes} value={visibleMode} onChange={setMode} /><ChipGroup label="Bộ đề Listening" items={COLLECTIONS} value={collection} onChange={setCollection} /></div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-semibold text-ink">{COLLECTIONS.find(c=>c.id===collection)?.label} · {tests.length} test</h2><p className="mt-1 text-sm text-muted">{tests[0]?.hasReading ? "Có Reading cùng số test — có thể thi cả hai kỹ năng trong thư viện đề." : "Listening 100 câu/test, có audio và đáp án."}</p></div>
      <Link className="btn btn-outline-primary btn-sm" href={`/tests?set=${collection}`}>Thư viện đề <ArrowRight className="size-4" /></Link>
    </div>
    {visibleMode === "dictation" ? <DictationCatalog tests={tests} /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tests.map(test=><ListeningTestCard key={test.id} test={test} mode={visibleMode} />)}</div>}
  </div>;
}

function ListeningTestCard({test,mode}:{test:EtsIndexEntry;mode:string}) {
  const {startSession,sessions,testProgress,hydrated}=useDemoStore();
  const router=useRouter(); const {toast}=useToast(); const [busy,setBusy]=useState(false);
  const part=mode.startsWith("part")?Number(mode.slice(4)):null;
  const active=Object.values(sessions).find(s=>s.testId===test.id&&s.status==="active"&&s.questionNumbers.length>0&&s.questionNumbers.every(n=>n<=100)&&(!part||s.questionNumbers.every(n=>part===1?n<=6:part===2?n>=7&&n<=31:part===3?n>=32&&n<=70:n>=71)));
  const answered=Object.keys(testProgress[test.id]?.results??{}).filter(n=>Number(n)<=100).length;
  const start=async(exam:boolean, selectedPart=part)=>{
    setBusy(true);
    try {
      const data=await EXAM_LOADERS[test.id]();
      const questions=data.questions.filter(q=>q.part<=4&&(!selectedPart||q.part===selectedPart));
      const id=startSession({testId:test.id,mode:exam?"exam":"practice",questionNumbers:questions.map(q=>q.number),deadline:null,phase:exam?"listening":undefined,label:exam?"Thi thử · Listening":`Luyện tập · ${selectedPart?`Part ${selectedPart}`:"Listening"}`});
      router.push(`/exam/${id}`);
    } catch {toast("Không tải được đề. Vui lòng thử lại.",{tone:"warning"});setBusy(false);}
  };
  return <article className="card card-hover flex flex-col p-5">
    <div className="flex items-center justify-between gap-2"><h3 className="text-xl font-semibold text-ink">Test {test.number}</h3><span className="badge badge-primary">{part?`Part ${part}`:"100 câu"}</span></div>
    <p className="mt-2 text-sm text-muted">{part?`${PART_NAMES[part]} · ${test.parts[String(part)]} câu`: `${Math.floor((Math.max(2700,test.listeningDuration??2700))/60)} phút thi · Audio theo nhóm câu · Part 1–4`}</p>
    {test.hasReading && <Link href={`/tests?set=${test.collectionId}`} className="mt-2 text-xs font-semibold text-primary hover:underline">Có Reading cùng test →</Link>}
    {!test.hasReading && <p className="mt-2 text-sm text-warning-ink">Reading đang chờ sửa dữ liệu nguồn bị trùng câu.</p>}
    {!!test.missingAudio && <p className="mt-2 text-sm text-warning-ink">Thiếu audio {test.missingAudio} câu · chỉ mở luyện tập.</p>}
    <div className="my-4 rounded-xl bg-canvas px-3 py-2 text-sm text-ink-soft">{answered?`Đã luyện ${answered}/100 câu Listening`:"Chưa luyện Listening"}</div>
    {mode==="dictation" ? <div className="grid grid-cols-2 gap-2">{[1,2,3,4].map(p=><Link key={p} className="btn btn-outline-primary btn-sm" href={`/listening/${test.id}/dictation?part=${p}`}><NotebookPen className="size-4" />Part {p}</Link>)}</div> : <div className="mt-auto flex flex-wrap gap-2">
      {active ? <Link className="btn btn-primary flex-1" href={`/exam/${active.id}`}>Tiếp tục bài đang làm <ArrowRight className="size-4" /></Link> : <>
        {!part && <button type="button" className="btn btn-outline flex-1" disabled={busy || !hydrated || !!test.missingAudio} onClick={()=>start(true)}><Play className="size-4" />Thi Listening</button>}
        <button type="button" className="btn btn-primary flex-1" disabled={busy || !hydrated} onClick={()=>start(false)}><BookOpen className="size-4" />Luyện {part?`Part ${part}`:"tập"}</button>
      </>}
    </div>}
    {test.collectionId === "ybm-2025" && mode!=="dictation" && <Link className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline" href={`/listening/${test.id}/dictation?part=${part??3}`}><NotebookPen className="size-4" />Nghe chép theo nhóm câu</Link>}
  </article>;
}
