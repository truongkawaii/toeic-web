"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Attempt, Deck, EtsTest, ExamSession, Module, Profile, TestProgress, TopicProgress, VocabGoal } from "@/types/domain";
import { seedAttempts, seedDecks, seedModules, seedProfile, seedTestProgress, seedTopicProgress } from "@/lib/mock/fixtures";
import { attemptIdFor, gradeSession } from "@/lib/ets";
import { advanceToReading, beginListeningSession } from "@/lib/exam-session";

/* ---------------------------------------------------------------------------
 * Demo store phía client. Giai đoạn UI: lưu localStorage để reload không mất
 * thao tác. Giai đoạn mock API sẽ thay bằng Route Handlers + repository.
 * ------------------------------------------------------------------------- */

type State = {
  profile: Profile;
  vocabGoal: VocabGoal;
  topicProgress: Record<string, TopicProgress>;
  testProgress: Record<string, TestProgress>;
  decks: Deck[];
  modules: Module[];
  sessions: Record<string, ExamSession>;
  attempts: Attempt[];
};

const STORAGE_KEY = "toeic-practice.demo.v1";

const seed = (): State => ({
  profile: seedProfile(),
  vocabGoal: { newPerDay: 20 },
  topicProgress: seedTopicProgress(),
  testProgress: seedTestProgress(),
  decks: seedDecks(),
  modules: seedModules(),
  sessions: {},
  attempts: seedAttempts(),
});

export type StartSessionInput = Pick<ExamSession, "testId" | "mode" | "questionNumbers" | "deadline" | "label" | "phase">;

type Actions = {
  updateProfile: (patch: Partial<Profile>) => void;
  setVocabGoal: (goal: VocabGoal) => void;
  resetTopic: (id: string) => void;
  resetTest: (id: string) => void;
  createDeck: (title: string) => Deck;
  renameDeck: (id: string, title: string) => void;
  deleteDeck: (id: string) => void;
  createModule: (title: string, deckId: string | null) => Module;
  renameModule: (id: string, title: string) => void;
  resetModule: (id: string) => void;
  deleteModule: (id: string) => void;
  /** Tạo phiên mới (huỷ phiên đang dở của cùng đề) và trả về id. */
  startSession: (input: StartSessionInput) => string;
  answerQuestion: (sessionId: string, number: number, key: string) => void;
  toggleFlag: (sessionId: string, number: number) => void;
  setCurrent: (sessionId: string, index: number) => void;
  beginListening: (sessionId: string, durationSeconds: number) => void;
  finishListening: (sessionId: string) => void;
  /** Idempotent: nộp lại phiên đã nộp không tạo thêm kết quả/XP. Trả về attemptId. */
  submitSession: (sessionId: string, test: EtsTest) => string;
  discardSession: (sessionId: string) => void;
  resetDemo: () => void;
};

type Ctx = State & Actions & { hydrated: boolean };

