import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
export const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
export function auditReading(){
 const tests=[];
 for(const dir of fs.readdirSync(path.join(root,'web/src/data'))){
  if(!/^yts(?:\d{4})?$/.test(dir))continue;
  for(const file of fs.readdirSync(path.join(root,'web/src/data',dir))){
   if(!/^yts\d{4}-t\d+\.json$/.test(file))continue;
   tests.push(JSON.parse(fs.readFileSync(path.join(root,'web/src/data',dir,file))));
  }
 }
 const sets=new Map(),errors=[],skills={};
 for(const t of tests){
  if(t.questions.length!==100)errors.push(`${t.id}: question count`);
  for(const p of [5,6,7])if(t.questions.filter(q=>q.part===p).length!==({5:30,6:16,7:54})[p])errors.push(`${t.id}: part ${p} count`);
  for(const q of t.questions){
   const g=t.groups.find(g=>g.id===q.groupId);
   // Part 6 has no standalone stem: compare the complete blank-bearing sentence,
   // not an empty string or the complete (possibly unrelated) passage.
   const context=q.part===6?g.documents.map(d=>d.content).join('\n').split(/(?<=[.!?])\s+|\n\n/).find(s=>s.includes(`(${q.number})`)).replace(/\(\d{3}\)/g,'(blank)'):q.stem;
   const signature=JSON.stringify([q.part,normalize(context),q.options.map(o=>normalize(o.text)).sort()]);
   const entries=sets.get(signature)||[];entries.push(`${t.id}/${q.number}`);sets.set(signature,entries);
   const texts=q.options.map(o=>normalize(o.text));
   if(new Set(texts).size!==4)errors.push(`${t.id}/${q.number}: repeated options`);
   if(!q.options.find(o=>o.key===q.answer))errors.push(`${t.id}/${q.number}: invalid key`);
   if(!q.explanation||q.explanation.length<70)errors.push(`${t.id}/${q.number}: insufficient explanation`);
   skills[q.skill]=(skills[q.skill]||0)+1;
  }
 }
 const duplicates=[...sets].filter(([,v])=>v.length>1).map(([signature,locations])=>({signature:JSON.parse(signature),locations}));
 return {testCount:tests.length,questionCount:tests.reduce((s,t)=>s+t.questions.length,0),duplicates:duplicates.length,duplicateOccurrences:duplicates.reduce((s,d)=>s+d.locations.length,0),redundantQuestions:duplicates.reduce((s,d)=>s+d.locations.length-1,0),byPart:Object.fromEntries([5,6,7].map(p=>[p,duplicates.filter(d=>d.signature[0]===p).length])),skills,errors,duplicateDetails:duplicates};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const report=auditReading();
 if(process.argv.includes('--save-baseline'))fs.writeFileSync(path.join(root,'docs/reading-audit-before.json'),JSON.stringify(report,null,2)+'\n');
 if(process.argv.includes('--report'))fs.writeFileSync(path.join(root,'docs/reading-audit-after.json'),JSON.stringify(report,null,2)+'\n');
 const {duplicateDetails,...summary}=report;console.log(JSON.stringify(summary,null,2));
 if(process.argv.includes('--check')&&(report.duplicates||report.errors.length))process.exitCode=1;
}
