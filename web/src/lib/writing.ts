import content from "./writing-content.json";

export type WritingPart = "picture" | "email" | "essay";
export type WritingPicture = {
  id: string; part: "picture"; title: string; category: string; scene: string;
  words: [string, string]; answer: string; explanation: string;
};
export type WritingEmail = {
  id: string; part: "email"; title: string; category: string; sender: string;
  recipient: string; subject: string; incoming: string; task: string;
  outline: string; vocabulary: string; samples: string[]; explanation: string;
};
export type WritingEssay = {
  id: string; part: "essay"; title: string; category: string; topic: string;
  difficulty: string; prompt: string; ideas: string[]; samples: string[];
  outline: string; vocabulary: string; explanation: string; analysis: string; summary: string;
};
export type WritingLesson = WritingPicture | WritingEmail | WritingEssay;
export const WRITING_PICTURES = content.pictures as WritingPicture[];
export const WRITING_EMAILS = content.emails as WritingEmail[];
export const WRITING_ESSAYS = content.essays as WritingEssay[];
export const WRITING_GRAMMAR = content.grammar;
export const WRITING_LESSONS: WritingLesson[] = [...WRITING_PICTURES, ...WRITING_EMAILS, ...WRITING_ESSAYS];
export const WRITING_CATEGORIES = {
  picture: [...new Set(WRITING_PICTURES.map(p => p.category))],
  email: [],
  essay: ["Đồng ý/Phản đối", "Nêu ý kiến", "Chọn 1 trong 2", "Chọn 1 trong 3", "Ưu–nhược"],
};
export const WRITING_TOPICS = [...new Set(WRITING_ESSAYS.map(p => p.topic))];
export const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/u).length : 0;
export const CHECKLISTS: Record<WritingPart, string[]> = {
  picture: ["Tôi viết đúng một câu hoàn chỉnh.", "Tôi dùng đủ hai từ gợi ý, có thể đổi dạng từ.", "Câu phù hợp với mô tả cảnh.", "Tôi đã kiểm tra động từ, mạo từ và số ít/số nhiều."],
  email: ["Tôi trả lời đúng vai trò và người nhận.", "Tôi đã đáp ứng từng hành động trong yêu cầu đề.", "Lịch, quy trình và thông tin không mâu thuẫn với email.", "Câu hỏi và cấu trúc ngữ pháp rõ nghĩa.", "Bài có mở đầu, phần trả lời chính và lời chào kết."],
  essay: ["Tôi trả lời trực tiếp câu hỏi và giữ quan điểm nhất quán.", "Tôi phát triển các lý do khác nhau, không lặp ý.", "Ví dụ giải thích được vì sao quan điểm hợp lý.", "Tôi xử lý đủ các lựa chọn hoặc hai mặt ưu–nhược theo đề.", "Các đoạn liên kết rõ; tôi đã kiểm tra ngữ pháp và dấu câu."],
};

export type WritingEntry = {
  draft?: string; note?: string; completed?: boolean; bookmarked?: boolean;
  checks?: boolean[]; deadline?: number | null;
};
export type WritingProgress = {entries: Record<string, WritingEntry>};
export const EMPTY_WRITING: WritingProgress = {entries: {}};
export function parseWritingProgress(raw: string | null): WritingProgress {
  try {
    const data = JSON.parse(raw ?? "{}");
    if (!data || typeof data !== "object" || Array.isArray(data) || !data.entries || typeof data.entries !== "object" || Array.isArray(data.entries)) return EMPTY_WRITING;
    const entries: Record<string, WritingEntry> = {};
    for (const lesson of WRITING_LESSONS) {
      const item = data.entries[lesson.id];
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      entries[lesson.id] = {
        draft: typeof item.draft === "string" ? item.draft : "",
        note: typeof item.note === "string" ? item.note : "",
        completed: item.completed === true && typeof item.draft === "string" && wordCount(item.draft) > 0,
        bookmarked: item.bookmarked === true,
        checks: Array.from({length: CHECKLISTS[lesson.part].length}, (_, i) => item.checks?.[i] === true),
        deadline: typeof item.deadline === "number" && Number.isFinite(item.deadline) && item.deadline > 0 ? item.deadline : null,
      };
    }
    return {entries};
  } catch { return EMPTY_WRITING; }
}

/** Editing a previously reviewed draft invalidates its review without erasing notes. */
export function patchWritingEntry(current: WritingEntry, patch: Partial<WritingEntry>): WritingEntry {
  const changed = typeof patch.draft === "string" && patch.draft !== (current.draft ?? "");
  return {...current, ...patch, ...(changed ? {completed: false, checks: []} : {})};
}
export function canComplete(lesson: WritingLesson, entry: WritingEntry) {
  return wordCount(entry.draft ?? "") > 0 && CHECKLISTS[lesson.part].every((_, i) => entry.checks?.[i]);
}

/** Stable token identities allow repeated words to be selected independently. */
export function orderingTokens(sentence: string) {
  const tokens = sentence.split(/\s+/).map((text, id) => ({id, text}));
  let seed = 2166136261;
  for (const character of sentence) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  for (let i = tokens.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [tokens[i], tokens[j]] = [tokens[j], tokens[i]];
  }
  return tokens;
}
