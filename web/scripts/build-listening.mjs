import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'web/src/data/listening');
fs.mkdirSync(output, { recursive: true });
const index = [];
for (const year of [2023, 2024, 2025, 2026]) {
  for (let number = 1; number <= 10; number++) {
    const id = `yts${year}-t${number}`;
    const source = `yts/YTS${year}/T${String(number).padStart(2, '0')}/audio`;
    const audioRoot = path.join(root, source);
    const raw = fs.readFileSync(path.join(audioRoot, 'manifest.json'));
    const manifest = JSON.parse(raw);
    const publicRoot = path.join(root, 'web/public/listening', id);
    fs.mkdirSync(publicRoot, { recursive: true });
    const asset = relative => {
      if (!relative) throw new Error(`${id}: missing media path`);
      const file = path.resolve(audioRoot, relative);
      if (!file.startsWith(audioRoot + path.sep) || !fs.existsSync(file)) throw new Error(`${id}: missing asset ${relative}`);
      const target = path.join(publicRoot, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(file, target);
      return `/listening/${id}/${relative}`;
    };
    const groups = [], questions = [], parts = {}, counts = {};
    let duration = 0;
    for (const part of manifest.parts) {
      parts[part.part] = { directionsAudio: asset(part.directions.audio), fullAudio: asset(part.full_audio), duration: part.full_duration };
      duration += part.full_duration;
      counts[part.part] = 0;
      for (const item of part.items) {
        const from = item.numbers[0], to = item.numbers.at(-1);
        const imagePath = item.image || (item.graphic ? `${item.folder}/graphic.webp` : null);
        const image = imagePath ? asset(imagePath) : null;
        if (part.part === 1 && !image) throw new Error(`${id}: missing photograph ${from}`);
        const clips = item.segments.filter(s => s.dictation && s.audio).map(s => ({ id: `${item.id}-${s.id}`, text: s.dictation_text || s.text, audio: asset(s.audio), speaker: s.speaker, voice: s.voice, role: s.role }));
        for (const q of item.questions) {
          if (q.dictation_audio) clips.push({ id: `${item.id}-q${q.number}`, text: q.dictation_text || q.printed_question, audio: asset(q.dictation_audio), speaker: 'NARRATOR', voice: 'US_M', role: 'question' });
          if (!q.answer || !q.options[q.answer] || !q.explanation_vi) throw new Error(`${id}: invalid question ${q.number}`);
          questions.push({ number: q.number, part: part.part, groupId: item.id, stem: part.part <= 2 ? '' : q.printed_question, options: Object.entries(q.options).map(([key, text]) => ({ key, text })), answer: q.answer, explanation: q.explanation_vi });
          counts[part.part]++;
        }
        groups.push({ id: item.id, from, to, part: part.part, kind: part.part <= 2 ? 'question' : part.part === 3 ? 'conversation' : 'talk', passage: '', listening: {
          audio: asset(item.audio.item || item.audio.main), conversationAudio: asset(item.audio.main), duration: item.duration.item || item.duration.main,
          instructions: item.segments.filter(s => ['item_opening', 'set_opening'].includes(s.role)).map(s => s.text).join(' '),
          transcript: item.segments.filter(s => ['speech', 'prompt', 'option'].includes(s.role)).map(s => `${s.speaker}: ${s.text}`).join('\n'),
          speakers: item.speakers, image, imagePending: false, graphic: null, clips,
        } });
      }
    }
    if (JSON.stringify(questions.map(q => q.number)) !== JSON.stringify(Array.from({ length: 100 }, (_, i) => i + 1)) || JSON.stringify(Object.values(counts)) !== '[6,25,39,30]') throw new Error(`${id}: invalid Listening coverage`);
    const contentHash = crypto.createHash('sha256').update(raw).digest('hex');
    const assembled = path.join(publicRoot, 'full_test.mp3');
    const stamp = path.join(publicRoot, 'full_test.sha256');
    if (!fs.existsSync(assembled) || !fs.existsSync(stamp) || fs.readFileSync(stamp, 'utf8') !== contentHash) {
      const inputs = manifest.parts.map(p => path.join(audioRoot, p.full_audio));
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', `concat:${inputs.join('|')}`, '-c', 'copy', assembled]);
      fs.writeFileSync(stamp, contentHash);
    }
    const hasReading = year === 2024 || year === 2026;
    const title = `YTS ${year} · Test ${number}`;
    fs.writeFileSync(path.join(output, `${id}.json`), JSON.stringify({ id, year, number, title, source, groups, questions, listening: { fullAudio: `/listening/${id}/full_test.mp3`, duration, missingPhotos: 0, contentHash, parts } }, null, 2) + '\n');
    index.push({ id, year, number, title, collectionId: `yts-${year}`, questionCount: hasReading ? 200 : 100, parts: { ...counts, ...(hasReading ? { 5: 30, 6: 16, 7: 54 } : {}) }, complete: true, hasReading, listeningDuration: duration, missingPhotos: 0 });
    console.log(`${id}: 100 questions, ${groups.length} groups, ${Math.round(duration)} seconds`);
  }
}
fs.writeFileSync(path.join(output, 'index.json'), JSON.stringify(index, null, 2) + '\n');
fs.writeFileSync(path.join(output, 'loaders.ts'), `// Generated by scripts/build-listening.mjs\nimport type { EtsTest } from "@/types/domain";\nexport const LISTENING_LOADERS: Record<string, () => Promise<EtsTest>> = {\n${index.map(t => `  "${t.id}": () => import("./${t.id}.json").then(m => m.default as unknown as EtsTest),`).join('\n')}\n};\n`);
