import catalog from "./speaking-content.json";
import type { MediaCategory } from "@/types/domain";

export type SpeakingVideo = {
  id: string;
  videoId: string;
  category: MediaCategory;
  collection: string;
  accent: "uk" | "us" | "mixed";
  level: "A2" | "B1" | "B2";
  title: string;
  source: string;
  sourceUrl: string;
  durationSeconds: number;
  verifiedAt: string;
  captionLanguages: string[];
  embedAllowed: boolean;
  goal: string;
  practicePrompt: string;
};
export const SPEAKING_VIDEOS = catalog as SpeakingVideo[];
export const SPEAKING_CATEGORIES = [
  {
    id: "pronunciation",
    label: "Pronunciation",
    description: "Khẩu hình, nguyên âm, phụ âm và nối âm.",
  },
  {
    id: "toeic",
    label: "TOEIC",
    description: "Đọc thành tiếng, mô tả tranh, nêu ý kiến và hiểu tiêu chí.",
  },
  {
    id: "conversation",
    label: "Conversation",
    description: "Hội thoại thường ngày và cách dùng thành ngữ ngắn.",
  },
  {
    id: "movie",
    label: "Movie",
    description: "Ngữ điệu cảm xúc và kể lại tình huống từ clip phim.",
  },
  {
    id: "vlog",
    label: "Vlog",
    description: "Lời kể về địa điểm, trải nghiệm và quan điểm cá nhân.",
  },
  {
    id: "business",
    label: "Business English",
    description: "Phỏng vấn, hợp tác, cuộc họp và giao dịch.",
  },
] as const;
export const SPEAKING_ACCENTS = [
  { id: "all", label: "Tất cả" },
  { id: "uk", label: "Anh–Anh" },
  { id: "us", label: "Anh–Mỹ" },
  { id: "mixed", label: "Nhiều giọng" },
] as const;
export const formatVideoTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;

/** Time windows for practice, deliberately not represented as transcript sentences. */
export function practiceSegments(duration: number) {
  const segments: { id: string; start: number; end: number }[] = [];
  if (!Number.isFinite(duration) || duration <= 0 || duration >= 900)
    return segments;
  for (let start = 0; start < duration; ) {
    const end = duration - start <= 30 ? duration : start + 20;
    segments.push({ id: String(segments.length), start, end });
    start = end;
  }
  return segments;
}

/** Resolve only real YouTube hosts, including shorts and embed URLs; never fetch arbitrary input. */
export function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split("/").filter(Boolean);
    const id =
      host === "youtu.be"
        ? parts[0]
        : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)
          ? url.pathname === "/watch"
            ? url.searchParams.get("v")
            : ["shorts", "embed"].includes(parts[0])
              ? parts[1]
              : null
          : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function filterSpeakingVideos(
  options: {
    category: string;
    accent: string;
    collection: string;
    query: string;
    status: string;
    level?: string;
    maxMinutes?: number;
  },
  progress: SpeakingProgress,
) {
  const query = options.query.trim().toLocaleLowerCase("vi");
  const videoId = youtubeVideoId(options.query);
  return SPEAKING_VIDEOS.filter(
    (video) =>
      video.category === options.category &&
      (!options.maxMinutes || video.durationSeconds < options.maxMinutes * 60) &&
      (!options.level || options.level === "all" || video.level === options.level) &&
      (options.accent === "all" || video.accent === options.accent) &&
      (options.collection === "all" ||
        video.collection === options.collection) &&
      (options.status === "all" ||
        (options.status === "saved"
          ? progress.entries[video.id]?.bookmarked
          : isVideoPracticed(video, progress.entries[video.id]))) &&
      (!query ||
        (videoId
          ? video.id === videoId
          : `${video.title} ${video.goal} ${video.source} ${video.collection}`
              .toLocaleLowerCase("vi")
              .includes(query))),
  );
}

export type SpeakingEntry = {
  bookmarked?: boolean;
  note?: string;
  drafts?: Record<string, string>;
  practiced?: string[];
};
export type SpeakingProgress = { entries: Record<string, SpeakingEntry> };
export const EMPTY_SPEAKING: SpeakingProgress = { entries: {} };
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
export function parseSpeakingProgress(raw: string | null): SpeakingProgress {
  try {
    const data: unknown = JSON.parse(raw ?? "{}");
    if (!record(data) || !record(data.entries)) return EMPTY_SPEAKING;
    const entries: SpeakingProgress["entries"] = {};
    for (const video of SPEAKING_VIDEOS) {
      const entry = data.entries[video.id];
      if (!record(entry)) continue;
      const segments = practiceSegments(video.durationSeconds);
      const drafts: Record<string, string> = {};
      for (const segment of segments)
        if (
          record(entry.drafts) &&
          typeof entry.drafts[segment.id] === "string"
        )
          drafts[segment.id] = entry.drafts[segment.id] as string;
      entries[video.id] = {
        bookmarked: entry.bookmarked === true,
        note: typeof entry.note === "string" ? entry.note : "",
        drafts,
        practiced: segments
          .filter(
            (segment) =>
              Array.isArray(entry.practiced) &&
              entry.practiced.includes(segment.id),
          )
          .map((segment) => segment.id),
      };
    }
    return { entries };
  } catch {
    return EMPTY_SPEAKING;
  }
}
export function isVideoPracticed(video: SpeakingVideo, entry?: SpeakingEntry) {
  const segments = practiceSegments(video.durationSeconds);
  return (
    segments.length > 0 &&
    segments.every((segment) => entry?.practiced?.includes(segment.id))
  );
}