const StoreContext = createContext<Ctx | null>(null);

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}`;

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(seed);
  const [hydrated, setHydrated] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate từ localStorage một lần sau mount, tránh lệch SSR
      if (raw) setState({ ...seed(), ...JSON.parse(raw) });
    } catch {
      /* dữ liệu hỏng: dùng seed */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const patch = useCallback((fn: (s: State) => Partial<State>) => setState((s) => ({ ...s, ...fn(s) })), []);

  const actions = useMemo<Actions>(
    () => ({
      updateProfile: (p) => patch((s) => ({ profile: { ...s.profile, ...p } })),
      setVocabGoal: (g) => patch(() => ({ vocabGoal: g })),
      resetTopic: (id) =>
        patch((s) => {
          const next = { ...s.topicProgress };
          delete next[id];
          return { topicProgress: next };
        }),
      resetTest: (id) =>
        patch((s) => {
          const next = { ...s.testProgress };
          delete next[id];
          return { testProgress: next };
        }),
      createDeck: (title) => {
        const deck: Deck = { id: uid("deck"), title, visibility: "private" };
        patch((s) => ({ decks: [deck, ...s.decks] }));
        return deck;
      },
      renameDeck: (id, title) => patch((s) => ({ decks: s.decks.map((d) => (d.id === id ? { ...d, title } : d)) })),
      deleteDeck: (id) =>
        patch((s) => ({ decks: s.decks.filter((d) => d.id !== id), modules: s.modules.filter((m) => m.deckId !== id) })),
      createModule: (title, deckId) => {
        const mod: Module = { id: uid("mod"), title, deckId, total: 0, learned: 0 };
        patch((s) => ({ modules: [...s.modules, mod] }));
        return mod;
      },
      renameModule: (id, title) => patch((s) => ({ modules: s.modules.map((m) => (m.id === id ? { ...m, title } : m)) })),
      resetModule: (id) => patch((s) => ({ modules: s.modules.map((m) => (m.id === id ? { ...m, learned: 0 } : m)) })),
      deleteModule: (id) => patch((s) => ({ modules: s.modules.filter((m) => m.id !== id) })),
      startSession: (input) => {
        const id = uid("ses");
        patch((s) => {
          const sessions = Object.fromEntries(
            Object.entries(s.sessions).filter(([, x]) => !(x.status === "active" && x.testId === input.testId)),
          );
          sessions[id] = { ...input, id, answers: {}, flagged: [], current: 0, startedAt: Date.now(), status: "active" };
          return { sessions };
        });
        return id;
      },
      answerQuestion: (sid, n, key) =>
        patch((s) => {
          const ses = s.sessions[sid];
          if (!ses || ses.status !== "active") return {};
          if (!ses.questionNumbers.includes(n)) return {};
          if ((ses.phase === "listening" && n >= 101) || (ses.phase === "reading" && n <= 100)) return {};
          // Luyện tập: đã xem đáp án thì khoá câu
          if (ses.mode === "practice" && ses.answers[n]) return {};
          return { sessions: { ...s.sessions, [sid]: { ...ses, answers: { ...ses.answers, [n]: key } } } };
        }),
      toggleFlag: (sid, n) =>
        patch((s) => {
          const ses = s.sessions[sid];
          if (!ses) return {};
          const flagged = ses.flagged.includes(n) ? ses.flagged.filter((x) => x !== n) : [...ses.flagged, n];
          return { sessions: { ...s.sessions, [sid]: { ...ses, flagged } } };
        }),
      setCurrent: (sid, index) =>
        patch((s) => {
          const ses = s.sessions[sid];
          if (!ses || ses.current === index) return {};
          return { sessions: { ...s.sessions, [sid]: { ...ses, current: index } } };
        }),
      beginListening: (sid, durationSeconds) => patch(s => {
        const current = s.sessions[sid];
        if (!current) return {};
        const next = beginListeningSession(current, durationSeconds);
        return next === current ? {} : { sessions: { ...s.sessions, [sid]: next } };
      }),
      finishListening: (sid) => patch(s => {
        const current = s.sessions[sid];
        if (!current) return {};
        const next = advanceToReading(current);
        return next === current ? {} : { sessions: { ...s.sessions, [sid]: next } };
      }),
      submitSession: (sid, test) => {
        patch((s) => {
          const ses = s.sessions[sid];
          if (!ses || ses.status === "submitted" || s.attempts.some((a) => a.sessionId === sid)) return {};
          const att = gradeSession(test, ses);
          const prev = s.testProgress[ses.testId];
          const results = { ...(prev?.results ?? {}) };
          for (const n of att.questionNumbers ?? []) {
            if (att.blank?.includes(n)) continue;
            results[n] = !att.wrong?.includes(n);
          }
          const vals = Object.values(results);
          const correct = vals.filter(Boolean).length;
          return {
            sessions: { ...s.sessions, [sid]: { ...ses, status: "submitted" } },
            attempts: [...s.attempts, att],
            testProgress: {
              ...s.testProgress,
              [ses.testId]: {
                done: vals.length,
                correct,
                wrong: vals.length - correct,
                attempts: (prev?.attempts ?? 0) + 1,
                savedWords: prev?.savedWords ?? 0,
                results,
              },
            },
            profile: { ...s.profile, xp: s.profile.xp + att.correct * 2 + (ses.mode === "exam" ? 20 : 0) },
          };
        });
        return attemptIdFor(sid);
      },
      discardSession: (sid) =>
        patch((s) => {
          const sessions = { ...s.sessions };
          delete sessions[sid];
          return { sessions };
        }),
      resetDemo: () => {
        localStorage.removeItem(STORAGE_KEY);
        setState(seed());
      },
    }),
    [patch],
  );

  const value = useMemo(() => ({ ...state, ...actions, hydrated }), [state, actions, hydrated]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDemoStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useDemoStore must be used inside DemoStoreProvider");
  return ctx;
}
