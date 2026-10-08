"""
Render TOEIC Listening audio for the app (exam mode + practice mode + dictation)
from the JSON produced by the system prompt.

Cài đặt (1 lần):
    pip install edge-tts
    + ffmpeg (Windows: winget install ffmpeg | macOS: brew install ffmpeg)

Chạy (1 hoặc nhiều file JSON, mỗi file 1 Part hoặc 1 batch của Part):
    python render_toeic_audio.py part1.json part2.json part3_a.json part3_b.json --out output

Kết quả:
    output/manifest.json                 app đọc file này (đường dẫn audio, thời lượng,
                                         từng câu kèm mốc thời gian, đáp án, giải thích)
    output/partN/directions.mp3          phát 1 lần khi người dùng vào Part
    output/partN/full_partN.mp3          cả Part liền mạch, đúng timing đề thật
    Part 1, 2:  output/partN/q007/item.mp3, seg_01.mp3 ...
    Part 3, 4:  output/partN/q032-034/conversation.mp3   (set opening + hội thoại → Replay)
                output/partN/q032-034/q032.mp3 ...       (từng câu hỏi)
                output/partN/q032-034/item.mp3           (hội thoại + 3 câu hỏi, có 8s trả lời)
                output/partN/q032-034/seg_01.mp3 ...     (từng câu để chép chính tả)

Tuỳ chọn:
    --narrator UK_M      đổi giọng người dẫn (mặc định US_M)
"""

import argparse
import asyncio
import json
import os
import shutil
import subprocess
import tempfile
import hashlib
from pathlib import Path

import edge_tts

VOICES = {
    "US_M": "en-US-GuyNeural",     "US_F": "en-US-JennyNeural",
    "UK_M": "en-GB-RyanNeural",    "UK_F": "en-GB-SoniaNeural",
    "AU_M": "en-AU-WilliamNeural", "AU_F": "en-AU-NatashaNeural",
    "CA_M": "en-CA-LiamNeural",    "CA_F": "en-CA-ClaraNeural",
}
SR = "24000"
ANSWER_TIME = {1: 5.0, 2: 5.0, 3: 8.0, 4: 8.0}
PART2_GAP = 1.0  # khoảng lặng sau câu hỏi và giữa các đáp án Part 2

# Directions mặc định (dùng khi JSON không có directions)
DEFAULT_DIRECTIONS = {
    1: "Part 1. Directions: For each question in this part, you will hear four statements about a picture in your test book. When you hear the statements, you must select the one statement that best describes what you see in the picture. Then find the number of the question on your answer sheet and mark your answer. The statements will not be printed in your test book and will be spoken only one time.",
    2: "Part 2. Directions: You will hear a question or statement and three responses spoken in English. They will not be printed in your test book and will be spoken only one time. Select the best response to the question or statement and mark the letter (A), (B), or (C) on your answer sheet.",
    3: "Part 3. Directions: You will hear some conversations between two or more people. You will be asked to answer three questions about what the speakers say in each conversation. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The conversations will not be printed in your test book and will be spoken only one time.",
    4: "Part 4. Directions: You will hear some talks given by a single speaker. You will be asked to answer three questions about what the speaker says in each talk. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The talks will not be printed in your test book and will be spoken only one time.",
}

ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()


def num_words(n):
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ("" if n % 10 == 0 else "-" + ONES[n % 10])
    return "one hundred"


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def wav_duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", path], capture_output=True, text=True)
    return float(out.stdout.strip() or 0)


def load_json(path):
    raw = open(path, encoding="utf-8").read().strip()
    if raw.startswith("```"):  # cho phép dán nguyên khối ```json từ AI
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(raw)


