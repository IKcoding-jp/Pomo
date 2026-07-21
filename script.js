const KEYS = {
  autoStart: "autoStart",
  timerRunning: "timerRunning",
  startTimestamp: "savedStartTimestamp",
  startTimeLeft: "savedStartTimeLeft",
  timerStatus: "savedTimerStatus",
  workTime: "workTime",
  breakTime: "breakTime",
  longBreakTime: "longBreakTime",
  sessionCount: "sessionCount",
  studyLog: "studyLog",
};

const CONFIG = {
  initialTime: 1500,
  ringRadius: 90,
  sessionsPerRound: 4,
  colorDarkenThreshold: 31,
  updateInterval: 500,
};

const timerState = {
  timeLeft: CONFIG.initialTime,
  totalTime: CONFIG.initialTime,
  timer: null,
  isRunning: false,
  timerStatus: "work",
  sessionCount: 0,
  startTimestamp: null,
  startTimeLeft: 0,
};

const display = document.querySelector(".ring-time");
const startButton = document.getElementById("start");
const workInput = document.getElementById(KEYS.workTime);
const breakInput = document.getElementById(KEYS.breakTime);
const ring = document.querySelector(".ring-progress");
const circumference = 2 * Math.PI * CONFIG.ringRadius;
const chimeSound = new Audio("sounds/chime.mp3");
const savedWork = localStorage.getItem(KEYS.workTime);
const savedBreak = localStorage.getItem(KEYS.breakTime);
const longBreakInput = document.getElementById(KEYS.longBreakTime);
const savedLongBreak = localStorage.getItem(KEYS.longBreakTime);
const savedSession = localStorage.getItem(KEYS.sessionCount);
const showStatsBtn = document.getElementById("showStats");
const statsModal = document.getElementById("statsModal");
const closeStatsBtn = document.getElementById("closeStats");
const showSettingsBtn = document.getElementById("showSettings");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsBtn = document.getElementById("closeSettings");
const autoStartInput = document.getElementById("autoStart");
ring.style.strokeDasharray = circumference;

function updateRing(timeLeft, totalTime) {
  const offset = circumference * (1 - timeLeft / totalTime);
  ring.style.strokeDashoffset = offset;
}

