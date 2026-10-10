import { describe, expect, it } from "vitest";
import { EMPTY_SPEAKING, SPEAKING_CATEGORIES, SPEAKING_VIDEOS, filterSpeakingVideos, formatVideoTime, isVideoPracticed, parseSpeakingProgress, practiceSegments, youtubeVideoId } from "../speaking";

describe("curated YouTube speaking library", () => {
  it("only publishes unique, verified short videos and real learning tasks", () => {
    expect(SPEAKING_VIDEOS).toHaveLength(298);
    expect(new Set(SPEAKING_VIDEOS.map(video => video.videoId)).size).toBe(298);
    expect(new Set(SPEAKING_VIDEOS.map(video => video.category)).size).toBe(6);
    expect(new Set(SPEAKING_VIDEOS.map(video => video.collection)).size).toBeGreaterThanOrEqual(14);
    for (const video of SPEAKING_VIDEOS) {
      expect(video.durationSeconds).toBeGreaterThan(0);
      expect(video.durationSeconds).toBeLessThan(900);
      expect(video.embedAllowed).toBe(true);
      expect(Number.isFinite(Date.parse(video.verifiedAt))).toBe(true);
      expect(youtubeVideoId(video.sourceUrl)).toBe(video.id);
      expect(video.title && video.source && video.goal && video.practicePrompt).toBeTruthy();
    }
    for (const category of SPEAKING_CATEGORIES) expect(SPEAKING_VIDEOS.some(video => video.category === category.id)).toBe(true);
    const counts = {pronunciation: 20, toeic: 56, conversation: 56, movie: 54, vlog: 54, business: 58};
    for (const category of SPEAKING_CATEGORIES) expect(SPEAKING_VIDEOS.filter(video => video.category === category.id)).toHaveLength(counts[category.id]);
  });
  it("accepts supported YouTube links without accepting lookalike or unsafe hosts", () => {
    for (const url of ['https://youtu.be/Tn7a8Cv64B4?t=12', 'https://www.youtube.com/watch?v=Tn7a8Cv64B4', 'https://m.youtube.com/shorts/Tn7a8Cv64B4', 'https://youtube.com/embed/Tn7a8Cv64B4']) expect(youtubeVideoId(url)).toBe('Tn7a8Cv64B4');
    for (const url of ['https://youtube.com.evil.example/watch?v=Tn7a8Cv64B4', 'https://evil.example/youtube.com/watch?v=Tn7a8Cv64B4', 'javascript:alert(1)', 'https://youtube.com/watch?v=abc', 'some youtube.com link']) expect(youtubeVideoId(url)).toBeNull();
    const options = {category: 'conversation', accent: 'all', collection: 'all', query: 'https://youtu.be/Tn7a8Cv64B4', status: 'all'};
    expect(filterSpeakingVideos(options, EMPTY_SPEAKING).map(video => video.id)).toEqual(['Tn7a8Cv64B4']);
    expect(filterSpeakingVideos({...options, query: 'https://youtu.be/abcdefghijk'}, EMPTY_SPEAKING)).toEqual([]);
    expect(filterSpeakingVideos({...options, query: 'BBC', accent: 'us'}, EMPTY_SPEAKING)).toEqual([]);
    expect(filterSpeakingVideos({...options, query: '', collection: 'Giao tiếp hằng ngày'}, EMPTY_SPEAKING)).toHaveLength(3);
    for (const level of ['A2', 'B1', 'B2']) {
      const result = filterSpeakingVideos({...options, query: '', level}, EMPTY_SPEAKING);
      expect(result.every(video => video.level === level)).toBe(true);
    }
  });
  it("applies cumulative duration limits independently within every category", () => {
    for (const category of SPEAKING_CATEGORIES) {
      const options = {category: category.id, accent: 'all', collection: 'all', query: '', status: 'all'};
      const full = SPEAKING_VIDEOS.filter(video => video.category === category.id);
      for (const minutes of [5, 10, 15]) {
        const result = filterSpeakingVideos({...options, maxMinutes: minutes}, EMPTY_SPEAKING);
        expect(result.map(video => video.id)).toEqual(full.filter(video => video.durationSeconds < minutes * 60).map(video => video.id));
      }
      if (category.id !== 'pronunciation') expect(full.some(video => video.durationSeconds >= 600)).toBe(true);
    }
    const exactFive = SPEAKING_VIDEOS.find(video => video.durationSeconds === 300)!;
    expect(exactFive).toBeDefined();
    const options = {category: exactFive.category, accent: 'all', collection: 'all', query: exactFive.sourceUrl, status: 'all'};
    expect(filterSpeakingVideos({...options, maxMinutes: 5}, EMPTY_SPEAKING)).toEqual([]);
    expect(filterSpeakingVideos({...options, maxMinutes: 10}, EMPTY_SPEAKING)).toEqual([exactFive]);
  });
  it("covers each video with contiguous bounded practice segments, including its last seconds", () => {
    for (const video of SPEAKING_VIDEOS) {
      const segments = practiceSegments(video.durationSeconds);
      expect(segments[0].start).toBe(0);
      expect(segments.at(-1)?.end).toBe(video.durationSeconds);
      expect(new Set(segments.map(segment => segment.id)).size).toBe(segments.length);
      segments.forEach((segment, index) => {
        expect(segment.end).toBeGreaterThan(segment.start);
        expect(segment.end - segment.start).toBeLessThanOrEqual(30);
        if (index) expect(segment.start).toBe(segments[index - 1].end);
      });
    }
    expect(formatVideoTime(239)).toBe('3:59');
    for (const duration of [0, -1, Infinity, NaN, 900]) expect(practiceSegments(duration)).toEqual([]);
  });
  it("restores independent drafts and self-practice marks, rejecting damaged and unknown entries", () => {
    const video = SPEAKING_VIDEOS[0];
    const progress = parseSpeakingProgress(JSON.stringify({entries: {[video.id]: {note: 'Keep final consonants', bookmarked: true, drafts: {'0': 'What I heard', 'invalid': 'ignore'}, practiced: ['0', '0', 'invalid']}, unknown: {note: 'ignore'}}}));
    expect(progress.entries[video.id]).toEqual({note: 'Keep final consonants', bookmarked: true, drafts: {'0': 'What I heard'}, practiced: ['0']});
    expect(isVideoPracticed(video, progress.entries[video.id])).toBe(false);
    const complete = {practiced: practiceSegments(video.durationSeconds).map(segment => segment.id)};
    expect(isVideoPracticed(video, complete)).toBe(true);
    expect(filterSpeakingVideos({category: video.category, accent: 'all', collection: 'all', query: '', status: 'practiced'}, {entries: {[video.id]: complete}}).map(item => item.id)).toEqual([video.id]);
    for (const raw of [null, '{bad', 'null', '[]', '{"entries":[]}', '{"entries":{"TNFKG0yvDx4":[]}}']) expect(parseSpeakingProgress(raw)).toEqual(EMPTY_SPEAKING);
    expect(parseSpeakingProgress('{"entries":{"TNFKG0yvDx4":{"drafts":[],"practiced":"0","note":42}}}').entries[video.id]).toEqual({note: '', bookmarked: false, drafts: {}, practiced: []});
  });
});
