import { useState } from "react";
import { Download } from "lucide-react";

interface ProfileProps {
  userName: string;
}

export function Profile({ userName }: ProfileProps) {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState("sofia@ejemplo.mx");

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#121820" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#E2E8F0", marginBottom: 24 }}>Mi Perfil</h1>

      {/* Profile card */}
      <div className="p-6 rounded-2xl mb-6 flex items-center gap-5" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(91,136,178,0.2)" }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: "#5B88B2" }}>{name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#E2E8F0" }}>{name}</p>
          <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>{email}</p>
          <span className="px-2.5 py-0.5 rounded-full mt-2 inline-block" style={{ fontSize: 11, background: "rgba(76,217,100,0.12)", color: "#4CD964", fontWeight: 600 }}>
            Cuenta activa desde junio 2026
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[["Días activos","24","#5B88B2"],["Entradas","18","#4CD964"],["Racha","7 🔥","#F5A623"]].map(([l,v,c]) => (
          <div key={l} style={{ background: "#1A2332", borderRadius: 16, padding: "16px 18px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>{l}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: c as string }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Edit fields */}
      <div className="p-6 rounded-2xl mb-6" style={{ background: "#1A2332", border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "#E2E8F0", marginBottom: 16 }}>Mis datos</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 13, color: "#94A3B8", display: "block", marginBottom: 6 }}>Nombre preferido</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0", fontSize: 14 }}
              onFocus={e => (e.target.style.borderColor = "#5B88B2")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#94A3B8", display: "block", marginBottom: 6 }}>Correo electrónico</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              className="w-full px-4 py-3 rounded-xl outline-none"
              style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0", fontSize: 14 }}
              onFocus={e => (e.target.style.borderColor = "#5B88B2")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>
          <button
            className="w-full py-3 rounded-xl transition-all"
            style={{ background: "#5B88B2", color: "#fff", fontWeight: 600, fontSize: 14 }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#4a76a0")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "#5B88B2")}
          >Guardar cambios</button>
        </div>
      </div>

      {/* Export */}
      <button
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl transition-all"
        style={{ border: "1px solid rgba(91,136,178,0.4)", color: "#5B88B2", background: "transparent", fontWeight: 600, fontSize: 14 }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(91,136,178,0.08)")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
      >
        <Download size={16} /> Exportar reporte PDF semanal
      </button>
    </div>
  );
}
