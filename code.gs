/************************************************************
 * QUIZ BACKEND — Google Apps Script
 * ----------------------------------------------------------
 * Gắn với 1 Google Sheet có cấu trúc:
 *
 *  • Mỗi MÃ ĐỀ là 1 sheet con riêng (tên sheet = mã đề, vd "DE01")
 *    với dòng tiêu đề và các cột:
 *      ID | Question | OptionA | OptionB | OptionC | OptionD | Answer
 *    Trong đó Answer là 1 trong: A / B / C / D
 *
 *  • Sheet "Results"  : nơi lưu bài làm (tự tạo nếu chưa có).
 *  • Sheet "Config"   : (tuỳ chọn) 2 cột  Code | Minutes
 *                       để đặt thời gian làm bài theo từng mã đề.
 *
 * Triển khai: Deploy > New deployment > Web app
 *   - Execute as:  Me
 *   - Who has access:  Anyone
 ************************************************************/

var RESULTS_SHEET = "Results";
var CONFIG_SHEET  = "Config";

/* ---------- GET: trả câu hỏi theo mã đề ---------- */
function doGet(e) {
  try {
    var action = (e.parameter.action || "getQuiz");
    if (action !== "getQuiz") return json({ ok: false, error: "Hành động không hợp lệ." });

    var code = (e.parameter.code || "").trim();
    if (!code) return json({ ok: false, error: "Thiếu mã đề." });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(code);
    if (!sheet) return json({ ok: false, error: "Không tìm thấy mã đề '" + code + "'." });

    // Dùng getDisplayValues để lấy đúng chuỗi hiển thị trên sheet
    // (tránh việc "28/6/1750" bị Sheet tự chuyển thành Date -> ISO).
    var rows = sheet.getDataRange().getDisplayValues();
    if (rows.length < 2) return json({ ok: false, error: "Đề chưa có câu hỏi." });

    var header = rows[0].map(function (h) { return String(h).trim().toLowerCase(); });
    var col = {
      question: idx(header, ["question", "câu hỏi", "cauhoi"]),
      a: idx(header, ["optiona", "a", "đáp án a"]),
      b: idx(header, ["optionb", "b", "đáp án b"]),
      c: idx(header, ["optionc", "c", "đáp án c"]),
      d: idx(header, ["optiond", "d", "đáp án d"]),
      answer: idx(header, ["answer", "đáp án", "dapan", "correct"]),
    };

    var questions = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      var qtext = col.question >= 0 ? String(r[col.question]).trim() : "";
      if (!qtext) continue;
      questions.push({
        question: qtext,
        optionA: cell(r, col.a),
        optionB: cell(r, col.b),
        optionC: cell(r, col.c),
        optionD: cell(r, col.d),
        answer: String(cell(r, col.answer)).trim().toUpperCase(),
      });
    }

    return json({
      ok: true,
      code: code,
      duration: getDurationSeconds(ss, code, questions.length),
      questions: questions,
    });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/* ---------- POST: lưu kết quả vào sheet "Results" ---------- */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(RESULTS_SHEET);
    if (!sheet) {
      sheet = ss.insertSheet(RESULTS_SHEET);
      sheet.appendRow([
        "Thời gian", "Họ tên", "Mã đề", "Điểm", "Tổng câu",
        "Phần trăm", "Thời lượng (giây)", "Chi tiết",
      ]);
    }

    sheet.appendRow([
      new Date(),
      body.name || "",
      body.code || "",
      Number(body.score) || 0,
      Number(body.total) || 0,
      Number(body.percent) || 0,
      Number(body.durationSec) || 0,
      JSON.stringify(body.answers || {}),
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/* ------------------- Tiện ích ------------------- */
function getDurationSeconds(ss, code, numQuestions) {
  var DEFAULT_PER_Q = 45; // giây / câu nếu không có Config
  try {
    var cfg = ss.getSheetByName(CONFIG_SHEET);
    if (cfg) {
      var data = cfg.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === code && data[i][1]) {
          return Math.round(Number(data[i][1]) * 60);
        }
      }
    }
  } catch (e) {}
  return numQuestions * DEFAULT_PER_Q;
}

function idx(header, names) {
  for (var i = 0; i < names.length; i++) {
    var p = header.indexOf(names[i]);
    if (p >= 0) return p;
  }
  return -1;
}

function cell(row, i) { return i >= 0 && i < row.length ? row[i] : ""; }

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
