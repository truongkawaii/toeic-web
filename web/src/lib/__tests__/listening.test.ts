import { describe, expect, it } from "vitest";
import { advanceToReading, beginListeningSession } from "@/lib/exam-session";
import type { ExamSession } from "@/types/domain";

describe("Listening exam clock and section transition",()=>{
  const initial:ExamSession={id:"s",testId:"yts2024-t1",mode:"exam",questionNumbers:Array.from({length:200},(_,i)=>i+1),answers:{1:"B"},flagged:[],current:0,startedAt:1000,deadline:null,status:"active",phase:"listening"};
  it("starts only when audio plays and never resets its deadline on replay",()=>{
    const started=beginListeningSession(initial,2718.914,5000);
    expect(started.audioStartedAt).toBe(5000);
    expect(started.deadline).toBe(2724914);
    expect(beginListeningSession(started,2718.914,8000)).toBe(started);
  });
  it("moves to question 101, preserves answers and awards exactly 75 minutes",()=>{
    const started=beginListeningSession(initial,2700,5000);
    const reading=advanceToReading(started,2705000);
    expect(reading.current).toBe(100);
    expect(reading.phase).toBe("reading");
    expect(reading.deadline).toBe(7205000);
    expect(reading.answers).toEqual({1:"B"});
    expect(advanceToReading(reading,9000000)).toBe(reading);
  });
  it("resuming after expiry does not grant extra Reading time",()=>{
    const started=beginListeningSession(initial,2700,5000);
    expect(advanceToReading(started,9000000).deadline).toBe(started.deadline!+4500000);
  });
  it("does not invent Reading for a Listening-only paper",()=>{
    const started=beginListeningSession({...initial,questionNumbers:initial.questionNumbers.slice(0,100)},2700,5000);
    expect(advanceToReading(started,3000000)).toBe(started);
  });
});
