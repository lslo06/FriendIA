import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  DEFAULT_SETTINGS,
  deleteAccount,
  deleteChatHistory,
  normalizeFontSize,
  type SettingsUpdates,
} from "@/lib/settings";

interface AppSettingsProps {
  userId: string;
  onLogout: () => void;
}

export function AppSettings({ userId, onLogout }: AppSettingsProps) {
  const { settings, updateSettings } = useAuth();
  const [saving, setSaving] = useState(false);
  const darkMode = settings?.modo_oscuro ?? true;
  const fontSize = normalizeFontSize(
    settings?.tamano_fuente ?? DEFAULT_SETTINGS.tamano_fuente
  );
  const dailyCheckIn = settings?.registro_diario_activo
    ?? DEFAULT_SETTINGS.registro_diario_activo;
  const saveHistory = settings?.guardar_historial_chat
    ?? DEFAULT_SETTINGS.guardar_historial_chat;
  const reminderTime = settings?.hora_registro
    ?? DEFAULT_SETTINGS.hora_registro
    ?? "20:00";

  async function persist(updates: SettingsUpdates) {
    setSaving(true);
    try {
      await updateSettings(updates);
    } catch (error) {
      console.error("Error guardando la configuración:", error);
      toast.error("No se pudo guardar la configuración");
    } finally {
      setSaving(false);
    }
  }

  function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        disabled={saving}
        aria-pressed={value}
        className="relative transition-all"
        style={{
          width: 44, height: 24, borderRadius: 12,
          background: value ? "#5B88B2" : "var(--app-muted-strong)",
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
        <p style={{ fontSize: "calc(11px * var(--app-font-scale))", color: "var(--app-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 8 }}>{label}</p>
        <div style={{ background: "var(--app-surface)", borderRadius: 16, border: "1px solid var(--app-border)", overflow: "hidden" }}>
          {children}
        </div>
      </div>
    );
  }

  function Row({ label, control, danger = false, onClick }: { label: string; control: React.ReactNode; danger?: boolean; onClick?: () => void }) {
    return (
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--app-border-subtle)", cursor: onClick ? "pointer" : "default" }}
        onClick={onClick}
      >
        <span style={{ fontSize: "calc(14px * var(--app-font-scale))", color: danger ? "#E24B4A" : "var(--app-text)" }}>{label}</span>
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

  return (
    <div className="flex-1 overflow-y-auto p-8" style={{ background: "var(--app-bg)" }}>
      <h1 style={{ fontSize: "calc(24px * var(--app-font-scale))", fontWeight: 700, color: "var(--app-text)", marginBottom: 24 }}>Configuración</h1>

      <Section label="Apariencia">
        <Row
          label="Modo oscuro"
          control={
            <Toggle
              value={darkMode}
              onChange={value => persist({ modo_oscuro: value })}
            />
          }
        />
        <Row label="Tamaño de texto" control={
          <select
            value={fontSize}
            disabled={saving}
            onChange={event => persist({ tamano_fuente: Number(event.target.value) })}
            style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border-strong)", color: "var(--app-text)", borderRadius: 8, padding: "4px 10px", fontSize: "calc(13px * var(--app-font-scale))" }}
          >
            <option value={13}>Pequeño</option>
            <option value={14}>Normal</option>
            <option value={16}>Grande</option>
          </select>
        } />
      </Section>

      <Section label="Notificaciones">
        <Row
          label="Check-in diario"
          control={
            <Toggle
              value={dailyCheckIn}
              onChange={value => persist({ registro_diario_activo: value })}
            />
          }
        />
        <Row label="Hora del recordatorio" control={
          <input
            type="time"
            value={reminderTime}
            disabled={!dailyCheckIn || saving}
            onChange={event => persist({ hora_registro: event.target.value })}
            style={{ background: "var(--app-surface-alt)", border: "1px solid var(--app-border-strong)", color: "var(--app-text)", borderRadius: 8, padding: "4px 10px", fontSize: "calc(13px * var(--app-font-scale))" }}
          />
        } />
      </Section>

      <Section label="Privacidad">
        <Row
          label="Guardar historial de chat"
          control={
            <Toggle
              value={saveHistory}
              onChange={value => persist({ guardar_historial_chat: value })}
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
          control={<ChevronRight size={16} color="var(--app-text-muted)" />}
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
