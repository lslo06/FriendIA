import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";

type Filter = "todos" | "semana" | "mes";

const entries = [
  { date: "Hoy, 9:14 am", preview: "Hoy me desperté sintiéndome mucho mejor. El descanso del fin de semana realmente ayudó y pude empezar el día con más energía.", tag: "Bienestar", tagColor: "#4CD964" },
  { date: "Ayer, 8:40 pm", preview: "Tuve una conversación difícil con mi jefe. Siento que no me escuchan y eso me genera mucha tensión al llegar a casa.", tag: "Estrés", tagColor: "#F5A623" },
  { date: "Lun 9 Jun, 10:02 pm", preview: "Empecé una nueva rutina de meditación de 10 minutos antes de dormir. Fue complicado al principio pero al final me sentí más tranquila.", tag: "Calma", tagColor: "#5B88B2" },
  { date: "Dom 8 Jun, 7:30 pm", preview: "Pasé el día con mi familia. Hay momentos en que me cuesta conectar con ellos emocionalmente, pero hoy fue diferente y lo disfruté.", tag: "Conexión", tagColor: "#A78BFA" },
  { date: "Sáb 7 Jun, 11:00 am", preview: "No dormí bien por tercera noche consecutiva. El cansancio empieza a afectar mi estado de ánimo durante el día.", tag: "Cansancio", tagColor: "#94A3B8" },
];

export function Diary() {
  const [filter, setFilter] = useState<Filter>("todos");
  const [showNew, setShowNew] = useState(false);
  const [newText, setNewText] = useState("");
  const [newMood, setNewMood] = useState("");

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#121820" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#E2E8F0" }}>Mi Diario Emocional</h1>
        <button
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
          style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 14 }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
        ><Plus size={16} /> Nueva entrada</button>
      </div>

      {/* New entry form */}
      {showNew && (
        <div className="mb-6 p-5 rounded-2xl" style={{ background: "#1A2332", border: "1px solid rgba(91,136,178,0.3)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0", marginBottom: 10 }}>¿Cómo estuvo tu día?</p>
          <div className="flex gap-2 mb-3">
            {["😊","😐","😔","😤","😰","💪"].map(e => (
              <button key={e} onClick={() => setNewMood(e)}
                className="text-xl p-2 rounded-xl transition-all"
                style={{ background: newMood === e ? "rgba(91,136,178,0.2)" : "#0F1825", border: newMood === e ? "1px solid #5B88B2" : "1px solid transparent" }}
              >{e}</button>
            ))}
          </div>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Escribe cómo te sientes, qué pasó hoy..."
            rows={4}
            className="w-full rounded-xl p-4 outline-none resize-none"
            style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0", fontSize: 14, lineHeight: 1.6 }}
            onFocus={e => (e.target.style.borderColor = "#5B88B2")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          <div className="flex gap-3 mt-3 justify-end">
            <button onClick={() => setShowNew(false)} style={{ fontSize: 13, color: "#94A3B8", background: "none", border: "none", cursor: "pointer" }}>Cancelar</button>
            <button
              className="px-5 py-2 rounded-xl"
              style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 13 }}
            >Guardar entrada</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-0 mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {(["todos","semana","mes"] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="pb-3 mr-6 transition-all"
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 14,
              color: filter === f ? "#5B88B2" : "#94A3B8",
              borderBottom: filter === f ? "2px solid #5B88B2" : "2px solid transparent",
              marginBottom: -1,
              textTransform: "capitalize",
              fontWeight: filter === f ? 600 : 400,
            }}
          >{f === "todos" ? "Todos" : f === "semana" ? "Esta semana" : "Este mes"}</button>
        ))}
      </div>

      {/* Entries list */}
      <div className="flex flex-col gap-3">
        {entries.map((entry, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer"
            style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(91,136,178,0.25)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)")}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontSize: 12, color: "#94A3B8" }}>{entry.date}</span>
                <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, background: `${entry.tagColor}22`, color: entry.tagColor, fontWeight: 600 }}>{entry.tag}</span>
              </div>
              <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any }}>{entry.preview}</p>
            </div>
            <ChevronRight size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
