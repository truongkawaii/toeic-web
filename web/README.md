# TOEIC Practice — Web UI (Phase 1 + 2)

Giao diện học TOEIC xây theo [`docs/UI_BUILD_PLAN.md`](../docs/UI_BUILD_PLAN.md). Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · Lucide.

## Chạy

```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build      # kiểm tra type + build production
npm run lint
npm test           # Vitest: logic chấm điểm + kiểm tra dữ liệu đề
npm run parse:ets  # parse lại đề từ ../ets 2024, ../ets 2026
npm run build:yts  # xuất bộ YTS 2026 từ nguồn biên soạn trong scripts/yts
```

> Nếu thêm route mới khi `next dev` đang chạy mà trang báo 404, hãy khởi động lại dev server.

## YTS Listening và đề kết hợp

40 test YTS 2023–2026 đã có Listening, audio, chữa bài và nghe chép tại `/listening`. YTS 2024 và YTS 2026 có cả Reading: `/tests` cho chọn Listening, Reading hoặc toàn bài 200 câu. Lưu bài và bản nháp trên trình duyệt, chưa cần backend.

Đồng bộ nguồn/media: `npm run sync:listening`. Xem [hướng dẫn và giới hạn ảnh Part 1](../docs/YTS_LISTENING_UI.md). Smoke test: `node scripts/qa-yts.mjs listening`.

## Màn hình

### Speaking: video YouTube dưới 15 phút

`/speaking` dùng 298 video nguồn thật thuộc 6 nhóm: Pronunciation (20), TOEIC (56), Conversation (56), Movie (54), Vlog (54), Business English (58). Giữ 40 video ban đầu, bổ sung 50 video cho mỗi nhóm ngoài phát âm; phát âm thêm 8 bài về các âm còn thiếu. Metadata thời lượng 42–893 giây, tên kênh và khả năng nhúng đã được kiểm tra từ trang xem hoặc trang nhúng YouTube. Xem [danh sách nguồn và mục tiêu luyện](../docs/speaking/README.md).

Mở video để chọn Shadowing, Nghe chép hoặc Chỉ xem. Có phát đoạn với mốc đầu/cuối chỉnh được, tốc độ, nghe lặp, thu âm tại thiết bị và tải bản thu. Danh sách bên phải là các đoạn thời gian, chưa phải transcript theo câu. Dùng CC của YouTube nếu nguồn có phụ đề để tự đối chiếu. Bản thu chỉ ở trong phiên luyện; bài nghe chép, ghi chú, bookmark và dấu tự luyện lưu bằng key `toeic-speaking-v1`.

Nguồn biên tập: `docs/speaking/catalog-source.json`. Chạy `python3 scripts/verify-speaking.py` từ thư mục `web` để tái kiểm tra tất cả video và tạo lại catalog/báo cáo. Script chỉ xuất dữ liệu khi tất cả video vượt kiểm tra; không tải video/audio. Kiểm tra giao diện qua build và logic qua `src/lib/__tests__/speaking.test.ts`.

Bộ lọc Speaking theo ảnh `docs/speaking/filter.png`: chủ đề, trình độ (Mọi trình độ/A2/B1/B2), ô thời lượng và tìm kiếm. Thời lượng dùng `duration=5|10|15`, mặc định dưới 15 phút và áp dụng cho nhóm đang chọn; dưới 10 phút bao gồm các video dưới 5 phút. Các tham số cũ `accent`, `list`, `status` không còn giới hạn kết quả ở giao diện thư viện. Movie ưu tiên hội thoại từ phim nổi tiếng; bỏ các cảnh ca hát, mẫu nói không thành thạo và nhiều cảnh hành động. Phân loại trình độ là gợi ý biên tập, không phải chứng nhận CEFR của nguồn.

### TOEIC Writing

