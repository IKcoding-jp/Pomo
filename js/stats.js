import { getStudyLog } from "./storage.js";
import { formatDate, formatMinutes } from "./format.js";
import { CONFIG } from "./config.js";

export function updateTodayStats() {
  const today = formatDate(new Date());
  const log = getStudyLog();
  const todayData = log[today] || { sessions: 0, workMinutes: 0 };
  const timeStr = formatMinutes(todayData.workMinutes);
  document.getElementById("todayStats").textContent =
    "今日: " + todayData.sessions + "セッション / " + timeStr;
}

export function renderBarChart() {
  const log = getStudyLog();
  const chart = document.getElementById("barChart");
  chart.innerHTML = "";
  const values = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return (log[formatDate(d)] || { workMinutes: 0 }).workMinutes;
  });
  const maxMinutes = Math.max(...values, 1);

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = formatDate(date);
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

export function renderHeatmap() {
  const log = getStudyLog();
  const heatmap = document.getElementById("heatmap");
  heatmap.innerHTML = "";

  for (let i = 89; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = formatDate(date);
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
