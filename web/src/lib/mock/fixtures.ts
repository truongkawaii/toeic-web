import ETS_INDEX_JSON from "@/data/ets/index.json";
import YTS_LISTENING_INDEX_JSON from "@/data/listening/index.json";
import type {
  EtsIndexEntry,
  ActivityStat,
  Attempt,
  Collection,
  Deck,
  EmailPrompt,
  FeedItem,
  GrammarTopic,
  LeaderEntry,
  LeaderMetric,
  LeaderPeriod,
  ListeningPartLesson,
  MediaLesson,
  MockTest,
  Module,
  Period,
  PicturePrompt,
  Profile,
  TestProgress,
  TopicProgress,
  VocabSet,
  Word,
} from "@/types/domain";

/* ---------------------------------------------------------------------------
 * Fixtures demo. Mọi tên, số liệu là dữ liệu minh hoạ — không sao chép tài khoản
 * trong ảnh tham chiếu. Ngày tháng tính tương đối theo clock hiện tại.
 * ------------------------------------------------------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const daysFromToday = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return toISODate(d);
};

/** Deterministic pseudo random để số liệu ổn định giữa server/client. */
const seeded = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export const seedProfile = (): Profile => ({
  name: "Nguyễn Xuân Trường",
  currentScore: 500,
  targetScore: 750,
  examDate: daysFromToday(-5), // cố ý: ngày thi đã qua để hiển thị CTA "Đặt lại"
  streak: 2,
  longestStreak: 59,
  xp: 53344,
  level: 33,
});

export const SCORE_PRESETS = [500, 650, 750, 850, 900];
export const SCORE_MIN = 10;
export const SCORE_MAX = 990;

/* ----------------------------- Dashboard ---------------------------------- */

const PERIOD_FACTOR: Record<Period, number> = { today: 0, week: 1, month: 4, all: 18, custom: 2 };

export function activityStats(period: Period): ActivityStat[] {
  const f = PERIOD_FACTOR[period];
  const label = { today: "Hôm nay", week: "7 ngày", month: "30 ngày", all: "Tất cả", custom: "Khoảng đã chọn" }[period];
  const n = (base: number) => Math.round(base * f);
  const minutes = period === "today" ? 0 : n(95);
  const time = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
  const pct = (c: number, t: number) => (t === 0 ? "Chưa luyện" : `Đúng ${Math.round((c / t) * 100)}%`);

  const test = n(40);
  const reading = period === "today" ? 1 : n(62);
  const listening = n(48);
  return [
    { key: "time", label: "Thời gian học", value: time, sub: label, href: "/" },
    {
      key: "test", label: "Luyện đề", value: `${test} câu`, sub: `${label} · ${pct(test * 0.6, test)}`, href: "/tests",
      breakdown: [{ label: "Thi thử", value: `${n(1)} đề` }, { label: "Luyện tập", value: `${test} câu` }],
    },
    {
      key: "reading", label: "Đọc", value: `${reading} câu`, sub: `${label} · ${pct(reading * (period === "today" ? 1 : 0.72), reading)}`,
      href: "/reading", highlight: true,
      breakdown: [{ label: "Ngữ pháp", value: `${Math.ceil(reading * 0.5)} câu` }, { label: "Part 5–7", value: `${Math.floor(reading * 0.5)} câu` }],
    },
    {
      key: "listening", label: "Nghe", value: `${listening} câu`, sub: `${label} · ${pct(listening * 0.65, listening)}`, href: "/listening",
      breakdown: [{ label: "Nghe chép", value: `${n(12)} câu` }, { label: "Part 1–4", value: `${listening} câu` }],
    },
    {
      key: "speaking", label: "Nói", value: `${n(14)} lượt nói`, sub: `${label} · ${n(9)}m`, href: "/speaking",
      breakdown: [{ label: "Shadowing", value: `${n(14)} câu` }],
    },
    {
      key: "writing", label: "Viết", value: `${n(3)} bài viết`, sub: `${label} · ${n(3) ? "Đã nộp" : "Chưa luyện"}`, href: "/writing",
      breakdown: [{ label: "Picture", value: `${n(2)} bài` }, { label: "Email", value: `${n(1)} bài` }],
    },
    {
      key: "vocabulary", label: "Từ vựng", value: `${n(35)} từ học/ôn`, sub: `${label} · Đã thuộc ${period === "today" ? 4 : n(11)}`,
      href: "/vocabulary/progress", highlight: true,
      breakdown: [{ label: "Từ mới", value: `${n(20)}` }, { label: "Ôn tập", value: `${n(15)}` }],
    },
    {
      key: "video", label: "Video", value: `${n(2)} video`, sub: `${label} · ${n(2) ? "Đã xem" : "Chưa xem"}`, href: "/video",
      breakdown: [{ label: "Thời lượng", value: `${n(18)}m` }],
    },
  ];
}

