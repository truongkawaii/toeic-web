import type { ExamSession } from "@/types/domain";

export function beginListeningSession(session: ExamSession, durationSeconds: number, now = Date.now()): ExamSession {
  if (session.status !== "active" || session.phase !== "listening" || session.audioStartedAt) return session;
  return { ...session, audioStartedAt: now, deadline: now + Math.ceil(durationSeconds * 1000) + 1000 };
}

export function advanceToReading(session: ExamSession, now = Date.now()): ExamSession {
  if (session.status !== "active" || session.phase !== "listening") return session;
  const firstReading = session.questionNumbers.findIndex(n => n >= 101);
  if (firstReading < 0) return session;
  // Returning after closing the tab does not restart the Reading allowance.
  const ended = Math.min(now, session.deadline ?? now);
  return { ...session, phase: "reading", current: firstReading, deadline: ended + 75 * 60_000 };
}
