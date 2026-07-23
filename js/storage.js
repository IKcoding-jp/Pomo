import { KEYS } from "./config.js";
import { formatDate } from './format.js';



export function getStudyLog() {
  return JSON.parse(localStorage.getItem(KEYS.studyLog) || "{}");
}

export function saveTodaySession(workMinutes) {
  const log = getStudyLog();
  const today = formatDate(new Date());
  if (!log[today]) {
    log[today] = { sessions: 0, workMinutes: 0 };
  }
  log[today].sessions += 1;
  log[today].workMinutes += workMinutes;
  localStorage.setItem(KEYS.studyLog, JSON.stringify(log));
}