/* ----------------------------- Listening ---------------------------------- */

export const LISTENING_COLLECTIONS: Collection[] = [
  { id: "crack-1", label: "Crack Vol 1" },
  { id: "crack-2", label: "Crack Vol 2" },
  ...["2026", "2024", "2023", "2022", "2021", "2020", "2019"].map((y) => ({ id: y, label: y })),
];

export function listeningLessons(collectionId: string): ListeningPartLesson[] {
  if (collectionId.startsWith("yts-")) return [];
  const base = collectionId.length * 7 + Number(collectionId.replace(/\D/g, "") || 3);
  const out: ListeningPartLesson[] = [];
  for (let t = 1; t <= 10; t++) {
    const r = (k: number) => seeded(base + t * 13 + k);
    out.push(
      { id: `${collectionId}-t${t}-p1`, testNo: t, part: 1, questions: 24 },
      { id: `${collectionId}-t${t}-p2`, testNo: t, part: 2, questions: 100 },
      { id: `${collectionId}-t${t}-p3`, testNo: t, part: 3, questions: 130 + Math.round(r(3) * 14) },
      { id: `${collectionId}-t${t}-p4`, testNo: t, part: 4, questions: 80 + Math.round(r(4) * 9) },
    );
  }
  return out;
}

/* ------------------------------ Reading ----------------------------------- */

export const GRAMMAR_GROUPS = [
  { id: "word-form", label: "Từ loại" },
  { id: "verb", label: "Động từ" },
  { id: "other", label: "Ngữ pháp khác" },
] as const;

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  { id: "noun", group: "word-form", title: "Danh từ", questions: 287 },
  { id: "adjective", group: "word-form", title: "Tính từ", questions: 130 },
  { id: "adverb", group: "word-form", title: "Trạng từ", questions: 137 },
  { id: "tense", group: "verb", title: "Thì", questions: 113 },
  { id: "agreement", group: "verb", title: "Hoà hợp chủ ngữ – động từ", questions: 129 },
  { id: "voice", group: "verb", title: "Chủ động – bị động", questions: 113 },
  { id: "gerund", group: "verb", title: "Danh động từ", questions: 76 },
  { id: "imperative", group: "verb", title: "Câu mệnh lệnh", questions: 14 },
  { id: "verb-form", group: "verb", title: "Dạng động từ", questions: 137 },
  { id: "pronoun", group: "other", title: "Đại từ", questions: 145 },
  { id: "comparison", group: "other", title: "So sánh", questions: 164 },
  { id: "conj-prep", group: "other", title: "Liên từ giới từ", questions: 151 },
  { id: "relative", group: "other", title: "Mệnh đề quan hệ", questions: 156 },
  { id: "conditional", group: "other", title: "Câu điều kiện", questions: 37 },
  { id: "adverbial", group: "other", title: "Mệnh đề trạng ngữ", questions: 54 },
];

export const seedTopicProgress = (): Record<string, TopicProgress> => ({
  gerund: { done: 1, correct: 1, wrong: 0 },
});

export const READING_COLLECTIONS: Collection[] = [
  { id: "yts-2026", label: "YTS 2026" },
  { id: "yts-2024", label: "YTS 2024" },
  { id: "ets-2026", label: "ETS 2026" },
  { id: "ets-2024", label: "ETS 2024" },
];

export const READING_PART_QUESTIONS: Record<5 | 6 | 7, number> = { 5: 30, 6: 16, 7: 54 };

/* ------------------------------- Tests ------------------------------------ */

