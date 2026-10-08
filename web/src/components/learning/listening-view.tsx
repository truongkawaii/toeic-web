"use client";

import { ArrowRight, BookOpen, Headphones, NotebookPen, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DictationCatalog } from "@/components/learning/dictation-catalog";
import { PageHero } from "@/components/learning/page-hero";
import { ChipGroup, SegTabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { EXAM_LOADERS, YTS_EXAM_INDEX } from "@/lib/ets";
import { useDemoStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import type { EtsIndexEntry } from "@/types/domain";

const COLLECTIONS=[2026,2025,2024,2023].map(year=>({id:`yts-${year}`,label:`YTS ${year}`}));
const MODES=[{id:"full",label:"Listening"},{id:"dictation",label:"Nghe chép"},...([1,2,3,4] as const).map(part=>({id:`part${part}`,label:`Part ${part}`}))];
const PART_NAMES:Record<number,string>={1:"Mô tả tranh",2:"Hỏi – đáp",3:"Hội thoại",4:"Bài nói"};

export function ListeningView() {
  const [collection,setCollection]=useQueryParam("set","yts-2026",COLLECTIONS.map(c=>c.id));
  const [mode,setMode]=useQueryParam("mode","full",MODES.map(m=>m.id));
  const tests=YTS_EXAM_INDEX.filter(t=>t.collectionId===collection);
  return <div className="container-app space-y-7">
    <PageHero eyebrow="Luyện nghe TOEIC" title={["Lắng nghe,","hiểu sâu,","tiến bộ mỗi ngày"]} description="40 test YTS 2023–2026. Luyện Part 1–4, thi Listening và nghe chép từng câu với audio của chính bộ đề." icon={Headphones} />
    <div className="space-y-4"><SegTabs label="Chế độ luyện nghe" items={MODES} value={mode} onChange={setMode} /><ChipGroup label="Bộ đề Listening" items={COLLECTIONS} value={collection} onChange={setCollection} /></div>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-semibold text-ink">{COLLECTIONS.find(c=>c.id===collection)?.label} · 10 test</h2><p className="mt-1 text-sm text-muted">{tests[0]?.hasReading ? "Có Reading cùng số test — có thể thi cả hai kỹ năng trong thư viện đề." : "Listening 100 câu/test, đủ audio, đáp án và giải thích."}</p></div>
      <Link className="btn btn-outline-primary btn-sm" href={`/tests?set=${collection}`}>Thư viện đề <ArrowRight className="size-4" /></Link>
    </div>
    {mode === "dictation" ? <DictationCatalog tests={tests} /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tests.map(test=><ListeningTestCard key={test.id} test={test} mode={mode} />)}</div>}
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
    <p className="mt-2 text-sm text-muted">{part?`${PART_NAMES[part]} · ${test.parts[String(part)]} câu`: `${Math.floor((test.listeningDuration??2700)/60)} phút audio · Part 1–4`}</p>
    {test.hasReading && <Link href={`/tests?set=yts-${test.year}`} className="mt-2 text-xs font-semibold text-primary hover:underline">Có Reading cùng test →</Link>}
    <div className="my-4 rounded-xl bg-canvas px-3 py-2 text-sm text-ink-soft">{answered?`Đã luyện ${answered}/100 câu Listening`:"Chưa luyện Listening"}</div>
    {mode==="dictation" ? <div className="grid grid-cols-2 gap-2">{[1,2,3,4].map(p=><Link key={p} className="btn btn-outline-primary btn-sm" href={`/listening/${test.id}/dictation?part=${p}`}><NotebookPen className="size-4" />Part {p}</Link>)}</div> : <div className="mt-auto flex flex-wrap gap-2">
      {active ? <Link className="btn btn-primary flex-1" href={`/exam/${active.id}`}>Tiếp tục bài đang làm <ArrowRight className="size-4" /></Link> : <>
        {!part && <button type="button" className="btn btn-outline flex-1" disabled={busy || !hydrated} onClick={()=>start(true)}><Play className="size-4" />Thi Listening</button>}
        <button type="button" className="btn btn-primary flex-1" disabled={busy || !hydrated} onClick={()=>start(false)}><BookOpen className="size-4" />Luyện {part?`Part ${part}`:"tập"}</button>
      </>}
    </div>}
    {mode!=="dictation" && <Link className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline" href={`/listening/${test.id}/dictation?part=${part??3}`}><NotebookPen className="size-4" />Nghe chép từng câu</Link>}
  </article>;
}
