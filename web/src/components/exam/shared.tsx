"use client";

import { Check, Lightbulb, X } from "lucide-react";
import { Fragment } from "react";
import type { EtsGroup, EtsQuestion } from "@/types/domain";

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "missed";

/**
 * Danh sách lựa chọn A–D dạng radio lớn (≥ 48px), dùng cho cả phòng thi và màn xem lại.
 * `reveal` = hiện đúng/sai: đáp án đúng xanh, lựa chọn sai đỏ.
 */
export function OptionList({
  q, selected, reveal, disabled, onSelect,
  hideText = false,
}: { q: EtsQuestion; selected?: string; reveal: boolean; disabled?: boolean; onSelect?: (key: string) => void; hideText?: boolean }) {
  return (
    <div role="radiogroup" aria-label={`Lựa chọn câu ${q.number}`} className="reading-options grid gap-2">
      {q.options.map((o) => {
        const isSel = selected === o.key;
        const state: OptionState = reveal
          ? o.key === q.answer ? (isSel ? "correct" : "missed") : isSel ? "wrong" : "idle"
          : isSel ? "selected" : "idle";
        const tone = {
          idle: "border-line bg-white hover:border-[#bcd0f7] hover:bg-primary-tint/60",
          selected: "border-primary bg-primary-tint ring-1 ring-primary",
          correct: "border-success bg-success-soft ring-1 ring-success",
          missed: "border-success/60 bg-success-soft/60",
          wrong: "border-danger bg-danger-soft ring-1 ring-danger",
        }[state];
        const dot = {
          idle: "border-line text-muted bg-white",
          selected: "border-primary bg-primary text-white",
          correct: "border-success bg-success text-white",
          missed: "border-success text-success bg-white",
          wrong: "border-danger bg-danger text-white",
        }[state];
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={isSel}
            disabled={disabled}
            onClick={() => onSelect?.(o.key)}
            className={`focus-ring group flex min-h-12 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[15px] transition-all duration-150 disabled:cursor-default ${tone} ${!disabled ? "active:scale-[0.995]" : ""}`}
          >
            <span className={`grid size-7 shrink-0 place-items-center rounded-full border text-[13px] font-bold transition-colors ${dot}`}>
              {state === "correct" || state === "missed" ? <Check className="size-4" /> : state === "wrong" ? <X className="size-4" /> : o.key}
            </span>
            <span className="min-w-0 flex-1 text-ink">{hideText ? `Phương án ${o.key}` : o.text}</span>
            {reveal && state === "missed" && selected && <span className="shrink-0 text-xs font-semibold text-success">Đáp án đúng</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Explanation({ q, selected }: { q: EtsQuestion; selected?: string }) {
  const ok = selected === q.answer;
  return (
    <div className={`reading-explanation animate-fade-up rounded-xl border px-4 py-3 text-sm ${!selected ? "border-line bg-canvas" : ok ? "border-[#bbf0d0] bg-success-soft/70" : "border-[#fecaca] bg-danger-soft/60"}`}>
      <p className={`font-semibold ${!selected ? "text-ink-soft" : ok ? "text-success" : "text-danger"}`}>
        {!selected ? `Bỏ trống · Đáp án ${q.answer}` : ok ? "Chính xác!" : `Chưa đúng · Đáp án ${q.answer}`}
      </p>
      {q.explanation ? (
        <p className="mt-1 flex gap-2 leading-relaxed text-ink-soft">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" /> {q.explanation}
        </p>
      ) : (
        <p className="mt-1 text-muted">Đề này chưa có giải thích chi tiết.</p>
      )}
      {!!q.paraphrases?.length && <dl className="mt-3 space-y-2 border-t border-current/10 pt-3">
        {q.paraphrases.map(p => <div key={p.source} className="grid gap-0.5"><dt className="font-semibold text-ink">{p.source} <span className="font-normal text-muted">→</span> {p.target}</dt><dd className="text-ink-soft">{p.meaning}</dd></div>)}
      </dl>}
    </div>
  );
}

/** Exam directions shared by the passage and question panes. */
export function GroupInstructions({ group, className = "" }: { group: EtsGroup; className?: string }) {
  const kind = group.kind.trim().replace(/\.$/, "").replace(/^the following\s+/i, "");
  return <p className={`reading-instructions ${className}`}>
    {group.from === group.to ? `Question ${group.from} refers` : `Questions ${group.from}-${group.to} refer`} to the following {kind}.
  </p>;
}

/**
 * Đoạn văn Part 6/7. Chỗ trống "------- (131)" được thay bằng nút số câu
 * để bấm nhảy tới câu tương ứng; câu đang làm được tô nổi.
 */
export function Passage({
  group, current, answers, onJump,
}: { group: EtsGroup; current?: number; answers?: Record<number, string>; onJump?: (n: number) => void }) {
  const documents = group.documents ?? [{heading: "", content: group.passage}];
  return (
    <article className="reading-document">
      <GroupInstructions group={group} className="reading-caption" />
      {documents.map((document, documentIndex) => <section key={documentIndex} className="reading-document-section">
        {documents.length > 1 && <p className="reading-document-label">Document {documentIndex + 1} of {documents.length}</p>}
        {document.heading && <h2 className="reading-document-heading">{document.heading}</h2>}
      {document.content.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="whitespace-pre-line">
          {para.split(/(-{3,}\s*\(\d{3}\))/).map((chunk, j) => {
            const m = chunk.match(/\((\d{3})\)/);
            if (!m || !/^-{3,}/.test(chunk)) return <Fragment key={j}>{chunk}</Fragment>;
            const n = Number(m[1]);
            const active = n === current;
            const done = !!answers?.[n];
            return (
              <button
                key={j}
                type="button"
                onClick={() => onJump?.(n)}
                aria-label={`Chỗ trống câu ${n}${done ? `, đã chọn ${answers?.[n]}` : ""}`}
                className={`focus-ring mx-0.5 inline-flex min-w-16 items-center justify-center rounded-md border-b-2 px-2 align-baseline text-[13px] font-bold leading-6 transition-colors ${
                  active ? "border-primary bg-primary text-white" : done ? "border-primary bg-primary-soft text-primary" : "border-[#94a3b8] bg-canvas text-ink-soft hover:bg-primary-tint"
                }`}
              >
                {n}{done ? ` · ${answers?.[n]}` : ""}
              </button>
            );
          })}
        </p>
      ))}
      {document.table && <div className="reading-table-scroll"><table className="reading-table"><thead><tr>{document.table.headers.map((h, i) => <th scope="col" key={i}>{h}</th>)}</tr></thead><tbody>{document.table.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
      </section>)}
    </article>
  );
}

/** Câu Part 5 có "-------" trong đề: làm nổi chỗ trống. */
export function Stem({ text }: { text: string }) {
  return (
    <>
      {text.split(/(-{3,})/).map((c, i) =>
        /^-{3,}$/.test(c) ? <span key={i} className="mx-1 inline-block w-16 border-b-2 border-ink-soft align-baseline" aria-label="chỗ trống" /> : <Fragment key={i}>{c}</Fragment>,
      )}
    </>
  );
}
