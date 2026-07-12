import { useState } from "react";
import { MessageCircle, ChevronRight } from "lucide-react";

interface DashboardProps {
  userName: string;
  onOpenChat: () => void;
  onOpenDiary: () => void;
}

// Emotion wheel — grouped by core emotion
const emotionWheel = [
  {
    core: "Alegría", color: "#4CD964", emoji: "😊",
    nuances: ["Gratitud", "Satisfacción", "Esperanza", "Entusiasmo", "Serenidad"]
  },
  {
    core: "Tristeza", color: "#5B88B2", emoji: "😢",
    nuances: ["Melancolía", "Nostalgia", "Soledad", "Decepción", "Duelo"]
  },
  {
    core: "Ansiedad", color: "#F5A623", emoji: "😰",
    nuances: ["Preocupación", "Nerviosismo", "Tensión", "Inseguridad", "Miedo"]
  },
  {
    core: "Enojo", color: "#E24B4A", emoji: "😤",
    nuances: ["Frustración", "Irritación", "Indignación", "Resentimiento", "Impaciencia"]
  },
  {
    core: "Calma", color: "#A78BFA", emoji: "🧘",
    nuances: ["Paz", "Aceptación", "Equilibrio", "Claridad", "Descanso"]
  },
  {
    core: "Agotamiento", color: "#94A3B8", emoji: "😴",
    nuances: ["Cansancio físico", "Saturación mental", "Desmotivación", "Vacío", "Apatía"]
  },
];

const weekDays = [
  { label: "L", color: "#4CD964", emotion: "Alegría" },
  { label: "M", color: "#4CD964", emotion: "Calma" },
  { label: "Mi", color: "#F5A623", emotion: "Ansiedad" },
  { label: "J", color: "#E24B4A", emotion: "Enojo" },
  { label: "V", color: "#5B88B2", emotion: "Tristeza" },
  { label: "S", color: null, emotion: null },
  { label: "D", color: null, emotion: null },
];

const diaryEntries = [
  { date: "Hoy, 9:14 am", preview: "Hoy me desperté sintiéndome mucho mejor. El descanso del fin de semana realmente ayudó...", tag: "Bienestar", tagColor: "#4CD964" },
  { date: "Ayer, 8:40 pm", preview: "Tuve una conversación difícil con mi jefe. Siento que no me escuchan y eso me genera mucha tensión...", tag: "Estrés", tagColor: "#F5A623" },
  { date: "Lun, 10:02 pm", preview: "Empecé una nueva rutina de meditación. Los primeros minutos fueron complicados pero luego...", tag: "Calma", tagColor: "#5B88B2" },
];