export const TEST_COLLECTIONS: Collection[] = [
  { id: "ets-2026", label: "ETS 2026 · Reading" },
  { id: "ets-2024", label: "ETS 2024 · Reading" },
  { id: "crack-1", label: "Crack TOEIC Vol 1" },
  { id: "crack-2", label: "Crack TOEIC Vol 2" },
];

const ETS_TESTS: MockTest[] = ([...YTS_LISTENING_INDEX_JSON, ...ETS_INDEX_JSON] as EtsIndexEntry[]).map((t) => ({
  id: t.id,
  collectionId: t.collectionId ?? `ets-${t.year}`,
  testNo: t.number,
  difficulty: (["medium", "hard", "medium"] as const)[t.number % 3],
  questions: t.questionCount,
  minutes: t.listeningDuration ? Math.ceil(t.listeningDuration / 60) + (t.hasReading ? 75 : 0) : Math.max(5, Math.round((75 * t.questionCount) / 100)),
  playable: true,
  parts: Object.keys(t.parts).map(Number),
  partCounts: Object.fromEntries(Object.entries(t.parts).map(([part, count]) => [Number(part), count])),
  missingPhotos: t.missingPhotos,
  incomplete: !t.complete,
}));

export const MOCK_TESTS: MockTest[] = [
  ...ETS_TESTS,
  ...["crack-1", "crack-2"].flatMap((cid) =>
    Array.from({ length: 10 }, (_, i) => ({
      id: `${cid}-test-${i + 1}`,
      collectionId: cid,
      testNo: i + 1,
      difficulty: (["hard", "hard", "medium", "hard", "medium"] as const)[(i + cid.length) % 5],
      questions: 200,
      minutes: 120,
    })),
  ),
];

export const seedTestProgress = (): Record<string, TestProgress> => ({
  "crack-1-test-1": { done: 5, correct: 2, wrong: 3, attempts: 3, savedWords: 4 },
});

export const seedAttempts = (): Attempt[] => {
  const scores = [455, 470, 520, 505, 560, 585, 610];
  return scores.map((s, i) => ({
    id: `att-${i + 1}`,
    testId: `crack-1-test-${(i % 4) + 1}`,
    mode: i % 3 === 0 ? "practice" : "exam",
    date: daysFromToday(-(scores.length - i) * 6),
    correct: Math.round((s / 990) * 200),
    total: 200,
    minutes: 98 + (i % 4) * 6,
    estimatedScore: s,
  }));
};

/* ------------------------------ Speaking ---------------------------------- */

export const MEDIA_CATEGORIES = [
  { id: "pronunciation", label: "Pronunciation" },
  { id: "toeic", label: "TOEIC" },
  { id: "conversation", label: "Conversation" },
  { id: "movie", label: "Movie" },
  { id: "vlog", label: "Vlog" },
  { id: "business", label: "Business English" },
] as const;

const vowel = (
  id: string, ipa: string, kind: string, words: string[], sentences: number, duration: string, accent: "uk" | "us" = "uk",
): MediaLesson => ({
  id, category: "pronunciation", accent, ipa, words, sentences, duration,
  title: `${kind.startsWith("Nguyên âm dài") ? "Long vowel" : kind.startsWith("Âm schwa") ? "Schwa" : "Short vowel"} ${ipa} – ${words.join(", ")}`,
  subtitle: `${kind} ${ipa} – “${words[0]}”`,
  source: "Demo Pronunciation", tone: "from-[#0f766e] to-[#0d9488]",
});

