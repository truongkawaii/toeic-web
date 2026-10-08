/* Domain model cho UI demo. Khớp với §6 "Model chính" trong docs/UI_BUILD_PLAN.md (rút gọn cho giai đoạn UI). */

export type Skill = "listening" | "reading" | "speaking" | "writing" | "vocabulary" | "test" | "video";

export type Profile = {
  name: string;
  currentScore: number;
  targetScore: number;
  /** ISO date yyyy-mm-dd */
  examDate: string;
  streak: number;
  longestStreak: number;
  xp: number;
  level: number;
};

export type Period = "today" | "week" | "month" | "all" | "custom";

export type ActivityStat = {
  key: "time" | "test" | "reading" | "listening" | "speaking" | "writing" | "vocabulary" | "video";
  label: string;
  value: string;
  sub: string;
  href: string;
  highlight?: boolean;
  breakdown?: { label: string; value: string }[];
};

export type Collection = { id: string; label: string };

export type ListeningPartLesson = {
  id: string;
  testNo: number;
  part: 1 | 2 | 3 | 4;
  questions: number;
};

export type GrammarGroup = "word-form" | "verb" | "other";

export type GrammarTopic = {
  id: string;
  group: GrammarGroup;
  title: string;
  questions: number;
};

export type TopicProgress = { done: number; correct: number; wrong: number };

export type Difficulty = "easy" | "medium" | "hard";

export type MockTest = {
  id: string;
  collectionId: string;
  testNo: number;
  difficulty: Difficulty;
  questions: number;
  minutes: number;
  /** Có nội dung thật để làm bài (đề ETS Reading). */
  playable?: boolean;
  /** Part có trong đề; mặc định 1–7. */
  parts?: number[];
  /** Số câu theo Part (đề thật). */
  partCounts?: Record<number, number>;
  /** Đề nguồn thiếu câu (in ra khi parse). */
  incomplete?: boolean;
  missingPhotos?: number;
};

export type TestProgress = TopicProgress & {
  attempts: number;
  savedWords: number;
  /** Kết quả gần nhất theo số câu (true = đúng). Dùng cho "Luyện lại câu sai". */
  results?: Record<number, boolean>;
};

export type Accent = "uk" | "us";
export type MediaCategory = "pronunciation" | "toeic" | "conversation" | "movie" | "vlog" | "business";

export type MediaLesson = {
  id: string;
  category: MediaCategory;
  accent: Accent;
  title: string;
  subtitle: string;
  ipa: string;
  words: string[];
  sentences: number;
  duration: string;
  source: string;
  tone: string;
};

export type PicturePrompt = {
  id: string;
  structure: string;
  words: [string, string];
  image?: string;
  scene: string;
};

export type EmailPrompt = {
  id: string;
  from: string;
  subject: string;
  summary: string;
  tasks: string[];
};

export type Word = {
  id: string;
  term: string;
  ipa: string;
  pos: string;
  meaning: string;
  example: string;
};

export type VocabSet = {
  id: string;
  collectionId: string;
  label: string;
  tag: string;
  total: number;
  learned: number;
};

export type Module = {
  id: string;
  deckId: string | null;
  title: string;
  total: number;
  learned: number;
};

export type Deck = {
  id: string;
  title: string;
  visibility: "private" | "public";
};

export type VocabGoal = { newPerDay: number };

export type LeaderMetric = "xp" | "time" | "streak" | "share";
export type LeaderPeriod = "today" | "week" | "month" | "all";

export type LeaderEntry = {
  id: string;
  name: string;
  level: number;
  value: number;
  color: string;
  isPremium?: boolean;
};

export type FeedItem = {
  id: string;
  who: string;
  text: string;
  tag?: string;
  meta: string;
  kind: "xp" | "level";
};

export type Attempt = {
  id: string;
  testId: string;
  mode: "exam" | "practice";
  date: string;
  correct: number;
  total: number;
  minutes: number;
  estimatedScore: number;
  /** Thang điểm: 990 (toàn bài) hoặc 495 (chỉ Reading). Mặc định 990. */
  scoreMax?: number;
  skill?: "listening" | "reading" | "combined";
  sectionScores?: { listening?: number; reading?: number };
  /** Chỉ có ở lượt làm thật (không có ở dữ liệu seed). */
  sessionId?: string;
  questionNumbers?: number[];
  answers?: Record<number, string>;
  flagged?: number[];
  wrong?: number[];
  blank?: number[];
  byPart?: Record<number, { correct: number; total: number }>;
};

/* ------------------------------ Đề ETS ---------------------------------- */

export type EtsOption = { key: string; text: string };

export type EtsQuestion = {
  number: number;
  part: number;
  groupId: string | null;
  stem: string;
  options: EtsOption[];
  answer: string | null;
  explanation: string | null;
  skill?: string;
  paraphrases?: { source: string; target: string; meaning: string }[];
};

export type ReadingDocument = {
  heading: string;
  content: string;
  table?: { headers: string[]; rows: string[][] };
};
export type ListeningClip = { id: string; text: string; audio: string; speaker: string; voice: string; role: string };
export type ListeningItem = {
  audio: string; conversationAudio: string; duration: number; instructions: string;
  transcript: string; speakers: Record<string, string>; image: string | null; imagePending: boolean;
  graphic: { title: string; headers: string[]; rows: string[][] } | null;
  clips: ListeningClip[];
};
export type EtsGroup = { id: string; from: number; to: number; kind: string; part: number; passage: string; documents?: ReadingDocument[]; listening?: ListeningItem };

export type EtsTest = {
  id: string;
  year: number;
  number: number;
  title: string;
  source: string;
  vocabularyFocus?: string[];
  editorialTrack?: string;
  groups: EtsGroup[];
  questions: EtsQuestion[];
  listening?: { fullAudio: string; duration: number; missingPhotos: number; contentHash: string; parts: Record<string, { directionsAudio: string; fullAudio: string; duration: number }> };
};

export type EtsIndexEntry = {
  id: string;
  year: number;
  number: number;
  title: string;
  questionCount: number;
  parts: Record<string, number>;
  complete: boolean;
  collectionId?: string;
  editorialTrack?: string;
  hasReading?: boolean;
  listeningDuration?: number;
  missingPhotos?: number;
};

/** Phiên làm bài lưu localStorage để refresh/đóng tab vẫn tiếp tục được. */
export type ExamSession = {
  id: string;
  testId: string;
  mode: "exam" | "practice";
  /** Danh sách câu trong phiên (theo Part đã chọn hoặc câu sai cần luyện lại). */
  questionNumbers: number[];
  answers: Record<number, string>;
  flagged: number[];
  current: number;
  startedAt: number;
  /** epoch ms; null = không giới hạn (luyện tập) */
  deadline: number | null;
  status: "active" | "submitted";
  label?: string;
  phase?: "listening" | "reading";
  audioStartedAt?: number;
};