class Studio:
    def __init__(self, workdir, narrator):
        self.wd = workdir
        self.narrator = narrator
        self.silences = {}
        self.n = 0
        self.semaphore = asyncio.Semaphore(8)

    def silence(self, sec):
        sec = round(float(sec), 2)
        if sec not in self.silences:
            p = os.path.join(self.wd, f"sil_{sec}.wav")
            ffmpeg("-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono", "-t", str(sec), p)
            self.silences[sec] = (p, sec)
        return self.silences[sec]

    async def speak(self, seg, speakers):
        key = seg.get("speaker", "NARRATOR")
        voice_key = self.narrator if key == "NARRATOR" else speakers.get(key, key)
        if voice_key not in VOICES:
            raise ValueError(f"Segment '{seg.get('id')}': voice key không hợp lệ '{voice_key}'")
        self.n += 1
        mp3 = os.path.join(self.wd, f"clip_{self.n:05d}.mp3")
        wav = mp3[:-4] + ".wav"
        edge_filter = (
            "silenceremove=start_periods=1:start_duration=0.08:"
            "start_threshold=-45dB:start_silence=0.06,"
            "areverse,silenceremove=start_periods=1:start_duration=0.08:"
            "start_threshold=-45dB:start_silence=0.06,areverse"
        )
        cache_dir = os.environ.get("YTS_TTS_CACHE")
        cached = None
        if cache_dir:
            fingerprint = json.dumps([seg["text"], VOICES[voice_key], seg.get("rate", "+0%"),
                                      seg.get("pitch", "+0Hz"), SR, edge_filter])
            cached = Path(cache_dir) / (hashlib.sha256(fingerprint.encode()).hexdigest() + ".wav")
            cached.parent.mkdir(parents=True, exist_ok=True)
            if cached.is_file():
                seg["_wav"], seg["_dur"], seg["_voice"] = str(cached), wav_duration(str(cached)), voice_key
                return
        async with self.semaphore:
            for attempt in range(4):
                try:
                    await edge_tts.Communicate(seg["text"], VOICES[voice_key],
                                               rate=seg.get("rate", "+0%"),
                                               pitch=seg.get("pitch", "+0Hz")).save(mp3)
                    ffmpeg("-i", mp3, "-af", edge_filter, "-ar", SR, "-ac", "1", wav)
                    if cached:
                        staged = cached.with_suffix(f".{os.getpid()}.{self.n}.tmp")
                        shutil.copyfile(wav, staged)
                        os.replace(staged, cached)
                    break
                except Exception:
                    for partial in (mp3, wav):
                        if os.path.exists(partial):
                            os.remove(partial)
                    if attempt == 3:
                        raise
                    await asyncio.sleep(1.5 * (attempt + 1))
        seg["_wav"], seg["_dur"], seg["_voice"] = wav, wav_duration(wav), voice_key

    def export(self, pieces, out_mp3):
        """pieces = list of (wav_path, duration). Returns total duration."""
        os.makedirs(os.path.dirname(out_mp3), exist_ok=True)
        lst = os.path.join(self.wd, f"list_{self.n}_{abs(hash(out_mp3))}.txt")
        with open(lst, "w", encoding="utf-8") as f:
            for p, _ in pieces:
                f.write(f"file '{p}'\n")
        ffmpeg("-f", "concat", "-safe", "0", "-i", lst,
               "-codec:a", "libmp3lame", "-b:a", "128k", out_mp3)
        return round(sum(d for _, d in pieces), 2)


def guess_role(seg, part, index):
    """Dự phòng khi JSON thiếu 'role'."""
    if seg.get("role"):
        return seg["role"]
    text = seg["text"].lstrip()
    if seg.get("speaker") == "NARRATOR":
        if text.startswith("Questions "):
            return "set_opening"
        if part in (1, 2) and index == 0:
            return "item_opening"
        return "question" if part in (3, 4) else "item_opening"
    if text[:3] in ("(A)", "(B)", "(C)", "(D)"):
        return "option"
    return "prompt" if part == 2 else "speech"


def build_transition(part, first_number):
    if part == 1:
        return "Now Part 1 will begin."
    if part == 2:
        return f"Now let us begin with question number {num_words(first_number)}."
    return None