export const MEDIA_LESSONS: MediaLesson[] = [
  vowel("uk-ii", "/iː/", "Nguyên âm dài", ["fleece", "sea", "machine"], 43, "2:09"),
  vowel("uk-i", "/ɪ/", "Nguyên âm ngắn", ["bid", "tip", "minute"], 36, "2:05"),
  vowel("uk-u", "/ʊ/", "Nguyên âm ngắn", ["foot", "put", "good"], 11, "0:44"),
  vowel("uk-uu", "/uː/", "Nguyên âm dài", ["blue", "two", "goose"], 15, "0:57"),
  vowel("uk-e", "/e/", "Nguyên âm ngắn", ["dress", "head", "bed"], 30, "1:59"),
  vowel("uk-schwa", "/ə/", "Âm schwa", ["the", "of", "butter"], 50, "4:02"),
  vowel("uk-er", "/ɜː/", "Nguyên âm dài", ["nurse", "stir", "learn"], 12, "0:57"),
  vowel("uk-or", "/ɔː/", "Nguyên âm dài", ["law", "north", "war"], 18, "0:55"),
  vowel("uk-ae", "/æ/", "Nguyên âm ngắn", ["trap", "stamp", "back"], 14, "0:48"),
  vowel("uk-uh", "/ʌ/", "Nguyên âm ngắn", ["strut", "mud", "love"], 39, "1:53"),
  vowel("uk-ar", "/ɑː/", "Nguyên âm dài", ["father", "start", "hard"], 15, "0:46"),
  vowel("uk-o", "/ɒ/", "Nguyên âm ngắn", ["lot", "odd", "wash"], 8, "0:47"),
  vowel("us-ae", "/æ/", "Nguyên âm ngắn", ["cat", "map", "plan"], 22, "1:12", "us"),
  vowel("us-r", "/ɝ/", "Nguyên âm dài", ["bird", "work", "first"], 19, "1:31", "us"),
  vowel("us-flap", "/ɾ/", "Âm schwa", ["water", "better", "city"], 26, "2:20", "us"),
  ...(
    [
      ["toeic-p1", "toeic", "uk", "Describing a busy office", "Mô tả tranh Part 1", 24, "3:10"],
      ["toeic-p2", "toeic", "us", "Short responses that sound natural", "Phản xạ Part 2", 30, "4:25"],
      ["conv-1", "conversation", "us", "Ordering coffee like a local", "Hội thoại quán cà phê", 18, "2:48"],
      ["conv-2", "conversation", "uk", "Small talk at work", "Bắt chuyện nơi công sở", 21, "3:35"],
      ["movie-1", "movie", "us", "The interview scene", "Cảnh phỏng vấn kinh điển", 16, "2:02"],
      ["vlog-1", "vlog", "uk", "A day in London", "Vlog một ngày ở London", 34, "6:15"],
      ["biz-1", "business", "us", "Leading a short meeting", "Điều phối cuộc họp ngắn", 27, "5:05"],
      ["biz-2", "business", "uk", "Negotiating a deadline", "Thương lượng deadline", 23, "4:40"],
    ] as const
  ).map(([id, category, accent, title, subtitle, sentences, duration]) => ({
    id, category, accent, title, subtitle, sentences, duration,
    ipa: "", words: [], source: "Demo Studio", tone: "from-[#1e3a8a] to-[#2563eb]",
  })),
];

/* ------------------------------ Writing ----------------------------------- */

export const PICTURE_STRUCTURES = [
  { id: "n-v", label: "N + V", count: 45 },
  { id: "v-conj", label: "V + Conj", count: 35 },
  { id: "n-prep", label: "N + Prep", count: 32 },
  { id: "n-n", label: "N + N", count: 25 },
  { id: "n-conj", label: "N + Conj", count: 25 },
  { id: "adj-n", label: "Adj + N", count: 17 },
  { id: "quant-n", label: "Quant + N", count: 16 },
  { id: "v-prep", label: "V + Prep", count: 14 },
  { id: "adv-v", label: "Adv + V", count: 11 },
];

export const PICTURE_PROMPTS: PicturePrompt[] = [
  { id: "pic-1", structure: "n-v", words: ["beverage", "pour"], image: "/demo/writing/cafe-pour.jpg", scene: "Quán cà phê" },
  { id: "pic-2", structure: "n-prep", words: ["boat", "dock"], image: "/demo/writing/boat-dock.jpg", scene: "Bến thuyền" },
  { id: "pic-3", structure: "n-v", words: ["car", "fix"], image: "/demo/writing/car-fix.jpg", scene: "Gara sửa xe" },
  { id: "pic-4", structure: "v-prep", words: ["carry", "back"], image: "/demo/writing/hiker-back.jpg", scene: "Đường mòn" },
  { id: "pic-5", structure: "n-v", words: ["boat", "float"], scene: "Bến cảng" },
  { id: "pic-6", structure: "n-n", words: ["car", "work"], scene: "Xưởng sửa chữa" },
  { id: "pic-7", structure: "v-conj", words: ["carry", "tray"], scene: "Nhà hàng" },
  { id: "pic-8", structure: "n-v", words: ["dog", "sit"], scene: "Quán ngoài trời" },
  { id: "pic-9", structure: "n-n", words: ["dump", "garbage"], scene: "Khu dân cư" },
  { id: "pic-10", structure: "n-conj", words: ["equipment", "install"], scene: "Hành lang" },
  { id: "pic-11", structure: "quant-n", words: ["fill", "glass"], scene: "Nhà bếp" },
  { id: "pic-12", structure: "adj-n", words: ["finish", "grocery"], scene: "Siêu thị" },
];

