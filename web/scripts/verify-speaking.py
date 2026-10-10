"""Recheck curated YouTube metadata. Never downloads video/audio or publishes transcripts."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import re
import subprocess
from datetime import datetime, timezone
from collections import Counter

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/speaking/catalog-source.json'
DEST = ROOT / 'web/src/lib/speaking-content.json'

def verify(item):
    url = 'https://www.youtube.com/watch?v=' + item['videoId']
    try:
        result = subprocess.run(['curl', '-f', '-L', '-sS', '--max-time', '30', url], capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError:
        return verify_embed(item)
    match = re.search(r'ytInitialPlayerResponse\s*=\s*', result.stdout)
    if not match:
        raise ValueError(f"No player metadata: {url}")
    player = json.JSONDecoder().raw_decode(result.stdout[match.end():])[0]
    details = player.get('videoDetails', {})
    duration = int(details.get('lengthSeconds', 0))
    if not 0 < duration < 900 or details.get('isLiveContent') or details.get('isPrivate'):
        raise ValueError(f"Not a public video under 15 minutes: {url} ({duration}s)")
    if details.get('author') != item['expectedSource']:
        raise ValueError(f"Channel mismatch: {url}: {details.get('author')}")
    status = player.get('playabilityStatus', {})
    if status.get('status') != 'OK' or not status.get('playableInEmbed'):
        raise ValueError(f"Not playable in embed at verification: {url}")
    tracks = player.get('captions', {}).get('playerCaptionsTracklistRenderer', {}).get('captionTracks', [])
    return {k:v for k,v in item.items() if k != 'expectedSource'} | dict(
        title=details['title'], source=details['author'], sourceUrl=url,
        durationSeconds=duration, verifiedAt=datetime.now(timezone.utc).isoformat(timespec='seconds'),
        captionLanguages=sorted(set(t['languageCode'] for t in tracks)), embedAllowed=True)

def verify_embed(item):
    """Read public embed preview metadata when the watch endpoint is unavailable."""
    url = 'https://www.youtube.com/embed/' + item['videoId']
    result = subprocess.run(['curl', '-f', '-L', '-sS', '--max-time', '30', '--referer',
                             'http://localhost:3000/', url], capture_output=True, text=True, check=True)
    match = re.search(r'"embedded_player_response":', result.stdout)
    if not match:
        raise ValueError('No embed preview metadata: ' + url)
    player = json.loads(json.JSONDecoder().raw_decode(result.stdout[match.end():])[0])
    status = player.get('previewPlayabilityStatus', {})
    if status.get('status') != 'OK' or not status.get('playableInEmbed'):
        raise ValueError('Not playable in embed preview: ' + url)
    preview = player['embedPreview']['thumbnailPreviewRenderer']
    source = preview['videoDetails']['embeddedPlayerOverlayVideoDetailsRenderer']['expandedRenderer']['embeddedPlayerOverlayVideoDetailsExpandedRenderer']['title']['runs'][0]['text']
    duration = int(preview['videoDurationSeconds'])
    if source != item['expectedSource'] or not 0 < duration < 900:
        raise ValueError('Embed source or duration mismatch: ' + url)
    return {k:v for k,v in item.items() if k != 'expectedSource'} | dict(
        title=''.join(run['text'] for run in preview['title']['runs']), source=source,
        sourceUrl='https://www.youtube.com/watch?v=' + item['videoId'], durationSeconds=duration,
        verifiedAt=datetime.now(timezone.utc).isoformat(timespec='seconds'),
        captionLanguages=[], embedAllowed=True, verificationMethod='embed-preview')

def main():
    authored = json.loads(SOURCE.read_text())
    def checked(item):
        try:
            return verify(item), None
        except Exception as error:
            return None, str(error)
    with ThreadPoolExecutor(max_workers=6) as pool:
        checked_items = list(pool.map(checked, authored))
    failures = [error for _, error in checked_items if error]
    if failures:
        raise ValueError('\n'.join(failures))
    videos = [video for video, _ in checked_items]
    assert len(videos) == len({v['videoId'] for v in videos}) == len(authored)
    publish(videos)

def publish(videos):
    assert len(videos) == len({v['videoId'] for v in videos})
    assert all(v['embedAllowed'] and 0 < v['durationSeconds'] < 900 for v in videos)
    DEST.write_text(json.dumps(videos, ensure_ascii=False, indent=2)+'\n')
    report = ['# Speaking — Video YouTube luyện nói dưới 15 phút',
              'Đã đọc ba ảnh tham khảo trong folder speaking. Giữ hướng luyện nghe chép, shadowing và xem video; dùng đoạn luyện theo thời gian, không giả lập transcript hay điểm phát âm. Video phát bằng trình nhúng YouTube và có link mở nguồn.',
              'Thời lượng, tên kênh và khả năng nhúng được kiểm tra từ metadata trang xem hoặc trang nhúng YouTube. Kiểm tra UTC: '+min(v['verifiedAt'] for v in videos)+' đến '+max(v['verifiedAt'] for v in videos)+'. Video có thể thay đổi khả năng phát theo vùng/tài khoản sau thời điểm này. Trang nhúng không cung cấp danh sách CC; captionLanguages rỗng ở các mục verificationMethod=embed-preview nghĩa là chưa xác định ngôn ngữ CC.',
              'Mỗi video có mục tiêu và nhiệm vụ nói tự biên soạn. Nút CC nằm trong trình phát nếu nguồn cung cấp; danh sách bên phải là các đoạn thời gian để luyện, không phải câu phụ đề. Không tải hoặc phân phối lại video.',
              '| Nhóm | Danh sách | Video nguồn | Thời lượng | Mục tiêu luyện |',
              '| --- | --- | --- | --- | --- |']
    for v in videos:
        seconds=v['durationSeconds']
        report.append(f"| {v['category']} | {v['collection']} | [{v['title'].replace('|','—')}]({v['sourceUrl']}) — {v['source']} | {seconds//60}:{seconds%60:02} | {v['goal']} |")
    report.extend(['', '## Tái kiểm tra', '', 'Chạy `python3 web/scripts/verify-speaking.py` tại thư mục dự án. Script chỉ cập nhật catalog khi tất cả video vượt kiểm tra. Nguồn biên soạn: `catalog-source.json`; dữ liệu giao diện: `web/src/lib/speaking-content.json`.', '', 'Tự thu âm cần trình duyệt cho phép micro; bản thu chỉ tồn tại trong phiên hiện tại. Bản nghe chép, ghi chú, bookmark và dấu tự luyện lưu trên trình duyệt. Không có dịch tự động, IPA theo từng từ hoặc chấm điểm phát âm.'])
    summary = ['## Phân bố thời lượng', '',
               'Bộ lọc dưới 5/10/15 phút áp dụng trong mỗi nhóm. Các giới hạn là tích lũy: dưới 10 phút bao gồm dưới 5 phút. Mặc định dưới 15 phút.', '',
               '| Nhóm | Tổng | Dưới 5 phút | 5–dưới 10 phút | 10–dưới 15 phút |',
               '| --- | ---: | ---: | ---: | ---: |']
    for category,count in Counter(v['category'] for v in videos).items():
        items=[v for v in videos if v['category']==category]
        buckets=[sum(lo <= v['durationSeconds'] < hi for v in items) for lo,hi in [(0,300),(300,600),(600,900)]]
        summary.append(f'| {category} | {count} | '+ ' | '.join(map(str,buckets))+' |')
    summary.extend(['', 'Giữ nguyên 40 video ban đầu trong catalog-baseline.json; thêm 50 video cho TOEIC, Conversation, Movie, Vlog và Business, thêm 8 bài phát âm. Movie ưu tiên lời thoại trong phim nổi tiếng, tránh ca hát và các mẫu nói cố ý không thành thạo. Đây là tuyển chọn theo nguồn và bối cảnh cảnh phim; không phải xác nhận đã nghe kiểm định toàn bộ âm thanh.', ''])
    (ROOT / 'docs/speaking/README.md').write_text('\n\n'.join(report[:4])+'\n\n'+'\n'.join(summary+report[4:])+'\n')
    print(f"Verified {len(videos)} unique videos; durations {min(v['durationSeconds'] for v in videos)}–{max(v['durationSeconds'] for v in videos)} seconds.")

if __name__ == '__main__':
    main()