async def render(files, out_dir, narrator):
    # Gom item theo Part (nhiều batch của cùng 1 Part được nối lại)
    parts = {}
    for f in files:
        data = load_json(f)
        part = int(data["meta"]["part"])
        p = parts.setdefault(part, {"meta": data["meta"], "directions": [], "items": [], "closing": None})
        d = data.get("directions") or []
        p["directions"] += [d] if isinstance(d, dict) else d
        p["items"] += data["items"]
        if data.get("closing"):
            p["closing"] = data["closing"]

    manifest = {"version": 2, "parts": []}
    with tempfile.TemporaryDirectory() as wd:
        st = Studio(wd, narrator)
        for part in sorted(parts):
            P = parts[part]
            P["items"].sort(key=lambda it: min(it.get("numbers") or [q["number"] for q in it["questions"]]))
            first_no = min(P["items"][0].get("numbers") or [P["items"][0]["questions"][0]["number"]])
            pdir = os.path.join(out_dir, f"part{part}")
            gap = ANSWER_TIME[part]
            print(f"\n=== Part {part}: {len(P['items'])} item ===", flush=True)

            # ---- Directions ----
            dirs = P["directions"] or [{"speaker": "NARRATOR", "role": "directions",
                                        "text": DEFAULT_DIRECTIONS[part], "pause_after": 2.0}]
            trans = build_transition(part, first_no)
            if trans and not any(trans.split(" with ")[0] in d["text"] for d in dirs):
                dirs.append({"speaker": "NARRATOR", "role": "directions", "text": trans, "pause_after": 1.5})
            dir_pieces = []
            await asyncio.gather(*(st.speak(d, {}) for d in dirs))
            for d in dirs:
                dir_pieces += [(d["_wav"], d["_dur"]), st.silence(d.get("pause_after", 1.5))]
            dir_rel = f"part{part}/directions.mp3"
            dir_dur = st.export(dir_pieces[:-1], os.path.join(out_dir, dir_rel))
            full_pieces = list(dir_pieces)

            part_entry = {"part": part, "content_hash": P["meta"].get("content_hash"), "content_revision": P["meta"].get("content_revision"), "directions": {"audio": dir_rel, "duration": dir_dur,
                                                       "text": " ".join(d["text"] for d in dirs)},
                          "answer_time": gap, "items": []}

            # ---- Items ----
            for item in P["items"]:
                spk = item.get("speakers", {})
                nums = item.get("numbers") or [q["number"] for q in item["questions"]]
                folder = f"q{nums[0]:03d}" if len(nums) == 1 else f"q{nums[0]:03d}-{nums[-1]:03d}"
                rel = f"part{part}/{folder}"
                idir = os.path.join(out_dir, rel)
                print(f"  {folder}", flush=True)

                segs = item.get("segments", [])
                for i, s in enumerate(segs):
                    s["role"] = guess_role(s, part, i)
                await asyncio.gather(*(st.speak(s, spk) for s in segs))
                if part == 2:  # luật cố định: câu hỏi → 1s → (A) → 1s → (B) → 1s → (C)
                    opts = [i for i, s in enumerate(segs) if s["role"] == "option"]
                    for i, s in enumerate(segs):
                        if s["role"] == "prompt" or (s["role"] == "option" and i != opts[-1]):
                            s["pause_after"] = PART2_GAP
                qsegs = [q["segment"] for q in item.get("questions", []) if q.get("segment")]
                for s in qsegs:
                    s["role"] = "question"
                await asyncio.gather(*(st.speak(s, spk) for s in qsegs))

                # main.mp3 = item.mp3 (Part 1-2) hoặc conversation.mp3 (Part 3-4), không có khoảng trả lời cuối
                main_pieces, seg_entries, t, clip_no = [], [], 0.0, 0
                for i, s in enumerate(segs):
                    entry = {"id": s.get("id"), "role": s["role"], "speaker": s.get("speaker"),
                             "voice": s["_voice"], "text": s["text"],
                             "start": round(t, 2), "end": round(t + s["_dur"], 2)}
                    if s.get("dictation"):
                        clip_no += 1
                        clip_rel = f"{rel}/seg_{clip_no:02d}.mp3"
                        st.export([(s["_wav"], s["_dur"])], os.path.join(out_dir, clip_rel))
                        entry.update({"dictation": True, "audio": clip_rel,
                                      "dictation_text": s.get("dictation_text", s["text"])})
                        if s.get("focus"):
                            entry["focus"] = s["focus"]
                    seg_entries.append(entry)
                    main_pieces.append((s["_wav"], s["_dur"]))
                    t += s["_dur"]
                    if i < len(segs) - 1:
                        sil = st.silence(s.get("pause_after", 0.5))
                        main_pieces.append(sil)
                        t += sil[1]

                main_name = "item.mp3" if part in (1, 2) else "conversation.mp3"
                main_rel = f"{rel}/{main_name}"
                main_dur = st.export(main_pieces, os.path.join(out_dir, main_rel))
                audio = {"main": main_rel}
                durations = {"main": main_dur}

                # Câu hỏi Part 3-4: từng file riêng + item.mp3 đầy đủ
                q_entries = []
                if part in (3, 4):
                    lead = st.silence(segs[-1].get("pause_after", 1.5) if segs else 1.5)
                    item_pieces = main_pieces + [lead]
                    for q in item["questions"]:
                        s = q.get("segment")
                        qe = {k: q.get(k) for k in ("number", "printed_question", "options",
                                                     "answer", "explanation_vi")}
                        if s:
                            q_rel = f"{rel}/q{q['number']:03d}.mp3"
                            qe["audio"] = q_rel
                            qe["duration"] = st.export([(s["_wav"], s["_dur"])], os.path.join(out_dir, q_rel))
                            qe["spoken_text"] = s["text"]
                            if s.get("dictation"):
                                clip_no += 1
                                clip_rel = f"{rel}/seg_{clip_no:02d}.mp3"
                                st.export([(s["_wav"], s["_dur"])], os.path.join(out_dir, clip_rel))
                                qe["dictation_audio"] = clip_rel
                                qe["dictation_text"] = s.get("dictation_text", s["text"])
                            item_pieces += [(s["_wav"], s["_dur"]), st.silence(gap)]
                        q_entries.append(qe)
                    item_rel = f"{rel}/item.mp3"
                    audio["item"] = item_rel
                    durations["item"] = st.export(item_pieces, os.path.join(out_dir, item_rel))
                    full_pieces += item_pieces
                else:
                    for q in item["questions"]:
                        q_entries.append({k: q.get(k) for k in ("number", "options", "answer", "explanation_vi")})
                    full_pieces += main_pieces + [st.silence(gap)]

                part_entry["items"].append({
                    "id": item.get("id", folder), "numbers": nums, "folder": rel,
                    "audio": audio, "duration": durations,
                    "speakers": spk, "speaker_names": item.get("speaker_names"), "photo_brief": item.get("photo_brief"),
                    "graphic": item.get("graphic"),
                    "segments": seg_entries, "questions": q_entries,
                })

            # ---- Closing + full Part ----
            if P["closing"]:
                c = P["closing"]
                await st.speak(c, {})
                full_pieces += [(c["_wav"], c["_dur"])]
            full_rel = f"part{part}/full_part{part}.mp3"
            part_entry["full_audio"] = full_rel
            part_entry["full_duration"] = st.export(full_pieces, os.path.join(out_dir, full_rel))
            manifest["parts"].append(part_entry)

    staged_manifest = os.path.join(out_dir, f"manifest.{os.getpid()}.tmp")
    with open(staged_manifest, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    os.replace(staged_manifest, os.path.join(out_dir, "manifest.json"))
    return manifest


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("json_files", nargs="+")
    ap.add_argument("--out", default="output")
    ap.add_argument("--narrator", default="US_M", choices=list(VOICES))
    a = ap.parse_args()
    if not shutil.which("ffmpeg"):
        raise SystemExit("Chưa cài ffmpeg. Xem hướng dẫn ở đầu file.")
    m = asyncio.run(render(a.json_files, a.out, a.narrator))
    total = sum(len(p["items"]) for p in m["parts"])
    print(f"\nXong: {total} item, {len(m['parts'])} Part → {a.out}/ (xem manifest.json)")


if __name__ == "__main__":
    main()
