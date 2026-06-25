import { MessageCircle } from "lucide-react";

interface DashboardProps {
  userName: string;
  onOpenChat: () => void;
  onOpenDiary: () => void;
}

const weekDays = [
  { label: "L", color: "#4CD964" },
  { label: "M", color: "#4CD964" },
  { label: "Mi", color: "#F5A623" },
  { label: "J", color: "#E24B4A" },
  { label: "V", color: "#5B88B2" },
  { label: "S", color: null },
  { label: "D", color: null },
];

const diaryEntries = [
  { date: "Hoy, 9:14 am", preview: "Hoy me desperté sintiéndome mucho mejor. El descanso del fin de semana realmente ayudó...", tag: "Bienestar", tagColor: "#4CD964" },
  { date: "Ayer, 8:40 pm", preview: "Tuve una conversación difícil con mi jefe. Siento que no me escuchan y eso me genera mucha tensión...", tag: "Estrés", tagColor: "#F5A623" },
  { date: "Lun, 10:02 pm", preview: "Empecé una nueva rutina de meditación. Los primeros minutos fueron complicados pero luego...", tag: "Calma", tagColor: "#5B88B2" },
];

export function Dashboard({ userName, onOpenChat, onOpenDiary }: DashboardProps) {
  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

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

      {/* Two-col cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Estado de hoy */}
        <div style={{ background: "#1A2332", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 14, fontWeight: 500 }}>Estado de hoy</p>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: 48 }}>😊</span>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#E2E8F0" }}>Bien</p>
              <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>¿Cómo te sientes ahora?</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            {["😊","😐","😔","😤","😰"].map(emoji => (
              <button key={emoji} className="text-xl p-2 rounded-xl transition-all" style={{ background: "#0F1825" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(91,136,178,0.15)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#0F1825")}
              >{emoji}</button>
            ))}
          </div>
        </div>

        {/* Semana emocional */}
        <div style={{ background: "#1A2332", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 14, fontWeight: 500 }}>Tu semana emocional</p>
          <div className="flex gap-3">
            {weekDays.map(({ label, color }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: color ?? "#1E2D42",
                  border: color ? "none" : "2px dashed #2D3F55",
                  opacity: color ? 1 : 0.5
                }} />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            {[["#4CD964","Bien"],["#F5A623","Neutral"],["#E24B4A","Difícil"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{l}</span>
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
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl transition-all" style={{ background: "#0F1825" }}
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
              <span style={{ color: "#94A3B8", fontSize: 16, marginTop: 4 }}>›</span>
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
