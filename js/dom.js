import { KEYS, CONFIG } from "./config.js";

export const DOM = {
  display: document.querySelector(".ring-time"),
  startButton: document.getElementById("start"),
  workInput: document.getElementById(KEYS.workTime),
  breakInput: document.getElementById(KEYS.breakTime),
  ring: document.querySelector(".ring-progress"),
  circumference: 2 * Math.PI * CONFIG.ringRadius,
  chimeSound: new Audio("sounds/chime.mp3"),
  savedWork: localStorage.getItem(KEYS.workTime),
  savedBreak: localStorage.getItem(KEYS.breakTime),
  longBreakInput: document.getElementById(KEYS.longBreakTime),
  savedLongBreak: localStorage.getItem(KEYS.longBreakTime),
  savedSession: localStorage.getItem(KEYS.sessionCount),
  showStatsBtn: document.getElementById("showStats"),
  statsModal: document.getElementById("statsModal"),
  closeStatsBtn: document.getElementById("closeStats"),
  showSettingsBtn: document.getElementById("showSettings"),
  settingsModal: document.getElementById("settingsModal"),
  closeSettingsBtn: document.getElementById("closeSettings"),
  autoStartInput: document.getElementById("autoStart"),
  resetButton: document.getElementById("reset"),
};
