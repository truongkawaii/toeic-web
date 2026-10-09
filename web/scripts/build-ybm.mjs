import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(web, 'src/data/ybm');
fs.mkdirSync(output, { recursive: true });
const index = [];
const clean = text => (text ?? '').replace(/^\([A-D]\)\s*/, '').trim();
const partFor = n => n <= 6 ? 1 : n <= 31 ? 2 : n <= 70 ? 3 : n <= 100 ? 4 : n <= 130 ? 5 : n <= 146 ? 6 : 7;
for (let number = 1; number <= 10; number++) {
  const id = `ybm2025-t${number}`;
  const testRoot = path.join(web, 'public/YBM 2025', `t${number}`);
  const listeningRoot = fs.existsSync(path.join(testRoot, 'listening/listening.json')) ? path.join(testRoot, 'listening') : testRoot;
  const raw = JSON.parse(fs.readFileSync(path.join(listeningRoot, 'listening.json'), 'utf8'));
  const readingPath = path.join(testRoot, 'reading/reading.json');
  const reading = fs.existsSync(readingPath) ? JSON.parse(fs.readFileSync(readingPath, 'utf8')) : [];
  const asset = file => {
    if (!fs.existsSync(file) || !fs.statSync(file).size) throw new Error(`Missing asset: ${file}`);
    return '/' + path.relative(path.join(web, 'public'), file).split(path.sep).map(encodeURIComponent).join('/');
  };
  const groups = [], questions = [], counts = {};
  let duration = 0, missingAudio = 0;
  for (const [position, source] of [...raw, ...reading].entries()) {
    const from = source.questions[0].number, to = source.questions.at(-1).number;
    const part = partFor(from), groupId = `${id}-g${position}`;
    const documents = (source.passages ?? []).map(p => ({ heading: '', content: p.text ?? '' }));
    const group = { id: groupId, from, to, part, kind: part <= 2 ? 'question' : part === 3 ? 'conversation' : part === 4 ? 'talk' : 'passage', passage: documents.map(d => d.content).join('\n\n'), ...(documents.length ? { documents } : {}) };
    const sourceRange = String(source.range);
    const original = path.join(listeningRoot, source.audioFile || `audio/q${sourceRange}.aac`);
    if (part <= 4 && fs.existsSync(original)) {
      // Local supplementary files take precedence over stale source hasAudio flags.
      // Downloads contain transport metadata between ADTS frames; extract complete AAC frames.
      const bytes = fs.readFileSync(original), frames = [];
      for (let offset = 0; offset + 7 < bytes.length;) {
        if (bytes[offset] === 255 && (bytes[offset + 1] & 246) === 240 && bytes[offset + 2] === 80 && (bytes[offset + 3] & 252) === 128) {
          const size = ((bytes[offset + 3] & 3) << 11) | (bytes[offset + 4] << 3) | (bytes[offset + 5] >> 5);
          if (size >= 7 && offset + size <= bytes.length) { frames.push(bytes.subarray(offset, offset + size)); offset += size; continue; }
        }
        offset++;
      }
      if (!frames.length) throw new Error(`No AAC frames: ${original}`);
      const mediaRoot = path.join(web, 'public/ybm2025', id);
      fs.mkdirSync(mediaRoot, { recursive: true });
      const file = path.join(mediaRoot, `q${source.range}.aac`);
      fs.writeFileSync(file, Buffer.concat(frames));
      const audio = asset(file);
      const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' }).trim());
      if (!Number.isFinite(seconds)) throw new Error(`Invalid audio duration: ${file}`);
      duration += seconds;
      const imageFile = ["png", "webp", "jpg", "jpeg"].map(ext => path.join(listeningRoot, `images/q${source.range}.${ext}`)).find(file => fs.existsSync(file));
      const image = imageFile ? asset(imageFile) : null;
      if (part === 1 && !image) throw new Error(`Missing photograph: ${id} Q${from}`);
      const transcript = source.transcript || source.questions.map(q => [q.question, ...q.options.map(o => o.text)].filter(Boolean).join('\n')).join('\n');
      // Source provides group audio, not sentence cuts: preserve one accurate clip per group.
      group.listening = { audio, conversationAudio: audio, duration: seconds, instructions: '', transcript, speakers: {}, image, imagePending: false, graphic: null, clips: transcript ? [{ id: `${groupId}-clip`, text: transcript, audio, speaker: '', voice: '', role: 'speech' }] : [] };
    }
    if (part <= 4 && !group.listening) {
      missingAudio += source.questions.length;
      group.listening = { audio: '', conversationAudio: '', duration: 0, instructions: '', transcript: source.questions.map(q => q.question).join('\n'), speakers: {}, image: null, imagePending: false, graphic: null, clips: [] };
    }
    groups.push(group);
    for (const q of source.questions) {
      if (!q.options.some(o => o.key === q.answer)) throw new Error(`Invalid answer: ${id} Q${q.number}`);
      counts[part] = (counts[part] ?? 0) + 1;
      questions.push({ number: q.number, part, groupId, stem: part === 1 ? '' : q.question ?? '', options: q.options.map(o => ({ key: o.key, text: clean(o.text) })), answer: q.answer, explanation: q.explanationText || (q.explanation ?? []).filter(e => /giải thích/i.test(e.title)).map(e => e.content).join('\n') || null });
    }
  }
  const expected = reading.length ? 200 : 100;
  if (questions.length !== expected || questions.some((q, i) => q.number !== i + 1)) throw new Error(`Invalid question coverage: ${id}`);
  const title = `YBM 2025 · Test ${number}`;
  const test = { id, year: 2025, number, title, source: 'YBM 2025', groups, questions, listening: { duration, missingPhotos: 0, contentHash: '', parts: {} } };
  fs.writeFileSync(path.join(output, `${id}.json`), JSON.stringify(test, null, 2) + '\n');
  index.push({ id, year: 2025, number, title, collectionId: 'ybm-2025', questionCount: expected, parts: counts, complete: missingAudio === 0, missingAudio, hasReading: reading.length > 0, listeningDuration: duration, missingPhotos: 0 });
  console.log(`${title}: ${expected} questions`);
}
fs.writeFileSync(path.join(output, 'index.json'), JSON.stringify(index, null, 2) + '\n');
fs.writeFileSync(path.join(output, 'loaders.ts'), `// Generated by scripts/build-ybm.mjs\nimport type { EtsTest } from '@/types/domain';\nexport const YBM_LOADERS: Record<string, () => Promise<EtsTest>> = {\n${index.map(t => `  '${t.id}': () => import('./${t.id}.json').then(m => m.default as unknown as EtsTest),`).join('\n')}\n};\n`);
