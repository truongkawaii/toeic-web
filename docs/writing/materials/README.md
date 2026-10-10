# TOEIC Writing — Từ câu chính xác đến bài viết thuyết phục

Bộ tài liệu biên soạn mới dành cho người Việt, trình độ đầu vào khoảng A2–B1; phần mở rộng phù hợp người học B2. Mục tiêu là viết đúng yêu cầu, rõ nghĩa và có lập luận. Tài liệu không gán một mức điểm TOEIC cho từng bài mẫu.

**Đọc toàn bộ:** [TOEIC-Writing.html](TOEIC-Writing.html). Bản HTML dùng ngoại tuyến, có mục lục và định dạng in. Có thể chọn Print → Save as PDF trong trình duyệt. Các file Markdown bên dưới là bản nguồn để chỉnh sửa; chạy `python3 docs/writing/materials/build_reader.py` từ thư mục dự án để tạo lại HTML sau khi sửa.

## Kho bài mở rộng: 200 / 50 / 100

- [Part 1 — 200 bài](05-picture-bank.md): mô tả cảnh, hai từ gợi ý, đáp án và giải thích; đủ 15 danh mục.
- [Part 2 — 50 email](06-email-bank.md): đề, yêu cầu, dàn ý, từ vựng, bài mẫu và giải thích cho từng bài.
- [Part 3 — 100 đề essay](07-essay-bank.md): đủ 5 dạng và 12 chủ đề; mỗi đề có hướng lập luận, dàn ý và lưu ý ngữ pháp. Có 5 bài mẫu hoàn chỉnh đại diện 5 dạng; 95 đề còn lại luyện viết từ dàn ý.

Các chương nền tảng bên dưới giữ nguyên ví dụ để học phương pháp. Kho mở rộng bao gồm những ví dụ này, không cộng thêm lần nữa. Mã bài cũ được giữ để bản nháp trên website tiếp tục sử dụng được. Từ thư mục `web`, chạy `npm run build:writing` để tái tạo kho bài, dữ liệu website và HTML từ các nguồn biên soạn trong `bank-source`.

## Học theo thứ tự

1. [Part 1 — Picture](01-part1-picture.md): 15 danh mục từ gợi ý, ngữ pháp mô tả tranh, 30 bài luyện có đáp án, dịch câu, điền từ và sắp xếp câu.
2. [Part 2 — Email](02-part2-email.md): phương pháp đọc yêu cầu, 12 tình huống email viết mới, dàn ý, từ vựng, bài mẫu và bài tập ngữ pháp.
3. [Part 3 — Essay](03-part3-essay.md): 5 dạng đề, 12 nhóm chủ đề, 24 đề luyện, 5 bài mẫu hoàn chỉnh và bài tập sửa lỗi.
4. [Hướng dẫn giáo viên và đối chiếu ảnh](04-teacher-guide.md): lộ trình 8 buổi, phiếu nhận xét, danh mục nguồn và cách sử dụng tài liệu.

## Cấu trúc bài thi và cách dùng

TOEIC Writing có 8 câu: 5 câu viết theo tranh, 2 email và 1 bài luận. Part 1 có 8 phút cho cả 5 câu; mỗi email có 10 phút; bài luận có 30 phút. Các thông tin này được kiểm tra với [bài thi mẫu chính thức của ETS](https://www.ets.org/content/dam/ets-org/pdfs/toeic/toeic-speaking-writing-sample-tests.pdf), truy cập ngày 10/10/2026. Tổng thời gian được ETS mô tả là khoảng một giờ.

Các tên Part 1/2/3 là cách chia học liệu. 15 nhóm từ Part 1, 5 dạng đề và 12 nhóm chủ đề Part 3 là danh mục sư phạm lấy từ ảnh tham khảo, không phải hệ thống phân loại chính thức của ETS.

Trong ảnh có giới hạn 40 từ cho câu, 300 từ cho email và bộ đếm 300 từ cho essay. Đây là thiết lập của giao diện tham khảo; không sử dụng chúng như giới hạn chính thức của bài thi. ETS mô tả bài luận hiệu quả thường có ít nhất 300 từ. Mục tiêu luyện trong bộ này là khoảng 300–350 từ cho essay và 90–150 từ cho email; độ dài email là gợi ý giảng dạy, không phải điều kiện chấm điểm chính thức.

## Nguyên tắc biên soạn

Đã xem 35 ảnh: Part 1 có 7 ảnh, Part 2 có 9 ảnh, Part 3 có 19 ảnh. Giữ tên danh mục và kiến thức ngữ pháp phổ thông; viết mới đề, nhân vật, dữ kiện, ví dụ, diễn giải và bài mẫu. Không đưa ảnh chụp giao diện, logo hoặc ảnh có watermark vào giáo trình.

Part 1 hiện sử dụng **mô tả cảnh bằng tiếng Việt** để luyện ngôn ngữ trước khi làm với tranh. Đây chưa phải bộ đề thi theo ảnh; không dùng những bài này để đánh giá khả năng quan sát tranh. Hướng dẫn tạo/chọn ảnh phù hợp nằm trong tài liệu giáo viên.

Học viên làm trước khi mở đáp án. Đáp án là một phương án hợp lệ; giáo viên chấp nhận cách viết khác nếu đúng ngữ pháp, dùng đủ từ gợi ý và phù hợp cảnh hoặc yêu cầu.