export function Dashboard({ userName, onOpenChat, onOpenDiary }: DashboardProps) {
  const [selectedCore, setSelectedCore] = useState<string | null>(null);
  const [selectedNuance, setSelectedNuance] = useState<string | null>(null);
  const [checkInSaved, setCheckInSaved] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const selectedEmotion = emotionWheel.find(e => e.core === selectedCore);

  function saveCheckIn() {
    if (selectedCore) {
      setCheckInSaved(true);
      setTimeout(() => setCheckInSaved(false), 3000);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#121820" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#E2E8F0" }}>Hola, {userName} 👋</h1>
        <p style={{ fontSize: 14, color: "#94A3B8", marginTop: 4, textTransform: "capitalize" }}>{today}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Días activos", value: "24", color: "#5B88B2" },
          { label: "Entradas en diario", value: "18", color: "#4CD964" },
          { label: "Racha actual", value: "7 🔥", color: "#F5A623" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#1A2332", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6 }}>{label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Two-col */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Structured Check-in — Emotion Wheel */}
        <div style={{ background: "#1A2332", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>Check-in emocional de hoy</p>
            {checkInSaved && (
              <span style={{ fontSize: 11, color: "#4CD964", fontWeight: 600 }}>✓ Guardado</span>
            )}
          </div>

          {!selectedCore ? (
            <>
              <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12, lineHeight: 1.5 }}>¿Cuál de estas emociones se acerca más a cómo te sientes?</p>
              <div className="grid grid-cols-3 gap-2">
                {emotionWheel.map(({ core, color, emoji }) => (
                  <button
                    key={core}
                    onClick={() => { setSelectedCore(core); setSelectedNuance(null); }}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all"
                    style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.06)" }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = color)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)")}
                  >
                    <span style={{ fontSize: 20 }}>{emoji}</span>
                    <span style={{ fontSize: 11, color, fontWeight: 600 }}>{core}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => { setSelectedCore(null); setSelectedNuance(null); }}
                  style={{ fontSize: 12, color: "#94A3B8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>← Cambiar</button>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: `${selectedEmotion!.color}18`, border: `1px solid ${selectedEmotion!.color}40` }}>
                  <span style={{ fontSize: 14 }}>{selectedEmotion!.emoji}</span>
                  <span style={{ fontSize: 12, color: selectedEmotion!.color, fontWeight: 600 }}>{selectedCore}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10 }}>¿Puedes afinar un poco más?</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedEmotion!.nuances.map(n => (
                  <button
                    key={n}
                    onClick={() => setSelectedNuance(n)}
                    className="px-3 py-1.5 rounded-full transition-all text-xs"
                    style={{
                      background: selectedNuance === n ? `${selectedEmotion!.color}20` : "#0F1825",
                      border: `1px solid ${selectedNuance === n ? selectedEmotion!.color : "rgba(255,255,255,0.08)"}`,
                      color: selectedNuance === n ? selectedEmotion!.color : "#94A3B8",
                      fontWeight: selectedNuance === n ? 600 : 400,
                    }}
                  >{n}</button>
                ))}
              </div>
              <button
                onClick={saveCheckIn}
                disabled={!selectedNuance}
                className="w-full py-2.5 rounded-xl transition-all"
                style={{
                  background: selectedNuance ? selectedEmotion!.color : "#1E2D42",
                  color: selectedNuance ? "#fff" : "#2D3F55",
                  fontWeight: 600, fontSize: 13,
                }}
              >Registrar estado</button>
            </>
          )}
        </div>

        {/* Semana emocional */}
        <div style={{ background: "#1A2332", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 14, fontWeight: 500 }}>Tu semana emocional</p>
          <div className="flex gap-3 mb-4">
            {weekDays.map(({ label, color, emotion }) => (
              <div key={label}
                className="flex flex-col items-center gap-2 cursor-default"
                onMouseEnter={() => setHoveredDay(label)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div
                  style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: color ?? "#1E2D42",
                    border: color ? "none" : "2px dashed #2D3F55",
                    opacity: color ? 1 : 0.4,
                    transition: "transform 0.15s",
                    transform: hoveredDay === label && color ? "scale(1.15)" : "scale(1)",
                  }}
                />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{label}</span>
              </div>
            ))}
          </div>
          {hoveredDay && weekDays.find(d => d.label === hoveredDay)?.emotion && (
            <div className="px-3 py-2 rounded-lg mb-3" style={{ background: "#0F1825" }}>
              <span style={{ fontSize: 12, color: "#E2E8F0" }}>{hoveredDay}: </span>
              <span style={{ fontSize: 12, color: weekDays.find(d => d.label === hoveredDay)!.color ?? "#94A3B8" }}>
                {weekDays.find(d => d.label === hoveredDay)!.emotion}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {emotionWheel.slice(0, 4).map(({ core, color }) => (
              <div key={core} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{core}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diary entries */}
      <div style={{ background: "#1A2332", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>Entradas recientes del diario</p>
          <button onClick={onOpenDiary} style={{ fontSize: 12, color: "#5B88B2", background: "none", border: "none", cursor: "pointer" }}>Ver todas →</button>
        </div>
        <div className="flex flex-col gap-3">
          {diaryEntries.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer" style={{ background: "#0F1825" }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#162030")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#0F1825")}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{entry.date}</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: `${entry.tagColor}22`, color: entry.tagColor, fontWeight: 600 }}>{entry.tag}</span>
                </div>
                <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{entry.preview}</p>
              </div>
              <ChevronRight size={14} color="#94A3B8" style={{ flexShrink: 0, marginTop: 4 }} />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onOpenChat}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl transition-all"
        style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 16 }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
      >
        <MessageCircle size={20} />
        Hablar con mi Guía emocional
      </button>
    </div>
  );
}
