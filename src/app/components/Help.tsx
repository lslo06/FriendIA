import { Phone, AlertCircle } from "lucide-react";

const psychologists = [
  { initials: "LM", name: "Lic. Laura Méndez", specialties: ["Ansiedad", "Duelo", "Relaciones"], color: "#A78BFA" },
  { initials: "CR", name: "Dr. Carlos Ríos", specialties: ["Estrés", "Autoestima", "Trabajo"], color: "#5B88B2" },
  { initials: "SP", name: "Lic. Sofía Paredes", specialties: ["Trauma", "Identidad", "Adolescentes"], color: "#F472B6" },
];

export function Help() {
  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#121820" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#E2E8F0", marginBottom: 24 }}>Ayuda y apoyo</h1>

      {/* Emergency card */}
      <div className="p-5 rounded-2xl mb-8" style={{ border: "1px solid rgba(226,75,74,0.35)", background: "rgba(226,75,74,0.06)" }}>
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle size={20} color="#E24B4A" />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#E2E8F0" }}>Líneas de crisis</h2>
        </div>
        <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 14 }}>Si estás pasando por una situación de emergencia emocional, estas líneas están disponibles 24/7.</p>
        <div className="flex gap-3">
          {[["SAPTEL", "55 5259-8121"], ["CONASAMA", "800-290-0024"]].map(([name, num]) => (
            <a
              key={name}
              href={`tel:${num.replace(/\D/g,"")}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{ background: "rgba(226,75,74,0.12)", border: "1px solid rgba(226,75,74,0.3)", color: "#E24B4A", fontWeight: 600, fontSize: 13 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(226,75,74,0.2)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(226,75,74,0.12)")}
            >
              <Phone size={14} /> {name}: {num}
            </a>
          ))}
        </div>
      </div>

      {/* Psychologists */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#E2E8F0", marginBottom: 14 }}>Psicólogos disponibles</h2>
      <div className="flex flex-col gap-4 mb-8">
        {psychologists.map(({ initials, name, specialties, color }) => (
          <div
            key={name}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
              <span style={{ fontSize: 15, fontWeight: 700, color }}>{initials}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#E2E8F0", marginBottom: 6 }}>{name}</p>
              <div className="flex gap-2 flex-wrap">
                {specialties.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, background: "rgba(148,163,184,0.1)", color: "#94A3B8" }}>{s}</span>
                ))}
              </div>
            </div>
            <button
              className="px-4 py-2 rounded-xl flex-shrink-0 transition-all"
              style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 13 }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
            >Contactar</button>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, textAlign: "center" }}>
          FriendIA no sustituye la atención psicológica profesional.<br />
          Ante cualquier emergencia, busca apoyo de un profesional de salud mental.
        </p>
      </div>
    </div>
  );
}
