"""Convert the original Writing curriculum into the site's typed content catalog."""
from pathlib import Path
import json
import re
import shutil
import runpy

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/writing/materials"
DEST = ROOT / "web/src/lib/writing-content.json"


def clean(value):
    return value.replace("**", "").replace("`", "").strip()


def field(text, name):
    match = re.search(r"\*\*" + re.escape(name) + r":\*\*\s*(.*?)(?=\n\n|$)", text, re.S)
    return clean(match[1]) if match else ""


def rows(text, prefix):
    return [[clean(c) for c in line.strip().strip("|").split("|")]
            for line in text.splitlines() if re.match(r"^\| " + prefix, line)]


p1 = (SOURCE / "01-part1-picture.md").read_text()
answers = {r[0]: r[1:] for r in rows(p1, r"\d{2} \|")}
pictures = []
for row in rows(p1, "P1-"):
    code, category, scene, pair = row
    answer, explanation = answers[code[-2:]]
    pictures.append(dict(id=code, part="picture", title=scene, category=category,
                         scene=scene, words=[s.strip() for s in pair.split("/")],
                         answer=answer, explanation=explanation))

p2 = (SOURCE / "02-part2-email.md").read_text()
emails = []
for match in re.finditer(r"^### (E\d{2}) — ([^\n]+)\n(.*?)(?=^### |^## 4\.|\Z)", p2, re.M | re.S):
    code, title, body = match.groups()
    metadata = re.search(r"\*\*From:\*\* (.*?) · \*\*To:\*\* (.*?) · \*\*Subject:\*\* (.*)", body)
    assert metadata, code
    incoming = "\n".join(line[2:] for line in body.splitlines() if line.startswith("> "))
    # Email samples start with Dear/Hello; stop at the next pedagogical annotation.
    samples = re.findall(r"^(?:Dear|Hello) [^\n]+,\n.*?(?=\n\n\*\*|\Z)", body, re.M | re.S)
    outline = field(body, "Dàn ý")
    vocab = field(body, "Từ vựng")
    if "Từ vựng:" in outline:
        outline, vocab = outline.split("Từ vựng:", 1)
    emails.append(dict(id=code, part="email", title=title, category="Email",
                       sender=metadata[1], recipient=metadata[2], subject=metadata[3],
                       incoming=incoming, task=field(body, "Yêu cầu"), outline=outline.strip(),
                       vocabulary=vocab.strip(), samples=samples,
                       explanation=field(body, "Đối chiếu") or field(body, "Phân tích cấu trúc")))

p3 = (SOURCE / "03-part3-essay.md").read_text()
essays = []
for code, topic, category_level, prompt, ideas in rows(p3, r"W\d{2} \|"):
    category, level = [x.strip() for x in category_level.split(" / ")]
    essays.append(dict(id=code, part="essay", title=prompt, category=category,
                       topic=topic, difficulty=level, prompt=prompt,
                       ideas=[x.strip() for x in ideas.split(";")], samples=[],
                       outline="", vocabulary="", explanation="", analysis="", summary=""))
for match in re.finditer(r"^### Mẫu [A-E] — .*? — (W\d{2})\n(.*?)(?=^### |^## 6\.|\Z)", p3, re.M | re.S):
    code, body = match.groups()
    sample = re.search(r"\*\*Bài mẫu:\*\*\n\n(.*?)\n\n\*\*Tóm nghĩa:", body, re.S)[1]
    essay = next(item for item in essays if item["id"] == code)
    analysis = re.search(r"\*\*Phân tích đề:\*\* (.*?)(?=\*\*Dàn ý:|\n\n)", body, re.S)[1]
    essay.update(samples=[sample], analysis=clean(analysis), outline=field(body, "Dàn ý"),
                 vocabulary=field(body, "Từ vựng"), explanation=field(body, "Điểm học"), summary=field(body, "Tóm nghĩa"))

grammar = {}
for part, text, heading in [("picture", p1, "Kiến thức"), ("email", p2, "Chức năng"), ("essay", p3, "Công thức giữ kiến thức")]:
    table = re.search(r"^\| " + heading + r".*?\n(.*?)(?=\n\n)", text, re.M | re.S)[0]
    parsed = [r for r in rows(table, ".") if not r[0].startswith("---")]
    grammar[part] = {"headers": parsed[0], "rows": parsed[1:]}

bank = SOURCE / 'bank-source'
for name, target in [('pictures', pictures), ('emails', emails), ('essays', essays)]:
    runpy.run_path(str(bank / f'write_{name}.py'), run_name='__main__')
    target.extend(json.loads((bank / f'{name}.json').read_text()))
reference = runpy.run_path(str(bank / 'write_essays.py'))['reference']
for item in essays:
    if not item['outline']:
        item.update(reference(item['category'], item['ideas'], 'Tự xây dựng tình huống cụ thể phù hợp hai luận điểm của đề; nêu ai làm gì và kết quả.'))
catalog = dict(pictures=pictures, emails=emails, essays=essays, grammar=grammar)
assert len(pictures) == 200 and len(emails) == 50 and len(essays) == 100
assert len({item['id'] for group in [pictures, emails, essays] for item in group}) == 350
assert all(item["samples"] for item in emails)
assert sum(bool(item["samples"]) for item in essays) == 5
DEST.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n")
def export_bank(filename, title, lessons):
    sections = [f'# {title}', 'Nội dung biên soạn mới. Làm bài trước khi mở đáp án hoặc dàn ý.']
    for item in lessons:
        sections.append(f"## {item['id']} — {item['title']}")
        sections.append(f"**Danh mục:** {item['category']}")
        if item['part'] == 'picture':
            sections.extend([f"**Từ gợi ý:** {' / '.join(item['words'])}", f"**Đáp án tham khảo:** {item['answer']}", item['explanation']])
        elif item['part'] == 'email':
            sections.extend([f"**From:** {item['sender']} · **To:** {item['recipient']} · **Subject:** {item['subject']}", '\n'.join('> '+line for line in item['incoming'].splitlines()), f"**Yêu cầu:** {item['task']}"])
        else:
            sections.extend([f"**Chủ đề:** {item['topic']} · **Độ khó:** {item['difficulty']}", item['analysis']])
        if item['part'] != 'picture':
            sections.extend(['**Dàn ý:**\n\n'+item['outline'], '**Từ vựng:** '+item['vocabulary']])
            sections.extend('**Bài mẫu tham khảo:**\n\n'+sample for sample in item['samples'])
            if not item['samples']:
                sections.append('Bài này luyện phát triển bài viết từ dàn ý; chưa có bài mẫu hoàn chỉnh riêng.')
            sections.append('**Giải thích:** '+item['explanation'])
    (SOURCE / filename).write_text('\n\n'.join(sections)+'\n')
export_bank('05-picture-bank.md', 'Part 1 — Kho 200 bài viết theo cảnh', pictures)
export_bank('06-email-bank.md', 'Part 2 — Kho 50 bài email', emails)
export_bank('07-essay-bank.md', 'Part 3 — Kho 100 đề và dàn ý essay', essays)
runpy.run_path(str(SOURCE / 'build_reader.py'), run_name='__main__')
public = ROOT / "web/public/writing"
public.mkdir(parents=True, exist_ok=True)
shutil.copyfile(SOURCE / "TOEIC-Writing.html", public / "TOEIC-Writing.html")
print("Built 200 scenes, 50 email tasks, 100 essay prompts and the offline reader.")
