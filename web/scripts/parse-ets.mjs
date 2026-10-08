#!/usr/bin/env node
/**
 * Chuyển đề Reading (Part 5–7) dạng text trong `../ets 2024` và `../ets 2026`
 * thành fixture JSON cho UI: `src/data/ets/<id>.json` + `src/data/ets/index.json`.
 *
 * Chạy: `npm run parse:ets` (đọc lại toàn bộ, ghi đè file cũ). Không sửa file nguồn.
 * Cảnh báo (thiếu câu, thiếu đáp án, số lựa chọn lạ) được in ra để rà soát tay.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outDir = path.resolve(here, "../src/data/ets");
const SOURCES = [
  { dir: "ets 2024", year: 2024 },
  { dir: "ets 2026", year: 2026 },
];

const RE_PART = /^\W*PART\s+([5-7])\b/i;
const RE_GROUP = /^\W*Questions?\s+(\d{3})\s*(?:[-–—]|to|and)\s*(\d{3})\s+refers?\s+to\s+the\s+following\s+(.+?)\.?\s*$/i;
const RE_Q = /^\W{0,4}(\d{3})\s*[.)]\s*(.*)$/;
const RE_OPT_START = /^\s*\(([A-D])\)\s*/;

function splitOptions(text) {
  // "(A) foo (B) bar" -> [["A","foo"],["B","bar"]]
  const parts = text.split(/\(([A-D])\)\s*/).slice(1);
  const out = [];
  for (let i = 0; i < parts.length; i += 2) out.push([parts[i], parts[i + 1].trim()]);
  return out;
}

function parseTest(src) {
  const lines = src.replace(/\r/g, "").split("\n");
  const questions = [];
  const groups = [];
  let part = 5;
  let group = null; // { id, from, to, kind, passage: [] }
  let q = null;
  let collectingPassage = false;

  const flushQ = () => {
    if (q) questions.push({ ...q, stem: q.stem.trim() });
    q = null;
  };

  const startQ = (n, rest) => {
    flushQ();
    collectingPassage = false;
    if (group && (n < group.from || n > group.to)) group = null;
    q = { number: n, part, groupId: group?.id ?? null, stem: "", options: {} };
    if (RE_OPT_START.test(rest)) for (const [k, v] of splitOptions(rest)) q.options[k] = v;
    else q.stem = rest;
  };
  const expected = () => {
    const last = q?.number ?? questions.at(-1)?.number ?? 100;
    return group ? Math.max(last + 1, group.from) : last + 1;
  };
  const nextNonEmpty = (i) => {
    for (let j = i + 1; j < lines.length; j++) if (lines[j].trim()) return lines[j].trim();
    return "";
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const t = line.trim();
    let m;

    if ((m = t.match(RE_PART))) {
      flushQ();
      part = Number(m[1]);
      group = null;
      collectingPassage = false;
      continue;
    }
    if ((m = t.match(RE_GROUP))) {
      flushQ();
      group = { id: `g${m[1]}`, from: Number(m[1]), to: Number(m[2]), kind: m[3].trim(), part, passage: [] };
      groups.push(group);
      collectingPassage = true;
      continue;
    }
    if ((m = t.match(RE_Q)) && Number(m[1]) >= 101 && Number(m[1]) <= 200) {
      startQ(Number(m[1]), m[2]);
      continue;
    }
    // Lỗi nguồn 1: câu hỏi dính vào cuối dòng bảng/đoạn văn ("... 7:00 P.M. 149. What is ...")
    if (group && (m = t.match(/^(.*\S)\s+(\d{3})\.\s+(.+)$/)) && Number(m[2]) === expected()) {
      if (collectingPassage) group.passage.push(m[1]);
      startQ(Number(m[2]), m[3]);
      continue;
    }
    // Lỗi nguồn 2: đánh số sai ("6. For whom ...") nhưng dòng kế tiếp là lựa chọn (A)
    if (group && part === 7 && (m = t.match(/^(\d{1,2})\.\s+(.+)$/)) && RE_OPT_START.test(nextNonEmpty(i)) && expected() <= group.to) {
      startQ(expected(), m[2]);
      continue;
    }

    if (q && RE_OPT_START.test(t)) {
      for (const [k, v] of splitOptions(t)) q.options[k] = v;
      continue;
    }
    if (collectingPassage && group) {
      group.passage.push(line);
      continue;
    }
    if (q && t && Object.keys(q.options).length === 0) q.stem += ` ${t}`;
  }
  flushQ();

  for (const g of groups) g.passage = g.passage.join("\n").replace(/^\n+|\n+$/g, "").replace(/\n{3,}/g, "\n\n");
  return { questions, groups };
}