`/writing` đã có 3 phần: 200 bài viết theo cảnh (15 nhóm từ), 50 email với bài mẫu cho từng đề, 100 đề essay (5 dạng, 12 chủ đề) với dàn ý cho từng đề và 5 bài mẫu đầy đủ. Part 1 tạm dùng mô tả cảnh, chưa cần ảnh mới. Các mã bài cũ được giữ để tiếp tục bản nháp.

Nút **Luyện tập** mở đề và trình soạn thảo. Có dàn ý, từ vựng, ngữ pháp, bài mẫu, ghi chú, hẹn giờ và phiếu tự kiểm. Các bài hỗ trợ gồm dịch câu, điền từ, sắp xếp câu Part 1 và sửa lỗi Part 2/3. Bài phụ dùng trong lượt luyện; bản nháp chính, ghi chú, bookmark, tiến độ tự kiểm và hạn chót hẹn giờ lưu trên trình duyệt bằng key `toeic-writing-v1`. Sửa bản nháp sau khi tự kiểm sẽ yêu cầu tự kiểm lại. Không có chấm điểm AI/điểm TOEIC.

Nguồn nội dung mới: [`docs/writing/materials`](../docs/writing/materials/README.md). Sau khi chỉnh giáo trình, chạy `npm run build:writing` để tạo lại `src/lib/writing-content.json` và bản HTML ngoại tuyến tại `/writing/TOEIC-Writing.html`. Bài cấu trúc tương tác nằm trong `src/lib/writing-exercises.ts`; khi sửa bài tập trong giáo trình, cập nhật file này tương ứng.

| Route | Nội dung |
| --- | --- |
| `/` | Tổng quan: mục tiêu điểm, ngày thi, hoạt động theo kỳ |
| `/listening`, `/reading`, `/speaking`, `/writing` | 4 kỹ năng, filter lưu trên URL |
| `/vocabulary`, `/vocabulary/progress`, `/vocabulary/mine`, `/vocabulary/method` | Từ vựng (Học / Tiến độ / Từ của tôi / Phương pháp) |
| `/tests`, `/tests/progress` | Thư viện đề + tiến độ luyện đề |
| `/listening/[testId]/dictation` | Nghe chép từng câu/ngữ đoạn Listening YTS |
| `/exam/[sessionId]` | Phòng thi toàn màn hình (thi thử / luyện tập / luyện lại câu sai) |
| `/exam/[sessionId]/result` | Kết quả, điểm theo Part, xem lại đáp án (`?filter=wrong`) |
| `/leaderboard` | Bảng xếp hạng (`?metric=&period=`) |
| `/settings` | Mục tiêu, ngày thi, số từ mới/ngày, khôi phục demo |
| `/video`, `/community`, `/about` | Trạng thái "đang xây dựng" |

## Dữ liệu demo

- Toàn bộ dữ liệu là mock phía client: `src/lib/mock/fixtures.ts`.
- Thao tác của người dùng (mục tiêu, reset tiến độ, bộ thẻ, học phần) lưu `localStorage` key `toeic-practice.demo.v1` qua `src/lib/store.tsx`.
- Khôi phục: menu **Thêm → Khôi phục dữ liệu demo** hoặc `/settings`.
- Các nút dẫn tới màn chưa làm (nghe/đọc theo chủ đề, flashcard…) hiện toast "đang được xây dựng" thay vì nút giả.

## Luồng làm đề (Giai đoạn 3 — đã có)

`/tests` → chọn **ETS 2026/2024 · Reading** → Thi thử (75 phút) hoặc Luyện tập (chọn Part, xem giải thích ngay) → nộp → kết quả + xem lại → luyện lại câu sai. Tổng quan hiện bài đang làm dở, kết quả gần nhất, số câu hôm nay và XP.

- Phiên làm bài tự lưu: tải lại trang không mất đáp án; đồng hồ tính theo hạn chót nên không bị đặt lại; hết giờ tự nộp.
- Nộp bài idempotent (id kết quả = id phiên): bấm hai lần không nhân đôi kết quả/XP.
- Phím tắt: `A`–`D` chọn, `←` `→` chuyển câu, `F` đánh dấu.
- Điểm Reading (5–495) là quy đổi minh hoạ, không phải bảng quy đổi chính thức.

