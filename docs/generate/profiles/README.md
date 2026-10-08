# Hồ sơ cấu trúc Listening — 40 test

Đã xử lý theo `docs/generate/prompt_3_test_profiler.md`:

| Bộ nguồn | Test | Bộ đích |
|---|---|---|
| ETS2023 | 01–10 | YTS2023 |
| ETS2024 | 01–10 | YTS2024 |
| ETS2026 | 01–10 | YTS2026 |
| YBM2025 | 01–10 | YTS2025 |

Mỗi test có một file `profile_<BỘ>_TNN.json`, gồm Part 1–4, từ vựng, tình huống cần tránh và thống kê. Mỗi hồ sơ đủ 6 câu Part 1, 25 câu Part 2, 13 bộ Part 3 và 10 bài Part 4. Các trường mô tả dùng nhãn hoặc cụm trừu tượng; không xuất script, câu hỏi, lựa chọn, đáp án chữ cái hoặc ảnh nguồn.

**Đưa sang Project sinh đề:** dùng các file `profile_*.json` trong từng thư mục bộ đề, hoặc giải nén `listening_profiles_40.zip`. ZIP chỉ chứa 40 hồ sơ. Các file annotation, manifest và script là tài liệu xây dựng/kiểm tra tại workspace này.

## Dữ liệu nguồn chưa đầy đủ

Có 37 hồ sơ đầy đủ và 3 hồ sơ có phần thiếu:

- **ETS2024 Test 10:** thiếu đáp án cho toàn bộ 100 câu; thiếu script câu 32–100. Part 1–2 được đánh dấu `missing`, Part 2 vẫn giữ loại câu hỏi khi nhận diện được. Các bộ Part 3–4 được đánh dấu `missing`. Danh sách từ vựng giữ dữ liệu từ file từ vựng đã có.
- **ETS2023 Test 08:** ảnh Part 1 câu 5 không đọc được; graphic của bộ câu 65–67 và 68–70 không đọc được.
- **ETS2023 Test 09:** ảnh Part 1 câu 3–5 không đọc được; graphic của bộ câu 65–67 không đọc được.

Với graphic bị hỏng, giữ cấu trúc bộ câu khi script và đáp án có đủ; riêng `special` được đánh dấu `missing`. Không suy đoán loại hoặc bố cục ảnh hỏng. Cần bổ sung dữ liệu nguồn rồi dựng lại các hồ sơ tương ứng trước khi dùng như hồ sơ đầy đủ.

Chi tiết từng mục thiếu nằm trong `manifest.json`. Kiểm tra cấu trúc và thống kê nằm trong `validation_report.json`.

## Cách dựng lại

```sh
PYTHONDONTWRITEBYTECODE=1 voice/.venv/bin/python scripts/build_test_profiles.py
PYTHONDONTWRITEBYTECODE=1 python3 scripts/validate_test_profiles.py
```

Phân loại chủ đề, vai trò, diễn tiến và tình huống cần tránh được lưu trong `semantic_annotations.tsv`. Loại ảnh/graphic nằm trong `visual_annotations.json`. Các hiệu chỉnh đã rà soát nằm trong `review_overrides.json`. Ngữ pháp, bẫy và kỹ thuật diễn đạt được hỗ trợ bằng nhận diện quy tắc; đây là các nhãn phân tích, không phải đáp án chính thức do nhà xuất bản cung cấp.

Từ vựng top 150, từ xuất hiện lần đầu và tỷ lệ band dựa trên file từ vựng từng test. `part_words` được đếm trong đúng Part của test hiện tại, không dùng cột Part tổng hợp của toàn kho đề. Collocations phải có trong danh sách toàn cục và xuất hiện trong nguồn test hiện tại. Tỷ lệ band tính theo tần suất từ trong bảng từ vựng. Từ xuất hiện lần đầu được giữ theo thứ tự kho từ vựng hiện có.