function parseKey(src) {
  const answers = {};
  const explanations = {};
  for (const raw of src.replace(/\r/g, "").split("\n")) {
    const t = raw.trim();
    const pairs = [...t.matchAll(/(?:^|\s)(\d{3})\s+\(?([A-D])\)?(?=\s|$|\.)/g)];
    if (!pairs.length) continue;
    if (pairs.length === 1 && t.startsWith(pairs[0][1])) {
      const [whole, n, a] = pairs[0];
      answers[n] = a;
      const exp = t.slice(t.indexOf(whole.trim()) + whole.trim().length).trim();
      if (exp) explanations[n] = exp;
    } else {
      for (const [, n, a] of pairs) answers[n] = a;
    }
  }
  // Honor explicit corrections supplied in the local answer-key notes.
  for (const match of src.matchAll(/Câu\s+(\d{3})[^\n]*?đáp án đúng phải là\s+([A-D])[^\n]*/gi)) {
    answers[match[1]] = match[2];
    explanations[match[1]] = match[0].replace(/\)\.?$/, "");
  }
  return { answers, explanations };
}

fs.mkdirSync(outDir, { recursive: true });
const index = [];
let warnings = 0;
const warn = (msg) => {
  warnings++;
  console.warn(`  ⚠ ${msg}`);
};

for (const { dir, year } of SOURCES) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) continue;
  const files = fs.readdirSync(abs).filter((f) => /^Read_test\d+\.md$/.test(f));
  for (const f of files.sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)))) {
    const num = Number(f.match(/\d+/)[0]);
    const id = `ets${year}-t${num}`;
    console.log(`${dir}/${f} → ${id}.json`);
    const { questions, groups } = parseTest(fs.readFileSync(path.join(abs, f), "utf8"));
    const keyFile = path.join(abs, f.replace(".md", "_key.md"));
    const { answers, explanations } = fs.existsSync(keyFile) ? parseKey(fs.readFileSync(keyFile, "utf8")) : { answers: {}, explanations: {} };
    if (!fs.existsSync(keyFile)) warn("không có file đáp án");

    const byNum = new Map(questions.map((q) => [q.number, q]));
    const missing = [];
    for (let n = 101; n <= 200; n++) if (!byNum.has(n)) missing.push(n);
    if (missing.length) warn(`thiếu câu: ${missing.join(", ")}`);
    const out = [];
    for (const q of [...byNum.values()].sort((a, b) => a.number - b.number)) {
      const opts = Object.entries(q.options).sort(([a], [b]) => a.localeCompare(b)).map(([key, text]) => ({ key, text }));
      if (opts.length !== 4) warn(`câu ${q.number}: ${opts.length} lựa chọn`);
      const answer = answers[q.number] ?? null;
      if (!answer) warn(`câu ${q.number}: thiếu đáp án`);
      out.push({ number: q.number, part: q.part, groupId: q.groupId, stem: q.stem, options: opts, answer, explanation: explanations[q.number] ?? null });
    }

    const test = {
      id,
      year,
      number: num,
      title: `ETS ${year} · Test ${num}`,
      source: `${dir}/${f}`,
      groups: groups.map(({ id: gid, from, to, kind, part, passage }) => ({ id: gid, from, to, kind, part, passage })),
      questions: out,
    };
    fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify(test, null, 1));
    index.push({
      id,
      year,
      number: num,
      title: test.title,
      questionCount: out.length,
      parts: { 5: out.filter((q) => q.part === 5).length, 6: out.filter((q) => q.part === 6).length, 7: out.filter((q) => q.part === 7).length },
      complete: missing.length === 0 && out.every((q) => q.answer && q.options.length === 4),
    });
  }
}

fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify(index, null, 1));
fs.writeFileSync(
  path.join(outDir, "loaders.ts"),
  `// File sinh tự động bởi scripts/parse-ets.mjs — không sửa tay.\n` +
    `import type { EtsTest } from "@/types/domain";\n\n` +
    `export const ETS_LOADERS: Record<string, () => Promise<EtsTest>> = {\n` +
    index.map((t) => `  "${t.id}": () => import("./${t.id}.json").then((m) => m.default as unknown as EtsTest),`).join("\n") +
    `\n};\n`,
);
console.log(`\n${index.length} đề · ${warnings} cảnh báo → ${path.relative(process.cwd(), outDir)}`);