export const EMAIL_PROMPTS: EmailPrompt[] = [
  { id: "mail-1", from: "Laura Chen · HR Manager", subject: "New employee orientation", summary: "Bạn là nhân viên mới, cần hỏi về lịch định hướng tuần đầu.", tasks: ["Hỏi 2 câu về lịch trình", "Đưa ra 1 đề xuất"] },
  { id: "mail-2", from: "Brightway Hotel", subject: "Your reservation has changed", summary: "Khách sạn báo thay đổi phòng đặt cho chuyến công tác của bạn.", tasks: ["Hỏi 1 thông tin", "Đưa ra 2 yêu cầu"] },
  { id: "mail-3", from: "Tom Rivera · Office Supplies", subject: "Delayed shipment notice", summary: "Nhà cung cấp thông báo đơn văn phòng phẩm bị giao trễ.", tasks: ["Nêu 1 vấn đề", "Đưa ra 2 yêu cầu"] },
  { id: "mail-4", from: "City Library", subject: "Volunteer program", summary: "Thư viện tuyển tình nguyện viên cho sự kiện cuối tuần.", tasks: ["Hỏi 2 câu", "Cung cấp 1 thông tin"] },
  { id: "mail-5", from: "Mark Davis · Team Lead", subject: "Quarterly meeting room", summary: "Trưởng nhóm cần bạn đặt phòng họp cho buổi tổng kết quý.", tasks: ["Đưa ra 2 phương án", "Hỏi 1 câu"] },
  { id: "mail-6", from: "Greenfield Gym", subject: "Membership renewal", summary: "Phòng gym nhắc gia hạn thẻ hội viên kèm ưu đãi.", tasks: ["Hỏi 1 thông tin", "Nêu 2 mong muốn"] },
];

/* ---------------------------- Vocabulary ---------------------------------- */

export const VOCAB_COLLECTIONS: Collection[] = [
  { id: "2026", label: "2026" },
  { id: "600", label: "600 Essential Words" },
  { id: "2023", label: "2023" },
  { id: "2024", label: "2024" },
  { id: "master", label: "TOEIC MASTER" },
];

const SET_SIZES: Record<string, number> = { "2026": 10, "600": 50, "2023": 10, "2024": 10, master: 3 };

export const VOCAB_SETS: VocabSet[] = VOCAB_COLLECTIONS.flatMap((c) =>
  Array.from({ length: SET_SIZES[c.id] }, (_, i) => {
    const total = c.id === "600" ? 12 : c.id === "master" ? 300 : 160;
    return {
      id: `${c.id}-${i + 1}`,
      collectionId: c.id,
      label: c.id === "600" ? `Lesson ${i + 1}` : c.id === "master" ? `Chặng ${i + 1}` : `Test ${i + 1}`,
      tag: c.id === "600" ? "600 Words" : c.id === "master" ? "Master" : c.label,
      total,
      learned: Math.round(seeded(i * 3 + c.id.length) * (c.id === "2026" ? 16 : total * 0.35)),
    };
  }),
);

