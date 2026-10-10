"""Build a self-contained, offline HTML reader with Python's standard library."""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parent
FILES = ["README.md", "01-part1-picture.md", "02-part2-email.md",
         "03-part3-essay.md", "04-teacher-guide.md", "05-picture-bank.md",
         "06-email-bank.md", "07-essay-bank.md"]
ANCHORS = {name: f"chapter-{i}" for i, name in enumerate(FILES)}


def inline(value):
    value = html.escape(value)
    value = re.sub(r"`([^`]+)`", r"<code>\1</code>", value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", value)

    def link(match):
        label, target = match.groups()
        target = "#" + ANCHORS[target] if target in ANCHORS else target
        return f'<a href="{target}">{label}</a>'

    return re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, value)


def render(text):
    lines = text.splitlines()
    output = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        heading = re.match(r"^(#{1,6}) (.+)$", line)
        if heading:
            level = len(heading[1])
            output.append(f"<h{level}>{inline(heading[2])}</h{level}>")
            i += 1
        elif line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-+:?", c) for c in cells):
                    rows.append(cells)
                i += 1
            output.append('<div class="table-scroll"><table><thead><tr>')
            output.extend(f"<th>{inline(c)}</th>" for c in rows[0])
            output.append("</tr></thead><tbody>")
            for row in rows[1:]:
                output.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in row) + "</tr>")
            output.append("</tbody></table></div>")
        elif line.startswith(">"):
            output.append("<blockquote>")
            while i < len(lines) and lines[i].startswith(">"):
                output.append("<p>" + inline(lines[i][1:].strip()) + "</p>")
                i += 1
            output.append("</blockquote>")
        elif re.match(r"^(?:- |\d+\. )", line):
            ordered = bool(re.match(r"^\d+\.", line))
            tag = "ol" if ordered else "ul"
            pattern = r"^\d+\. " if ordered else r"^- "
            output.append(f"<{tag}>")
            while i < len(lines) and re.match(pattern, lines[i]):
                output.append("<li>" + inline(re.sub(pattern, "", lines[i])) + "</li>")
                i += 1
            output.append(f"</{tag}>")
        else:
            paragraph = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r"^(?:#|\||>|- |\d+\. )", lines[i]):
                paragraph.append(lines[i])
                i += 1
            output.append("<p>" + inline(" ".join(paragraph)) + "</p>")
    return "\n".join(output)


def main():
    chapters = []
    navigation = []
    for filename in FILES:
        content = (ROOT / filename).read_text(encoding="utf-8")
        title = content.splitlines()[0].lstrip("# ")
        anchor = ANCHORS[filename]
        navigation.append(f'<a href="#{anchor}">{html.escape(title)}</a>')
        chapters.append(f'<article id="{anchor}">{render(content)}</article>')
    style = """
    :root{color-scheme:light;--ink:#243347;--accent:#17645d;--line:#dce4e6}
    *{box-sizing:border-box}body{margin:0;background:#f2f5f3;color:var(--ink);
    font:17px/1.75 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    header,main,nav{max-width:1100px;margin:auto}header{padding:48px 32px 24px}
    header p{margin:0;color:#52646d}header strong{font-size:32px;color:var(--accent)}
    nav{padding:20px 32px;display:grid;gap:10px}nav a{padding:10px 16px;background:white;
    border:1px solid var(--line);border-radius:8px;text-decoration:none}
    article{background:white;margin:26px 0;padding:38px 42px;border:1px solid var(--line);
    border-radius:10px;scroll-margin-top:20px}h1{font-size:30px;line-height:1.3;color:var(--accent)}
    h2{font-size:23px;margin-top:36px}h3{font-size:20px;margin-top:32px}
    a{color:#126c83}p{margin:14px 0}li{margin:7px 0}code{background:#eef3f4;
    padding:2px 5px;border-radius:4px;font-size:.9em;overflow-wrap:anywhere}
    blockquote{margin:18px 0;padding:12px 22px;border-left:4px solid var(--accent);background:#f3f8f6}
    blockquote p{margin:7px 0}.table-scroll{overflow:auto;margin:20px 0}
    table{border-collapse:collapse;width:100%;font-size:15px;line-height:1.6}
    th,td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}
    th{background:#eaf3f0}tr:nth-child(even){background:#fafcfb}
    footer{text-align:center;padding:24px;color:#52646d;font-size:14px}
    @media(max-width:700px){header{padding:26px 20px}nav{padding:12px 20px}
    article{padding:24px 20px;border-radius:0}h1{font-size:25px}table{min-width:640px}}
    @media print{@page{size:A4;margin:17mm}body{background:white;font-size:10pt;line-height:1.5}
    header,nav{display:none}article{border:0;padding:0;margin:0;border-radius:0;break-before:page}
    h1{font-size:19pt}h2{font-size:15pt;break-after:avoid}h3{font-size:12pt;break-after:avoid}
    .table-scroll{overflow:visible}table{font-size:8.5pt;min-width:0}tr{break-inside:avoid}
    thead{display:table-header-group}td,th{padding:5px}a{color:inherit}footer{display:none}}
    """
    page = ('<!doctype html><html lang="vi"><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>TOEIC Writing — Giáo trình và bài luyện</title>'
            f'<style>{style}</style></head><body><header><strong>TOEIC Writing</strong>'
            '<p>Giáo trình và bài luyện · Câu theo cảnh · Email · Essay</p></header>'
            '<nav aria-label="Mục lục">' + "".join(navigation) + '</nav><main>'
            + "".join(chapters) + '</main><footer>Học liệu biên soạn mới · '
            'Mở bản in bằng chức năng Print của trình duyệt</footer></body></html>')
    (ROOT / "TOEIC-Writing.html").write_text(page, encoding="utf-8")
    print("Built TOEIC-Writing.html")


if __name__ == "__main__":
    main()
