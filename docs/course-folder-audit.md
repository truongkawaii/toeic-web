# Course nghe / đọc và folder có thể chuyển ra ngoài

Đã thêm 60 test thuộc ETS 2026, 2024, 2023, 2022, HACKER 2, HACKER 3. Course mới không mở nghe chép chính tả.

## Có thể chuyển ra ngoài dự án

Sáu folder nguồn dưới đây không còn được website tham chiếu lúc chạy. Audio đã làm sạch và ảnh đã được sao chép sang `web/public/courses/`; nội dung nằm trong `web/src/data/courses/`. Giữ bản lưu nguồn để bổ sung những dữ liệu thiếu bên dưới.

- `web/public/ETS 2026/`
- `web/public/ETS 2024/`
- `web/public/ETS 2023/`
- `web/public/ETS 2022/`
- `web/public/HACKER 2/`
- `web/public/HACKER 3/`

Sau khi chuyển, có thể tái tạo bằng `cd web` rồi `npm run build:courses -- "/đường/dẫn/folder-chứa-6-course"`. Script chỉ đọc nguồn, không sửa nguồn.

## Phải giữ

- `web/public/courses/` và `web/src/data/courses/`: dữ liệu đang dùng của 6 course mới.
- `web/public/ybm2025/` và `web/src/data/ybm/`: dữ liệu YBM đang dùng.
- `web/public/YBM 2025/`: YBM vẫn tham chiếu ảnh trong folder này; chưa chuyển cả folder ra ngoài.

## Cần bổ sung nguồn

Ba test có các nhóm Reading khác nhau trùng số câu. Tạm chỉ cung cấp Listening, không tự chọn một bản Reading để chấm: ETS 2022 Test 2, HACKER 2 Test 1, HACKER 3 Test 8.

| Test | Câu thiếu audio |
| --- | --- |
| ETS 2024 · Test 3 | 32–34 |
| ETS 2024 · Test 5 | 25 |
| ETS 2024 · Test 8 | 50–52, 53–55 |
| ETS 2024 · Test 9 | 62–64, 74–76 |
| ETS 2024 · Test 10 | 53–55 |
| ETS 2023 · Test 1 | 89–91, 92–94 |
| ETS 2023 · Test 3 | 86–88, 89–91, 95–97 |
| ETS 2023 · Test 4 | 41–43, 74–76 |
| ETS 2023 · Test 5 | 3, 41–43 |
| ETS 2023 · Test 7 | 32–34 |
| ETS 2023 · Test 9 | 6, 7, 8, 11, 12, 13, 14, 15, 16 |
| ETS 2023 · Test 10 | 3, 4, 5, 6, 10, 11, 12, 13, 29 |
| ETS 2022 · Test 5 | 4 |
| HACKER 3 · Test 7 | 15, 20, 22 |

Test thiếu audio vẫn có luyện tập và thi Reading; thi Listening/toàn bài được khóa. Chi tiết máy đọc được: `web/src/data/courses/issues.json`.
