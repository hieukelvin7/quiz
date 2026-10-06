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
  study: $("#screen-study"), stats: $("#screen-stats"), fillpick: $("#screen-fillpick"),
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

/* Số ĐOẠN VĂN điền đục lỗ lấy ngẫu nhiên mỗi lần khởi tạo */
const FILL_PASSAGES = 10;

/* Chuẩn hoá đáp án điền: bỏ qua HOA/thường + khoảng trắng thừa,
   NHƯNG giữ nguyên dấu tiếng Việt (chính tả phải đúng). */
function normFill(s) {
  return String(s == null ? "" : s).trim().toLowerCase().replace(/\s+/g, " ");
}

/* Đúng 1 chỗ trống? (so với đáp án chính + biến thể) */
function blankCorrect(blank, val) {
  const n = normFill(val);
  if (!n) return false;
  const list = blank.accept && blank.accept.length ? blank.accept : [blank.answer];
  return list.some((a) => normFill(a) === n);
}

/* Chấm 1 câu -> {got, max}. Đoạn điền tính điểm theo từng chỗ trống. */
function gradeQuestion(q, ans) {
  if (q.type === "fill") {
    let got = 0;
    q.blanks.forEach((b, i) => { if (blankCorrect(b, ans && ans[i])) got++; });
    return { got, max: q.blanks.length };
  }
  return { got: String(ans || "").toUpperCase() === rightKey(q) ? 1 : 0, max: 1 };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* Xáo trộn 4 đáp án của 1 câu trắc nghiệm, cập nhật lại đáp án đúng */
function shuffleOptions(q) {
  const keys = ["A", "B", "C", "D"].filter((k) => q["option" + k] != null && q["option" + k] !== "");
  const items = keys.map((k) => ({ text: q["option" + k], correct: k === rightKey(q) }));
  shuffle(items);
  const out = { type: "mcq", question: q.question };
  const letters = ["A", "B", "C", "D"];
  out.answer = "A";
  items.forEach((it, i) => {
    out["option" + letters[i]] = it.text;
    if (it.correct) out.answer = letters[i];
  });
  return out;
}

/* Chuẩn bị đề trắc nghiệm: xáo đáp án từng câu + xáo thứ tự câu */
function prepareMcq(list) {
  return shuffle(list.map(shuffleOptions));
}

function setBtnLoading(btn, on) {
  btn.disabled = on;
  btn.classList.toggle("is-loading", on);
}

/* ----------------------- Lottie ----------------------- */
let loaderAnim = null, confettiAnim = null;
const appLoader = $("#app-loader");

function showLoader() {
  if (window.lottie && !loaderAnim) {
    try {
      loaderAnim = lottie.loadAnimation({
        container: $("#loader-anim"), renderer: "svg",
        loop: true, autoplay: true, path: "assets/loader.json",
      });
    } catch (e) {}
  }
  appLoader.classList.remove("is-hidden");
}
function hideLoader() { appLoader.classList.add("is-hidden"); }

function playConfetti() {
  if (!window.lottie) return;
  const c = $("#confetti");
  try {
    if (confettiAnim) { confettiAnim.destroy(); confettiAnim = null; }
    confettiAnim = lottie.loadAnimation({
      container: c, renderer: "svg", loop: false, autoplay: true, path: "assets/confetti.json",
    });
  } catch (e) {}
}
function clearConfetti() {
  if (confettiAnim) { confettiAnim.destroy(); confettiAnim = null; }
  const c = $("#confetti"); if (c) c.innerHTML = "";
}

let notesAnim = null;
function initNotes() {
  if (window.lottie && !notesAnim) {
    try {
      notesAnim = lottie.loadAnimation({
        container: $("#notes"), renderer: "svg",
        loop: true, autoplay: true, path: "assets/notes.json",
      });
    } catch (e) {}
  }
}

/* ===========================================================
   GAMIFICATION (kiểu Duolingo) — XP · chuỗi ngày · cấp · huy hiệu
   =========================================================== */
const GKEY = "quiz_gamify_v1";
const DAILY_GOAL = 50;
const BADGES = [
  { id: "first",    ic: "🎯", name: "Khởi đầu",     desc: "Hoàn thành bài đầu tiên" },
  { id: "perfect",  ic: "💯", name: "Tuyệt đối",     desc: "Đạt 100% một bài" },
  { id: "streak3",  ic: "🔥", name: "Chuỗi 3 ngày",  desc: "Học 3 ngày liên tiếp" },
  { id: "streak7",  ic: "⚡", name: "Chuỗi 7 ngày",  desc: "Học 7 ngày liên tiếp" },
  { id: "xp300",    ic: "⭐", name: "300 XP",        desc: "Tích lũy 300 XP" },
  { id: "xp1000",   ic: "🏆", name: "1000 XP",       desc: "Tích lũy 1000 XP" },
  { id: "fill",     ic: "✍️", name: "Điền thủ",      desc: "Hoàn thành đề điền đục lỗ" },
  { id: "comeback", ic: "🔁", name: "Học lại",       desc: "Luyện lại câu sai" },
];
const DEFAULT_G = { xp: 0, streak: 0, lastDay: "", badges: {}, dailyXp: 0, dailyDay: "" };

function loadGamify() {
  try { return Object.assign({}, DEFAULT_G, JSON.parse(localStorage.getItem(GKEY)) || {}); }
  catch (e) { return Object.assign({}, DEFAULT_G); }
}
function saveGamify(g) { try { localStorage.setItem(GKEY, JSON.stringify(g)); } catch (e) {} }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function levelFromXp(xp) { return Math.floor(xp / 100) + 1; }

function awardXp({ correct, percent, isFill }) {
  const g = loadGamify();
  const today = todayStr();
  const xp = correct * 10 + (percent >= 80 ? 20 : 0);
  g.xp += xp;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (g.lastDay === today) { /* giữ chuỗi */ }
  else if (g.lastDay === yesterday) g.streak += 1;
  else g.streak = 1;
  g.lastDay = today;

  if (g.dailyDay !== today) { g.dailyDay = today; g.dailyXp = 0; }
  g.dailyXp += xp;

  const newBadges = [];
  const unlock = (id) => { if (!g.badges[id]) { g.badges[id] = true; newBadges.push(id); } };
  unlock("first");
  if (percent >= 100) unlock("perfect");
  if (g.streak >= 3) unlock("streak3");
  if (g.streak >= 7) unlock("streak7");
  if (g.xp >= 300) unlock("xp300");
  if (g.xp >= 1000) unlock("xp1000");
  if (isFill) unlock("fill");

  saveGamify(g);
  return { xp, streak: g.streak, newBadges };
}

function renderGamify() {
  const g = loadGamify();
  const today = todayStr();
  const dailyXp = g.dailyDay === today ? g.dailyXp : 0;
  const lvl = levelFromXp(g.xp);
  const pct = Math.min(100, Math.round((dailyXp / DAILY_GOAL) * 100));
  $("#gamify").innerHTML = `
    <div class="g-row">
      <div class="g-chip streak"><span class="g-ic">🔥</span><b>${g.streak}</b><span class="g-lbl">ngày</span></div>
      <div class="g-chip xp"><span class="g-ic">⭐</span><b>${g.xp}</b><span class="g-lbl">XP</span></div>
      <div class="g-chip"><span class="g-ic">🏆</span><b>Lv ${lvl}</b></div>
    </div>
    <div class="g-goal ${dailyXp >= DAILY_GOAL ? "done" : ""}">
      <div class="g-goal-top"><span>Mục tiêu hôm nay</span><span>${Math.min(dailyXp, DAILY_GOAL)}/${DAILY_GOAL} XP${dailyXp >= DAILY_GOAL ? " ✓" : ""}</span></div>
      <div class="g-bar"><div class="g-bar-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="g-badges">${BADGES.map((b) =>
      `<span class="g-badge ${g.badges[b.id] ? "on" : ""}" title="${esc(b.name)} — ${esc(b.desc)}">${b.ic}</span>`
    ).join("")}</div>`;
}

function unlockBadge(id) {
  const g = loadGamify();
  if (!g.badges[id]) { g.badges[id] = true; saveGamify(g); }
}

function showXpGain({ xp, streak, newBadges }) {
  const el = $("#xp-gain");
  let html = `<div class="xp-pts">+${xp} XP</div><div class="xp-line">🔥 Chuỗi ${streak} ngày</div>`;
  if (newBadges && newBadges.length) {
    const names = newBadges.map((id) => {
      const b = BADGES.find((x) => x.id === id);
      return b ? b.ic + " " + b.name : id;
    });
    html += `<div class="xp-new">Mở khóa: ${esc(names.join(", "))}</div>`;
  }
  el.innerHTML = html;
  el.classList.add("show");
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
/* ===== MÔN HỌC ===== */
const SUBJECTS = [
  {
    id: "lichsu", name: "Lịch sử âm nhạc", icon: "🎼", fillSheet: "FILL",
    codes: [
      ["DE01", "Bach & bối cảnh Đức"], ["DE02", "Cổ điển Vienne"],
      ["DE03", "Lãng mạn: Schubert–Mendelssohn–Schumann"], ["DE04", "Lãng mạn: Chopin–Liszt–Grieg–Dvořák"],
      ["DE05", "Wagner–Brahms–Tchaikovsky–Debussy–TK XX"], ["DE06", "Bối cảnh & đặc điểm các trường phái"],
      ["DE07", "Điệu thức cổ, chi tiết & nhân vật"],
    ],
  },
  {
    id: "tieuluan", name: "Viết tiểu luận", icon: "✍️", fillSheet: "FILL_TL",
    codes: [["TL01", "Ôn tập kiến thức tiểu luận"]],
  },
];
let curSubject = SUBJECTS[0];
try {
  const saved = localStorage.getItem("quiz_subject");
  const f = SUBJECTS.find((s) => s.id === saved);
  if (f) curSubject = f;
} catch (e) {}

const startForm = $("#start-form");
const codeSelect = $("#code-select");
const subjectsEl = $("#subjects");
const nameInput = $("#name-input");
const startBtn = $("#start-btn");
const startNote = $("#start-note");
const startBest = $("#start-best");
const studyBtn = $("#study-btn");
const statsBtn = $("#stats-btn");
const instantToggle = $("#instant-toggle");
try { instantToggle.checked = localStorage.getItem("quiz_instant") === "1"; } catch (e) {}
instantToggle.addEventListener("change", () => {
  try { localStorage.setItem("quiz_instant", instantToggle.checked ? "1" : "0"); } catch (e) {}
});
function readInstant() { return !!instantToggle.checked; }

function renderSubjects() {
  subjectsEl.innerHTML = SUBJECTS.map((s) =>
    `<button type="button" class="subj ${s.id === curSubject.id ? "on" : ""}" data-sid="${s.id}">
       <span class="s-ic">${s.icon}</span><span class="s-name">${esc(s.name)}</span>
     </button>`).join("");
  subjectsEl.querySelectorAll(".subj").forEach((b) =>
    b.addEventListener("click", () => {
      curSubject = SUBJECTS.find((s) => s.id === b.dataset.sid) || SUBJECTS[0];
      try { localStorage.setItem("quiz_subject", curSubject.id); } catch (e) {}
      renderSubjects(); populateCodes(); setStatus(startNote, "");
    }));
}
function populateCodes() {
  codeSelect.innerHTML = curSubject.codes.map(([c, label]) =>
    `<option value="${esc(c)}">${esc(c)} — ${esc(label)}</option>`).join("");
}

startForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = codeSelect.value.trim();
  const name = nameInput.value.trim();
  if (!name) return setStatus(startNote, "Vui lòng nhập tên của bạn.", "error");
  if (!code) return setStatus(startNote, "Vui lòng nhập mã đề.", "error");
  if (GAS_URL.startsWith("DÁN_URL"))
    return setStatus(startNote, "Chưa cấu hình GAS_URL trong script.js.", "error");

  setBtnLoading(startBtn, true);
  setStatus(startNote, "Đang tải đề thi…");
  showLoader();
  try {
    const { questions, duration } = await loadQuiz(code);
    const prepared = prepareMcq(questions);     // xáo câu + xáo đáp án
    state.code = code; state.name = name; state.instant = readInstant();
    state.examQuestions = prepared; state.examDuration = duration;
    setStatus(startNote, "");
    beginQuiz({ mode: "exam", questions: prepared, duration });
  } catch (err) {
    setStatus(startNote, err.message || "Có lỗi xảy ra, thử lại nhé.", "error");
  } finally {
    setBtnLoading(startBtn, false);
    hideLoader();
  }
});