### Dữ liệu đề

`scripts/parse-ets.mjs` đọc `Read_testN.md` + `Read_testN_key.md` (không sửa file nguồn) và ghi `src/data/ets/*.json` + `loaders.ts` (mỗi đề là một chunk riêng). Script tự xử lý hai lỗi định dạng nguồn: câu hỏi dính vào cuối dòng bảng, và đánh số sai (`6.` thay vì `158.`).

> [!NOTE]
> File nguồn đang thiếu hẳn 4 câu: **ETS 2024 Test 1** (145, 146) và **ETS 2024 Test 2** (138, 142). Hai đề này hiển thị 98 câu; bổ sung vào file `.md` rồi chạy `npm run parse:ets`.

## Ảnh

Ảnh hiện tại là tạm thời — thay bằng ảnh thật cùng tên file:

- Mascot: `public/demo/mascot.jpg` (nền trắng, hiển thị với `mix-blend-multiply`).
- Writing Part 1 hiện dùng mô tả cảnh trong `src/lib/writing-content.json`; không sử dụng các ảnh demo cũ.
- Speaking dùng catalog YouTube đã kiểm tra tại `src/lib/speaking-content.json`; ảnh thẻ và ảnh trước khi phát dùng thumbnail của từng video từ YouTube, video phát trực tiếp từ YouTube.

## Cấu trúc

```
src/
  app/                 # routes (server pages bọc client view trong <Suspense>)
  components/
    ui/                # dialog, toast, tabs, primitives
    layout/            # header, skeleton, coming-soon
    learning/ dashboard/ vocabulary/ tests/ leaderboard/ settings/
  lib/                 # store, mock fixtures, useQueryParam
  types/domain.ts
```

Design token nằm trong `src/app/globals.css` (`@theme`).

## YTS 2026 và Reading workspace

- Mặc định kho đề mở **YTS 2026 · Reading**: 10 test × 100 câu, giải thích đầy đủ và sổ paraphrase.
- Trang `/reading?mode=part7&set=yts-2026` mở phiên luyện Part thật; bộ ETS cũng dùng chung luồng.
- Nội dung tĩnh lazy-load từ `src/data/yts`, không thêm API/backend. Bài làm giữ bằng localStorage như trước.
- Giao diện Reading dùng typography tài liệu: Georgia/Times serif hoặc Arial sans, chỉnh cỡ chữ, nền giấy trắng, chia tài liệu và render bảng HTML. Bảng số câu có thể thu gọn.
- Xem [nguồn đề YTS](../yts%202026/README.md) và [phân tích ETS](../docs/ETS_2026_ANALYSIS.md).
- Build đã kiểm tra bằng `npm run build -- --webpack` (Turbopack bị sandbox của môi trường kiểm tra chặn cổng xử lý CSS).
- QA UI tùy chọn: cài `playwright` tạm bằng `npm install --no-save --package-lock=false playwright`, rồi chạy `YTS_BASE_URL=http://localhost:3000 node scripts/qa-yts.mjs`. Cần Chrome local; script tạo browser context riêng và ảnh ở `docs/qa-yts`, không sửa bài làm của browser người dùng.

### Nghe chép theo ảnh mẫu

Thư viện `/listening?mode=dictation` có tiến độ từng Part và bộ lọc câu cần luyện lại. Bài luyện hỗ trợ Nghe chép / Nghe check / Nghe full, mức khuyết 30–100%, sóng âm MP3, tự lặp/phát tiếp, ghi chú và từ vựng lưu cục bộ. Logic và giới hạn dữ liệu: [YTS_DICTATION_UI.md](../docs/YTS_DICTATION_UI.md). Kiểm tra UI bằng `node scripts/qa-yts.mjs dictation`.
