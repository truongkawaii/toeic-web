# TOEIC preparation

Website Next.js nằm trong `web/`.

```sh
cd web
npm install
npm run dev
```

Bộ YBM 2025 có tại:

- `/tests?set=ybm-2025`: thư viện 10 test, thi thử và luyện tập.
- `/listening?set=ybm-2025`: Listening Part 1–4 và nghe chép theo nhóm câu.
- `/reading?set=ybm-2025`: Reading Part 5–7 của cả 10 test.

Cả 10 test có đủ 200 câu Listening + Reading, bao gồm audio bổ sung câu 20–22 của Test 6 và Reading của Test 10.

Thi toàn bài, thi riêng Listening hay luyện từng Part đều phát audio ngắn của câu/nhóm câu hiện tại. Đồng hồ Listening bắt đầu khi phát audio đầu tiên và không đặt lại khi nghe lại hoặc đổi câu. Hoàn tất Listening, chọn “Chuyển sang Reading” ở câu cuối để bắt đầu 75 phút Reading; hết giờ Listening cũng tự chuyển kỹ năng.

Chạy `npm run build:ybm` để chuyển dữ liệu nguồn trong `public/YBM 2025/` sang `src/data/ybm/` và tạo audio ngắn sạch trong `public/ybm2025/`. Cần `ffprobe`. Script giữ nguyên file nguồn, trích các khung AAC, ưu tiên file audio bổ sung trên đĩa khi metadata cũ báo thiếu. Không ghép audio toàn bài.

Đã bổ sung ETS 2026/2024/2023/2022 và HACKER 2/3 vào thư viện đề, Listening và Reading. Chạy `npm run build:courses` để tái tạo; có thể truyền đường dẫn chứa folder nguồn sau `--`. Course mới chỉ triển khai làm đề nghe/đọc.

Xem [ghi chú folder và dữ liệu còn thiếu](docs/course-folder-audit.md). Ba test Reading bị xung đột nguồn đang được giữ lại để sửa; test thiếu audio chỉ mở luyện tập Listening và thi Reading.

Kiểm tra bằng `npm test`, `npm run lint` và `npm run build`.