studyBtn.addEventListener("click", async () => {
  const code = codeSelect.value.trim();
  if (!code) return setStatus(startNote, "Chọn mã đề để ôn tập.", "error");
  setBtnLoading(studyBtn, true);
  setStatus(startNote, "Đang tải đề để ôn tập…");
  showLoader();
  try {
    const { questions } = await loadQuiz(code);
    setStatus(startNote, "");
    beginStudy(code, questions);
  } catch (err) {
    setStatus(startNote, err.message || "Có lỗi xảy ra.", "error");
  } finally {
    setBtnLoading(studyBtn, false);
    hideLoader();
  }
});

statsBtn.addEventListener("click", showStats);

const fillBtn = $("#fill-btn");
fillBtn.addEventListener("click", startFill);

/* Nhóm đoạn điền theo tác giả/chủ đề (bỏ phần sau " – " và hậu tố "(n)") */
function groupOf(title) {
  return String(title || "Khác")
    .split(" – ")[0].split(" - ")[0]
    .replace(/\s*\(\d+\)\s*$/, "").trim() || "Khác";
}

let fillPool = [];

async function startFill() {
  const name = nameInput.value.trim();
  if (!name) return setStatus(startNote, "Nhập tên trước khi làm bài điền.", "error");
  if (GAS_URL.startsWith("DÁN_URL"))
    return setStatus(startNote, "Chưa cấu hình GAS_URL trong script.js.", "error");

  setBtnLoading(fillBtn, true);
  setStatus(startNote, "Đang tải kho câu điền…");
  showLoader();
  try {
    const res = await fetch(`${GAS_URL}?action=getFill&code=${encodeURIComponent(curSubject.fillSheet)}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Không tải được pool câu điền.");
    if (!Array.isArray(data.items) || !data.items.length)
      throw new Error("Pool câu điền đang trống.");

    fillPool = data.items.map((it) => ({
      type: "fill", title: it.title || "", passage: it.passage, blanks: it.blanks || [],
    })).filter((q) => q.blanks.length);

    state.name = name;
    setStatus(startNote, "");
    renderFillPicker();
    showScreen("fillpick");
  } catch (err) {
    setStatus(startNote, err.message || "Có lỗi xảy ra.", "error");
  } finally {
    setBtnLoading(fillBtn, false);
    hideLoader();
  }
}

function renderFillPicker() {
  const groups = new Map();
  fillPool.forEach((q) => {
    const k = groupOf(q.title);
    groups.set(k, (groups.get(k) || 0) + 1);
  });
  const el = $("#fill-pick-list");
  let html = `<button type="button" class="pick-item all" data-group="*">
      <span class="pick-name">🎲 Tất cả (ngẫu nhiên)</span>
      <span class="pick-sub">${Math.min(FILL_PASSAGES, fillPool.length)} đoạn mỗi lượt · ${fillPool.length} đoạn</span>
    </button>`;
  html += [...groups.keys()].sort((a, b) => a.localeCompare(b, "vi")).map((k) =>
    `<button type="button" class="pick-item" data-group="${esc(k)}">
       <span class="pick-name">${esc(k)}</span>
       <span class="pick-sub">${groups.get(k)} đoạn</span>
     </button>`).join("");
  el.innerHTML = html;
  el.querySelectorAll(".pick-item").forEach((b) =>
    b.addEventListener("click", () => startFillWith(b.dataset.group)));
}

function startFillWith(group) {
  let questions;
  if (group === "*") {
    questions = shuffle(fillPool.slice());
    questions = questions.slice(0, Math.min(FILL_PASSAGES, questions.length));
  } else {
    questions = shuffle(fillPool.filter((q) => groupOf(q.title) === group));
  }
  if (!questions.length) return;
  const blanks = questions.reduce((s, q) => s + q.blanks.length, 0);
  state.code = curSubject.fillSheet; state.instant = readInstant();
  state.examQuestions = questions; state.examDuration = blanks * 40;
  beginQuiz({ mode: "exam", questions, duration: blanks * 40 });
}

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
const checkBtn = $("#check-btn");
const feedbackEl = $("#feedback");
const quizMeta = $("#quiz-meta");

function beginQuiz({ mode, questions, duration }) {
  state.mode = mode;
  state.timed = mode === "exam";
  state.questions = questions;
  state.answers = {};
  state.checked = {};          // câu nào đã bấm "Kiểm tra" (chế độ phản hồi ngay)
  state.current = 0;
  state.startedAt = Date.now();

  showScreen("quiz");
  qTotal.textContent = questions.length;
  const isFillSet = questions[0] && questions[0].type === "fill";
  quizMeta.textContent = !state.timed
    ? `Luyện tập câu sai · ${questions.length} câu`
    : isFillSet
      ? `Điền đục lỗ · ${state.name}`
      : `Mã đề ${state.code} · ${state.name}`;

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
  const revealed = state.instant && state.checked[idx];   // đã kiểm tra & lộ đáp án

  qCounter.textContent = idx + 1;
  progressFill.style.width = ((idx + 1) / state.questions.length) * 100 + "%";
  qText.textContent = q.question;
  optionsEl.innerHTML = "";
  feedbackEl.className = "feedback";
  feedbackEl.innerHTML = "";

  if (q.type === "fill") {
    qText.textContent = `Điền các từ còn thiếu trong đoạn (${q.blanks.length} chỗ)`;
    if (!Array.isArray(state.answers[idx])) state.answers[idx] = [];

    if (revealed) {
      // Hiện đoạn đã điền sẵn đáp án (xanh/đỏ) — dùng lại detailHTML
      optionsEl.innerHTML = `<div class="cloze-review">${detailHTML(q, state.answers[idx])}</div>`;
    } else {
      const cloze = document.createElement("div");
      cloze.className = "cloze";
      const parts = q.passage.split(/_{2,}/);
      parts.forEach((p, i) => {
        if (p) cloze.appendChild(document.createTextNode(p));
        if (i < parts.length - 1) {
          const wrap = document.createElement("span");
          wrap.className = "blank";
          const no = document.createElement("span");
          no.className = "blank-no";
          no.textContent = "(" + (i + 1) + ")";
          wrap.appendChild(no);
          wrap.appendChild(makeFillInput(idx, i));
          cloze.appendChild(wrap);
        }
      });
      optionsEl.appendChild(cloze);
      const note = document.createElement("div");
      note.className = "fill-note";
      note.textContent = "Không phân biệt hoa/thường · phải đúng chính tả, kể cả dấu · Enter để sang chỗ tiếp.";
      optionsEl.appendChild(note);
      setTimeout(() => { const el = cloze.querySelector("input"); if (el) el.focus(); }, 0);
    }
  } else {
    const right = rightKey(q);
    ["A", "B", "C", "D"].forEach((key) => {
      const label = q["option" + key];
      if (label == null || label === "") return;
      const chosen = state.answers[idx] === key;
      const btn = document.createElement("button");
      btn.type = "button";
      let cls = "option";
      if (revealed) {
        cls += " locked";
        if (key === right) cls += " opt-correct";
        else if (chosen) cls += " opt-wrong";
      } else if (chosen) cls += " is-selected";
      btn.className = cls;
      btn.innerHTML = `<span class="option-key">${key}</span><span class="option-text"></span>`;
      btn.querySelector(".option-text").textContent = label;
      if (!revealed) btn.addEventListener("click", () => { state.answers[idx] = key; renderQuestion(); });
      optionsEl.appendChild(btn);
    });
  }

  if (revealed) showFeedback(q, idx);
  updateNav(q, idx, revealed);
}

/* Banner phản hồi đúng/sai */
function showFeedback(q, idx) {
  const g = gradeQuestion(q, state.answers[idx]);
  const ok = g.got === g.max;
  feedbackEl.className = "feedback show " + (ok ? "ok" : "no");
  if (q.type === "fill") {
    feedbackEl.innerHTML = ok
      ? `Hoàn hảo! 🎉 <span class="fb-sub">Đúng cả ${g.max} chỗ</span>`
      : `Đúng ${g.got}/${g.max} chỗ <span class="fb-sub">Xem chỗ sai ở đáp án phía trên</span>`;
  } else {
    const rightText = q["option" + rightKey(q)] || "";
    feedbackEl.innerHTML = ok
      ? `Chính xác! 🎉`
      : `Chưa đúng <span class="fb-sub">Đáp án đúng: ${esc(rightText)}</span>`;
  }
}

/* Điều phối nút theo chế độ */
function updateNav(q, idx, revealed) {
  const isLast = idx === state.questions.length - 1;
  const lastLabel = state.mode === "practice" ? "Hoàn thành" : "Nộp bài";
  submitBtn.textContent = isLast && state.instant ? lastLabel : (state.mode === "practice" ? "Hoàn thành" : "Nộp bài");

  if (state.instant) {
    prevBtn.classList.add("is-hidden");
    if (!revealed) {
      checkBtn.classList.remove("is-hidden");
      checkBtn.disabled = !hasAnswer(q, state.answers[idx]);
      nextBtn.classList.add("is-hidden");
      submitBtn.classList.add("is-hidden");
    } else {
      checkBtn.classList.add("is-hidden");
      nextBtn.textContent = "Tiếp tục";
      nextBtn.classList.toggle("is-hidden", isLast);
      submitBtn.classList.toggle("is-hidden", !isLast);
    }
  } else {
    prevBtn.classList.remove("is-hidden");
    checkBtn.classList.add("is-hidden");
    prevBtn.disabled = idx === 0;
    nextBtn.textContent = "Câu tiếp";
    nextBtn.classList.toggle("is-hidden", isLast);
    submitBtn.classList.toggle("is-hidden", !isLast);
  }
}

prevBtn.addEventListener("click", () => {
  if (state.current > 0) { state.current -= 1; renderQuestion(); }
});
nextBtn.addEventListener("click", () => {
  if (state.current < state.questions.length - 1) { state.current += 1; renderQuestion(); }
});
checkBtn.addEventListener("click", () => {
  const idx = state.current;
  const q = state.questions[idx];
  if (!hasAnswer(q, state.answers[idx])) return;
  state.checked[idx] = true;
  renderQuestion();
});
function goNextOrSubmit() {
  // Enter trong ô điền: chế độ phản hồi ngay thì "Kiểm tra" trước
  if (state.instant && !state.checked[state.current]) { checkBtn.click(); return; }
  if (state.current < state.questions.length - 1) { state.current += 1; renderQuestion(); }
  else submitBtn.click();
}

/* Ô nhập cho 1 chỗ trống thứ b của câu idx (gắn với state.answers[idx][b]) */
function makeFillInput(idx, b) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "fill-input inline";
  input.placeholder = "…";
  input.autocomplete = "off";
  input.spellcheck = false;
  if (!Array.isArray(state.answers[idx])) state.answers[idx] = [];
  input.value = state.answers[idx][b] || "";
  input.setAttribute("aria-label", "Chỗ trống " + (b + 1));
  input.dataset.blank = b;
  input.addEventListener("input", () => {
    if (!Array.isArray(state.answers[idx])) state.answers[idx] = [];
    state.answers[idx][b] = input.value;
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const inputs = Array.from(optionsEl.querySelectorAll(".fill-input"));
    const pos = inputs.indexOf(input);
    if (pos > -1 && pos < inputs.length - 1) inputs[pos + 1].focus();
    else goNextOrSubmit();
  });
  return input;
}

function hasAnswer(q, a) {
  return q.type === "fill"
    ? Array.isArray(a) && a.some((x) => x && x.trim())
    : !!a;
}
submitBtn.addEventListener("click", () => {
  if (state.instant) { finishQuiz(false); return; }   // đã kiểm tra từng câu
  const answered = state.questions.reduce((n, q, i) => n + (hasAnswer(q, state.answers[i]) ? 1 : 0), 0);
  const unanswered = state.questions.length - answered;
  const word = state.questions[0] && state.questions[0].type === "fill" ? "đoạn" : "câu";
  const msg = unanswered
    ? `Bạn còn ${unanswered} ${word} chưa làm. ${state.mode === "practice" ? "Kết thúc" : "Nộp bài"} luôn?`
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
  let got = 0, max = 0; const wrong = [];
  qs.forEach((q, i) => {
    const g = gradeQuestion(q, ans[i]);
    got += g.got; max += g.max;
    if (g.got < g.max) wrong.push({ q, picked: ans[i] });
  });

  const correct = got, total = max;
  const percent = total ? Math.round((got / total) * 100) : 0;
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
        question: w.q.type === "fill" ? (w.q.title || "Đoạn văn") : w.q.question,
        answer: w.q.type === "fill" ? "" : rightKey(w.q),
        picked: w.q.type === "fill" ? "" : (w.picked || "—"),
      })),
    });
    const isFill = qs[0] && qs[0].type === "fill";
    showXpGain(awardXp({ correct, percent, isFill }));
    renderStartBest();
    renderGamify();
    sendResult({ correct, total, percent, durationSec });
  } else {
    submitNote.textContent = "";
  }
}

function renderResult({ correct, total, percent, durationSec, timedOut }) {
  const wrong = total - correct;
  const isFill = state.questions[0] && state.questions[0].type === "fill";
  scoreBig.textContent = `${correct}/${total}`;
  scoreLabel.textContent = percent >= 80 ? "Xuất sắc" : percent >= 50 ? "Đạt" : "Cần ôn thêm";
  resultRing.style.setProperty("--pct", percent);
  resultMeta.textContent =
    `${percent}% đúng · ${fmtTime(durationSec)}` +
    (timedOut ? " · hết giờ" : "") +
    (state.mode === "practice" ? " · luyện tập" : "");

  const okLabel = isFill ? "Chỗ đúng" : "Câu đúng";
  const noLabel = isFill ? "Chỗ sai" : "Câu sai";
  resultTiles.innerHTML = `
    <div class="tile ok"><div class="tile-num">${correct}</div><div class="tile-label">${okLabel}</div></div>
    <div class="tile no"><div class="tile-num">${wrong}</div><div class="tile-label">${noLabel}</div></div>
    <div class="tile am"><div class="tile-num">${fmtTime(durationSec)}</div><div class="tile-label">Thời gian</div></div>`;

  // Danh sách xem lại (mở rộng được)
  reviewList.innerHTML = state.questions.map((q, i) => {
    const raw = state.answers[i];
    const g = gradeQuestion(q, raw);
    const ok = g.got === g.max;
    let tag, qdisp;
    if (q.type === "fill") {
      tag = `${g.got}/${g.max}`;
      qdisp = (q.title ? q.title + " — " : "") + q.passage.replace(/_{2,}/g, "……");
    } else {
      tag = ok ? "Đúng" : `${raw || "—"} → ${rightKey(q)}`;
      qdisp = q.question;
    }
    return `
      <li class="review-item">
        <button type="button" class="review-row ${ok ? "is-ok" : "is-no"}" data-i="${i}">
          <span class="review-idx">${i + 1}</span>
          <span class="review-q">${esc(qdisp)}</span>
          <span class="review-tag">${esc(tag)}</span>
          <span class="review-caret">▸</span>
        </button>
        <div class="review-detail">${detailHTML(q, raw)}</div>
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
  const xg = $("#xp-gain"); xg.classList.remove("show"); xg.innerHTML = "";

  // Pháo giấy khi làm tốt
  if (percent >= 80) playConfetti(); else clearConfetti();
}

function detailHTML(q, ans) {
  if (q.type === "fill") {
    // Đoạn văn hoàn chỉnh: điền sẵn đáp án đúng, tô xanh chỗ bạn đúng, đỏ chỗ sai
    const parts = q.passage.split(/_{2,}/);
    let html = '<div class="detail-q" style="line-height:2.2">';
    const wrongs = [];
    parts.forEach((p, i) => {
      html += esc(p);
      if (i < parts.length - 1) {
        const b = q.blanks[i];
        const val = (ans && ans[i]) || "";
        const ok = blankCorrect(b, val);
        html += `<span class="blank-no">(${i + 1})</span><span class="cloze-ans ${ok ? "ok" : "no"}">${esc(b.answer)}</span>`;
        if (!ok) wrongs.push({ n: i + 1, answer: b.answer, picked: val });
      }
    });
    html += "</div>";
    if (wrongs.length) {
      html += `<div class="fill-hint">Chỗ sai: ` + wrongs.map((w) =>
        `#${w.n} bạn ghi “${w.picked ? esc(w.picked) : "trống"}”, đúng là “${esc(w.answer)}”`
      ).join(" · ") + `</div>`;
    } else {
      html += `<div class="fill-hint">Bạn điền đúng tất cả ✓</div>`;
    }
    return html;
  }

  const picked = ans;
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
  if (state.lastWrong.length) {
    unlockBadge("comeback");
    beginQuiz({ mode: "practice", questions: state.lastWrong });
  }
});
redoBtn.addEventListener("click", () => {
  if (state.examQuestions.length)
    beginQuiz({ mode: "exam", questions: state.examQuestions, duration: state.examDuration });
});
toStatsBtn.addEventListener("click", showStats);
restartBtn.addEventListener("click", () => {
  setStatus(startNote, "");
  renderStartBest();
  renderGamify();
  renderSubjects();
  populateCodes();
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
        <span class="txt">${esc(m.question)}${m.answer ? ` <span class="sub">— đáp án ${esc(m.answer)}</span>` : ""}</span>
        <span class="cnt">sai ${m.count}×</span>
      </div>`).join("") + `</div>`;
}

/* Nút quay lại ở các màn phụ */
$$("[data-back]").forEach((b) => b.addEventListener("click", () => {
  setStatus(startNote, "");
  renderStartBest();
  renderGamify();
  showScreen("start");
}));

/* ----------------------- Khởi động ----------------------- */
renderSubjects();
populateCodes();
renderStartBest();
renderGamify();
initNotes();
