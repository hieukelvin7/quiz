# Bộ câu hỏi LSAN — 104 câu / 5 mã đề

Sinh tự động từ tài liệu **ôn thi LSAN 2025.ppt**.

| Mã đề | Chủ đề | Số câu |
|------|--------|:---:|
| **DE01** | Bach & bối cảnh âm nhạc Đức | 16 |
| **DE02** | Trường phái Cổ điển Vienne (Haydn, Mozart, Beethoven) | 22 |
| **DE03** | Lãng mạn: Schubert – Mendelssohn – Schumann | 18 |
| **DE04** | Lãng mạn: Chopin – Liszt – Grieg – Dvořák | 20 |
| **DE05** | Wagner, Brahms, Tchaikovsky, Debussy, Stravinsky, Shostakovich | 28 |

Mỗi file CSV có cột: `ID | Question | OptionA | OptionB | OptionC | OptionD | Answer`
(Answer là đáp án đúng: A/B/C/D) — đúng định dạng backend `code.gs` yêu cầu.

---

## Cách nạp vào Google Sheet — chọn 1 trong 2

### ✅ Cách 1 (khuyên dùng): chạy `seed-quiz.gs` một lần
Tự tạo cả 5 sheet mã đề + sheet Results, **không cần import tay**.

1. Mở Google Sheet → **Extensions → Apps Script**.
2. Bấm **+ → Script**, tạo file mới, dán toàn bộ nội dung `seed-quiz.gs`.
3. Trên thanh công cụ chọn hàm **`seedQuiz`** → bấm **Run** → Authorize.
4. Xong: có ngay 5 sheet DE01–DE05 đầy câu hỏi.

> Sau khi seed xong có thể xoá file `seed-quiz.gs`. File backend `code.gs` vẫn giữ nguyên.

### Cách 2: import từng file CSV
Với mỗi file `DE01.csv` … `DE05.csv`:
1. **File → Import → Upload** → chọn file CSV.
2. Import location: **Insert new sheet(s)**.
3. Sau khi import, **đổi tên tab** thành đúng mã đề (`DE01`, `DE02`, …) — tên tab phải trùng mã đề thì app mới tải được.

---

## Kiểm tra nhanh
Sau khi nạp, mở trực tiếp trên trình duyệt (thay URL của bạn):

```
https://script.google.com/macros/s/XXXX/exec?action=getQuiz&code=DE01
```

Thấy JSON danh sách câu hỏi là đã chạy đúng. Khi làm bài trên web, nhập mã đề `DE01`…`DE05`.
