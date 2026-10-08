#!/usr/bin/env node
// Reproducible original YTS content. No ETS text is read or transformed here.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const year=Number(process.argv[2] ?? 2026);
if (![2024,2026].includes(year)) throw new Error('Supported editions: 2024, 2026');
const contentDir=year===2024?'yts2024':'yts';
const {PART5}=await import(`./${contentDir}/part5.mjs`);
const {part6,part7}=await import(`./${contentDir}/passages.mjs`);
const {TRACKS}=await import(`./${contentDir}/scenarios.mjs`);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,`web/src/data/${contentDir}`);
const md=path.join(root,`yts ${year}`);
fs.mkdirSync(out,{recursive:true}); fs.mkdirSync(md,{recursive:true});
const letters=['A','B','C','D'];
function shuffledAnswerOrder(testNo) {
 let state=(year ^ (testNo*0x45d9f3b)) >>> 0;
 const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
 const order=Array.from({length:100},(_,i)=>i%4);
 for(let j=order.length-1;j>0;j--) { const k=Math.floor(random()*(j+1));[order[j],order[k]]=[order[k],order[j]]; }
 return order;
}
const answerOrders=Array.from({length:10},(_,i)=>shuffledAnswerOrder(i+1));
function question(spec,number,part,groupId,testNo) {
 const values=[spec.answer,...spec.distractors];
 if(new Set(values).size!==4) throw new Error(`Ambiguous/repeated options: ${testNo}/${number}`);
 // Balanced but shuffled key positions: no A-B-C-D answer cycle.
 const correctPosition=answerOrders[testNo-1][number-101];
 const offset=(number+testNo)%3;
 const distractors=spec.distractors.map((_,j)=>spec.distractors[(j+offset)%3]);
 const ordered=[...distractors]; ordered.splice(correctPosition,0,spec.answer);
 return {number,part,groupId,stem:spec.stem,options:ordered.map((text,j)=>({key:letters[j],text})),answer:letters[ordered.indexOf(spec.answer)],explanation:spec.explanation,skill:spec.skill??spec.topic,paraphrases:spec.paraphrases??[]};
}
const asText=d=>[d.heading,d.content,d.table? [d.table.headers.join(' | '),...d.table.rows.map(r=>r.join(' | '))].join('\n'):''].filter(Boolean).join('\n\n');
const index=[];
for(let i=0;i<10;i++) {
 const number=i+1, id=`yts${year}-t${number}`;
 const test={id,year,number,title:`YTS ${year} · Test ${number}`,source:`yts ${year}/Read_test${number}.md`,editorialTrack:TRACKS[i].name,groups:[],questions:[]};
 // Coprime permutation varies the progression of sentence-level targets.
 for(let j=0;j<30;j++) {
  const b=PART5[(j*7+i*3)%30];
  test.questions.push(question({...b,stem:b.stems[i],explanation:`${b.answer}: ${b.rationale}`},101+j,5,null,number));
 }
 let n=131;
 const rotate = (xs, by) => [...xs.slice(by % xs.length), ...xs.slice(0, by % xs.length)];
 const p6=rotate(part6(i),i);
 const p7=part7(i);
 const singles=rotate(p7.slice(0,10),i);
 const doubles=rotate(p7.slice(10,12),i);
 const triples=rotate(p7.slice(12),i);
 for(const [part,entries] of [[6,p6],[7,[...singles,...doubles,...triples]]]) {
  for(const entry of entries) {
   const from=n, to=n+entry.questions.length-1, gid=`g${from}`;
   const documents=part===6 ? entry.documents.map(d => {
     const oldNumbers=[...d.content.matchAll(/\((\d{3})\)/g)].map(m=>Number(m[1]));
     return {...d,content:d.content.replace(/\((\d{3})\)/g, (_,num)=>`(${from+oldNumbers.indexOf(Number(num))})`)};
   }) : entry.documents;
   const group={id:gid,from,to,part,kind:entry.kind,documents,passage:documents.map(asText).join('\n\n────────────────────\n\n')};
   test.groups.push(group);
   for(const spec of entry.questions) test.questions.push(question(spec,n++,part,gid,number));
  }
 }
 if(n!==201||test.questions.length!==100) throw new Error(`${id} does not contain 100 questions`);
 fs.writeFileSync(path.join(out,id+'.json'),JSON.stringify(test,null,2)+'\n');
 index.push({id,year,number,title:test.title,collectionId:`yts-${year}`,editorialTrack:TRACKS[i].name,questionCount:100,parts:{5:30,6:16,7:54},complete:true});
 let reading=`# ${test.title} — Reading\n\n${TRACKS[i].name}\n\n100 questions · 75 minutes · Original practice material\n\n`;
 for(const part of [5,6,7]) {
  reading+=`## PART ${part}: ${({5:'INCOMPLETE SENTENCES',6:'TEXT COMPLETION',7:'READING COMPREHENSION'})[part]}\n\n`;
  let last=null;
  for(const x of test.questions.filter(x=>x.part===part)) {
   if(x.groupId&&last!==x.groupId) {
    const g=test.groups.find(g=>g.id===x.groupId);last=x.groupId;
    reading+=`### Questions ${g.from}–${g.to} refer to the following ${g.kind}.\n\n`;
    for(const d of g.documents) {
     reading+=`**${d.heading}**\n\n${d.content}\n\n`;
     if(d.table) reading+=`| ${d.table.headers.join(' | ')} |\n| ${d.table.headers.map(()=> '---').join(' | ')} |\n${d.table.rows.map(r=>'| '+r.join(' | ')+' |').join('\n')}\n\n`;
    }
   }
   reading+=`${x.number}. ${x.stem||'Choose the best answer for the numbered blank.'}\n${x.options.map(o=>`   (${o.key}) ${o.text}`).join('\n')}\n\n`;
  }
 }
 fs.writeFileSync(path.join(md,`Read_test${number}.md`),reading);
 let key=`# ${test.title} — Đáp án và giải thích\n\nĐề luyện tập do YTS biên soạn; không phải đề thi chính thức.\n\n`;
 for(const part of [5,6,7]) {
  key+=`## Part ${part}\n\n`;
  for(const x of test.questions.filter(x=>x.part===part)) {
   const correct=x.options.find(o=>o.key===x.answer).text;
   key+=`### ${x.number}. ${x.answer} — ${correct}\n\n${x.explanation}\n\n`;
   if(x.paraphrases.length) key+=x.paraphrases.map(p=>`- ${p.source} → ${p.target}: ${p.meaning}`).join('\n')+'\n\n';
  }
 }
 fs.writeFileSync(path.join(md,`Read_test${number}_key.md`),key);
}
fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(index,null,2)+'\n');
fs.writeFileSync(path.join(out,'loaders.ts'),`// Generated by scripts/build-yts.mjs\nimport type { EtsTest } from "@/types/domain";\nexport const YTS_LOADERS: Record<string, () => Promise<EtsTest>> = {\n${index.map(t=>`  "${t.id}": () => import("./${t.id}.json").then(m => m.default as unknown as EtsTest),`).join('\n')}\n};\n`);
console.log(`YTS ${year}: 10 tests, 1,000 questions, 190 passage groups; JSON + 20 Markdown files generated.`);
