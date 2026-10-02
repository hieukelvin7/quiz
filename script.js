/* ============================================================
   CẤU HÌNH — dán URL Web App của Google Apps Script vào đây
   (Deploy > New deployment > Web app > Copy URL, dạng:
    https://script.google.com/macros/s/AKfy..../exec )
   ============================================================ */
const GAS_URL = "https://script.google.com/macros/s/AKfycbx0bNn8w4LrC-2fIgThVjvvJ6I50m0KzhBBKIFrFYVzp1Yj2C7NsP_8whWYLkdsNIzorQ/exec";

/* Thời gian mặc định cho mỗi câu (giây) nếu Apps Script
   không trả về "duration". Có thể override bằng sheet "Config". */
const DEFAULT_SECONDS_PER_QUESTION = 45;

/* Khoá lưu lịch sử làm bài trên trình duyệt */
const HKEY = "quiz_history_v1";

/* ----------------------- Trạng thái ----------------------- */
const state = {
  code: "", name: "",
  mode: "exam",          // "exam" | "practice"
  timed: true,
  questions: [], answers: {}, current: 0,
  durationSec: 0, remainingSec: 0, startedAt: 0, timerId: null,
  examQuestions: [], examDuration: 0,   // để "Làm lại đề"
  lastWrong: [],                        // để "Học lại câu sai"
  study: { questions: [], index: 0, code: "" },
};

/* ----------------------- Tiện ích ------------------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const screens = {
  start: $("#screen-start"), quiz: $("#screen-quiz"), result: $("#screen-result"),
  study: $("#screen-study"), stats: $("#screen-stats"),
};

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("is-active"));
  screens[name].classList.add("is-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function setStatus(el, msg, type = "") {
  el.textContent = msg || "";
  el.className = "field-note" + (type ? ` is-${type}` : "");
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function rightKey(q) { return String(q.answer).trim().toUpperCase(); }

function setBtnLoading(btn, on) {
  btn.disabled = on;
  btn.classList.toggle("is-loading", on);
}

/* ----------------------- Lịch sử (localStorage) ----------------------- */
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HKEY)) || []; }
  catch (e) { return []; }
}
function saveHistory(arr) {
  try { localStorage.setItem(HKEY, JSON.stringify(arr.slice(-100))); } catch (e) {}
}
function addAttempt(a) { const h = loadHistory(); h.push(a); saveHistory(h); }

