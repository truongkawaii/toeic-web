import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.join(web, 'public');
const output = path.join(web, 'src/data/courses');
fs.mkdirSync(output, { recursive: true });
const index = [];
const clean = text => (text ?? '').replace(/^\([A-D]\)\s*/, '').trim();
const partFor = n => n <= 6 ? 1 : n <= 31 ? 2 : n <= 70 ? 3 : n <= 100 ? 4 : n <= 130 ? 5 : n <= 146 ? 6 : 7;
const collections = [['ETS 2026','ets-2026','ets2026',2026],['ETS 2024','ets-2024','ets2024',2024],['ETS 2023','ets-2023','ets2023',2023],['ETS 2022','ets-2022','ets2022',2022],['HACKER 2','hacker-2','hacker2',0],['HACKER 3','hacker-3','hacker3',0]];
const issues = [];
for (const [label, collectionId, prefix, year] of collections) for (let number = 1; number <= 10; number++) {
  const id = `${prefix}-t${number}`;
  const testRoot = path.join(sourceRoot, label, `t${number}`);
  const listeningRoot = fs.existsSync(path.join(testRoot, 'listening/listening.json')) ? path.join(testRoot, 'listening') : testRoot;
  const raw = JSON.parse(fs.readFileSync(path.join(listeningRoot, 'listening.json'), 'utf8'));
  const readingPath = path.join(testRoot, 'reading/reading.json');
  let reading = fs.existsSync(readingPath) ? JSON.parse(fs.readFileSync(readingPath, 'utf8')) : [];
  const numbers = reading.flatMap(g => g.questions.map(q => q.number));
  const readingIssue = new Set(numbers).size !== numbers.length;
  if (readingIssue) {
    issues.push({id, issue: 'Conflicting Reading groups; Reading withheld pending source correction.'});
    reading = [];
  }
  const mediaRoot = path.join(web, 'public/courses', id);
  fs.mkdirSync(mediaRoot, { recursive: true });
  const asset = file => {
    if (!fs.existsSync(file) || !fs.statSync(file).size) throw new Error(`Missing asset: ${file}`);
    const destination = path.join(mediaRoot, path.basename(file));
    if (file !== destination) fs.copyFileSync(file, destination);
    file = destination;
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
    const imageFile = ["png", "webp", "jpg", "jpeg"].map(ext => path.join(listeningRoot, `images/q${source.range}.${ext}`)).find(file => fs.existsSync(file));
    const image = part <= 4 && imageFile ? asset(imageFile) : null;
    const original = path.join(listeningRoot, source.audioFile || `audio/q${sourceRange}.aac`);
    if (part <= 4 && fs.existsSync(original)) {
      // Local supplementary files take precedence over stale source hasAudio flags.
      // Downloads contain transport metadata between ADTS frames; extract complete AAC frames.
      const bytes = fs.readFileSync(original), frames = [];
      const headers = new Map();
      for (let i = 0; i + 7 < bytes.length; i++) {
        if (bytes[i] === 255 && (bytes[i + 1] & 246) === 240) {
          const key = `${bytes[i + 1]}:${bytes[i + 2]}:${bytes[i + 3] & 252}`;
          headers.set(key, (headers.get(key) ?? 0) + 1);
        }
      }
      const header = [...headers].sort((a,b) => b[1]-a[1])[0]?.[0];
      for (let offset = 0; offset + 7 < bytes.length;) {
        if (bytes[offset] === 255 && `${bytes[offset + 1]}:${bytes[offset + 2]}:${bytes[offset + 3] & 252}` === header) {
          const size = ((bytes[offset + 3] & 3) << 11) | (bytes[offset + 4] << 3) | (bytes[offset + 5] >> 5);
          if (size >= 7 && offset + size <= bytes.length) { frames.push(bytes.subarray(offset, offset + size)); offset += size; continue; }
        }
        offset++;
      }
      if (!frames.length) throw new Error(`No AAC frames: ${original}`);
      const file = path.join(mediaRoot, `q${source.range}.aac`);
      fs.writeFileSync(file, Buffer.concat(frames));
      const audio = asset(file);
      const seconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file], { encoding: 'utf8' }).trim());
      if (!Number.isFinite(seconds)) throw new Error(`Invalid audio duration: ${file}`);
      duration += seconds;
      const transcript = source.transcript || source.questions.map(q => [q.question, ...q.options.map(o => o.text)].filter(Boolean).join('\n')).join('\n');
      // Source provides group audio, not sentence cuts: preserve one accurate clip per group.
      group.listening = { audio, conversationAudio: audio, duration: seconds, instructions: '', transcript, speakers: {}, image, imagePending: false, graphic: null, clips: [] };
    }
    if (part <= 4 && !group.listening) {
      missingAudio += source.questions.length;
      group.listening = { audio: '', conversationAudio: '', duration: 0, instructions: '', transcript: source.questions.map(q => q.question).join('\n'), speakers: {}, image, imagePending: part === 1 && !image, graphic: null, clips: [] };
    }
    groups.push(group);
    for (const q of source.questions) {
      if (!q.options.some(o => o.key === q.answer)) throw new Error(`Invalid answer: ${id} Q${q.number}`);
      counts[part] = (counts[part] ?? 0) + 1;
      questions.push({ number: q.number, part, groupId, stem: part === 1 ? '' : q.question ?? '', options: q.options.map(o => ({ key: o.key, text: clean(o.text) })), answer: q.answer, explanation: q.explanationText || (q.explanation ?? []).filter(e => /giải thích/i.test(e.title)).map(e => e.content).join('\n') || null });
    }
  }
  questions.sort((a,b) => a.number-b.number);
  if (missingAudio) issues.push({id, issue: 'Missing audio', questions: missingAudio});
  const expected = reading.length ? 200 : 100;
  if (questions.length !== expected || questions.some((q, i) => q.number !== i + 1)) throw new Error(`Invalid question coverage: ${id}`);
  const title = `${label} · Test ${number}`;
  const test = { id, year, number, title, source: label, groups, questions, listening: { duration, missingPhotos: 0, contentHash: '', parts: {} } };
  fs.writeFileSync(path.join(output, `${id}.json`), JSON.stringify(test, null, 2) + '\n');
  index.push({ id, year, number, title, collectionId, questionCount: expected, parts: counts, complete: missingAudio === 0, missingAudio, hasReading: reading.length > 0, readingIssue, listeningDuration: duration, missingPhotos: 0 });
  console.log(`${title}: ${expected} questions`);
}
fs.writeFileSync(path.join(output, 'index.json'), JSON.stringify(index, null, 2) + '\n');
fs.writeFileSync(path.join(output, 'loaders.ts'), `// Generated by scripts/build-courses.mjs\nimport type { EtsTest } from '@/types/domain';\nexport const COURSE_LOADERS: Record<string, () => Promise<EtsTest>> = {\n${index.map(t => `  '${t.id}': () => import('./${t.id}.json').then(m => m.default as unknown as EtsTest),`).join('\n')}\n};\n`);
fs.writeFileSync(path.join(output, 'issues.json'), JSON.stringify(issues, null, 2) + '\n');
