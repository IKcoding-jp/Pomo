import { CONFIG, KEYS } from "./config.js";
import { DOM } from "./dom.js";
import { formatTime } from "./format.js";
import { updateTodayStats } from "./stats.js";
import { saveTodaySession } from "./storage.js";

export const timerState = {
  timeLeft: CONFIG.initialTime,
  totalTime: CONFIG.initialTime,
  timer: null,
  isRunning: false,
  timerStatus: "work",
  sessionCount: 0,
  startTimestamp: null,
  startTimeLeft: 0,
};

export function startTimer() {
  timerState.timer = setInterval(function () {
    const elapsed = Math.floor((Date.now() - timerState.startTimestamp) / 1000);
    timerState.timeLeft = timerState.startTimeLeft - elapsed;
    DOM.display.textContent = formatTime(timerState.timeLeft);
    updateRing(timerState.timeLeft, timerState.totalTime);
    if (timerState.timeLeft <= 0) {
      handleTimerEnd();
    }
  }, CONFIG.updateInterval);
  timerState.isRunning = true;
  DOM.startButton.textContent = "ストップ";
}

export function handleTimerEnd() {
  localStorage.removeItem(KEYS.timerRunning);
  playChime();
  clearInterval(timerState.timer);
  timerState.isRunning = false;

  if (timerState.timerStatus === "work") {
    timerState.timerStatus = "break";
    timerState.sessionCount = timerState.sessionCount + 1;
    saveTodaySession(Number(DOM.workInput.value));
    updateTodayStats();
    localStorage.setItem(KEYS.sessionCount, timerState.sessionCount);
    updateDots();
    timerState.timeLeft =
      timerState.sessionCount % CONFIG.sessionsPerRound === 0
        ? DOM.longBreakInput.value * 60
        : DOM.breakInput.value * 60;
    DOM.display.textContent = "休憩";
    DOM.startButton.textContent = "休憩スタート";
  } else {
    timerState.timerStatus = "work";
    timerState.timeLeft = DOM.workInput.value * 60;
    DOM.display.textContent = formatTime(timerState.timeLeft);
    DOM.startButton.textContent = "スタート";
  }

  if (DOM.autoStartInput.checked) {
    DOM.startButton.click();
  }
}

export function playChime() {
  DOM.chimeSound.currentTime = 0;
  DOM.chimeSound.play().catch(function (e) {
    console.log("音が鳴りませんでした", e);
  });
}

export function updateRing(timeLeft, totalTime) {
  const offset = DOM.circumference * (1 - timeLeft / totalTime);
  DOM.ring.style.strokeDashoffset = offset;
}

export function updateDots() {
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