/* ----------------------- Tải đề ----------------------- */
async function loadQuiz(code) {
  const url = `${GAS_URL}?action=getQuiz&code=${encodeURIComponent(code)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Không tải được đề.");
  if (!Array.isArray(data.questions) || data.questions.length === 0)
    throw new Error("Đề này chưa có câu hỏi nào.");
  return {
    questions: data.questions,
    duration: Number(data.duration) || data.questions.length * DEFAULT_SECONDS_PER_QUESTION,
  };
}

/* ===========================================================
   MÀN HÌNH 1 — Trang chủ
   =========================================================== */
const startForm = $("#start-form");
const codeInput = $("#code-input");
const nameInput = $("#name-input");
const startBtn = $("#start-btn");
const startNote = $("#start-note");
const startBest = $("#start-best");
const studyBtn = $("#study-btn");
const statsBtn = $("#stats-btn");

startForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = codeInput.value.trim();
  const name = nameInput.value.trim();
  if (!name) return setStatus(startNote, "Vui lòng nhập tên của bạn.", "error");
  if (!code) return setStatus(startNote, "Vui lòng nhập mã đề.", "error");
  if (GAS_URL.startsWith("DÁN_URL"))
    return setStatus(startNote, "Chưa cấu hình GAS_URL trong script.js.", "error");

  setBtnLoading(startBtn, true);
  setStatus(startNote, "Đang tải đề thi…");
  try {
    const { questions, duration } = await loadQuiz(code);
    state.code = code; state.name = name;
    state.examQuestions = questions; state.examDuration = duration;
    setStatus(startNote, "");
    beginQuiz({ mode: "exam", questions, duration });
  } catch (err) {
    setStatus(startNote, err.message || "Có lỗi xảy ra, thử lại nhé.", "error");
  } finally {
    setBtnLoading(startBtn, false);
  }
});

studyBtn.addEventListener("click", async () => {
  const code = codeInput.value.trim();
  if (!code) return setStatus(startNote, "Nhập mã đề để ôn tập.", "error");
  setBtnLoading(studyBtn, true);
  setStatus(startNote, "Đang tải đề để ôn tập…");
  try {
    const { questions } = await loadQuiz(code);
    setStatus(startNote, "");
    beginStudy(code, questions);
  } catch (err) {
    setStatus(startNote, err.message || "Có lỗi xảy ra.", "error");
  } finally {
    setBtnLoading(studyBtn, false);
  }
});

statsBtn.addEventListener("click", showStats);

function renderStartBest() {
  const h = loadHistory();
  if (!h.length) { startBest.innerHTML = ""; return; }
  const best = Math.max(...h.map((a) => a.percent));
  startBest.innerHTML = `Bạn đã làm <b>${h.length}</b> lượt · điểm cao nhất <b>${best}%</b>`;
}

/* ===========================================================
   MÀN HÌNH 2 — Làm bài / Luyện tập
   =========================================================== */
const qCounter = $("#q-counter");
const qTotal = $("#q-total");
const progressFill = $("#progress-fill");
const timerEl = $("#timer");
const qText = $("#q-text");
const optionsEl = $("#options");
const prevBtn = $("#prev-btn");
const nextBtn = $("#next-btn");
const submitBtn = $("#submit-btn");
const quizMeta = $("#quiz-meta");

function beginQuiz({ mode, questions, duration }) {
  state.mode = mode;
  state.timed = mode === "exam";
  state.questions = questions;
  state.answers = {};
  state.current = 0;
  state.startedAt = Date.now();

  showScreen("quiz");
  qTotal.textContent = questions.length;
  quizMeta.textContent = state.timed
    ? `Mã đề ${state.code} · ${state.name}`
    : `Luyện tập câu sai · ${questions.length} câu`;

  timerEl.classList.toggle("is-hidden", !state.timed);
  if (state.timed) {
    state.durationSec = duration;
    state.remainingSec = duration;
    startTimer();
  } else {
    clearInterval(state.timerId);
  }
  renderQuestion();
}

function startTimer() {
  updateTimerUI();
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.remainingSec -= 1;
    updateTimerUI();
    if (state.remainingSec <= 0) {
      clearInterval(state.timerId);
      finishQuiz(true);
    }
  }, 1000);
}

function updateTimerUI() {
  timerEl.textContent = fmtTime(Math.max(0, state.remainingSec));
  timerEl.classList.toggle("is-urgent", state.remainingSec <= 30);
}

function renderQuestion() {
  const q = state.questions[state.current];
  const idx = state.current;

  qCounter.textContent = idx + 1;
  progressFill.style.width = ((idx + 1) / state.questions.length) * 100 + "%";
  qText.textContent = q.question;

  optionsEl.innerHTML = "";
  ["A", "B", "C", "D"].forEach((key) => {
    const label = q["option" + key];
    if (label == null || label === "") return;
    const chosen = state.answers[idx] === key;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option" + (chosen ? " is-selected" : "");
    btn.innerHTML = `<span class="option-key">${key}</span><span class="option-text"></span>`;
    btn.querySelector(".option-text").textContent = label;
    btn.addEventListener("click", () => { state.answers[idx] = key; renderQuestion(); });
    optionsEl.appendChild(btn);
  });

  prevBtn.disabled = idx === 0;
  const isLast = idx === state.questions.length - 1;
  nextBtn.classList.toggle("is-hidden", isLast);
  submitBtn.classList.toggle("is-hidden", !isLast);
  submitBtn.textContent = state.mode === "practice" ? "Hoàn thành" : "Nộp bài";
}

prevBtn.addEventListener("click", () => {
  if (state.current > 0) { state.current -= 1; renderQuestion(); }
});
nextBtn.addEventListener("click", () => {
  if (state.current < state.questions.length - 1) { state.current += 1; renderQuestion(); }
});
submitBtn.addEventListener("click", () => {
  const unanswered = state.questions.length - Object.keys(state.answers).length;
  const msg = unanswered
    ? `Bạn còn ${unanswered} câu chưa trả lời. ${state.mode === "practice" ? "Kết thúc" : "Nộp bài"} luôn?`
    : (state.mode === "practice" ? "Kết thúc luyện tập?" : "Nộp bài và xem kết quả?");
  if (confirm(msg)) finishQuiz(false);
});

/* ===========================================================
   MÀN HÌNH 3 — Kết quả
   =========================================================== */
const scoreBig = $("#score-big");
const scoreLabel = $("#score-label");
const resultRing = $("#result-ring");
const resultMeta = $("#result-meta");
const submitNote = $("#submit-note");
const reviewList = $("#review-list");
const resultTiles = $("#result-tiles");
const retryWrongBtn = $("#retry-wrong-btn");
const redoBtn = $("#redo-btn");
const toStatsBtn = $("#to-stats-btn");
const restartBtn = $("#restart-btn");

function finishQuiz(timedOut) {
  if (state.timed) clearInterval(state.timerId);

  const qs = state.questions, ans = state.answers;
  let correct = 0; const wrong = [];
  qs.forEach((q, i) => {
    const picked = ans[i] || "";
    if (picked === rightKey(q)) correct++;
    else wrong.push({ q, picked: picked || "—" });
  });

  const total = qs.length;
  const percent = Math.round((correct / total) * 100);
  // Giới hạn 0..24h để thống kê không bị méo bởi edge case
  const durationSec = Math.max(0, Math.min(86400, Math.round((Date.now() - state.startedAt) / 1000)));
  state.lastWrong = wrong.map((w) => w.q);

  showScreen("result");
  renderResult({ correct, total, percent, durationSec, timedOut });

  if (state.mode === "exam") {
    addAttempt({
      date: new Date().toISOString(),
      code: state.code, name: state.name,
      correct, total, percent, durationSec,
      wrong: wrong.map((w) => ({
        question: w.q.question, answer: rightKey(w.q), picked: w.picked,
      })),
    });
    renderStartBest();
    sendResult({ correct, total, percent, durationSec });
  } else {
    submitNote.textContent = "";
  }
}

function renderResult({ correct, total, percent, durationSec, timedOut }) {
  const wrong = total - correct;
  scoreBig.textContent = `${correct}/${total}`;
  scoreLabel.textContent = percent >= 80 ? "Xuất sắc" : percent >= 50 ? "Đạt" : "Cần ôn thêm";
  resultRing.style.setProperty("--pct", percent);
  resultMeta.textContent =
    `${percent}% đúng · ${fmtTime(durationSec)}` +
    (timedOut ? " · hết giờ" : "") +
    (state.mode === "practice" ? " · luyện tập" : "");

  resultTiles.innerHTML = `
    <div class="tile ok"><div class="tile-num">${correct}</div><div class="tile-label">Câu đúng</div></div>
    <div class="tile no"><div class="tile-num">${wrong}</div><div class="tile-label">Câu sai</div></div>
    <div class="tile am"><div class="tile-num">${fmtTime(durationSec)}</div><div class="tile-label">Thời gian</div></div>`;

  // Danh sách xem lại (mở rộng được)
  reviewList.innerHTML = state.questions.map((q, i) => {
    const picked = state.answers[i] || "—";
    const right = rightKey(q);
    const ok = picked === right;
    return `
      <li class="review-item">
        <button type="button" class="review-row ${ok ? "is-ok" : "is-no"}" data-i="${i}">
          <span class="review-idx">${i + 1}</span>
          <span class="review-q">${esc(q.question)}</span>
          <span class="review-tag">${ok ? "Đúng" : `${picked} → ${right}`}</span>
          <span class="review-caret">▸</span>
        </button>
        <div class="review-detail">${detailHTML(q, picked)}</div>
      </li>`;
  }).join("");

  $$("#review-list .review-row").forEach((row) => {
    row.addEventListener("click", () => {
      row.classList.toggle("open");
      row.nextElementSibling.classList.toggle("is-open");
    });
  });

  retryWrongBtn.classList.toggle("is-hidden", wrong === 0);
  submitNote.textContent = "";
}

function detailHTML(q, picked) {
  const right = rightKey(q);
  let lines = "";
  ["A", "B", "C", "D"].forEach((k) => {
    const label = q["option" + k];
    if (label == null || label === "") return;
    let cls = "", flag = "";
    if (k === right) { cls = " correct"; flag = "Đáp án đúng"; }
    else if (k === picked) { cls = " wrong"; flag = "Bạn chọn"; }
    lines += `<div class="opt-line${cls}"><span class="k">${k}</span>` +
             `<span class="opt-txt">${esc(label)}</span>` +
             (flag ? `<span class="opt-flag">${flag}</span>` : "") + `</div>`;
  });
  return `<div class="detail-q">${esc(q.question)}</div>${lines}`;
}

async function sendResult(scoreData) {
  setStatus(submitNote, "Đang gửi kết quả về hệ thống…");
  submitNote.style.textAlign = "center";
  const payload = {
    name: state.name, code: state.code,
    score: scoreData.correct, total: scoreData.total,
    percent: scoreData.percent, durationSec: scoreData.durationSec,
    answers: state.answers,
  };
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) setStatus(submitNote, "Đã lưu kết quả của bạn ✓", "ok");
    else throw new Error(data.error || "Lưu thất bại.");
  } catch (err) {
    setStatus(submitNote, "Không gửi được kết quả: " + err.message, "error");
  }
}

retryWrongBtn.addEventListener("click", () => {
  if (state.lastWrong.length) beginQuiz({ mode: "practice", questions: state.lastWrong });
});
redoBtn.addEventListener("click", () => {
  if (state.examQuestions.length)
    beginQuiz({ mode: "exam", questions: state.examQuestions, duration: state.examDuration });
});
toStatsBtn.addEventListener("click", showStats);
restartBtn.addEventListener("click", () => {
  setStatus(startNote, "");
  renderStartBest();
  showScreen("start");
});

/* ===========================================================
   MÀN HÌNH 4 — Ôn tập (xem đáp án, không tính giờ)
   =========================================================== */
const studyMeta = $("#study-meta");
const studyProgress = $("#study-progress");
const studyQ = $("#study-q");
const studyOptions = $("#study-options");
const studyPrev = $("#study-prev");
const studyNext = $("#study-next");

function beginStudy(code, questions) {
  state.study = { questions, index: 0, code };
  studyMeta.textContent = `Mã đề ${code} · ${questions.length} câu · đã hiển thị đáp án`;
  showScreen("study");
  renderStudy();
}

function renderStudy() {
  const { questions, index } = state.study;
  const q = questions[index];
  const right = rightKey(q);

  studyProgress.style.width = ((index + 1) / questions.length) * 100 + "%";
  studyQ.textContent = `${index + 1}. ${q.question}`;

  studyOptions.innerHTML = "";
  ["A", "B", "C", "D"].forEach((k) => {
    const label = q["option" + k];
    if (label == null || label === "") return;
    const div = document.createElement("div");
    div.className = "option static" + (k === right ? " is-correct" : "");
    div.innerHTML = `<span class="option-key">${k}</span><span class="option-text"></span>`;
    div.querySelector(".option-text").textContent = label;
    studyOptions.appendChild(div);
  });

  studyPrev.disabled = index === 0;
  studyNext.disabled = index === questions.length - 1;
}

studyPrev.addEventListener("click", () => {
  if (state.study.index > 0) { state.study.index -= 1; renderStudy(); }
});
studyNext.addEventListener("click", () => {
  if (state.study.index < state.study.questions.length - 1) { state.study.index += 1; renderStudy(); }
});

/* ===========================================================
   MÀN HÌNH 5 — Thống kê
   =========================================================== */
const statsBody = $("#stats-body");

function showStats() {
  const h = loadHistory();
  showScreen("stats");

  if (!h.length) {
    statsBody.innerHTML =
      `<div class="empty">Chưa có dữ liệu.<br>Hoàn thành ít nhất một bài thi để xem thống kê tiến bộ của bạn.</div>`;
    return;
  }

  const attempts = h.length;
  const avg = Math.round(h.reduce((s, a) => s + a.percent, 0) / attempts);
  const best = Math.max(...h.map((a) => a.percent));
  const totalSec = h.reduce((s, a) => s + (a.durationSec || 0), 0);

  statsBody.innerHTML = `
    <div class="tiles" style="margin-bottom:24px">
      <div class="tile"><div class="tile-num">${attempts}</div><div class="tile-label">Lượt làm</div></div>
      <div class="tile am"><div class="tile-num">${avg}%</div><div class="tile-label">Điểm TB</div></div>
      <div class="tile ok"><div class="tile-num">${best}%</div><div class="tile-label">Cao nhất</div></div>
      <div class="tile"><div class="tile-num">${fmtTotal(totalSec)}</div><div class="tile-label">Tổng giờ học</div></div>
    </div>

    <p class="section-title">Tiến bộ gần đây</p>
    <div class="chart-wrap">
      ${barChart(h)}
      <div class="chart-cap">${Math.min(h.length, 12)} lượt gần nhất · % đúng</div>
    </div>

    <p class="section-title">Theo mã đề</p>
    <div class="stat-table">${byCodeHTML(h)}</div>

    ${missHTML(h)}

    <button id="clear-history" class="btn btn-ghost" style="width:100%">Xoá lịch sử</button>
  `;

  $("#clear-history").addEventListener("click", () => {
    if (confirm("Xoá toàn bộ lịch sử làm bài trên thiết bị này?")) {
      saveHistory([]);
      renderStartBest();
      showStats();
    }
  });
}

function fmtTotal(sec) {
  const m = Math.round(sec / 60);
  if (m < 60) return m + "p";
  return Math.floor(m / 60) + "h" + String(m % 60).padStart(2, "0");
}

function barChart(h) {
  const data = h.slice(-12);
  const W = 100, H = 100, n = data.length, gap = n > 1 ? 3 : 0;
  const bw = (W - gap * (n - 1)) / n;
  const bars = data.map((a, i) => {
    const hh = Math.max(3, a.percent);
    const x = i * (bw + gap), y = H - hh;
    const col = a.percent >= 80 ? "var(--teal)" : a.percent >= 50 ? "var(--amber)" : "var(--red)";
    const d = new Date(a.date).toLocaleDateString("vi-VN");
    return `<rect class="bar" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${bw.toFixed(2)}" height="${hh.toFixed(2)}" rx="1.5" fill="${col}"><title>${esc(a.code)} · ${a.percent}% · ${d}</title></rect>`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${bars}</svg>`;
}

