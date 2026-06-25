import { useState } from "react";
import { ChevronRight } from "lucide-react";

export function AppSettings() {
  const [darkMode, setDarkMode] = useState(true);
  const [dailyCheckIn, setDailyCheckIn] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!value)}
        className="relative transition-all"
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: value ? "#5B88B2" : "#2D3F55",
          border: "none", cursor: "pointer", flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: value ? 22 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s ease",
        }} />
      </button>
    );
  }

  function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="mb-6">
        <p style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>{label}</p>
        <div style={{ background: "#1A2332", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          {children}
        </div>
      </div>
    );
  }

  function Row({ label, control, danger = false }: { label: string; control: React.ReactNode; danger?: boolean }) {
    return (
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <span style={{ fontSize: 14, color: danger ? "#E24B4A" : "#E2E8F0" }}>{label}</span>
        {control}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#121820" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#E2E8F0", marginBottom: 24 }}>Configuración</h1>

      <Section label="Apariencia">
        <Row label="Modo oscuro" control={<Toggle value={darkMode} onChange={setDarkMode} />} />
        <Row label="Tamaño de texto" control={
          <select
            style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0", borderRadius: 8, padding: "4px 10px", fontSize: 13 }}
          >
            <option>Normal</option>
            <option>Grande</option>
            <option>Pequeño</option>
          </select>
        } />
      </Section>

      <Section label="Notificaciones">
        <Row label="Check-in diario" control={<Toggle value={dailyCheckIn} onChange={setDailyCheckIn} />} />
        <Row label="Hora del recordatorio" control={
          <input
            type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
            style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0", borderRadius: 8, padding: "4px 10px", fontSize: 13 }}
          />
        } />
      </Section>

      <Section label="Privacidad">
        <Row label="Guardar historial de chat" control={<Toggle value={saveHistory} onChange={setSaveHistory} />} />
        <Row
          label="Borrar todo mi historial"
          danger
          control={<ChevronRight size={16} color="#E24B4A" />}
        />
      </Section>

      <Section label="Cuenta">
        <Row label="Cerrar sesión" control={<ChevronRight size={16} color="#94A3B8" />} />
        <Row label="Eliminar cuenta" danger control={<ChevronRight size={16} color="#E24B4A" />} />
      </Section>
    </div>
  );
}
