import type { DiaryEntry, EmotionRecord } from "./types";

export interface FriendiaReportData {
  userName: string;
  email: string;
  periodDays: number;
  generatedAt: Date;
  diaryEntries: DiaryEntry[];
  emotionRecords: EmotionRecord[];
  chatSessions: number | null;
  includeDiaryText: boolean;
  logoUrl: string;
}

const COLORS: Record<string, string> = {
  Alegría: "#4CD964",
  Tristeza: "#5B88B2",
  Ansiedad: "#F5A623",
  Enojo: "#E24B4A",
  Calma: "#A78BFA",
  Agotamiento: "#94A3B8",
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(value: Date | string): string {
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: Date | string): string {
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function filterReportPeriod<T>(items: T[], getDate: (item: T) => Date | string, days: number): T[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - Math.max(0, days - 1));
  return items.filter(item => new Date(getDate(item)).getTime() >= start.getTime());
}

export function buildFriendiaReportHtml(data: FriendiaReportData): string {
  const emotionCounts = data.emotionRecords.reduce<Record<string, number>>((counts, record) => {
    counts[record.primary_emotion] = (counts[record.primary_emotion] ?? 0) + 1;
    return counts;
  }, {});
  const maxCount = Math.max(1, ...Object.values(emotionCounts));
  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Sin datos";
  const averageScore = data.emotionRecords.length
    ? data.emotionRecords.reduce((sum, record) => sum + (record.mood_score ?? 0), 0) / data.emotionRecords.length
    : 0;
  const activityDays = new Set([
    ...data.diaryEntries.map(entry => new Date(entry.created_at).toISOString().slice(0, 10)),
    ...data.emotionRecords.map(record => record.date),
  ]).size;

  const emotionBars = Object.keys(COLORS).map(emotion => {
    const count = emotionCounts[emotion] ?? 0;
    const width = Math.round((count / maxCount) * 100);
    return `<div class="bar-row"><span>${escapeHtml(emotion)}</span><div class="track"><div class="bar" style="width:${width}%;background:${COLORS[emotion]}"></div></div><strong>${count}</strong></div>`;
  }).join("");

  const timelineRows = data.emotionRecords.slice(0, 40).map(record => `
    <tr>
      <td>${escapeHtml(formatDate(record.date))}</td>
      <td><span class="dot" style="background:${COLORS[record.primary_emotion] ?? "#94A3B8"}"></span>${escapeHtml(record.primary_emotion)}</td>
      <td>${escapeHtml(record.emotions.join(", ") || "Sin matiz")}</td>
      <td>${record.mood_score ?? "-"}/5</td>
    </tr>`).join("");

  const diaryBlocks = data.diaryEntries.slice(0, 30).map(entry => `
    <article class="diary-entry">
      <div class="entry-head"><strong>${escapeHtml(entry.tag || "Sin etiqueta")}</strong><span>${escapeHtml(formatDateTime(entry.created_at))}</span></div>
      ${data.includeDiaryText ? `<p>${escapeHtml(entry.text).replace(/\n/g, "<br>")}</p>` : ""}
    </article>`).join("");

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>Reporte FriendIA</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: Inter, Arial, sans-serif; color:#172238; background:#fff; font-size:11px; line-height:1.5; }
  .page { max-width: 180mm; margin:auto; }
  header { display:flex; align-items:center; justify-content:space-between; border-bottom:3px solid #5B88B2; padding-bottom:12px; margin-bottom:22px; }
  .brand { display:flex; align-items:center; gap:11px; }
  .brand img { width:44px; height:44px; object-fit:contain; }
  .brand h1 { margin:0; font-size:25px; color:#172238; }
  .brand h1 span { color:#5B88B2; }
  .meta { text-align:right; color:#66758c; }
  .hero { background:linear-gradient(135deg,#eef5fb,#f7f4ff); border:1px solid #dbe6f1; border-radius:18px; padding:22px; margin-bottom:18px; }
  .hero h2 { margin:0 0 5px; font-size:22px; }
  .hero p { margin:2px 0; color:#56667c; }
  .metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin:18px 0; }
  .metric { border:1px solid #dfe7ef; border-radius:12px; padding:13px; }
  .metric strong { display:block; font-size:22px; color:#5B88B2; }
  .metric span { color:#66758c; }
  section { margin:20px 0; break-inside:avoid; }
  h3 { font-size:16px; margin:0 0 10px; padding-bottom:6px; border-bottom:1px solid #dfe7ef; }
  .two-col { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  .bar-row { display:grid; grid-template-columns:72px 1fr 22px; align-items:center; gap:8px; margin:8px 0; }
  .track { height:9px; border-radius:8px; background:#edf1f5; overflow:hidden; }
  .bar { height:100%; border-radius:8px; }
  .insight { padding:12px; border-radius:12px; background:#f7f9fc; margin-bottom:8px; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; color:#65748a; background:#f4f7fa; }
  th, td { padding:8px; border-bottom:1px solid #e4eaf0; }
  .dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; }
  .diary-entry { border:1px solid #e0e7ee; border-radius:12px; padding:12px; margin:9px 0; break-inside:avoid; }
  .entry-head { display:flex; justify-content:space-between; color:#5B88B2; }
  .entry-head span { color:#78869a; font-size:10px; }
  .diary-entry p { margin:8px 0 0; white-space:normal; color:#344258; }
  footer { margin-top:25px; padding-top:12px; border-top:1px solid #dfe7ef; color:#78869a; font-size:9px; text-align:center; }
  .privacy { border-left:4px solid #F5A623; background:#fff9eb; padding:12px 14px; border-radius:8px; }
  @media print { .page { max-width:none; } }
</style></head><body><div class="page">
  <header><div class="brand"><img src="${escapeHtml(data.logoUrl)}" alt="FriendIA"><h1>Friend<span>IA</span></h1></div><div class="meta">Reporte de bienestar emocional<br>${escapeHtml(formatDate(data.generatedAt))}</div></header>
  <div class="hero"><h2>Reporte personal de ${escapeHtml(data.userName)}</h2><p>${escapeHtml(data.email)}</p><p>Periodo analizado: últimos ${data.periodDays} días</p></div>
  <div class="metrics">
    <div class="metric"><strong>${activityDays}</strong><span>Días con actividad</span></div>
    <div class="metric"><strong>${data.emotionRecords.length}</strong><span>Check-ins</span></div>
    <div class="metric"><strong>${data.diaryEntries.length}</strong><span>Entradas de diario</span></div>
    <div class="metric"><strong>${data.chatSessions ?? "-"}</strong><span>Conversaciones</span></div>
  </div>
  <section class="two-col"><div><h3>Distribución emocional</h3>${emotionBars}</div><div><h3>Resumen del periodo</h3><div class="insight"><strong>Emoción más frecuente</strong><br>${escapeHtml(dominantEmotion)}</div><div class="insight"><strong>Puntuación emocional promedio</strong><br>${averageScore ? averageScore.toFixed(1) : "Sin datos"} de 5</div><div class="insight"><strong>Actividad registrada</strong><br>${activityDays} de ${data.periodDays} días</div></div></section>
  <section><h3>Evolución emocional</h3>${timelineRows ? `<table><thead><tr><th>Fecha</th><th>Emoción</th><th>Matiz</th><th>Puntuación</th></tr></thead><tbody>${timelineRows}</tbody></table>` : "<p>No hay check-ins en este periodo.</p>"}</section>
  <section><h3>Diario emocional</h3>${diaryBlocks || "<p>No hay entradas en este periodo.</p>"}</section>
  <section class="privacy"><strong>Privacidad y uso responsable</strong><br>Este reporte contiene información personal sensible. Compártelo únicamente con personas de confianza. FriendIA es una herramienta de acompañamiento emocional y este documento no constituye diagnóstico, evaluación clínica ni tratamiento profesional.</section>
  <footer>Generado por FriendIA · Acompañamiento emocional entre sesiones · ${escapeHtml(formatDateTime(data.generatedAt))}</footer>
</div></body></html>`;
}

export function writeAndPrintReport(target: Window, html: string): void {
  target.document.open();
  target.document.write(html);
  target.document.close();
  target.focus();
  const printWhenReady = () => window.setTimeout(() => target.print(), 350);
  if (target.document.readyState === "complete") printWhenReady();
  else target.addEventListener("load", printWhenReady, { once: true });
}