function byCodeHTML(h) {
  const map = new Map();
  h.forEach((a) => {
    const e = map.get(a.code) || { code: a.code, times: 0, best: 0, sum: 0 };
    e.times++; e.best = Math.max(e.best, a.percent); e.sum += a.percent;
    map.set(a.code, e);
  });
  return [...map.values()]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((e) => `
      <div class="stat-row">
        <span class="code">${esc(e.code)}</span>
        <span class="grow">${e.times} lượt · TB <b>${Math.round(e.sum / e.times)}%</b> · cao nhất <b>${e.best}%</b></span>
      </div>`).join("");
}

function missHTML(h) {
  const map = new Map();
  h.forEach((a) => (a.wrong || []).forEach((w) => {
    const e = map.get(w.question) || { question: w.question, answer: w.answer, count: 0 };
    e.count++; map.set(w.question, e);
  }));
  const top = [...map.values()].sort((a, b) => b.count - a.count).slice(0, 8);
  if (!top.length) return "";
  return `<p class="section-title">Câu hay sai nhất</p><div class="miss-list">` +
    top.map((m) => `
      <div class="miss-row">
        <span class="txt">${esc(m.question)} <span class="sub">— đáp án ${esc(m.answer)}</span></span>
        <span class="cnt">sai ${m.count}×</span>
      </div>`).join("") + `</div>`;
}

/* Nút quay lại ở các màn phụ */
$$("[data-back]").forEach((b) => b.addEventListener("click", () => {
  setStatus(startNote, "");
  renderStartBest();
  showScreen("start");
}));

/* ----------------------- Khởi động ----------------------- */
renderStartBest();