function updateDots() {
  const dots = document.querySelectorAll(".dot");
  const current = timerState.sessionCount % CONFIG.sessionsPerRound;
  dots.forEach(function (dot, index) {
    if (index < current) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ":" + String(s).padStart(2, "0");
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? h + "時間" + m + "分" : m + "分";
}

function startTimer() {
  timerState.timer = setInterval(function () {
    const elapsed = Math.floor((Date.now() - timerState.startTimestamp) / 1000);
    timerState.timeLeft = timerState.startTimeLeft - elapsed;
    display.textContent = formatTime(timerState.timeLeft);
    updateRing(timerState.timeLeft, timerState.totalTime);
    if (timerState.timeLeft <= 0) {
      handleTimerEnd();
    }
  }, CONFIG.updateInterval);
  timerState.isRunning = true;
  startButton.textContent = "ストップ";
}

function getStudyLog() {
  return JSON.parse(localStorage.getItem(KEYS.studyLog) || "{}");
}

function handleTimerEnd() {
  localStorage.removeItem(KEYS.timerRunning);
  playChime();
  clearInterval(timerState.timer);
  timerState.isRunning = false;

  if (timerState.timerStatus === "work") {
    timerState.timerStatus = "break";
    timerState.sessionCount = timerState.sessionCount + 1;
    saveTodaySession(Number(workInput.value));
    updateTodayStats();
    localStorage.setItem(KEYS.sessionCount, timerState.sessionCount);
    updateDots();
    timerState.timeLeft =
      timerState.sessionCount % CONFIG.sessionsPerRound === 0
        ? longBreakInput.value * 60
        : breakInput.value * 60;
    display.textContent = "休憩";
    startButton.textContent = "休憩スタート";
  } else {
    timerState.timerStatus = "work";
    timerState.timeLeft = workInput.value * 60;
    display.textContent = formatTime(timerState.timeLeft);
    startButton.textContent = "スタート";
  }

  if (autoStartInput.checked) {
    startButton.click();
  }
}

function playChime() {
  chimeSound.currentTime = 0;
  chimeSound.play().catch(function (e) {
    console.log("音が鳴りませんでした", e);
  });
}

startButton.addEventListener("click", function () {
  if (timerState.isRunning) {
    clearInterval(timerState.timer);
    timerState.isRunning = false;
    localStorage.removeItem(KEYS.timerRunning);
    startButton.textContent = "スタート";
  } else {
    timerState.totalTime = timerState.timeLeft;
    timerState.startTimestamp = Date.now();
    timerState.startTimeLeft = timerState.timeLeft;
    startTimer();
    localStorage.setItem(KEYS.timerRunning, "true");
    localStorage.setItem(KEYS.startTimestamp, timerState.startTimestamp);
    localStorage.setItem(KEYS.startTimeLeft, timerState.startTimeLeft);
    localStorage.setItem(KEYS.timerStatus, timerState.timerStatus);
  }
});

const resetButton = document.getElementById("reset");

resetButton.addEventListener("click", function () {
  timerState.timerStatus = "work";
  clearInterval(timerState.timer);
  timerState.timeLeft = workInput.value * 60;
  timerState.isRunning = false;
  localStorage.removeItem(KEYS.timerRunning);
  localStorage.setItem(KEYS.sessionCount, 0);
  startButton.textContent = "スタート";
  display.textContent = formatTime(timerState.timeLeft);
  updateRing(timerState.timeLeft, timerState.totalTime);
  timerState.sessionCount = 0;
  updateDots();
});

workInput.addEventListener("input", function () {
  if (workInput.value < 1) workInput.value = 1;
  localStorage.setItem(KEYS.workTime, workInput.value);
  if (!timerState.isRunning) {
    timerState.timeLeft = workInput.value * 60;
    display.textContent = formatTime(timerState.timeLeft);
  }
});

breakInput.addEventListener("input", function () {
  if (breakInput.value < 1) breakInput.value = 1;
  localStorage.setItem(KEYS.breakTime, breakInput.value);
  if (!timerState.isRunning) {
    if (timerState.timerStatus === "break") {
      timerState.timeLeft = breakInput.value * 60;
      display.textContent = formatTime(timerState.timeLeft);
    }
  }
});

longBreakInput.addEventListener("input", function () {
  if (longBreakInput.value < 1) longBreakInput.value = 1;
  localStorage.setItem(KEYS.longBreakTime, longBreakInput.value);
});

autoStartInput.addEventListener("change", function () {
  localStorage.setItem(KEYS.autoStart, autoStartInput.checked);
});

document.getElementById("debug").addEventListener("click", function () {
  handleTimerEnd();
});

if (
  location.hostname !== "localhost" &&
  location.hostname !== "127.0.0.1" &&
  location.protocol !== "file:"
) {
  document.getElementById("debug").style.display = "none";
}

if (savedWork) {
  workInput.value = savedWork;
  timerState.timeLeft = savedWork * 60;
  timerState.totalTime = timerState.timeLeft;
  display.textContent = formatTime(timerState.timeLeft);
}
if (savedBreak) breakInput.value = savedBreak;
if (savedLongBreak) longBreakInput.value = savedLongBreak;
if (savedSession) {
  timerState.sessionCount = Number(savedSession);
  updateDots();
}

const savedAutoStart = localStorage.getItem(KEYS.autoStart);
if (savedAutoStart === "true") autoStartInput.checked = true;

function updateTodayStats() {
  const today = new Date().toISOString().slice(0, 10);
  const log = getStudyLog();
  const todayData = log[today] || { sessions: 0, workMinutes: 0 };
  const timeStr = formatMinutes(todayData.workMinutes);
  document.getElementById("todayStats").textContent =
    "今日: " + todayData.sessions + "セッション / " + timeStr;
}

function saveTodaySession(workMinutes) {
  const today = new Date().toISOString().slice(0, 10);
  const log = getStudyLog();
  if (!log[today]) {
    log[today] = { sessions: 0, workMinutes: 0 };
  }
  log[today].sessions += 1;
  log[today].workMinutes += workMinutes;
  localStorage.setItem(KEYS.studyLog, JSON.stringify(log));
}

if (localStorage.getItem(KEYS.timerRunning) === "true") {
  timerState.startTimestamp = Number(localStorage.getItem(KEYS.startTimestamp));
  timerState.startTimeLeft = Number(localStorage.getItem(KEYS.startTimeLeft));
  timerState.timerStatus = localStorage.getItem(KEYS.timerStatus);
  timerState.timeLeft =
    timerState.startTimeLeft -
    Math.floor((Date.now() - timerState.startTimestamp) / 1000);
  timerState.totalTime = timerState.startTimeLeft;
  display.textContent = formatTime(timerState.timeLeft);
  updateRing(timerState.timeLeft, timerState.totalTime);
  startTimer();
}

updateTodayStats();

showStatsBtn.addEventListener("click", () => {
  renderBarChart();
  renderHeatmap();
  statsModal.classList.remove("hidden");
});

closeStatsBtn.addEventListener("click", () => {
  statsModal.classList.add("hidden");
});

showSettingsBtn.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

closeSettingsBtn.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

function renderBarChart() {
  const log = getStudyLog();
  const chart = document.getElementById("barChart");
  chart.innerHTML = "";
  const values = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return (log[d.toISOString().slice(0, 10)] || { workMinutes: 0 })
      .workMinutes;
  });
  const maxMinutes = Math.max(...values, 1);

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const data = log[key] || { sessions: 0, workMinutes: 0 };

    const bar = document.createElement("div");
    bar.className = "bar-item";
    bar.innerHTML =
      '<div class="bar-fill" style="height: ' +
      Math.round((data.workMinutes / maxMinutes) * 116) +
      'px"></div>' +
      '<div class="bar-label">' +
      (date.getMonth() + 1) +
      "/" +
      date.getDate() +
      "</div>";
    chart.appendChild(bar);
  }
}

function renderHeatmap() {
  const log = getStudyLog();
  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";

  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const minutes = (log[key] || { workMinutes: 0 }).workMinutes;

    const cell = document.createElement("div");
    cell.className = "heatmap-cell";
    if (minutes >= CONFIG.colorDarkenThreshold) {
      cell.classList.add("level-2");
    } else if (minutes >= 1) {
      cell.classList.add("level-1");
    }
    const timeStr = formatMinutes(minutes);
    cell.title = key + ": " + timeStr;
    heatmap.appendChild(cell);
  }
}
