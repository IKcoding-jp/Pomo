export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ":" + String(s).padStart(2, "0");
}

export function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? h + "時間" + m + "分" : m + "分";
}

export function formatDate(inputDate) {
  const d = new Date(inputDate);
  return d.toISOString().slice(0, 10);
}