export const SAMPLE_WORDS: Word[] = [
  { id: "w1", term: "beverage", ipa: "/ˈbev.ər.ɪdʒ/", pos: "n", meaning: "đồ uống", example: "Hot beverages are served in the lobby." },
  { id: "w2", term: "itinerary", ipa: "/aɪˈtɪn.ə.rer.i/", pos: "n", meaning: "lịch trình", example: "Please review the itinerary before Friday." },
  { id: "w3", term: "reimburse", ipa: "/ˌriː.ɪmˈbɝːs/", pos: "v", meaning: "hoàn trả (chi phí)", example: "The company will reimburse travel expenses." },
  { id: "w4", term: "tentative", ipa: "/ˈten.t̬ə.t̬ɪv/", pos: "adj", meaning: "tạm thời, chưa chắc chắn", example: "We set a tentative date for the launch." },
  { id: "w5", term: "commence", ipa: "/kəˈmens/", pos: "v", meaning: "bắt đầu", example: "Construction will commence next month." },
  { id: "w6", term: "complimentary", ipa: "/ˌkɑːm.pləˈmen.t̬ɚ.i/", pos: "adj", meaning: "miễn phí (tặng kèm)", example: "Guests receive a complimentary breakfast." },
  { id: "w7", term: "renovation", ipa: "/ˌren.əˈveɪ.ʃən/", pos: "n", meaning: "sự cải tạo", example: "The lobby is closed for renovation." },
  { id: "w8", term: "expedite", ipa: "/ˈek.spə.daɪt/", pos: "v", meaning: "xúc tiến, đẩy nhanh", example: "Can you expedite the shipment?" },
  { id: "w9", term: "adjacent", ipa: "/əˈdʒeɪ.sənt/", pos: "adj", meaning: "liền kề", example: "Parking is available in the adjacent lot." },
  { id: "w10", term: "inventory", ipa: "/ˈɪn.vən.tɔːr.i/", pos: "n", meaning: "hàng tồn kho", example: "We check inventory every Monday." },
  { id: "w11", term: "proficient", ipa: "/prəˈfɪʃ.ənt/", pos: "adj", meaning: "thành thạo", example: "Applicants must be proficient in Excel." },
  { id: "w12", term: "allocate", ipa: "/ˈæl.ə.keɪt/", pos: "v", meaning: "phân bổ", example: "Funds were allocated to marketing." },
];

export const VOCAB_STATS = { total: 6442, learned: 1639, mastered: 696, due: 223, waiting: 1416, reviewedToday: 0, newToday: 0 };
export const MY_VOCAB_STATS = { due: 222, fresh: 5, mastered: 365, total: 1774, sources: 128 };

export const MY_SOURCE_TABS = [
  { id: "test", label: "Đề thi" },
  { id: "listening", label: "Nghe" },
  { id: "reading", label: "Đọc" },
  { id: "writing", label: "Viết" },
  { id: "modules", label: "Học phần" },
  { id: "decks", label: "Bộ từ vựng" },
] as const;

export const SAVED_BY_SOURCE: Record<string, { id: string; title: string; tag: string; total: number; learned: number }[]> = {
  test: [
    { id: "s-t1", title: "Crack Vol 1 · Test 1", tag: "Đề thi", total: 42, learned: 18 },
    { id: "s-t2", title: "Crack Vol 1 · Test 2", tag: "Đề thi", total: 27, learned: 27 },
    { id: "s-t3", title: "Crack Vol 2 · Test 1", tag: "Đề thi", total: 15, learned: 3 },
  ],
  listening: [
    { id: "s-l1", title: "Crack Vol 1 · Part 3", tag: "Nghe", total: 31, learned: 12 },
    { id: "s-l2", title: "ETS 2026 · Part 4", tag: "Nghe", total: 9, learned: 0 },
  ],
  reading: [
    { id: "s-r1", title: "ETS 2026 · Test 1 · Part 7", tag: "Đọc", total: 56, learned: 40 },
    { id: "s-r2", title: "Ngữ pháp · Danh động từ", tag: "Đọc", total: 8, learned: 8 },
  ],
  writing: [],
};

export const seedDecks = (): Deck[] => [
  { id: "deck-pass", title: "Pass TOEIC (web cũ)", visibility: "private" },
  { id: "deck-ets24", title: "ETS 2024 (web cũ)", visibility: "private" },
];

export const seedModules = (): Module[] => [
  { id: "m1", deckId: "deck-pass", title: "Test 3", total: 5, learned: 0 },
  { id: "m2", deckId: "deck-pass", title: "Test 4", total: 1, learned: 1 },
  { id: "m3", deckId: "deck-ets24", title: "Test 1", total: 104, learned: 104 },
  { id: "m4", deckId: "deck-ets24", title: "Test 10", total: 1, learned: 1 },
  { id: "m5", deckId: "deck-ets24", title: "Test 2", total: 9, learned: 9 },
  { id: "m6", deckId: "deck-ets24", title: "Test 4", total: 1, learned: 1 },
];

