"""
Tạo file audio TOEIC Listening Part 2 (Unit 1 – Office Life).

Cài đặt (1 lần):
    pip install edge-tts
    + cài ffmpeg (Windows: winget install ffmpeg | macOS: brew install ffmpeg)

Chạy:
    python make_toeic_audio.py

Kết quả: unit1_part2.mp3 ở cùng thư mục.

edge-tts dùng giọng neural của Microsoft, miễn phí, không cần API key,
nhưng cần có Internet khi chạy.
"""

import asyncio
import os
import shutil
import subprocess
import tempfile

import edge_tts

# ----- Giọng đọc: 4 accent như đề thật -----
VOICES = {
    "US_M": "en-US-GuyNeural",
    "US_F": "en-US-JennyNeural",
    "UK_M": "en-GB-RyanNeural",
    "UK_F": "en-GB-SoniaNeural",
    "AU_M": "en-AU-WilliamNeural",
    "AU_F": "en-AU-NatashaNeural",
    "CA_M": "en-CA-LiamNeural",
    "CA_F": "en-CA-ClaraNeural",
}
NARRATOR = "US_M"

# ----- Timing (giây) -----
PAUSE_AFTER_NUMBER = 0.8
PAUSE_AFTER_QUESTION = 1.0
PAUSE_BETWEEN_OPTIONS = 0.8
ANSWER_TIME = 5.0  # thời gian chọn đáp án, giống Part 2 thật

DIRECTIONS = (
    "Part 2. Directions: You will hear a question or statement and three "
    "responses spoken in English. They will not be printed in your test book "
    "and will be spoken only one time. Select the best response to the question "
    "or statement and mark the letter A, B, or C on your answer sheet."
)

# ----- Nội dung: (giọng hỏi, câu hỏi, giọng trả lời, [A, B, C]) -----
# Muốn làm Unit mới: chỉ cần sửa danh sách này.
QUESTIONS = [
    ("UK_F", "When is the quarterly report due?", "AU_M",
     ["It's on the third floor.", "By Friday afternoon.", "Yes, I reported it."]),
    ("US_M", "Who's leading the training session tomorrow?", "CA_F",
     ["Ms. Tanaka from HR.", "It starts at nine.", "The train was delayed."]),
    ("AU_F", "Where can I find extra printer paper?", "UK_M",
     ["It's a newspaper article.", "In the supply cabinet.", "Print two copies, please."]),
    ("CA_M", "Why was the client meeting postponed?", "US_F",
     ["The client's flight was canceled.", "In conference room B.", "Yes, it was posted online."]),
    ("US_F", "Would you like me to book the conference room?", "AU_M",
     ["I've already reserved it.", "A book about management.", "Room for twelve people."]),
    ("UK_M", "Have you submitted your travel expenses yet?", "CA_F",
     ["I traveled to Singapore.", "It's quite expensive.", "Not yet, I'm still collecting receipts."]),
    ("AU_M", "Should we order lunch or go out to eat?", "UK_F",
     ["Yes, I ordered it.", "Let's go to the café downstairs.", "It was delicious."]),
    ("CA_F", "The new scheduling software is quite efficient, isn't it?", "US_M",
     ["A software engineer.", "On my schedule.", "Yes, it saves me a lot of time."]),
]

OUTPUT = "unit1_part2.mp3"
SAMPLE_RATE = "24000"


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def to_wav(src, dst):
    ffmpeg("-i", src, "-ar", SAMPLE_RATE, "-ac", "1", dst)


def make_silence(seconds, dst):
    ffmpeg("-f", "lavfi", "-i", f"anullsrc=r={SAMPLE_RATE}:cl=mono",
           "-t", str(seconds), dst)


async def speak(text, voice_key, dst_wav, rate="-5%"):
    """Đọc text bằng giọng chỉ định. rate âm = chậm hơn một chút cho dễ nghe."""
    tmp_mp3 = dst_wav.replace(".wav", ".mp3")
    await edge_tts.Communicate(text, VOICES[voice_key], rate=rate).save(tmp_mp3)
    to_wav(tmp_mp3, dst_wav)


async def build(workdir):
    parts = []
    silences = {}
    counter = 0

    def silence(sec):
        if sec not in silences:
            path = os.path.join(workdir, f"silence_{sec}.wav")
            make_silence(sec, path)
            silences[sec] = path
        parts.append(silences[sec])

    async def say(text, voice):
        nonlocal counter
        counter += 1
        path = os.path.join(workdir, f"clip_{counter:03d}.wav")
        await speak(text, voice, path)
        parts.append(path)

    await say(DIRECTIONS, NARRATOR)
    silence(2.0)

    for i, (q_voice, question, a_voice, options) in enumerate(QUESTIONS, start=1):
        print(f"  Câu {i}/{len(QUESTIONS)}...")
        await say(f"Number {i}.", NARRATOR)
        silence(PAUSE_AFTER_NUMBER)
        await say(question, q_voice)
        silence(PAUSE_AFTER_QUESTION)
        for letter, option in zip("ABC", options):
            await say(f"({letter}) {option}", a_voice)
            silence(PAUSE_BETWEEN_OPTIONS)
        silence(ANSWER_TIME)

    await say("This is the end of Part 2.", NARRATOR)

    list_file = os.path.join(workdir, "list.txt")
    with open(list_file, "w", encoding="utf-8") as f:
        for p in parts:
            f.write(f"file '{p}'\n")
    ffmpeg("-f", "concat", "-safe", "0", "-i", list_file,
           "-codec:a", "libmp3lame", "-b:a", "128k", OUTPUT)


def main():
    if not shutil.which("ffmpeg"):
        raise SystemExit("Chưa cài ffmpeg. Xem hướng dẫn ở đầu file.")
    print("Đang tạo audio...")
    with tempfile.TemporaryDirectory() as workdir:
        asyncio.run(build(workdir))
    print(f"Xong: {OUTPUT}")


if __name__ == "__main__":
    main()