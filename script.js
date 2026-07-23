import { KEYS } from "./js/config.js";
import { DOM } from "./js/dom.js";
import { formatTime } from "./js/format.js";
import { updateTodayStats, renderBarChart, renderHeatmap } from "./js/stats.js";
import {
  timerState,
  startTimer,
  updateDots,
  updateRing,
  handleTimerEnd,
} from "./js/timer.js";

DOM.ring.style.strokeDasharray = DOM.circumference;

DOM.startButton.addEventListener("click", function () {
  if (timerState.isRunning) {
    clearInterval(timerState.timer);
    timerState.isRunning = false;
    localStorage.removeItem(KEYS.timerRunning);
    DOM.startButton.textContent = "スタート";
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

DOM.resetButton.addEventListener("click", function () {
  timerState.timerStatus = "work";
  clearInterval(timerState.timer);
  timerState.timeLeft = DOM.workInput.value * 60;
  timerState.isRunning = false;
  localStorage.removeItem(KEYS.timerRunning);
  localStorage.setItem(KEYS.sessionCount, 0);
  DOM.startButton.textContent = "スタート";
  DOM.display.textContent = formatTime(timerState.timeLeft);
  updateRing(timerState.timeLeft, timerState.totalTime);
  timerState.sessionCount = 0;
  updateDots();
});

DOM.workInput.addEventListener("input", function () {
  if (DOM.workInput.value < 1) DOM.workInput.value = 1;
  localStorage.setItem(KEYS.workTime, DOM.workInput.value);
  if (!timerState.isRunning) {
    timerState.timeLeft = DOM.workInput.value * 60;
    DOM.display.textContent = formatTime(timerState.timeLeft);
  }
});

DOM.breakInput.addEventListener("input", function () {
  if (DOM.breakInput.value < 1) DOM.breakInput.value = 1;
  localStorage.setItem(KEYS.breakTime, DOM.breakInput.value);
  if (!timerState.isRunning) {
    if (timerState.timerStatus === "break") {
      timerState.timeLeft = DOM.breakInput.value * 60;
      DOM.display.textContent = formatTime(timerState.timeLeft);
    }
  }
});

DOM.longBreakInput.addEventListener("input", function () {
  if (DOM.longBreakInput.value < 1) DOM.longBreakInput.value = 1;
  localStorage.setItem(KEYS.longBreakTime, DOM.longBreakInput.value);
});

DOM.autoStartInput.addEventListener("change", function () {
  localStorage.setItem(KEYS.autoStart, DOM.autoStartInput.checked);
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

if (DOM.savedWork) {
  DOM.workInput.value = DOM.savedWork;
  timerState.timeLeft = DOM.savedWork * 60;
  timerState.totalTime = timerState.timeLeft;
  DOM.display.textContent = formatTime(timerState.timeLeft);
}
if (DOM.savedBreak) DOM.breakInput.value = DOM.savedBreak;
if (DOM.savedLongBreak) DOM.longBreakInput.value = DOM.savedLongBreak;
if (DOM.savedSession) {
  timerState.sessionCount = Number(DOM.savedSession);
  updateDots();
}

const savedAutoStart = localStorage.getItem(KEYS.autoStart);
if (savedAutoStart === "true") DOM.autoStartInput.checked = true;

if (localStorage.getItem(KEYS.timerRunning) === "true") {
  timerState.startTimestamp = Number(localStorage.getItem(KEYS.startTimestamp));
  timerState.startTimeLeft = Number(localStorage.getItem(KEYS.startTimeLeft));
  timerState.timerStatus = localStorage.getItem(KEYS.timerStatus);
  timerState.timeLeft =
    timerState.startTimeLeft -
    Math.floor((Date.now() - timerState.startTimestamp) / 1000);
  timerState.totalTime = timerState.startTimeLeft;
  DOM.display.textContent = formatTime(timerState.timeLeft);
  updateRing(timerState.timeLeft, timerState.totalTime);
  startTimer();
}

updateTodayStats();

DOM.showStatsBtn.addEventListener("click", () => {
  renderBarChart();
  renderHeatmap();
  DOM.statsModal.classList.remove("hidden");
});

DOM.closeStatsBtn.addEventListener("click", () => {
  DOM.statsModal.classList.add("hidden");
});

DOM.showSettingsBtn.addEventListener("click", () => {
  DOM.settingsModal.classList.remove("hidden");
});

DOM.closeSettingsBtn.addEventListener("click", () => {
  DOM.settingsModal.classList.add("hidden");
});
