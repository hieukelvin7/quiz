# Bộ câu hỏi LSAN — 152 câu / 7 mã đề

Sinh tự động từ tài liệu **ôn thi LSAN 2025.ppt** (phủ gần như toàn bộ nội dung).

| Mã đề | Chủ đề | Số câu |
|------|--------|:---:|
| **DE01** | Bach & bối cảnh âm nhạc Đức | 16 |
| **DE02** | Trường phái Cổ điển Vienne (Haydn, Mozart, Beethoven) | 22 |
| **DE03** | Lãng mạn: Schubert – Mendelssohn – Schumann | 18 |
| **DE04** | Lãng mạn: Chopin – Liszt – Grieg – Dvořák | 20 |
| **DE05** | Wagner, Brahms, Tchaikovsky, Debussy, Stravinsky, Shostakovich | 28 |
| **DE06** | Bối cảnh & đặc điểm các trường phái | 24 |
| **DE07** | Điệu thức cổ, chi tiết tác phẩm & nhân vật (Weber, Rimsky, Rachmaninov…) | 24 |

> Khi làm bài, app **xáo trộn thứ tự câu + xáo trộn đáp án A/B/C/D** mỗi lần → trắc nghiệm cũng "động".

Mỗi file CSV có cột: `ID | Question | OptionA | OptionB | OptionC | OptionD | Answer`
(Answer là đáp án đúng: A/B/C/D) — đúng định dạng backend `code.gs` yêu cầu.

### Điền đục lỗ — ĐOẠN VĂN (cloze) — `FILL.csv` / `seed-fill.gs`
- **36 đoạn văn** phủ ~toàn bộ tài liệu (năm, opus, danh mục tác phẩm từng nhạc sĩ) — **195 chỗ trống**, sheet **`FILL`**.
- Vào "Điền đục lỗ" → **chọn tác giả/chủ đề** để luyện riêng, hoặc "Tất cả (ngẫu nhiên)" lấy **10 đoạn/lượt**.
- Nhóm theo tác giả tự động dựa vào cột `Title` (phần trước dấu " – ").
- Cột: `Title | Passage | Answers | Accept`
  - `Passage`: đoạn văn, mỗi chỗ trống đánh dấu **`___`** (theo thứ tự).
  - `Answers`: đáp án từng chỗ, ngăn nhau bằng **`|`** (đúng thứ tự chỗ trống).
  - `Accept`: *(tuỳ chọn)* biến thể từng chỗ — các chỗ ngăn `|`, nhiều biến thể trong 1 chỗ ngăn `;`.
  - `Title`: nhãn ngắn (vd tên tác giả).
- App **random 5 đoạn mỗi lần** vào chế độ "Điền đục lỗ"; chấm **theo từng chỗ** (mỗi chỗ 1 điểm).
- Chấm: **bỏ qua hoa/thường** nhưng **bắt buộc đúng chính tả, kể cả dấu**.
- Tự thêm đoạn: viết đoạn đầy đủ, thay từ cần khoét bằng `___`, điền `Answers` đúng thứ tự.
- Nạp: Apps Script → file mới → dán `seed-fill.gs` → chọn hàm **`seedFill`** → Run.

> ⚠️ Backend `getFill` đã đổi sang định dạng đoạn văn → **phải redeploy `code.gs`** (New version) và **chạy lại `seedFill`**.

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
