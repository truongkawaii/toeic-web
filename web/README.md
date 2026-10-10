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
- Thumbnail Speaking đang vẽ bằng CSS; có thể thêm trường ảnh trong `MEDIA_LESSONS`.

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
