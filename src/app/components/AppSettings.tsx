import { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteAccount,
  deleteChatHistory,
  fetchSettings,
  saveSettings,
} from "@/lib/settings";

interface AppSettingsProps {
  userId: string;
  onLogout: () => void;
}

export function AppSettings({ userId, onLogout }: AppSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState("Normal");
  const [dailyCheckIn, setDailyCheckIn] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [reminderTime, setReminderTime] = useState("20:00");

  useEffect(() => {
    fetchSettings(userId)
      .then(s => {
        setDarkMode(s.modo_oscuro);
        setFontSize(s.tamano_fuente === 1 ? "Normal" : s.tamano_fuente === 2 ? "Grande" : "Pequeño");
        setDailyCheckIn(s.registro_diario_activo);
        setSaveHistory(s.guardar_historial_chat);
        setReminderTime(s.hora_registro || "20:00");
      })
      .catch(() => toast.error("No se pudo cargar la configuración"))
      .finally(() => setLoading(false));
  }, [userId]);

  async function persist(updates: Parameters<typeof saveSettings>[1]) {
    setSaving(true);
    try {
      await saveSettings(userId, updates);
    } catch {
      toast.error("No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        onClick={() => onChange(!value)}
        disabled={saving}
        className="relative transition-all"
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: value ? "#5B88B2" : "#2D3F55",
          border: "none", cursor: saving ? "not-allowed" : "pointer", flexShrink: 0,
          opacity: saving ? 0.6 : 1,
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

  function Row({ label, control, danger = false, onClick }: { label: string; control: React.ReactNode; danger?: boolean; onClick?: () => void }) {
    return (
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: onClick ? "pointer" : "default" }}
        onClick={onClick}
      >
        <span style={{ fontSize: 14, color: danger ? "#E24B4A" : "#E2E8F0" }}>{label}</span>
        {control}
      </div>
    );
  }

  async function handleDeleteHistory() {
    if (!confirm("¿Estás seguro de que quieres borrar todo tu historial de chat? Esta acción no se puede deshacer.")) return;
    try {
      await deleteChatHistory(userId);
      toast.success("Historial de chat eliminado");
    } catch {
      toast.error("No se pudo eliminar el historial");
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("¿Estás seguro de que quieres eliminar tu cuenta? Se borrarán todos tus datos permanentemente.")) return;
    try {
      await deleteAccount();
      toast.success("Cuenta eliminada");
      onLogout();
    } catch {
      toast.error("No se pudo eliminar la cuenta");
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#121820" }}>
        <Loader2 size={28} color="#5B88B2" className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "#121820" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "#E2E8F0", marginBottom: 24 }}>Configuración</h1>

      <Section label="Apariencia">
        <Row
          label="Modo oscuro"
          control={
            <Toggle
              value={darkMode}
              onChange={v => { setDarkMode(v); persist({ modo_oscuro: v }); }}
            />
          }
        />
        <Row label="Tamaño de texto" control={
          <select
            value={fontSize}
            onChange={e => { setFontSize(e.target.value); persist({ tamano_fuente: e.target.value === "Normal" ? 1 : e.target.value === "Grande" ? 2 : 0 }); }}
            style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0", borderRadius: 8, padding: "4px 10px", fontSize: 13 }}
          >
            <option>Normal</option>
            <option>Grande</option>
            <option>Pequeño</option>
          </select>
        } />
      </Section>

      <Section label="Notificaciones">
        <Row
          label="Check-in diario"
          control={
            <Toggle
              value={dailyCheckIn}
              onChange={v => { setDailyCheckIn(v); persist({ registro_diario_activo: v }); }}
            />
          }
        />
        <Row label="Hora del recordatorio" control={
          <input
            type="time"
            value={reminderTime}
            onChange={e => { setReminderTime(e.target.value); persist({ hora_registro: e.target.value }); }}
            style={{ background: "#0F1825", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0", borderRadius: 8, padding: "4px 10px", fontSize: 13 }}
          />
        } />
      </Section>

      <Section label="Privacidad">
        <Row
          label="Guardar historial de chat"
          control={
            <Toggle
              value={saveHistory}
              onChange={v => { setSaveHistory(v); persist({ guardar_historial_chat: v }); }}
            />
          }
        />
        <Row
          label="Borrar todo mi historial"
          danger
          onClick={handleDeleteHistory}
          control={<ChevronRight size={16} color="#E24B4A" />}
        />
      </Section>

      <Section label="Cuenta">
        <Row
          label="Cerrar sesión"
          onClick={onLogout}
          control={<ChevronRight size={16} color="#94A3B8" />}
        />
        <Row
          label="Eliminar cuenta"
          danger
          onClick={handleDeleteAccount}
          control={<ChevronRight size={16} color="#E24B4A" />}
        />
      </Section>
    </div>
  );
}
