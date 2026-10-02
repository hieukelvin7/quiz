/* ============================================================
   CẤU HÌNH — dán URL Web App của Google Apps Script vào đây
   (Deploy > New deployment > Web app > Copy URL, dạng:
    https://script.google.com/macros/s/AKfy..../exec )
   ============================================================ */
const GAS_URL = "DÁN_URL_WEB_APP_CỦA_BẠN_VÀO_ĐÂY";

/* Thời gian mặc định cho mỗi câu (giây) nếu Apps Script
   không trả về "duration". Có thể override bằng sheet "Config". */
const DEFAULT_SECONDS_PER_QUESTION = 45;

/* ----------------------- Trạng thái ----------------------- */
const state = {
  code: "",
  questions: [],
  answers: {},      // { [questionIndex]: "A" | "B" | "C" | "D" }
  current: 0,
  name: "",
  durationSec: 0,
  remainingSec: 0,
  startedAt: 0,
  timerId: null,
};

/* ----------------------- Tiện ích ------------------------- */
const $ = (sel) => document.querySelector(sel);
const screens = {
  start: $("#screen-start"),
  quiz: $("#screen-quiz"),
  result: $("#screen-result"),
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

/* ===========================================================
   MÀN HÌNH 1 — Nhập mã đề & tải câu hỏi
   =========================================================== */
const startForm = $("#start-form");
const codeInput = $("#code-input");
const nameInput = $("#name-input");
const startBtn = $("#start-btn");
const startNote = $("#start-note");

startForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = codeInput.value.trim();
  const name = nameInput.value.trim();

  if (!name) return setStatus(startNote, "Vui lòng nhập tên của bạn.", "error");
  if (!code) return setStatus(startNote, "Vui lòng nhập mã đề.", "error");
  if (GAS_URL.startsWith("DÁN_URL"))
    return setStatus(startNote, "Chưa cấu hình GAS_URL trong script.js.", "error");

  startBtn.disabled = true;
  startBtn.classList.add("is-loading");
  setStatus(startNote, "Đang tải đề thi…");

  try {
    const url = `${GAS_URL}?action=getQuiz&code=${encodeURIComponent(code)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "Không tải được đề.");
    if (!Array.isArray(data.questions) || data.questions.length === 0)
      throw new Error("Đề này chưa có câu hỏi nào.");

    state.code = code;
    state.name = name;
    state.questions = data.questions;
    state.answers = {};
    state.current = 0;
    state.durationSec =
      Number(data.duration) ||
      data.questions.length * DEFAULT_SECONDS_PER_QUESTION;

    beginQuiz();
  } catch (err) {
    setStatus(startNote, err.message || "Có lỗi xảy ra, thử lại nhé.", "error");
  } finally {
    startBtn.disabled = false;
    startBtn.classList.remove("is-loading");
  }
});

/* ===========================================================
   MÀN HÌNH 2 — Làm bài
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

function beginQuiz() {
  showScreen("quiz");
  quizMeta.textContent = `Mã đề ${state.code} · ${state.name}`;
  qTotal.textContent = state.questions.length;
  state.remainingSec = state.durationSec;
  state.startedAt = Date.now();
  startTimer();
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
      finishQuiz(true); // hết giờ -> tự nộp
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
  const pct = ((idx + 1) / state.questions.length) * 100;
  progressFill.style.width = pct + "%";
  qText.textContent = q.question;

  optionsEl.innerHTML = "";
  ["A", "B", "C", "D"].forEach((key) => {
    const label = q["option" + key];
    if (label == null || label === "") return;

    const chosen = state.answers[idx] === key;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option" + (chosen ? " is-selected" : "");
    btn.innerHTML = `
      <span class="option-key">${key}</span>
      <span class="option-text"></span>`;
    btn.querySelector(".option-text").textContent = label;

    btn.addEventListener("click", () => {
      state.answers[idx] = key;
      renderQuestion();
    });
    optionsEl.appendChild(btn);
  });

  prevBtn.disabled = idx === 0;
  const isLast = idx === state.questions.length - 1;
  nextBtn.classList.toggle("is-hidden", isLast);
  submitBtn.classList.toggle("is-hidden", !isLast);
}

prevBtn.addEventListener("click", () => {
  if (state.current > 0) {
    state.current -= 1;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (state.current < state.questions.length - 1) {
    state.current += 1;
    renderQuestion();
  }
});

submitBtn.addEventListener("click", () => {
  const unanswered = state.questions.length - Object.keys(state.answers).length;
  const msg = unanswered
    ? `Bạn còn ${unanswered} câu chưa trả lời. Nộp bài luôn?`
    : "Nộp bài và xem kết quả?";
  if (confirm(msg)) finishQuiz(false);
});

/* ===========================================================
   MÀN HÌNH 3 — Chấm điểm & gửi kết quả về Google Sheet
   =========================================================== */
const scoreBig = $("#score-big");
const scoreLabel = $("#score-label");
const resultRing = $("#result-ring");
const resultMeta = $("#result-meta");
const submitNote = $("#submit-note");
const reviewList = $("#review-list");
const restartBtn = $("#restart-btn");

function finishQuiz(timedOut) {
  clearInterval(state.timerId);

  let correct = 0;
  state.questions.forEach((q, i) => {
    if ((state.answers[i] || "") === String(q.answer).trim().toUpperCase())
      correct++;
  });

  const total = state.questions.length;
  const percent = Math.round((correct / total) * 100);
  const durationSec = Math.round((Date.now() - state.startedAt) / 1000);

  showScreen("result");
  renderResult(correct, total, percent, durationSec, timedOut);
  sendResult({ correct, total, percent, durationSec });
}

function renderResult(correct, total, percent, durationSec, timedOut) {
  scoreBig.textContent = `${correct}/${total}`;
  scoreLabel.textContent =
    percent >= 80 ? "Xuất sắc" : percent >= 50 ? "Đạt" : "Cần ôn thêm";
  resultRing.style.setProperty("--pct", percent);
  resultMeta.textContent = `${percent}% đúng · ${fmtTime(durationSec)}${
    timedOut ? " · hết giờ" : ""
  }`;

  reviewList.innerHTML = "";
  state.questions.forEach((q, i) => {
    const picked = state.answers[i] || "—";
    const right = String(q.answer).trim().toUpperCase();
    const ok = picked === right;
    const row = document.createElement("li");
    row.className = "review-row " + (ok ? "is-ok" : "is-no");
    row.innerHTML = `
      <span class="review-idx">${i + 1}</span>
      <span class="review-q"></span>
      <span class="review-tag">${ok ? "Đúng" : `${picked} → ${right}`}</span>`;
    row.querySelector(".review-q").textContent = q.question;
    reviewList.appendChild(row);
  });
}

async function sendResult(scoreData) {
  setStatus(submitNote, "Đang gửi kết quả về hệ thống…");
  const payload = {
    name: state.name,
    code: state.code,
    score: scoreData.correct,
    total: scoreData.total,
    percent: scoreData.percent,
    durationSec: scoreData.durationSec,
    answers: state.answers,
  };

  try {
    // text/plain tránh preflight CORS với Apps Script.
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

restartBtn.addEventListener("click", () => {
  codeInput.value = "";
  setStatus(startNote, "");
  showScreen("start");
});
