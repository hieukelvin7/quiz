# Quiz tĩnh — GitHub Pages + Google Sheet (Apps Script)

Trang web làm quiz chạy hoàn toàn tĩnh, dùng **Google Sheet làm database** qua **Google Apps Script**.

```
index.html   → giao diện (3 màn hình) + CSS
script.js    → logic + gọi API (fetch GET lấy câu hỏi, POST nộp kết quả)
code.gs      → backend dán vào Apps Script của Google Sheet
```

---

## Phần A — Google Sheet + Apps Script (Database)

### 1. Tạo Google Sheet
Tạo 1 Google Sheet mới. Với **mỗi mã đề**, tạo 1 sheet con (tab) có **tên trùng mã đề**, ví dụ `DE01`, với dòng tiêu đề:

| ID | Question | OptionA | OptionB | OptionC | OptionD | Answer |
|----|----------|---------|---------|---------|---------|--------|
| 1  | 2 + 2 = ? | 3 | 4 | 5 | 6 | B |
| 2  | Thủ đô Việt Nam? | Huế | Đà Nẵng | Hà Nội | TP.HCM | C |

- Cột **Answer** là đáp án đúng: `A`, `B`, `C` hoặc `D`.
- Có thể bỏ trống OptionC/OptionD nếu câu chỉ có 2–3 lựa chọn.

### 2. (Tuỳ chọn) Đặt thời gian làm bài
Tạo thêm sheet tên **`Config`** với 2 cột để quy định thời gian theo từng đề:

| Code | Minutes |
|------|---------|
| DE01 | 10 |
| DE02 | 15 |

Nếu không có sheet Config → mặc định **45 giây/câu**.

> Sheet **`Results`** không cần tạo tay — Apps Script tự tạo khi có bài nộp đầu tiên.

### 3. Dán code backend
1. Trong Google Sheet: **Extensions → Apps Script**.
2. Xoá code mẫu, dán toàn bộ nội dung **`code.gs`** vào.
3. Lưu (Ctrl/Cmd + S).

### 4. Deploy thành Web App
1. Nút **Deploy → New deployment**.
2. Chọn type: biểu tượng bánh răng → **Web app**.
3. Cấu hình:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. **Deploy** → cấp quyền (Authorize) cho tài khoản của bạn.
5. Copy **Web app URL** — dạng:
   `https://script.google.com/macros/s/AKfy....../exec`

> Mỗi lần sửa `code.gs`, vào **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy** để cập nhật (URL giữ nguyên).

---

## Phần B — Kết nối frontend

Mở **`script.js`**, sửa dòng đầu:

```js
const GAS_URL = "https://script.google.com/macros/s/AKfy....../exec";
```

Dán đúng URL vừa copy ở bước A4.

---

## Phần C — Đưa lên GitHub Pages

1. Tạo repo mới trên GitHub (ví dụ `quiz`), để **Public**.
2. Upload 3 file `index.html`, `script.js`, `code.gs` (file `.gs` chỉ để lưu trữ, Pages không chạy nó).

   Hoặc qua terminal:
   ```bash
   git init
   git add index.html script.js code.gs README.md
   git commit -m "Quiz app"
   git branch -M main
   git remote add origin https://github.com/<user>/quiz.git
   git push -u origin main
   ```
3. Trên GitHub: **Settings → Pages**.
4. Mục **Build and deployment → Source:** chọn `Deploy from a branch`.
5. **Branch:** `main`, thư mục `/ (root)` → **Save**.
6. Đợi ~1 phút, trang chạy tại:
   `https://<user>.github.io/quiz/`

---

## Luồng hoạt động

1. **Màn 1:** nhập tên + mã đề → `GET ?action=getQuiz&code=DE01` → nhận JSON câu hỏi.
2. **Màn 2:** làm bài với progress bar + đồng hồ đếm ngược (hết giờ tự nộp).
3. **Màn 3:** chấm điểm ngay trên trình duyệt + `POST` kết quả về sheet **Results**.

## Xử lý sự cố

| Triệu chứng | Nguyên nhân / cách sửa |
|---|---|
| "Chưa cấu hình GAS_URL" | Chưa dán URL vào `script.js`. |
| "Không tìm thấy mã đề" | Tên sheet con không trùng mã đề (phân biệt hoa/thường, khoảng trắng). |
| Nộp bài báo lỗi gửi | Deployment chưa đặt *Who has access = Anyone*, hoặc chưa deploy lại version mới sau khi sửa `code.gs`. |
| Không tải được câu hỏi | Mở URL `...exec?action=getQuiz&code=DE01` trực tiếp trên trình duyệt để xem JSON lỗi. |
