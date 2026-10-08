# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository shape

This repo has one real application (`web/`) plus raw/generated TOEIC content that feeds it:

- **`web/`** — the product: a Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + Tailwind v4 app. This is where almost all code changes happen.
- **`YBM 2025/`** — raw source test material (`t1`–`t10`, each with `listening/` and `reading/` subfolders: audio, images, transcripts) for one test collection.
- **`docs/generate/profiles/`** — per-test JSON "profiles" (`profile_<SET>_T<NN>.json`) distilled from source tests (ETS2023/2024/2026, YBM2025) for generating new listening content — vocabulary, situations, stats. These are structural/abstracted profiles, **not** official scripts, answers, or source images (see `docs/generate/profiles/README.md` for which profiles are incomplete and why).
- **`docs/voice/`** — standalone Python TTS experiments (`edge-tts` + ffmpeg) for generating TOEIC-style audio, unrelated to the Next.js build.
- **`toeic_blueprint.json`** — a large generated blueprint JSON (not hand-edited).

Comments and docs throughout the repo (including inside `web/`) are written in Vietnamese; match that convention when editing existing files.

**Known gap:** `web/`'s data-generation scripts (`parse-ets.mjs`, `build-listening.mjs`, and `build-yts.mjs`'s `scripts/yts`/`scripts/yts2024` content modules) read from sibling source directories (e.g. `../ets 2024`, `../ets 2026`, root-level `yts/YTS<year>/T<NN>/audio/`) that are not currently present in this repo. `web/src/data/*` (the generated fixture JSON the app imports at build time) is correspondingly empty, so `npm run dev`/`build`/`test` in `web/` will fail to resolve `@/data/...` imports until that source content is restored and the relevant generator script is run. Check `web/src/data/` before assuming the app builds.

## Commands

All app commands run from `web/`:

```bash
cd web
npm install
npm run dev            # http://localhost:3000 (Turbopack)
npm run build           # type-check + production build
npm run lint
npm test                 # vitest run — all *.test.ts under src/
npx vitest run src/lib/__tests__/ets.test.ts   # single test file
npx vitest watch src/lib/__tests__/ets.test.ts # watch mode for one file

npm run parse:ets        # regenerate src/data/ets/* from ../ets 2024, ../ets 2026 (source dirs currently absent)
npm run build:yts        # regenerate src/data/yts/* from scripts/yts (YTS 2026)
npm run build:yts:2024   # regenerate src/data/yts2024/* from scripts/yts2024
npm run build:listening   # regenerate src/data/listening/* + public/listening assets
```

There is no separate lint/test config beyond the above — `vitest.config.mts` restricts tests to `src/**/*.test.ts` with the `@` → `src` alias, matching `tsconfig.json`.

Optional UI smoke tests (require local Chrome + an ad hoc `playwright` install — see `web/README.md`):
```bash
npm install --no-save --package-lock=false playwright
YTS_BASE_URL=http://localhost:3000 node scripts/qa-yts.mjs            # or: qa-yts.mjs dictation / listening
```

`web/` has its own `CLAUDE.md` which imports `web/AGENTS.md` — an auto-regenerated file (by `next dev`) warning that this Next.js version has breaking changes vs. training data; read `node_modules/next/dist/docs/` before writing Next.js-specific code there.

## Architecture (`web/`)

**Client-only demo app, no backend.** There are no Next.js Route Handlers — every route under `src/app/` is a server page that wraps a client component in `<Suspense>`. All state (profile, goals, progress, exam sessions, attempts) lives in `src/lib/store.tsx`'s `DemoStoreProvider`, seeded from `src/lib/mock/fixtures.ts` and persisted to `localStorage` under key `toeic-practice.demo.v1`. "Reset demo data" in `/settings` just re-seeds this store.

**Domain types** are centralized in `src/types/domain.ts` — read this first when touching any feature; it's the shared vocabulary for profile/progress/vocab, and for the ETS/YTS test model (`EtsTest`, `EtsQuestion`, `EtsGroup`, `ListeningItem`, `ExamSession`, `Attempt`).

**Test content pipeline:** source material (ETS reading text files, YTS editorial content modules, YTS audio manifests) is transformed offline by the `scripts/*.mjs` build scripts into static per-test JSON fixtures under `src/data/{ets,yts,yts2024,listening}/`, each with an `index.json` and a `loaders.ts` of lazy `() => Promise<EtsTest>` loaders (one JSON chunk per test, dynamically imported only when a test is opened — see `src/lib/ets.ts`). `ETS_INDEX`/`EXAM_INDEX`/`EXAM_LOADERS` in `src/lib/ets.ts` merge all these sources into one lookup table keyed by test id; listening-only YTS entries get their reading half spliced in there too (`EXAM_LOADERS[entry.id]`).

**Exam flow:** `/exam/[sessionId]` is a full-screen runner (`src/components/exam/exam-runner.tsx`) driven by an `ExamSession` (answers, flags, deadline, `phase: "listening" | "reading"` for combined tests — see `src/lib/exam-session.ts` for the listening→reading handoff). Deadlines are absolute epoch ms so a page reload doesn't reset the clock; submission is idempotent because the resulting `Attempt.id` is deterministically derived from the session id (`attemptIdFor`), so double-submit can't duplicate results/XP. Grading (`gradeSession` in `src/lib/ets.ts`) splits questions into listening (`part <= 4`) vs reading (`part >= 5`) and computes a per-section illustrative score (`estimateReading`, scale 5–495) — explicitly not an official scoring table.

**Reading UI** (`src/components/learning/reading-view.tsx` and friends) renders test content with document-style typography (serif/sans toggle, paper background) rather than generic app chrome, because the content is literally exam passages/tables.

**Dictation feature** (`/listening/[testId]/dictation`) is a separate mini-app over the same listening fixtures — logic in `src/lib/dictation.ts` / `dictation-vocabulary.ts` / `use-dictation-progress.ts`.

When adding a new test collection, follow the existing pattern: produce source content → add/extend a `scripts/*.mjs` generator → emit `src/data/<set>/{index.json,loaders.ts,<id>.json}` → merge into the appropriate index/loaders map in `src/lib/ets.ts`.