/* ----------------------------- Leaderboard -------------------------------- */

const NAMES = [
  "Phạm Tú", "Diệu Anh Nguyễn", "Nguyễn Thanh Nhã", "Thanh Bình Đỗ", "Tuấn Định Nguyễn", "Đinh Tuấn Kiệt", "Lâm Gia Huy",
  "Kiệt Văn Phúc", "Dung Lê", "Trường Vương Văn", "Mai Phương", "Hoàng Long", "Quỳnh Như", "Bảo Ngọc", "Minh Khang",
  "Thu Hà", "Đức Anh", "Lan Chi", "Gia Bảo", "Hải Yến", "Văn Hùng", "Ngọc Trâm", "Khánh Linh", "Quốc Việt", "Thảo Vy",
  "Anh Thư", "Tiến Đạt", "Phương Uyên", "Hữu Phước", "Minh Thư", "Trung Kiên", "Như Ý", "Cao Sơn", "Bích Ngọc", "Đăng Khoa",
  "Thanh Tâm", "Hồng Nhung", "Tấn Phát", "Yến Nhi", "Duy Mạnh", "Kim Ngân", "Phúc Thịnh", "Diễm My", "Quang Huy", "Tú Anh",
  "Hoài An", "Xuân Mai", "Nhật Minh", "Thùy Dương", "Gia Hân",
];
const COLORS = ["#2563eb", "#db2777", "#059669", "#7c3aed", "#ea580c", "#0891b2", "#4f46e5", "#16a34a", "#c026d3", "#0d9488"];

export function leaderboard(metric: LeaderMetric, period: LeaderPeriod): LeaderEntry[] {
  const scale = { today: 0.12, week: 1, month: 3.6, all: 31 }[period];
  const base = { xp: 3840, time: 1260, streak: 199, share: 420 }[metric];
  return NAMES.map((name, i) => {
    const jitter = seeded(i * 7 + metric.length * 3 + period.length);
    const raw = base * scale * Math.pow(0.955, i) * (0.96 + jitter * 0.08);
    return {
      id: `u${i}`,
      name,
      level: Math.max(2, Math.round(9 - i * 0.12 + jitter)),
      value: metric === "streak" ? Math.max(1, Math.round(base * Math.pow(0.95, i))) : Math.max(1, Math.round(raw)),
      color: COLORS[i % COLORS.length],
      isPremium: i % 3 !== 1,
    };
  }).sort((a, b) => b.value - a.value);
}

export const HALL_OF_FAME = [
  { id: "h1", title: "Bậc thầy tri thức", name: "Thuấn Trần Hữu", value: "129.008 XP", tone: "amber", icon: "trophy" },
  { id: "h2", title: "Huyền thoại không nghỉ", name: "Ngọc Nguyễn", value: "199 ngày", tone: "orange", icon: "flame" },
  { id: "h3", title: "Đại sứ lan toả", name: "Minh Trương", value: "3.277 bạn", tone: "emerald", icon: "megaphone" },
] as const;

export const RECENT_FEED: FeedItem[] = [
  { id: "f1", who: "Yến N.", text: "vừa kiếm thêm XP trong ít phút", tag: "+44 XP", meta: "Vừa xong · Luyện đề", kind: "xp" },
  { id: "f2", who: "Nguyễn N.", text: "vừa kiếm thêm XP trong ít phút", tag: "+13 XP", meta: "2 phút trước · Luyện đề", kind: "xp" },
  { id: "f3", who: "Phạm H.", text: "vừa kiếm thêm XP trong ít phút", tag: "+12 XP", meta: "4 phút trước · Từ vựng", kind: "xp" },
  { id: "f4", who: "Khang Đ.", text: "vừa kiếm thêm XP trong ít phút", tag: "+14 XP", meta: "6 phút trước · Nghe", kind: "xp" },
  { id: "f5", who: "Nguyễn N.", text: "vừa lên cấp", tag: "Lv. 15", meta: "8 phút trước · Cấp độ", kind: "level" },
  { id: "f6", who: "Anh N.", text: "vừa lên cấp", tag: "Lv. 5", meta: "12 phút trước · Cấp độ", kind: "level" },
];
